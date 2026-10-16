const { v4: uuidv4 } = require('uuid');
const {
  getQuestions,
  getScoring,
  getQuestionByIndex,
  getLevelBand,
  shuffle,
  categoryDisplayName,
} = require('./knowledge');
const { exportSessionToken, importSessionToken } = require('./sessionToken');
const { saveEvaluationLead, saveEvaluationResult } = require('./airtable');

const sessions = new Map();
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

const NIVEAUX_DECLARES = ['Débutant', 'Notions de base', 'Confortable', 'Avancé'];

function cleanupSessions() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.updatedAt > SESSION_TTL_MS) sessions.delete(id);
  }
}
setInterval(cleanupSessions, 30 * 60 * 1000).unref();

function cleanText(value, max) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseLead(body) {
  const src = body || {};
  const prenom = cleanText(src.prenom || src.name, 80);
  const nom = cleanText(src.nom, 80);
  const email = cleanText(src.email, 120).toLowerCase();
  const telephone = cleanText(src.telephone, 30);
  const metier = cleanText(src.metier, 160);
  const niveauDeclare = cleanText(src.niveauDeclare || src.niveau_declare, 40);
  const roleRaw = cleanText(src.roleTechnique || src.role_technique || src.routing, 10).toLowerCase();

  if (!prenom) throw httpError(400, 'Le prénom est obligatoire.');
  if (!nom) throw httpError(400, 'Le nom est obligatoire.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw httpError(400, 'Indiquez un email professionnel valide.');
  }
  const digits = telephone.replace(/\D/g, '');
  if (!/^\+[1-9][\d\s().-]{7,20}$/.test(telephone) || digits.length < 8 || digits.length > 15) {
    throw httpError(400, 'Indiquez un téléphone au format international, par exemple +212 612 345678.');
  }
  if (!metier) throw httpError(400, 'Le métier ou la fonction est obligatoire.');
  if (!NIVEAUX_DECLARES.includes(niveauDeclare)) {
    throw httpError(400, 'Indiquez votre niveau de connaissance en IA.');
  }

  let roleTechnique;
  if (roleRaw === 'oui' || roleRaw === 'yes' || roleRaw === 'true') roleTechnique = true;
  else if (roleRaw === 'non' || roleRaw === 'no' || roleRaw === 'false') roleTechnique = false;
  else throw httpError(400, 'Indiquez si votre rôle implique des compétences techniques.');

  const profilQcm = roleTechnique ? 'technique' : 'non-technique';
  return { prenom, nom, email, telephone, metier, niveauDeclare, roleTechnique, profilQcm };
}

function createSession(profile) {
  const scoring = getScoring(profile.profilQcm);
  const questions = getQuestions(profile.profilQcm);
  const session = {
    id: uuidv4(),
    name: profile.prenom,
    profile,
    profilQcm: profile.profilQcm,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    currentIndex: 0,
    stage: 'choice',
    scores: {},
    categoryScores: {},
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
  return {
    current: Math.min(session.currentIndex + (session.completed ? 1 : 0), session.totalQuestions),
    displayCurrent: session.completed
      ? session.totalQuestions
      : session.currentIndex + 1,
    total: session.totalQuestions,
  };
}

function publicQuestion(question) {
  return {
    id: question.id,
    category: categoryDisplayName(question.category),
    difficulty: question.difficulty,
    text: question.question,
    options: shuffle(question.options).map((o) => ({ id: o.id, text: o.text })),
  };
}

function publicState(session, extra = {}) {
  return {
    sessionId: session.id,
    sessionToken: exportSessionToken(session),
    name: session.name,
    profilQcm: session.profilQcm,
    stage: session.stage,
    completed: session.completed,
    progress: progress(session),
    inputMode: session.completed ? 'done' : 'choice',
    ...extra,
  };
}

function totalScore(session) {
  return Object.values(session.scores).reduce((a, b) => a + b, 0);
}

function buildSummary(session) {
  const total = totalScore(session);
  const band = getLevelBand(session.profilQcm, total);
  const byCategory = {};
  for (const [cat, data] of Object.entries(session.categoryScores)) {
    byCategory[categoryDisplayName(cat)] = {
      score: data.score,
      max: data.max,
    };
  }
  return {
    totalScore: total,
    maxScore: session.totalQuestions,
    level: band.level,
    recommendation: band.recommendation,
    advice: band.recommendation,
    byCategory,
  };
}

async function startQuiz(body) {
  const lead = parseLead(typeof body === 'string' ? { prenom: body } : body);
  try {
    await saveEvaluationLead({
      prenom: lead.prenom,
      nom: lead.nom,
      email: lead.email,
      telephone: lead.telephone,
      metier: lead.metier,
      niveauDeclare: lead.niveauDeclare,
      profilQcm: lead.profilQcm,
      dateDernierPassage: new Date().toISOString(),
    });
  } catch (err) {
    console.error('airtable lead error:', err.airtableType || (err.status === 500 ? 'config-missing' : err.status), err.message);
    throw httpError(502, "Impossible d'enregistrer vos coordonnées pour le moment. Réessayez.");
  }

  const session = createSession(lead);
  const q = getQuestionByIndex(lead.profilQcm, 0);
  return publicState(session, {
    question: publicQuestion(q),
    options: null,
  });
}

async function finishSession(session, lastAnswer) {
  session.completed = true;
  session.stage = 'finished';
  session.currentIndex = session.totalQuestions;
  const summary = buildSummary(session);
  session.summary = summary;

  try {
    await saveEvaluationResult({
      prenom: session.profile.prenom,
      nom: session.profile.nom,
      email: session.profile.email,
      telephone: session.profile.telephone,
      metier: session.profile.metier,
      niveauDeclare: session.profile.niveauDeclare,
      profilQcm: session.profilQcm,
      score: summary.totalScore,
      niveauCalcule: summary.level,
      recommandation: summary.recommendation,
      dateDernierPassage: new Date().toISOString(),
    });
  } catch (err) {
    console.error('airtable result error:', err.airtableType || err.status, err.message);
  }

  return publicState(session, {
    question: null,
    options: null,
    lastAnswer,
    summary,
  });
}

async function submitAnswer(sessionId, payload) {
  const session = getSession(sessionId, payload?.sessionToken);
  if (!session) throw httpError(404, 'Session introuvable');
  if (session.completed) throw httpError(400, 'Quiz déjà terminé');

  const optionId = cleanText(payload?.optionId, 8).toLowerCase();
  if (!/^[a-d]$/.test(optionId)) throw httpError(400, 'Choisissez une des quatre options.');

  const question = getQuestionByIndex(session.profilQcm, session.currentIndex);
  if (!question) throw httpError(400, 'Question introuvable');

  const correct = optionId === question.correctOptionId;
  const points = correct ? session.scoring.correct : session.scoring.incorrect;
  session.scores[question.id] = points;
  session.categoryScores[question.category].score += points;

  const lastAnswer = {
    questionId: question.id,
    optionId,
    correct,
    explanation: question.explanation || '',
  };

  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.totalQuestions) {
    return finishSession(session, lastAnswer);
  }

  session.currentIndex = nextIndex;
  session.stage = 'choice';
  const nextQ = getQuestionByIndex(session.profilQcm, nextIndex);
  return publicState(session, {
    question: publicQuestion(nextQ),
    lastAnswer,
  });
}

module.exports = {
  startQuiz,
  submitAnswer,
  getSession,
  NIVEAUX_DECLARES,
};
