const path = require('path');
const fs = require('fs');

const knowledgePath = path.join(__dirname, '..', 'data', 'questions.json');
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

function getQuestions() {
  return knowledge.questions;
}

function getScoring() {
  return knowledge.scoring;
}

function getQuizTitle() {
  return knowledge.quizTitle;
}

function getQuestionByIndex(index) {
  return knowledge.questions[index] || null;
}

function getLevelBand(totalScore) {
  const bands = knowledge.scoring.levelBands;
  return bands.find((b) => totalScore >= b.min && totalScore <= b.max) || bands[0];
}

function getCategories() {
  const cats = [];
  for (const q of knowledge.questions) {
    if (!cats.includes(q.category)) cats.push(q.category);
  }
  return cats;
}

/** Display label for the results UI (aligned with resultat.html). */
function categoryDisplayName(category) {
  if (category === 'Confidentialité et chiffrement') {
    return 'Confidentialité & chiffrement';
  }
  return category;
}

/** Distractors in original options order (excluding correct). */
function getDistractors(question) {
  return question.options.filter((o) => o.id !== question.correctOptionId);
}

function getCorrectOption(question) {
  return question.options.find((o) => o.id === question.correctOptionId);
}

/** Shuffle array (Fisher–Yates), returns new array. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = {
  getQuestions,
  getScoring,
  getQuizTitle,
  getQuestionByIndex,
  getLevelBand,
  getCategories,
  categoryDisplayName,
  getDistractors,
  getCorrectOption,
  shuffle,
  knowledge,
};
