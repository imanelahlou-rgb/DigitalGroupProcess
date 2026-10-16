const BASE = process.env.BASE_URL || 'https://www.digitalprocessgrp.com';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`${path} ${res.status}: ${data.error || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const profile = {
  prenom: 'Smoke',
  nom: 'Prod',
  email: 'smoke.qcm@example.com',
  telephone: '+212 612 345678',
  metier: 'Verification',
  niveauDeclare: 'Notions de base',
  technique: false,
};

(async () => {
  console.log('BASE', BASE);

  const home = await fetch(`${BASE}/`);
  assert(home.ok, 'home');
  const homeHtml = await home.text();
  assert(/Digital Process Group/i.test(homeHtml), 'home brand');
  assert(/\/evaluation\//.test(homeHtml), 'nav evaluation');

  const quizPage = await fetch(`${BASE}/evaluation/`);
  assert(quizPage.ok, 'evaluation page');
  const quizHtml = await quizPage.text();
  assert(quizHtml.includes('Téléphone'), 'champ téléphone');
  assert(quizHtml.includes('compétences techniques'), 'question de routage');
  assert(!quizHtml.includes('Écrivez votre réponse'), 'plus de réponse libre');

  const leaked = await fetch(`${BASE}/data/quiz_technique.json`);
  assert(leaked.status === 404, 'corrigé non public');

  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  assert(health.ok && health.format === 'qcm', JSON.stringify(health));
  assert(health.profiles?.technique === 20 && health.profiles?.['non-technique'] === 20, JSON.stringify(health));
  console.log('OK site + health');

  let rejected = false;
  try {
    await post('/api/session/start', { prenom: 'A' });
  } catch (err) {
    rejected = err.status === 400;
  }
  assert(rejected, 'formulaire incomplet refusé');

  let state = await post('/api/session/start', profile);
  assert(state.profil === 'non-technique', 'routage non-technique');
  assert(state.question && state.question.options.length === 4, '4 choix');
  assert(!state.question.correctOptionId, 'corrigé masqué');
  assert(!JSON.stringify(state.question).includes('explanation'), 'explication masquée');

  state = await post(`/api/session/${state.sessionId}/answer`, {
    optionId: state.question.options[0].id,
    sessionToken: state.sessionToken,
  });
  assert(state.feedback && typeof state.feedback.correct === 'boolean', 'feedback');
  assert(state.progress.current === 2, 'question suivante');
  console.log('OK premier choix');

  const tech = await post('/api/session/start', { ...profile, technique: true, email: 'smoke.tech@example.com' });
  assert(tech.profil === 'technique', 'routage technique');
  assert(tech.quizTitle && tech.quizTitle.toLowerCase().includes('technique'), tech.quizTitle);

  console.log('\nPROD SMOKE PASSED', BASE);
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
