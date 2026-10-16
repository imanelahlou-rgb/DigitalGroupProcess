const crypto = require('crypto');
const { getScoring } = require('./knowledge');

function getSecret() {
  return process.env.SESSION_SECRET || process.env.GEMINI_API_KEY || 'dpg-quiz-dev-secret';
}

function sign(body) {
  return crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
}

function exportSessionToken(session) {
  const payload = {
    id: session.id,
    name: session.name,
    createdAt: session.createdAt,
    currentIndex: session.currentIndex,
    stage: session.stage,
    scores: session.scores,
    categoryScores: session.categoryScores,
    completed: session.completed,
    totalQuestions: session.totalQuestions,
    profilQcm: session.profilQcm,
    profile: session.profile,
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

function importSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const profilQcm = payload.profilQcm === 'technique' ? 'technique' : 'non-technique';
    return {
      ...payload,
      profilQcm,
      scoring: getScoring(profilQcm),
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

module.exports = { exportSessionToken, importSessionToken };
