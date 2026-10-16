const BASE = process.env.BASE_URL || 'https://digital-group-process.vercel.app';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function assert(c, m) {
  if (!c) throw new Error(m);
}

(async () => {
  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  assert(health.ok && health.format === 'qcm' && health.questions === 20, 'health');
  assert(health.hasAirtable, 'airtable configured');
  console.log('OK health');

  const lead = {
    prenom: 'Prod',
    nom: 'Test',
    email: 'prod.test+dpg@example.com',
    telephone: '+212 612 345678',
    metier: 'Ingénieur réseau',
    niveauDeclare: 'Confortable',
    roleTechnique: 'oui',
  };
  let s = await post('/api/session/start', lead);
  assert(s.sessionId && s.sessionToken && s.inputMode === 'choice', 'start');
  assert(s.profilQcm === 'technique', 'routing technique');
  assert(s.question?.options?.length === 4, 'first question');
  console.log('OK start');

  const optionId = s.question.options[0].id;
  s = await post(`/api/session/${s.sessionId}/answer`, {
    optionId,
    sessionToken: s.sessionToken,
  });
  assert(s.progress.displayCurrent === 2 || s.completed, 'answer advances');
  assert(s.question?.options?.length === 4 || s.completed, 'next question or done');
  console.log('OK answer');

  const nonTech = await post('/api/session/start', {
    ...lead,
    email: 'prod.test.nontech+dpg@example.com',
    roleTechnique: 'non',
  });
  assert(nonTech.profilQcm === 'non-technique', 'routing non-technique');
  console.log('OK routing');

  const home = await fetch(`${BASE}/`).then((r) => r.text());
  assert(home.includes('Digital Process Group'), 'home brand');
  const evalPage = await fetch(`${BASE}/evaluation/`).then((r) => r.text());
  assert(evalPage.includes('Bienvenue') && evalPage.includes('compétences techniques'), 'eval welcome');

  console.log('\nPROD SMOKE PASSED', BASE);
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
