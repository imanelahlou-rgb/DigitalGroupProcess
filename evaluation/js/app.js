(() => {
  const welcome = document.getElementById('welcome');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const startForm = document.getElementById('start-form');
  const startBtn = document.getElementById('start-btn');
  const formError = document.getElementById('form-error');
  const progressNum = document.getElementById('progress-num');
  const progressFill = document.getElementById('progress-fill');
  const quizSubtitle = document.getElementById('quiz-subtitle');
  const resultSubtitle = document.getElementById('result-subtitle');
  const qCategory = document.getElementById('q-category');
  const qText = document.getElementById('q-text');
  const choicesEl = document.getElementById('choices');
  const feedbackEl = document.getElementById('feedback');
  const feedbackStatus = document.getElementById('feedback-status');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const nextBtn = document.getElementById('next-btn');
  const resultClosing = document.getElementById('result-closing');
  const resultAdvice = document.getElementById('result-advice');
  const resultLevel = document.getElementById('result-level');
  const resultScore = document.getElementById('result-score');
  const resultEyebrow = document.getElementById('result-eyebrow');
  const resultCategories = document.getElementById('result-categories');
  const restartBtn = document.getElementById('restart-btn');

  const STORAGE_KEY = 'dpg-qcm';
  const LETTERS = 'ABCD';
  const NIVEAUX = ['Débutant', 'Notions de base', 'Confortable', 'Avancé'];

  let sessionId = null;
  let sessionToken = null;
  let profil = null;
  let busy = false;
  let pendingQuestion = null;
  let pendingSummary = null;
  let pendingProgress = null;

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function isPhone(value) {
    if (!/^\+[1-9][\d\s().-]{7,20}$/.test(value)) return false;
    const digits = value.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }

  function showError(message) {
    formError.hidden = !message;
    formError.textContent = message || '';
  }

  function profileLabel(value) {
    return value === 'technique' ? 'Profil technique' : 'Profil non-technique';
  }

  function persistSession() {
    if (!sessionId || !sessionToken) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, sessionToken }));
  }

  function clearSession() {
    sessionId = null;
    sessionToken = null;
    profil = null;
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function setBusy(value) {
    busy = value;
    startBtn.disabled = value;
    nextBtn.disabled = value;
  }

  function updateProgress(progress) {
    if (!progress) return;
    progressNum.textContent = String(progress.current);
    const of = document.querySelector('#quiz-screen .progress-of');
    if (of) of.textContent = `sur ${progress.total}`;
    const pct = Math.max(4, Math.round((progress.current / progress.total) * 100));
    progressFill.style.width = `${pct}%`;
  }

  function showScreen(name) {
    welcome.hidden = name !== 'welcome';
    quizScreen.hidden = name !== 'quiz';
    resultScreen.hidden = name !== 'result';
  }

  function renderQuestion(question, progress) {
    pendingQuestion = null;
    pendingSummary = null;
    pendingProgress = null;
    feedbackEl.hidden = true;
    nextBtn.hidden = false;
    qCategory.textContent = question.category || '';
    qText.textContent = question.question || '';
    quizSubtitle.textContent = profileLabel(profil);
    choicesEl.replaceChildren();
    (question.options || []).forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.dataset.optionId = opt.id;
      const letter = document.createElement('span');
      letter.className = 'choice-letter';
      letter.textContent = LETTERS[i] || String(i + 1);
      const text = document.createElement('span');
      text.textContent = opt.text;
      btn.append(letter, text);
      btn.addEventListener('click', () => onChoice(opt.id));
      choicesEl.appendChild(btn);
    });
    updateProgress(progress);
    showScreen('quiz');
  }

  function renderFeedback(state) {
    const feedback = state.feedback || {};
    pendingQuestion = state.question || null;
    pendingSummary = state.summary || null;
    pendingProgress = state.progress || null;
    choicesEl.querySelectorAll('button').forEach((btn) => {
      btn.disabled = true;
      btn.classList.add('is-locked');
      const id = btn.dataset.optionId;
      if (id === feedback.correctOptionId) btn.classList.add('is-correct');
      else if (id === feedback.selectedOptionId) btn.classList.add('is-wrong');
      else btn.classList.add('is-dimmed');
    });
    feedbackStatus.className = `feedback-status ${feedback.correct ? 'ok' : 'ko'}`;
    feedbackStatus.textContent = feedback.correct
      ? 'Bonne réponse — 1 point'
      : 'Réponse incorrecte — 0 point';
    feedbackExplanation.textContent = feedback.explanation || '';
    nextBtn.hidden = false;
    nextBtn.textContent = state.completed ? 'Voir mon résultat' : 'Question suivante';
    feedbackEl.hidden = false;
  }

  function agentBubble(text) {
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = 'D';
    const bubble = document.createElement('div');
    bubble.className = 'bubble agent';
    bubble.textContent = text;
    const row = document.createElement('div');
    row.className = 'msg-row agent';
    row.append(avatar, bubble);
    return row;
  }

  function showResults(summary) {
    const data = summary || {};
    const label = profileLabel(data.profil || profil);
    resultSubtitle.textContent = label;
    resultEyebrow.textContent = `Niveau estimé · ${label}`;
    resultClosing.replaceChildren(
      agentBubble(
        data.prenom
          ? `Merci ${data.prenom}. Votre évaluation est terminée.`
          : 'Votre évaluation est terminée.'
      )
    );
    resultAdvice.replaceChildren(agentBubble(data.recommendation || ''));
    resultLevel.textContent = data.level || '—';
    resultScore.textContent = `${data.totalScore ?? '—'} / ${data.maxScore || 20} points`;
    resultCategories.replaceChildren();
    Object.entries(data.byCategory || {}).forEach(([name, cat]) => {
      const pct = cat.max ? Math.round((cat.score / cat.max) * 100) : 0;
      const wrap = document.createElement('div');
      const labels = document.createElement('div');
      labels.className = 'cat-row-label';
      const left = document.createElement('span');
      left.textContent = name;
      const right = document.createElement('span');
      right.textContent = `${cat.score} / ${cat.max}`;
      labels.append(left, right);
      const bar = document.createElement('div');
      bar.className = 'cat-bar';
      const fill = document.createElement('div');
      fill.className = 'cat-bar-fill';
      fill.style.width = `${pct}%`;
      bar.appendChild(fill);
      wrap.append(labels, bar);
      resultCategories.appendChild(wrap);
    });
    showScreen('result');
  }

  function applyState(state) {
    sessionId = state.sessionId;
    if (state.sessionToken) sessionToken = state.sessionToken;
    if (state.profil) profil = state.profil;
    persistSession();
    if (state.completed && state.summary) {
      showResults(state.summary);
      return;
    }
    if (!state.question) throw new Error('Question introuvable');
    renderQuestion(state.question, state.progress);
  }

  async function api(url, body) {
    const payload = { ...(body || {}) };
    if (sessionToken) payload.sessionToken = sessionToken;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data;
  }

  function readProfile() {
    const prenom = startForm.prenom.value.trim();
    const nom = startForm.nom.value.trim();
    const email = startForm.email.value.trim();
    const telephone = startForm.telephone.value.trim();
    const metier = startForm.metier.value.trim();
    const niveauDeclare = new FormData(startForm).get('niveauDeclare') || '';
    const techniqueValue = new FormData(startForm).get('technique') || '';

    if (!prenom) return { error: 'Le prénom est obligatoire.' };
    if (!nom) return { error: 'Le nom est obligatoire.' };
    if (!isEmail(email)) return { error: 'Indiquez un email professionnel valide.' };
    if (!isPhone(telephone)) {
      return { error: 'Indiquez un téléphone au format international, par exemple +212 612 345678.' };
    }
    if (!metier) return { error: 'Le métier ou la fonction est obligatoire.' };
    if (!NIVEAUX.includes(niveauDeclare)) return { error: 'Choisissez un niveau de connaissance.' };
    if (techniqueValue !== 'oui' && techniqueValue !== 'non') {
      return { error: 'Indiquez si votre rôle implique des compétences techniques.' };
    }

    return {
      value: {
        prenom,
        nom,
        email,
        telephone,
        metier,
        niveauDeclare,
        technique: techniqueValue === 'oui',
      },
    };
  }

  startForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const parsed = readProfile();
    if (parsed.error) {
      showError(parsed.error);
      return;
    }
    showError('');
    setBusy(true);
    try {
      clearSession();
      const state = await api('/api/session/start', parsed.value);
      applyState(state);
    } catch (err) {
      showError(err.message || "Impossible de démarrer l'évaluation");
    } finally {
      setBusy(false);
    }
  });

  async function onChoice(optionId) {
    if (busy || !sessionId) return;
    setBusy(true);
    const buttons = Array.from(choicesEl.querySelectorAll('button'));
    buttons.forEach((btn) => {
      btn.disabled = true;
    });
    try {
      const state = await api(`/api/session/${sessionId}/answer`, { optionId });
      applyIdentity(state);
      renderFeedback(state);
      persistSession();
    } catch (err) {
      buttons.forEach((btn) => {
        btn.disabled = false;
      });
      feedbackStatus.className = 'feedback-status ko';
      feedbackStatus.textContent = err.message || 'Une erreur est survenue. Réessayez.';
      feedbackExplanation.textContent = '';
      nextBtn.hidden = true;
      feedbackEl.hidden = false;
    } finally {
      setBusy(false);
    }
  }

  function applyIdentity(state) {
    if (state.sessionId) sessionId = state.sessionId;
    if (state.sessionToken) sessionToken = state.sessionToken;
    if (state.profil) profil = state.profil;
  }

  nextBtn.addEventListener('click', () => {
    if (pendingSummary && !pendingQuestion) {
      showResults(pendingSummary);
      return;
    }
    if (pendingQuestion) {
      renderQuestion(pendingQuestion, pendingProgress);
    }
  });

  restartBtn.addEventListener('click', () => {
    clearSession();
    pendingQuestion = null;
    pendingSummary = null;
    pendingProgress = null;
    showError('');
    startForm.reset();
    showScreen('welcome');
    window.scrollTo(0, 0);
  });

  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      sessionId = parsed.sessionId;
      sessionToken = parsed.sessionToken;
      api('/api/session/resume', { sessionId, sessionToken })
        .then((state) => {
          applyIdentity(state);
          if (state.completed && state.summary) showResults(state.summary);
          else if (state.question) renderQuestion(state.question, state.progress);
          else clearSession();
          persistSession();
        })
        .catch(() => {
          clearSession();
        });
    } catch {
      clearSession();
    }
  }
})();
