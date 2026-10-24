(() => {
  const QUESTIONS = window.MODULE1_QUESTIONS || [];
  const LETTERS = ['A', 'B', 'C', 'D'];

  const quizScreen = document.getElementById('quiz-screen');
  const resultScreen = document.getElementById('result-screen');
  const progressNum = document.getElementById('progress-num');
  const progressFill = document.getElementById('progress-fill');
  const progressTrack = document.getElementById('progress-track');
  const choicesEl = document.getElementById('choices');
  const qcmQuestion = document.getElementById('qcm-question');
  const resultClosing = document.getElementById('result-closing');
  const resultAdvice = document.getElementById('result-advice');
  const resultLevel = document.getElementById('result-level');
  const resultScore = document.getElementById('result-score');
  const reviewList = document.getElementById('review-list');
  const restartBtn = document.getElementById('restart-btn');

  let index = 0;
  let answers = [];
  let locked = false;

  function resultCopy(score) {
    if (score >= 7) {
      return {
        level: 'Avancé',
        closing: 'Bravo — vous maîtrisez déjà solidement les fondamentaux.',
        advice: 'Vous pouvez vous appuyer sur ces fondamentaux pour la suite du parcours.',
      };
    }
    if (score >= 4) {
      return {
        level: 'Intermédiaire',
        closing: 'Merci — un bon socle, avec des axes clairs à renforcer.',
        advice: 'Les questions à revoir indiquent les notions à consolider avant d’aller plus loin.',
      };
    }
    return {
      level: 'Débutant',
      closing: 'Merci — voici votre point de départ pour une montée en compétences ciblée.',
      advice: 'Reprenez le support du module — définition de l’IA, modèles, apprentissage, RAG et fine-tuning.',
    };
  }

  function fillAgentBubble(container, text) {
    container.replaceChildren();
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = 'D';
    const bubble = document.createElement('div');
    bubble.className = 'bubble agent';
    bubble.textContent = text;
    container.append(avatar, bubble);
  }

  function optionNode(opt, { button, className, tag }) {
    const el = document.createElement(button ? 'button' : 'div');
    if (button) el.type = 'button';
    el.className = className ? `choice-btn ${className}` : 'choice-btn';
    const letter = document.createElement('span');
    letter.className = 'choice-letter';
    letter.textContent = opt.id;
    const label = document.createElement('span');
    label.className = 'choice-label';
    label.textContent = opt.text;
    el.append(letter, label);
    if (tag) {
      const badge = document.createElement('span');
      badge.className = 'review-tag';
      badge.textContent = tag;
      el.append(badge);
    }
    return el;
  }

  function renderQuestion() {
    const question = QUESTIONS[index];
    const total = QUESTIONS.length;
    progressNum.textContent = String(index + 1);
    progressFill.style.width = `${Math.round(((index + 1) / total) * 100)}%`;
    progressTrack.setAttribute('aria-valuenow', String(index + 1));
    progressTrack.setAttribute('aria-valuemax', String(total));
    qcmQuestion.textContent = question.text;
    choicesEl.classList.remove('is-locked');
    choicesEl.replaceChildren();
    question.options.forEach((opt) => {
      const btn = optionNode(opt, { button: true });
      btn.addEventListener('click', () => select(opt.id, btn));
      choicesEl.append(btn);
    });
  }

  function select(optionId, btn) {
    if (locked) return;
    locked = true;
    answers[index] = optionId;
    btn.classList.add('choice-selected');
    choicesEl.classList.add('is-locked');
    window.setTimeout(() => {
      locked = false;
      if (index >= QUESTIONS.length - 1) {
        showResults();
        return;
      }
      index += 1;
      renderQuestion();
    }, 200);
  }

  function showResults() {
    const score = QUESTIONS.reduce(
      (total, question, i) => total + (answers[i] === question.correctOptionId ? 1 : 0),
      0
    );
    const copy = resultCopy(score);

    fillAgentBubble(resultClosing, copy.closing);
    fillAgentBubble(resultAdvice, copy.advice);
    resultLevel.textContent = `${score} / ${QUESTIONS.length}`;
    resultScore.textContent = copy.level;
    reviewList.replaceChildren();

    QUESTIONS.forEach((question, i) => {
      const picked = answers[i];
      const correct = picked === question.correctOptionId;
      const card = document.createElement('article');
      card.className = 'review-card';

      const head = document.createElement('div');
      head.className = 'review-head';
      const label = document.createElement('div');
      label.className = 'qcm-category';
      label.textContent = `Question ${i + 1}`;
      const badge = document.createElement('span');
      badge.className = correct ? 'review-badge is-correct' : 'review-badge is-incorrect';
      badge.textContent = correct ? 'Correcte' : 'À revoir';
      head.append(label, badge);

      const title = document.createElement('h2');
      title.className = 'review-question';
      title.textContent = question.text;

      const list = document.createElement('div');
      list.className = 'choices review-choices';
      question.options.forEach((opt) => {
        const isCorrect = opt.id === question.correctOptionId;
        const isPicked = opt.id === picked;
        let className = '';
        let tag = '';
        if (isCorrect) {
          className = 'choice-correct';
          tag = 'Bonne réponse';
        } else if (isPicked) {
          className = 'choice-incorrect';
          tag = 'Votre réponse';
        }
        list.append(optionNode(opt, { className, tag }));
      });

      card.append(head, title, list);
      reviewList.append(card);
    });

    quizScreen.hidden = true;
    resultScreen.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() {
    index = 0;
    answers = [];
    locked = false;
    resultScreen.hidden = true;
    quizScreen.hidden = false;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function questionsAreValid(list) {
    if (!Array.isArray(list) || list.length !== 10) return false;
    return list.every((question) => {
      if (!question || !String(question.text || '').trim()) return false;
      if (!Array.isArray(question.options) || question.options.length !== 4) return false;
      const ids = question.options.map((opt) => opt.id);
      if (ids.join('') !== LETTERS.join('')) return false;
      if (!LETTERS.includes(question.correctOptionId)) return false;
      return question.options.every((opt) => String(opt.text || '').trim());
    });
  }

  restartBtn.addEventListener('click', restart);

  if (!questionsAreValid(QUESTIONS)) {
    qcmQuestion.textContent = 'Le quizz ne peut pas être affiché.';
    return;
  }

  renderQuestion();
})();
