const crypto = require('crypto');

function getSecret() {
  return process.env.SESSION_SECRET || process.env.GEMINI_API_KEY || 'dpg-quiz-dev-secret';
}

function sign(body) {
  return crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
}

function exportSessionToken(session) {
  const payload = {
    id: session.id,
    createdAt: session.createdAt,
    profile: session.profile,
    answers: session.answers,
    completed: session.completed,
    recorded: session.recorded,
    summary: session.summary,
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
    if (!payload || typeof payload !== 'object' || !payload.id) return null;
    return {
      ...payload,
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

module.exports = { exportSessionToken, importSessionToken };
