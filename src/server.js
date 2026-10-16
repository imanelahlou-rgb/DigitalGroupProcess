require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { startQuiz, resumeQuiz, submitAnswer } = require('./quizEngine');
const { listProfiles } = require('./knowledge');

const app = express();
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '64kb' }));

app.get('/api/health', (_req, res) => {
  const profiles = listProfiles();
  res.json({
    ok: true,
    format: 'qcm',
    profiles,
    questions: Object.values(profiles).reduce((sum, n) => sum + n, 0),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
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

app.post('/api/session/resume', async (req, res) => {
  try {
    const state = await resumeQuiz(req.body?.sessionId, req.body?.sessionToken);
    res.json(state);
  } catch (err) {
    console.error('resume error:', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Session introuvable' });
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
    const status = err.status || 500;
    if (status >= 500) console.error('answer error:', err.message);
    res.status(status).json({ error: err.message || 'Erreur lors de la réponse' });
  }
});

app.use(['/data', '/src', '/node_modules', '/lib', '/quiz'], (_req, res) => {
  res.status(404).send('Not found');
});

app.use('/evaluation', express.static(path.join(ROOT, 'evaluation')));
app.get(['/evaluation', '/evaluation/'], (_req, res) => {
  res.sendFile(path.join(ROOT, 'evaluation', 'index.html'));
});

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

app.get('/evaluation/*', (_req, res) => {
  res.sendFile(path.join(ROOT, 'evaluation', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DPG site + quiz listening on port ${PORT}`);
  });
}

module.exports = app;
