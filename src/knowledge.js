const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');

const banks = {
  technique: JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'quiz_technique.json'), 'utf8')
  ),
  'non-technique': JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'quiz_non_technique.json'), 'utf8')
  ),
};

function getBank(profilQcm) {
  const key = profilQcm === 'technique' ? 'technique' : 'non-technique';
  return banks[key];
}

function getQuestions(profilQcm) {
  return getBank(profilQcm).questions;
}

function getScoring(profilQcm) {
  return getBank(profilQcm).scoring;
}

function getQuizTitle(profilQcm) {
  if (profilQcm) return getBank(profilQcm).quizTitle;
  return 'Quiz d\'évaluation de niveau — Digital Process Group';
}

function getQuestionByIndex(profilQcm, index) {
  return getQuestions(profilQcm)[index] || null;
}

function getLevelBand(profilQcm, totalScore) {
  const bands = getScoring(profilQcm).levelBands;
  return bands.find((b) => totalScore >= b.min && totalScore <= b.max) || bands[0];
}

function getCorrectOption(question) {
  return question.options.find((o) => o.id === question.correctOptionId);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function categoryDisplayName(category) {
  if (category === 'Confidentialité et chiffrement') {
    return 'Confidentialité & chiffrement';
  }
  return category;
}

module.exports = {
  getBank,
  getQuestions,
  getScoring,
  getQuizTitle,
  getQuestionByIndex,
  getLevelBand,
  getCorrectOption,
  shuffle,
  categoryDisplayName,
};
