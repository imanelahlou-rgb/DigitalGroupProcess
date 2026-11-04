require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { startQuiz, submitAnswer } = require('./quizEngine');
const { getQuizTitle } = require('./knowledge');
const {
  login: academyLogin,
  logout: academyLogout,
  sessionStatus: academySession,
  isAcademyAuthenticated,
} = require('./academyAuth');

const app = express();
const ROOT = path.join(__dirname, '..');
const ACADEMY_DIR = path.join(ROOT, 'academy', 'claude');
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '64kb' }));

/** Chemins internes à ne jamais exposer en fichiers statiques. */
const BLOCKED_STATIC = [
  '/data',
  '/src',
  '/node_modules',
  '/lib',
  '/quiz',
  '/academy-app',
  '/scripts',
  '/.env',
  '/.git',
  '/package.json',
  '/package-lock.json',
  '/vercel.json',
  '/middleware.js',
  '/server.js',
];

function isBlockedStatic(pathname) {
  const p = pathname.split('?')[0];
  return BLOCKED_STATIC.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`) || p.startsWith(`${prefix}.`)
  );
}

app.use((req, res, next) => {
  if (isBlockedStatic(req.path)) {
    return res.status(404).send('Not found');
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    title: getQuizTitle(),
    questions: 20,
    profiles: ['technique', 'non-technique'],
    format: 'qcm',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasAirtable: Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID),
    academyConfigured: Boolean(process.env.ACADEMY_ACCESS_CODE && process.env.ACADEMY_SESSION_SECRET),
  });
});

app.post('/api/session/start', async (req, res) => {
  try {
    const state = await startQuiz(req.body || {});
    res.json(state);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('start error:', err.message);
    res.status(status).json({ error: err.message || 'Erreur au démarrage' });
  }
});

app.post('/api/session/:id/answer', async (req, res) => {
  try {
    const state = await submitAnswer(req.params.id, {
      optionId: req.body?.optionId,
      sessionToken: req.body?.sessionToken,
    });
    res.json(state);
  } catch (err) {
    console.error('answer error:', err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Erreur lors de la réponse' });
  }
});

/* ——— DPG Academy · Atelier Claude ——— */
app.get('/api/academy/session', academySession);
app.post('/api/academy/login', academyLogin);
app.post('/api/academy/logout', academyLogout);

function requireAcademyForResources(req, res, next) {
  if (isAcademyAuthenticated(req)) return next();
  res.status(401).json({ error: 'Authentification requise.' });
}

// Ressources pédagogiques : accessibles uniquement avec session valide
app.use(
  '/academy/claude/resources',
  requireAcademyForResources,
  express.static(path.join(ACADEMY_DIR, 'resources'), {
    setHeaders(res) {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    },
  })
);

// Assets / SPA de l'académie (le contenu sensible des ressources reste protégé ci-dessus)
app.use(
  '/academy/claude',
  express.static(ACADEMY_DIR, {
    index: false,
    setHeaders(res, filePath) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);

app.get(['/academy/claude', '/academy/claude/', '/academy/claude/*'], (req, res, next) => {
  if (req.path.startsWith('/academy/claude/resources')) {
    const status = isAcademyAuthenticated(req) ? 404 : 401;
    return res.status(status).json({
      error: status === 401 ? 'Authentification requise.' : 'Ressource introuvable.',
    });
  }
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(ACADEMY_DIR, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Quiz UI
app.use('/evaluation', express.static(path.join(ROOT, 'evaluation')));
app.get(['/evaluation', '/evaluation/'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'evaluation', 'index.html'));
});

// Quizz module 1 — page statique, indépendante de /evaluation
app.use('/quizz-module-1', express.static(path.join(ROOT, 'quizz-module-1'), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  },
}));
app.get(['/quizz-module-1', '/quizz-module-1/'], (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(ROOT, 'quizz-module-1', 'index.html'));
});

// Marketing site (static)
app.get(['/', '/index.html'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use(
  express.static(ROOT, {
    index: false,
    dotfiles: 'ignore',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  })
);

// SPA-style fallback only for evaluation deep links
app.get('/evaluation/*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'evaluation', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DPG site + quiz listening on port ${PORT}`);
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.warn('WARNING: Airtable credentials are not set');
    }
    if (!process.env.ACADEMY_ACCESS_CODE) {
      console.warn('WARNING: ACADEMY_ACCESS_CODE is not set — /academy/claude login will return 503');
    }
    if (!process.env.ACADEMY_SESSION_SECRET) {
      console.warn('WARNING: ACADEMY_SESSION_SECRET is not set — using fallback secret (dev only)');
    }
  });
}

module.exports = app;
