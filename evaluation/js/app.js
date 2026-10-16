(() => {
  const welcome = document.getElementById('welcome');
  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const startForm = document.getElementById('start-form');
  const startBtn = document.getElementById('start-btn');
  const formError = document.getElementById('form-error');
  const progressNum = document.getElementById('progress-num');
  const progressFill = document.getElementById('progress-fill');
  const thinkingEl = document.getElementById('thinking');
  const choicesEl = document.getElementById('choices');
  const choiceFeedback = document.getElementById('choice-feedback');
  const qcmCategory = document.getElementById('qcm-category');
  const qcmQuestion = document.getElementById('qcm-question');
  const quizProfileLabel = document.getElementById('quiz-profile-label');
  const resultClosing = document.getElementById('result-closing');
  const resultAdvice = document.getElementById('result-advice');
  const resultLevel = document.getElementById('result-level');
  const resultScore = document.getElementById('result-score');
  const resultCategories = document.getElementById('result-categories');

  let sessionId = null;
  let sessionToken = null;
  let busy = false;

  const LETTERS = 'ABCD';

  function setBusy(value) {
    busy = value;
    thinkingEl.hidden = !value;
    startBtn.disabled = value;
    choicesEl.querySelectorAll('button').forEach((b) => {
      b.disabled = value;
    });
  }

  function formatText(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function agentBubbleHtml(text) {
    return `
      <div class="msg-avatar">D</div>
      <div class="bubble agent">${formatText(text)}</div>
    `;
  }

  function updateProgress(progress) {
    if (!progress) return;
    const cur = progress.displayCurrent;
    const total = progress.total;
    progressNum.textContent = String(cur);
    const pct = Math.max(5, Math.round((cur / total) * 100));
    progressFill.style.width = `${pct}%`;
    const of = document.querySelector('.progress-of');
    if (of) of.textContent = `sur ${total}`;
  }

  function renderQuestion(question) {
    if (!question) return;
    qcmCategory.textContent = question.category || '';
    qcmQuestion.textContent = question.text || '';
    choiceFeedback.hidden = true;
    choiceFeedback.textContent = '';
    choicesEl.innerHTML = '';
    (question.options || []).forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      const letter = LETTERS[i] || String(i + 1);
      btn.innerHTML = `<span class="choice-letter">${letter}</span><span>${escapeHtml(opt.text)}</span>`;
      btn.addEventListener('click', () => onChoice(opt.id, btn));
      choicesEl.appendChild(btn);
    });
  }

  function showResults(state) {
    quizScreen.hidden = true;
    resultScreen.hidden = false;

    const summary = state.summary || {};
    const closing =
      summary.level === 'Avancé'
        ? `Bravo${state.name ? ` ${escapeHtml(state.name)}` : ''} — vous maîtrisez déjà solidement les fondamentaux.`
        : summary.level === 'Intermédiaire'
          ? `Merci${state.name ? ` ${escapeHtml(state.name)}` : ''} — un bon socle, avec des axes clairs à renforcer.`
          : `Merci${state.name ? ` ${escapeHtml(state.name)}` : ''} — voici votre point de départ pour une montée en compétences ciblée.`;

    resultClosing.innerHTML = agentBubbleHtml(closing);
    resultAdvice.innerHTML = agentBubbleHtml(
      summary.advice || summary.recommendation || ''
    );
    resultLevel.textContent = summary.level || '—';
    resultScore.textContent = `${summary.totalScore ?? '—'} / ${summary.maxScore || 20} points`;

    resultCategories.innerHTML = '';
    Object.entries(summary.byCategory || {}).forEach(([name, data]) => {
      const pct = data.max ? Math.round((data.score / data.max) * 100) : 0;
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="cat-row-label"><span>${escapeHtml(name)}</span><span>${data.score} / ${data.max}</span></div>
        <div class="cat-bar"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
      `;
      resultCategories.appendChild(row);
    });
  }

  function applyState(state) {
    sessionId = state.sessionId;
    if (state.sessionToken) sessionToken = state.sessionToken;
    updateProgress(state.progress);

    if (state.profilQcm) {
      quizProfileLabel.textContent =
        state.profilQcm === 'technique'
          ? 'Profil technique'
          : 'Profil non-technique';
    }

    if (state.inputMode === 'done' || state.completed) {
      showResults(state);
      return;
    }

    renderQuestion(state.question);
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
    if (data.sessionToken) sessionToken = data.sessionToken;
    return data;
  }

  function showFormError(message) {
    formError.hidden = !message;
    formError.textContent = message || '';
  }

  function readLead() {
    const prenom = startForm.prenom.value.trim();
    const nom = startForm.nom.value.trim();
    const email = startForm.email.value.trim();
    const telephone = startForm.telephone.value.trim();
    const metier = startForm.metier.value.trim();
    const niveauDeclare = startForm.niveauDeclare.value;
    const roleEl = startForm.querySelector('input[name="roleTechnique"]:checked');
    const roleTechnique = roleEl ? roleEl.value : '';
    const digits = telephone.replace(/\D/g, '');

    if (!prenom) return { error: 'Le prénom est obligatoire.' };
    if (!nom) return { error: 'Le nom est obligatoire.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return { error: 'Indiquez un email professionnel valide.' };
    }
    if (!/^\+[1-9][\d\s().-]{7,20}$/.test(telephone) || digits.length < 8 || digits.length > 15) {
      return { error: 'Indiquez un téléphone au format international, par exemple +212 612 345678.' };
    }
    if (!metier) return { error: 'Le métier ou la fonction est obligatoire.' };
    if (!niveauDeclare) return { error: 'Indiquez votre niveau de connaissance en IA.' };
    if (!roleTechnique) {
      return { error: 'Indiquez si votre rôle implique des compétences techniques.' };
    }
    return {
      value: { prenom, nom, email, telephone, metier, niveauDeclare, roleTechnique },
    };
  }

  startForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    const lead = readLead();
    if (lead.error) {
      showFormError(lead.error);
      return;
    }
    showFormError('');
    setBusy(true);
    try {
      const state = await api('/api/session/start', lead.value);
      welcome.hidden = true;
      quizScreen.hidden = false;
      resultScreen.hidden = true;
      applyState(state);
    } catch (err) {
      showFormError(err.message || 'Impossible de démarrer le quiz');
    } finally {
      setBusy(false);
    }
  });

  async function onChoice(optionId, btn) {
    if (busy || !sessionId) return;
    setBusy(true);
    if (btn) btn.classList.add('choice-selected');
    try {
      const state = await api(`/api/session/${sessionId}/answer`, { optionId });
      applyState(state);
    } catch (err) {
      choiceFeedback.hidden = false;
      choiceFeedback.textContent = err.message || 'Une erreur est survenue. Réessayez.';
    } finally {
      setBusy(false);
    }
  }
})();
