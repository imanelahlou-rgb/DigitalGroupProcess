const path = require('path');
const fs = require('fs');

function load(name) {
  const file = path.join(__dirname, '..', 'data', `${name}.json`);
  const quiz = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(quiz.questions) || quiz.questions.length !== 20) {
    throw new Error(`${name}: 20 questions attendues, reçu ${quiz.questions?.length}`);
  }
  if (!Array.isArray(quiz.scoring?.levelBands) || quiz.scoring.levelBands.length === 0) {
    throw new Error(`${name}: levelBands manquants`);
  }
  return quiz;
}

const quizzes = {
  technique: load('quiz_technique'),
  'non-technique': load('quiz_non_technique'),
};

function getQuiz(profile) {
  const quiz = quizzes[profile];
  if (!quiz) {
    const err = new Error('Profil de QCM inconnu');
    err.status = 400;
    throw err;
  }
  return quiz;
}

function getLevelBand(profile, totalScore) {
  const bands = getQuiz(profile).scoring.levelBands;
  return bands.find((b) => totalScore >= b.min && totalScore <= b.max) || bands[bands.length - 1];
}

function publicQuestion(question) {
  return {
    id: question.id,
    category: question.category,
    difficulty: question.difficulty,
    question: question.question,
    options: question.options.map((o) => ({ id: o.id, text: o.text })),
  };
}

function listProfiles() {
  return Object.fromEntries(Object.entries(quizzes).map(([key, quiz]) => [key, quiz.questions.length]));
}

module.exports = {
  getQuiz,
  getLevelBand,
  publicQuestion,
  listProfiles,
};
