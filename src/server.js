require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { startQuiz, submitAnswer } = require('./quizEngine');
const { getQuizTitle } = require('./knowledge');

const app = express();
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    title: getQuizTitle(),
    questions: 20,
    profiles: ['technique', 'non-technique'],
    format: 'qcm',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasAirtable: Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID),
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

// Quiz UI
app.use('/evaluation', express.static(path.join(ROOT, 'evaluation')));
app.get(['/evaluation', '/evaluation/'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'evaluation', 'index.html'));
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
  });
}

module.exports = app;
