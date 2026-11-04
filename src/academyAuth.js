/**
 * Authentification Atelier Claude — code d'accès + cookie HttpOnly signé.
 * Le code (ACADEMY_ACCESS_CODE) n'est jamais exposé au client.
 */
const crypto = require('crypto');

const COOKIE_NAME = 'dpg_academy_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 heures
const MAX_ATTEMPTS = 12;
const WINDOW_MS = 15 * 60 * 1000;

/** @type {Map<string, { count: number, resetAt: number }>} */
const attempts = new Map();

function getAccessCode() {
  const code = process.env.ACADEMY_ACCESS_CODE;
  if (!code) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.warn('WARNING: ACADEMY_ACCESS_CODE is not set');
    }
    return null;
  }
  return String(code);
}

function getSessionSecret() {
  return (
    process.env.ACADEMY_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.GEMINI_API_KEY ||
    'dpg-academy-dev-secret-change-me'
  );
}

function sign(body) {
  return crypto.createHmac('sha256', getSessionSecret()).update(body).digest('base64url');
}

function createSessionToken() {
  const payload = {
    v: 1,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(16).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

function verifySessionToken(token) {
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
    if (!payload || payload.v !== 1 || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function clientKey(req) {
  const xf = req.headers['x-forwarded-for'];
  const ip = (typeof xf === 'string' ? xf.split(',')[0] : '') || req.socket?.remoteAddress || 'unknown';
  return String(ip).trim();
}

function checkRateLimit(req) {
  const key = clientKey(req);
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(key, entry);
  }
  if (entry.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterMs: entry.resetAt - now };
  }
  return { ok: true, entry };
}

function recordFailedAttempt(req) {
  const result = checkRateLimit(req);
  if (result.entry) result.entry.count += 1;
}

function clearAttempts(req) {
  attempts.delete(clientKey(req));
}

function cookieOptions(req) {
  const host = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const isSecure = host === 'https' || process.env.VERCEL === '1';
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
  };
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return [part.trim(), ''];
      return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1).trim())];
    })
  );
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

function isAcademyAuthenticated(req) {
  return Boolean(getSessionFromRequest(req));
}

function setSessionCookie(res, req, token) {
  const opts = cookieOptions(req);
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Path=${opts.path}`,
    `Max-Age=${Math.floor(opts.maxAge / 1000)}`,
    'HttpOnly',
    `SameSite=${opts.sameSite}`,
  ];
  if (opts.secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res, req) {
  const opts = cookieOptions(req);
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    `SameSite=${opts.sameSite}`,
  ];
  if (opts.secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function timingSafeEqualString(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Compare against self to keep constant-ish work, then fail
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function login(req, res) {
  const limit = checkRateLimit(req);
  if (!limit.ok) {
    res.status(429).json({ error: 'Trop de tentatives. Réessayez plus tard.' });
    return;
  }

  const expected = getAccessCode();
  if (!expected) {
    res.status(503).json({ error: 'Accès temporairement indisponible.' });
    return;
  }

  const code = req.body?.code;
  if (typeof code !== 'string' || !timingSafeEqualString(code.trim(), expected)) {
    recordFailedAttempt(req);
    res.status(401).json({ error: 'Code incorrect.' });
    return;
  }

  clearAttempts(req);
  const token = createSessionToken();
  setSessionCookie(res, req, token);
  res.json({ ok: true, expiresInMs: SESSION_TTL_MS });
}

function logout(req, res) {
  clearSessionCookie(res, req);
  res.json({ ok: true });
}

function sessionStatus(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.json({ authenticated: false });
    return;
  }
  res.json({
    authenticated: true,
    expiresAt: session.exp,
    remainingMs: Math.max(0, session.exp - Date.now()),
  });
}

module.exports = {
  COOKIE_NAME,
  login,
  logout,
  sessionStatus,
  isAcademyAuthenticated,
  getSessionFromRequest,
};
