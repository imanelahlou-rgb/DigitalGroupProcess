(() => {
  const welcome = document.getElementById('welcome');
  const chatScreen = document.getElementById('chat-screen');
  const resultScreen = document.getElementById('result-screen');
  const startForm = document.getElementById('start-form');
  const startBtn = document.getElementById('start-btn');
  const formError = document.getElementById('form-error');
  const messagesEl = document.getElementById('messages');
  const progressNum = document.getElementById('progress-num');
  const progressFill = document.getElementById('progress-fill');
  const thinkingEl = document.getElementById('thinking');
  const choicesWrap = document.getElementById('choices-wrap');
  const choicesEl = document.getElementById('choices');
  const choiceHint = document.getElementById('choice-hint');
  const composer = document.getElementById('composer');
  const freeForm = document.getElementById('free-form');
  const freeInput = document.getElementById('free-input');
  const sendBtn = document.getElementById('send-btn');
  const resultClosing = document.getElementById('result-closing');
  const resultAdvice = document.getElementById('result-advice');
  const resultLevel = document.getElementById('result-level');
  const resultScore = document.getElementById('result-score');
  const resultCategories = document.getElementById('result-categories');

  let sessionId = null;
  let sessionToken = null;
  let busy = false;
  let lastAgentWasQuestion = false;

  const LETTERS = 'ABCDEFGH';

  function setBusy(value) {
    busy = value;
    thinkingEl.hidden = !value;
    sendBtn.disabled = value;
    freeInput.disabled = value;
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

  function formatScore(n) {
    const rounded = Math.round(Number(n) * 100) / 100;
    return String(rounded).replace('.', ',');
  }

  function appendMessage(role, text, opts = {}) {
    const row = document.createElement('div');
    row.className = `msg-row ${role}`;

    if (role === 'agent') {
      const av = document.createElement('div');
      av.className = 'msg-avatar';
      av.textContent = 'D';
      row.appendChild(av);
    }

    const bubble = document.createElement('div');
    bubble.className = `bubble ${role}`;
    if (opts.isQuestion) bubble.classList.add('question');
    bubble.innerHTML = formatText(text);
    row.appendChild(bubble);

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
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
    const pct = Math.max(4, Math.round((cur / total) * 100));
    progressFill.style.width = `${pct}%`;
    const of = document.querySelector('.progress-of');
    if (of) of.textContent = `sur ${total}`;
  }

  function setInputMode(mode, options, stage) {
    if (mode === 'free') {
      choicesWrap.hidden = true;
      choicesEl.innerHTML = '';
      composer.hidden = false;
      freeInput.value = '';
      freeInput.focus();
    } else if (mode === 'choice') {
      composer.hidden = true;
      choicesWrap.hidden = false;
      choicesEl.innerHTML = '';
      (options || []).forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        const letter = LETTERS[i] || String(i + 1);
        btn.innerHTML = `<span class="choice-letter">${letter}</span><span>${escapeHtml(opt.text)}</span>`;
        btn.addEventListener('click', () => onChoice(opt.id));
        choicesEl.appendChild(btn);
      });
      if (stage === 'choice2') {
        choiceHint.textContent = 'Indice utilisé · réponse validée à 0,25 point si correcte';
      } else {
        choiceHint.textContent = 'Indice utilisé · réponse validée à 0,5 point si correcte';
      }
    } else if (mode === 'done') {
      composer.hidden = true;
      choicesWrap.hidden = true;
      choicesEl.innerHTML = '';
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isLikelyQuestion(text, index, total) {
    // Heuristic: last agent message in a turn that advances is often the next question;
    // first turn has greeting then question. Treat non-feedback short-ish agent lines
    // after user as question when it's the last agent message in the batch.
    if (index !== total - 1) return false;
    const t = String(text || '');
    if (t.length < 8) return false;
    // Feedback usually contains celebration words or "bonne réponse"
    const feedbackish =
      /exactement|très bien|c'est ça|parfait|tout à fait|bien vu|pas tout à fait|on y est|bonne réponse|coquille|enchaîne|valide|synthèse|merci pour/i.test(
        t
      );
    return !feedbackish;
  }

  function applyMessages(messages) {
    const list = messages || [];
    list.forEach((m, i) => {
      if (m.role === 'user') {
        appendMessage('user', m.text);
        lastAgentWasQuestion = false;
      } else {
        const isQuestion = isLikelyQuestion(m.text, i, list.length);
        appendMessage('agent', m.text, { isQuestion });
        lastAgentWasQuestion = isQuestion;
      }
    });
  }

  function showResults(state) {
    chatScreen.hidden = true;
    resultScreen.hidden = false;

    const summary = state.summary || {};
    const closingMsg =
      (state.messages || []).filter((m) => m.role === 'agent').pop()?.text ||
      'Voici votre synthèse.';

    resultClosing.innerHTML = agentBubbleHtml(closingMsg);
    resultAdvice.innerHTML = agentBubbleHtml(
      summary.advice || summary.recommendation || ''
    );
    resultLevel.textContent = summary.level || '—';
    resultScore.textContent = `${formatScore(summary.totalScore)} / ${summary.maxScore || 25} points`;

    resultCategories.innerHTML = '';
    const cats = summary.byCategory || {};
    // Only the 3 quiz categories — never show Cursor / GitHub lines
    const forbidden = /cursor|github|d[ée]ploiement|d[ée]couvrir/i;
    Object.entries(cats).forEach(([name, data]) => {
      if (forbidden.test(name)) return;
      const label =
        name === 'Confidentialité et chiffrement'
          ? 'Confidentialité & chiffrement'
          : name;
      const pct = data.max ? Math.round((data.score / data.max) * 100) : 0;
      const row = document.createElement('div');
      row.innerHTML = `
        <div class="cat-row-label"><span>${escapeHtml(label)}</span><span>${formatScore(data.score)} / ${data.max}</span></div>
        <div class="cat-bar"><div class="cat-bar-fill" style="width:${pct}%"></div></div>
      `;
      resultCategories.appendChild(row);
    });
  }

  function applyState(state) {
    sessionId = state.sessionId;
    if (state.sessionToken) sessionToken = state.sessionToken;
    updateProgress(state.progress);
    applyMessages(state.messages);

    if (state.inputMode === 'done') {
      // Don't duplicate closing in chat before switching — show result screen
      showResults(state);
      return;
    }

    setInputMode(state.inputMode, state.options, state.stage);
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
    return { value: { prenom, nom, email, telephone, metier } };
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
      chatScreen.hidden = false;
      resultScreen.hidden = true;
      messagesEl.innerHTML = '';
      applyState(state);
    } catch (err) {
      showFormError(err.message || 'Impossible de démarrer le quiz');
    } finally {
      setBusy(false);
    }
  });

  freeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy || !sessionId) return;
    const text = freeInput.value.trim();
    if (!text) return;
    setBusy(true);
    freeInput.value = '';
    try {
      const state = await api(`/api/session/${sessionId}/answer`, { text });
      applyState(state);
    } catch (err) {
      appendMessage('agent', err.message || 'Une erreur est survenue. Réessayez.');
      setInputMode('free');
    } finally {
      setBusy(false);
    }
  });

  async function onChoice(optionId) {
    if (busy || !sessionId) return;
    setBusy(true);
    try {
      const state = await api(`/api/session/${sessionId}/answer`, { optionId });
      applyState(state);
    } catch (err) {
      appendMessage('agent', err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setBusy(false);
    }
  }
})();
