const { v4: uuidv4 } = require('uuid');
const { getQuiz, getLevelBand, publicQuestion } = require('./knowledge');
const { exportSessionToken, importSessionToken } = require('./sessionToken');
const { appendResult } = require('./resultsStore');

const sessions = new Map();
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const NIVEAUX = ['Débutant', 'Notions de base', 'Confortable', 'Avancé'];

function cleanupSessions() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.updatedAt > SESSION_TTL_MS) sessions.delete(id);
  }
}
setInterval(cleanupSessions, 30 * 60 * 1000).unref();

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function cleanText(value, max) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 120;
}

function isPhone(value) {
  if (!/^\+[1-9][\d\s().-]{7,20}$/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function parseProfile(body) {
  const src = body || {};
  const prenom = cleanText(src.prenom, 80);
  const nom = cleanText(src.nom, 80);
  const email = cleanText(src.email, 120).toLowerCase();
  const telephone = cleanText(src.telephone, 30);
  const metier = cleanText(src.metier, 160);
  const niveauDeclare = cleanText(src.niveauDeclare, 40);
  const technique = src.technique;

  if (!prenom) throw httpError(400, 'Le prénom est obligatoire.');
  if (!nom) throw httpError(400, 'Le nom est obligatoire.');
  if (!isEmail(email)) throw httpError(400, 'Indiquez un email professionnel valide.');
  if (!isPhone(telephone)) {
    throw httpError(400, 'Indiquez un téléphone au format international, par exemple +212 612 345678.');
  }
  if (!metier) throw httpError(400, 'Le métier ou la fonction est obligatoire.');
  if (!NIVEAUX.includes(niveauDeclare)) throw httpError(400, 'Choisissez un niveau de connaissance.');
  if (technique !== true && technique !== false) {
    throw httpError(400, 'Indiquez si votre rôle implique des compétences techniques.');
  }

  return {
    prenom,
    nom,
    email,
    telephone,
    metier,
    niveauDeclare,
    profilQcm: technique ? 'technique' : 'non-technique',
  };
}

function createSession(profile) {
  const session = {
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    profile,
    answers: [],
    completed: false,
    recorded: false,
    summary: null,
  };
  sessions.set(session.id, session);
  return session;
}

function getSession(id, token) {
  if (token) {
    const imported = importSessionToken(token);
    if (!imported || (id && imported.id !== id)) return null;
    if (!imported.profile?.profilQcm || !Array.isArray(imported.answers)) return null;
    imported.updatedAt = Date.now();
    sessions.set(imported.id, imported);
    return imported;
  }

  const cached = id ? sessions.get(id) : null;
  if (!cached) return null;
  if (!cached.profile?.profilQcm || !Array.isArray(cached.answers)) return null;
  cached.updatedAt = Date.now();
  return cached;
}

function progressOf(session) {
  const total = getQuiz(session.profile.profilQcm).questions.length;
  return {
    current: session.completed ? total : session.answers.length + 1,
    answered: session.answers.length,
    total,
  };
}

function publicState(session, extra = {}) {
  return {
    sessionId: session.id,
    sessionToken: exportSessionToken(session),
    completed: Boolean(session.completed),
    progress: progressOf(session),
    profil: session.profile.profilQcm,
    quizTitle: getQuiz(session.profile.profilQcm).quizTitle,
    ...extra,
  };
}

function buildSummary(session) {
  const quiz = getQuiz(session.profile.profilQcm);
  const total = session.answers.filter((a) => a.correct).length;
  const band = getLevelBand(session.profile.profilQcm, total);
  const byCategory = {};
  quiz.questions.forEach((q, i) => {
    if (!byCategory[q.category]) byCategory[q.category] = { score: 0, max: 0 };
    byCategory[q.category].max += 1;
    if (session.answers[i]?.correct) byCategory[q.category].score += 1;
  });
  return {
    totalScore: total,
    maxScore: quiz.questions.length,
    level: band.level,
    recommendation: band.recommendation,
    byCategory,
    profil: session.profile.profilQcm,
    prenom: session.profile.prenom,
  };
}

async function startQuiz(body) {
  const profile = parseProfile(body);
  const session = createSession(profile);
  const quiz = getQuiz(profile.profilQcm);
  return publicState(session, {
    question: publicQuestion(quiz.questions[0]),
  });
}

async function resumeQuiz(sessionId, token) {
  const session = getSession(sessionId, token);
  if (!session) throw httpError(404, 'Session introuvable');
  if (session.completed) {
    return publicState(session, { question: null, summary: session.summary });
  }
  const quiz = getQuiz(session.profile.profilQcm);
  const question = quiz.questions[session.answers.length];
  if (!question) throw httpError(400, 'Question introuvable');
  return publicState(session, { question: publicQuestion(question) });
}

async function submitAnswer(sessionId, payload) {
  const session = getSession(sessionId, payload?.sessionToken);
  if (!session) throw httpError(404, 'Session introuvable');

  if (session.completed) {
    return publicState(session, { question: null, summary: session.summary, feedback: null });
  }

  const quiz = getQuiz(session.profile.profilQcm);
  const index = session.answers.length;
  const question = quiz.questions[index];
  if (!question) throw httpError(400, 'Question introuvable');

  const optionId = payload?.optionId;
  const chosen = question.options.find((o) => o.id === optionId);
  if (!chosen) throw httpError(400, 'Choix invalide');

  const correct = optionId === question.correctOptionId;
  session.answers.push({ optionId, correct });
  const feedback = {
    selectedOptionId: optionId,
    correctOptionId: question.correctOptionId,
    correct,
    explanation: question.explanation || '',
  };

  if (session.answers.length >= quiz.questions.length) {
    session.completed = true;
    session.summary = buildSummary(session);
    if (!session.recorded) {
      appendResult(session);
      session.recorded = true;
    }
    sessions.set(session.id, session);
    return publicState(session, { feedback, question: null, summary: session.summary });
  }

  sessions.set(session.id, session);
  return publicState(session, {
    feedback,
    question: publicQuestion(quiz.questions[session.answers.length]),
    summary: null,
  });
}

module.exports = {
  startQuiz,
  resumeQuiz,
  submitAnswer,
  parseProfile,
  isPhone,
  isEmail,
};
