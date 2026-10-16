const fs = require('fs');
const path = require('path');

const HEADER =
  'timestamp,prenom,nom,email,telephone,metier,niveau_declare,profil_qcm,score,niveau_calcule,recommandation\n';

function csvEscape(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function resultLine(session) {
  const p = session.profile;
  const s = session.summary;
  return (
    [
      new Date().toISOString(),
      p.prenom,
      p.nom,
      p.email,
      p.telephone,
      p.metier,
      p.niveauDeclare,
      p.profilQcm,
      s.totalScore,
      s.level,
      s.recommendation,
    ]
      .map(csvEscape)
      .join(',') + '\n'
  );
}

function writeLine(file, line) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, HEADER, 'utf8');
  fs.appendFileSync(file, line, 'utf8');
}

/**
 * Append one result row.
 * Local runs write data/results.csv (gitignored).
 * On Vercel the project disk is read-only, so the same row is written under /tmp
 * when that is the only writable location.
 */
function appendResult(session) {
  const line = resultLine(session);
  const targets = [path.join(__dirname, '..', 'data', 'results.csv')];
  if (process.env.VERCEL) targets.push(path.join('/tmp', 'dpg-results.csv'));

  let lastError = null;
  for (const file of targets) {
    try {
      writeLine(file, line);
      return { ok: true, file };
    } catch (err) {
      lastError = err;
    }
  }

  console.error('Quiz result persist failed:', lastError && lastError.code);
  return { ok: false };
}

module.exports = { appendResult, HEADER };
