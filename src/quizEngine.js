const { v4: uuidv4 } = require('uuid');
const {
  getQuestions,
  getScoring,
  getQuestionByIndex,
  getLevelBand,
  getDistractors,
  getCorrectOption,
  shuffle,
} = require('./knowledge');
const gemini = require('./gemini');
const { exportSessionToken, importSessionToken } = require('./sessionToken');

const sessions = new Map();
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

function cleanupSessions() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.updatedAt > SESSION_TTL_MS) sessions.delete(id);
  }
}
setInterval(cleanupSessions, 30 * 60 * 1000).unref();

function createSession(name = '') {
  const scoring = getScoring();
  const questions = getQuestions();
  const session = {
    id: uuidv4(),
    name: (name || '').trim().slice(0, 80),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    currentIndex: 0,
    /** free | choice4 | choice2 | finished */
    stage: 'free',
    scores: {}, // qId -> number
    categoryScores: {},
    choice4Options: null,
    choice2Options: null,
    /** How many times the user asked to rephrase the current question */
    clarificationCount: 0,
    completed: false,
    totalQuestions: questions.length,
    scoring,
  };

  for (const q of questions) {
    if (!session.categoryScores[q.category]) {
      session.categoryScores[q.category] = { score: 0, max: 0 };
    }
    session.categoryScores[q.category].max += 1;
  }

  sessions.set(session.id, session);
  return session;
}

function getSession(id, sessionToken) {
  let s = id ? sessions.get(id) : null;
  if (!s && sessionToken) {
    s = importSessionToken(sessionToken);
    if (s) sessions.set(s.id, s);
  }
  if (!s) return null;
  s.updatedAt = Date.now();
  return s;
}

function progress(session) {
  // Advances only when a question is definitively resolved
  return {
    current: Math.min(session.currentIndex + (session.completed ? 1 : 0), session.totalQuestions),
    // Show "Question N/25" for the question being answered; when finished show 25/25
    displayCurrent: session.completed
      ? session.totalQuestions
      : session.currentIndex + 1,
    total: session.totalQuestions,
  };
}

function publicState(session, extra = {}) {
  return {
    sessionId: session.id,
    sessionToken: exportSessionToken(session),
    name: session.name,
    stage: session.stage,
    completed: session.completed,
    progress: progress(session),
    ...extra,
  };
}

function buildChoice4(question) {
  return shuffle(question.options).map((o) => ({ id: o.id, text: o.text }));
}

function buildChoice2(question) {
  const correct = getCorrectOption(question);
  const distractors = getDistractors(question);
  // Deterministic: correct + first distractor from original distractor list
  const pair = [correct, distractors[0]];
  return shuffle(pair).map((o) => ({ id: o.id, text: o.text }));
}

function awardPoints(session, question, points) {
  session.scores[question.id] = points;
  session.categoryScores[question.category].score += points;
}

function totalScore(session) {
  return Object.values(session.scores).reduce((a, b) => a + b, 0);
}

function roundScore(n) {
  return Math.round(n * 100) / 100;
}

async function startQuiz(name) {
  const session = createSession(name);
  const q = getQuestionByIndex(0);
  const greeting = session.name
    ? `Bonjour ${session.name} — bienvenue dans le quiz d'évaluation Digital Process Group. Je vais vous poser 25 questions, une par une. Répondez d'abord librement avec vos propres mots ; si besoin, je vous proposerai des choix. On commence.`
    : `Bonjour — bienvenue dans le quiz d'évaluation Digital Process Group. Je vais vous poser 25 questions, une par une. Répondez d'abord librement avec vos propres mots ; si besoin, je vous proposerai des choix. On commence.`;

  return publicState(session, {
    messages: [
      { role: 'agent', text: greeting },
      { role: 'agent', text: q.question },
    ],
    inputMode: 'free',
    options: null,
  });
}

async function submitAnswer(sessionId, payload) {
  const session = getSession(sessionId, payload?.sessionToken);
  if (!session) {
    const err = new Error('Session introuvable');
    err.status = 404;
    throw err;
  }
  if (session.completed) {
    const err = new Error('Quiz déjà terminé');
    err.status = 400;
    throw err;
  }

  const question = getQuestionByIndex(session.currentIndex);
  if (!question) {
    const err = new Error('Question introuvable');
    err.status = 400;
    throw err;
  }

  const scoring = getScoring();
  const messages = [];
  let inputMode = 'free';
  let options = null;

  if (session.stage === 'free') {
    const text = (payload.text || '').trim();
    if (!text) {
      const err = new Error('Réponse vide');
      err.status = 400;
      throw err;
    }
    messages.push({ role: 'user', text });

    // Clarification request: rephrase, do not judge, do not advance progress
    if (gemini.isClarificationRequest(text)) {
      const attempt = session.clarificationCount || 0;
      session.clarificationCount = attempt + 1;
      const rephrased = await gemini.rephraseQuestion(question, attempt);
      messages.push({ role: 'agent', text: rephrased });
      return publicState(session, {
        messages,
        inputMode: 'free',
        options: null,
      });
    }

    const evaluation = await gemini.evaluateFreeText(question, text);
    if (evaluation.correct) {
      awardPoints(session, question, scoring.freeTextCorrect);
      messages.push({ role: 'agent', text: evaluation.feedback || 'Exactement.' });
      return await advanceOrFinish(session, messages);
    }

    // Wrong free text → 4 choices
    session.stage = 'choice4';
    session.choice4Options = buildChoice4(question);
    messages.push({
      role: 'agent',
      text:
        evaluation.feedback ||
        'Pas tout à fait, mais on y est presque — regardez ces options.',
    });
    inputMode = 'choice';
    options = session.choice4Options;
    return publicState(session, { messages, inputMode, options });
  }

  if (session.stage === 'choice4') {
    const optionId = payload.optionId;
    const chosen = session.choice4Options?.find((o) => o.id === optionId);
    if (!chosen) {
      const err = new Error('Choix invalide');
      err.status = 400;
      throw err;
    }
    messages.push({ role: 'user', text: chosen.text });

    if (optionId === question.correctOptionId) {
      awardPoints(session, question, scoring.correctAfter4Choices);
      const fb = await gemini.feedbackCorrectChoice(question, 'choice4');
      messages.push({ role: 'agent', text: fb });
      return await advanceOrFinish(session, messages);
    }

    session.stage = 'choice2';
    session.choice2Options = buildChoice2(question);
    messages.push({
      role: 'agent',
      text: 'Ce n\'est pas encore ça — on affine : deux options restantes. Vous y êtes presque.',
    });
    inputMode = 'choice';
    options = session.choice2Options;
    return publicState(session, { messages, inputMode, options });
  }

  if (session.stage === 'choice2') {
    const optionId = payload.optionId;
    const chosen = session.choice2Options?.find((o) => o.id === optionId);
    if (!chosen) {
      const err = new Error('Choix invalide');
      err.status = 400;
      throw err;
    }
    messages.push({ role: 'user', text: chosen.text });

    if (optionId === question.correctOptionId) {
      awardPoints(session, question, scoring.correctAfter2Choices);
      const fb = await gemini.feedbackCorrectChoice(question, 'choice2');
      messages.push({ role: 'agent', text: fb });
      return await advanceOrFinish(session, messages);
    }

    awardPoints(session, question, scoring.incorrect);
    const reveal = await gemini.feedbackReveal(question);
    messages.push({ role: 'agent', text: reveal });
    return await advanceOrFinish(session, messages);
  }

  const err = new Error('État de session invalide');
  err.status = 400;
  throw err;
}

async function advanceOrFinish(session, messages) {
  session.choice4Options = null;
  session.choice2Options = null;

  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.totalQuestions) {
    session.completed = true;
    session.stage = 'finished';
    session.currentIndex = session.totalQuestions;

    const total = roundScore(totalScore(session));
    const band = getLevelBand(total);
    const byCategory = {};
    for (const [cat, data] of Object.entries(session.categoryScores)) {
      byCategory[cat] = {
        score: roundScore(data.score),
        max: data.max,
      };
    }

    const summaryText = await gemini.generateSummary({
      name: session.name,
      totalScore: total,
      maxScore: session.totalQuestions,
      level: band.level,
      recommendation: band.recommendation,
      byCategory,
    });

    const closing =
      typeof summaryText === 'string'
        ? summaryText
        : summaryText.closing || 'Voici votre synthèse.';
    const advice =
      typeof summaryText === 'string'
        ? band.recommendation
        : summaryText.advice || band.recommendation;

    messages.push({ role: 'agent', text: closing });

    return publicState(session, {
      messages,
      inputMode: 'done',
      options: null,
      summary: {
        totalScore: total,
        maxScore: session.totalQuestions,
        level: band.level,
        recommendation: band.recommendation,
        advice,
        byCategory,
      },
    });
  }

  session.currentIndex = nextIndex;
  session.stage = 'free';
  session.clarificationCount = 0;
  const nextQ = getQuestionByIndex(nextIndex);
  messages.push({ role: 'agent', text: nextQ.question });

  return publicState(session, {
    messages,
    inputMode: 'free',
    options: null,
  });
}

module.exports = {
  startQuiz,
  submitAnswer,
  getSession,
};
