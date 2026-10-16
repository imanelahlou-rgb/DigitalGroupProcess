const fs = require('fs');
const path = require('path');

const quiz = path.join(
  'C:/Users/DELL/Desktop/AI Crafter/cours IA spécialisée/quiz-dpg'
);

fs.copyFileSync(
  path.join(quiz, 'public/css/styles.css'),
  path.join(__dirname, '..', 'evaluation', 'css', 'styles.css')
);

let html = fs.readFileSync(path.join(quiz, 'public/index.html'), 'utf8');
html = html
  .replace('href="/css/styles.css"', 'href="css/styles.css"')
  .replace('src="/js/app.js"', 'src="js/app.js"');
fs.writeFileSync(path.join(__dirname, '..', 'evaluation', 'index.html'), html);

console.log('synced evaluation html/css');
