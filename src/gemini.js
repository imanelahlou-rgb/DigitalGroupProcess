const { GoogleGenerativeAI } = require('@google/generative-ai');

let model = null;

function getModel() {
  if (model) return model;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY manquante dans les variables d\'environnement');
  }
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
    },
  });
  return model;
}

const TONE_RULES = `
Tu es l'agent d'évaluation de Digital Process Group (DPG). Ton : convivial, encourageant, professionnel, concis.
- Pas d'emojis excessifs, pas de familiarité excessive.
- Bonne réponse : féliciter brièvement avec une formulation VARIANTE (Exactement / Très bien / C'est ça / Parfait / Tout à fait / Bien vu…) — ne jamais répéter toujours "Bravo".
- Mauvaise réponse : jamais sec ni négatif — encourager, dédramatiser.
- Exemples de ton :
  * Succès : "Exactement — Large Language Model, c'est bien ça."
  * Échec doux : "Pas tout à fait, mais on y est presque — regarde ces options."
  * Encouragement : "Ce n'est pas grave, on affine ensemble."

Tu ne juges et n'expliques JAMAIS hors de la référence fournie (referenceAnswer + explanation).

JUGEMENT SÉMANTIQUE (obligatoire — pas littéral) :
- La réponse est Correcte dès qu'elle désigne SANS AMBIGUÏTÉ le même concept que referenceAnswer ET explanation, même reformulée avec d'autres mots, dans un autre ordre, plus courte/longue, ou en langage familier.
- Appuie-toi sur explanation (pas seulement referenceAnswer) pour vérifier que l'idée clé est couverte.
- Ne déclenche JAMAIS les indices seulement parce que la formulation diffère du libellé exact de referenceAnswer.
- Fautes de frappe / variations orthographiques mineures → Correcte aussi.
- Indices UNIQUEMENT si la réponse rate le concept clé ou désigne autre chose.

Exemples de calibration (question « Pourquoi utilise-t-on le RAG ? », référence : connecter l'IA à des données externes/privées/récentes absentes de l'entraînement) :
  * "Pour que le modèle puisse aller chercher des infos qu'il ne connaît pas dans ses données d'entraînement, genre des docs internes ou des trucs récents" → Correcte (même idée, autres mots)
  * "Pour rendre les réponses plus rapides" → Incorrecte (concept différent)
  * "Large Language Modal" (pour LLM) → Correcte (faute de frappe)
  * "Un modèle qui comprend plusieurs langues" (pour LLM) → Incorrecte (autre concept)

CLARIFICATIONS :
- Si l'utilisateur demande une reformulation / dit qu'il n'a pas compris → ce n'est PAS une réponse à juger (géré séparément).
Réponds UNIQUEMENT en JSON valide.
`;

const SUCCESS_VARIANTS = [
  'Exactement',
  'Très bien',
  'C\'est ça',
  'Parfait',
  'Tout à fait',
  'Bien vu',
];

function pickSuccess() {
  return SUCCESS_VARIANTS[Math.floor(Math.random() * SUCCESS_VARIANTS.length)];
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

function maxEditsForToken(len) {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}

/** True if two tokens are equal or near-typo. */
function tokensClose(a, b) {
  if (a === b) return true;
  const dist = levenshtein(a, b);
  return dist <= Math.max(maxEditsForToken(a.length), maxEditsForToken(b.length));
}

/**
 * Fuzzy match: whole-string edit distance, or token-by-token with typo tolerance.
 * Catches "Large Language Modal" ≈ "Large Language Model".
 */
function fuzzyEquals(userNorm, refNorm) {
  if (!userNorm || !refNorm) return false;
  if (userNorm === refNorm) return true;

  const maxWhole = Math.max(2, Math.floor(refNorm.length * 0.18));
  if (levenshtein(userNorm, refNorm) <= maxWhole) return true;

  const uTokens = userNorm.split(' ');
  const rTokens = refNorm.split(' ');
  if (uTokens.length === rTokens.length) {
    return rTokens.every((rt, i) => tokensClose(rt, uTokens[i]));
  }

  // Allow user answer containing a fuzzy version of the reference phrase
  if (userNorm.includes(refNorm)) return true;

  // Sliding window of same token count as reference
  if (uTokens.length > rTokens.length) {
    for (let i = 0; i <= uTokens.length - rTokens.length; i++) {
      const slice = uTokens.slice(i, i + rTokens.length);
      if (rTokens.every((rt, j) => tokensClose(rt, slice[j]))) return true;
    }
  }

  return false;
}

/** Deterministic local match before calling the LLM. */
function localMatch(question, userAnswer) {
  const u = normalize(userAnswer);
  const ref = normalize(question.referenceAnswer);
  if (!u) return false;
  if (fuzzyEquals(u, ref)) return true;

  const correctOpt = question.options?.find((o) => o.id === question.correctOptionId);
  if (correctOpt && fuzzyEquals(u, normalize(correctOpt.text))) return true;
  return false;
}

function localSuccessFeedback(question, userAnswer) {
  const u = normalize(userAnswer);
  const ref = normalize(question.referenceAnswer);
  const hadTypo = u !== ref && fuzzyEquals(u, ref);
  if (hadTypo) {
    return `${pickSuccess()} — ${question.referenceAnswer} (petite coquille, mais l'idée est la bonne). On enchaîne !`;
  }
  return `${pickSuccess()} — ${question.referenceAnswer}.`;
}

/**
 * Detect clarification / "I don't understand" requests (not answer attempts).
 */
function isClarificationRequest(userAnswer) {
  const raw = String(userAnswer || '').trim();
  const u = normalize(raw);
  if (!u) return false;
  if (/^\?+$/.test(raw)) return true;

  const patterns = [
    /je (n |ne )?(ai |aie )?pas compris/,
    /j ai pas compris/,
    /je (ne )?comprends? pas/,
    /(c est|ce n est) pas clair/,
    /\bpas clair\b/,
    /tu peux reformul/,
    /peux tu reformul/,
    /pouvez[- ]vous reformul/,
    /\breformul(e|er|ez)\b/,
    /qu est ce que (tu|vous) (veux|voulez) dire/,
    /qu est ce que (ca|cela) veut dire/,
    /je (ne )?sais pas ce que (ca|cela) veut dire/,
    /je (ne )?sais pas ce que (tu|vous) (veux|voulez) dire/,
    /\brepete(r|z)?\b/,
    /(tu peux|peux tu|pouvez vous) (m )?expliquer/,
    /\bexplique[- ]?moi\b/,
    /plus simplement/,
    /en d autres termes/,
    /je (ne )?suis pas sur de comprendre/,
    /je (ne )?vois pas (ce que|de quoi)/,
    /\bkesako\b/,
  ];

  if (patterns.some((p) => p.test(u))) return true;

  // Short help-seeking messages only
  if (u.length <= 55) {
    const asksHelp = /comprend|clair|reformul|explic|repet|veut dire|veux dire|c est quoi/.test(u);
    const looksLikeAnswer = /parce que|afin de|pour (que|connecter|permettre)|llm|rag|agent|modele|chiffrement/.test(u);
    if (asksHelp && !looksLikeAnswer) return true;
  }
  return false;
}

/**
 * Rephrase the current question using only KB grounding.
 * @param {object} question
 * @param {number} attemptIndex 0 = first rephrase, 1+ = different wording + example
 */
async function rephraseQuestion(question, attemptIndex = 0) {
  const variant =
    attemptIndex === 0
      ? 'Reformule la question en termes plus simples et naturels. Commence par une formule du type « Bien sûr, autrement dit : … ». Ne révèle PAS la réponse.'
      : 'Reformule DIFFÉREMMENT de toute reformulation précédente, et ajoute un petit exemple concret ancré UNIQUEMENT dans l\'explanation (sans donner la bonne réponse ni les options). Commence par une formule naturelle (ex. « Autre façon de le dire : … »).';

  const prompt = `${TONE_RULES}

L'utilisateur n'a pas compris la question. ${variant}

Énoncé original: ${question.question}
Explication (seule source de fond — ne rien inventer hors de ça): ${question.explanation}
Réponse de référence (NE PAS révéler): ${question.referenceAnswer}

Termine en reposant clairement la question reformulée, pour que l'utilisateur puisse répondre librement.
JSON: {"message": "..."}`;

  try {
    const result = await getModel().generateContent(prompt);
    const parsed = parseJsonResponse(result.response.text(), null);
    if (parsed?.message) return String(parsed.message);
  } catch (err) {
    console.error('rephraseQuestion error:', err.message);
  }

  // Fallback grounded on explanation only
  const hook =
    attemptIndex === 0
      ? 'Bien sûr, autrement dit'
      : 'Autre façon de le voir';
  const hint = question.explanation.split('.').slice(0, 1).join('.').trim();
  return `${hook} : ${hint}.\n\n${question.question}`;
}

/**
 * Evaluate a free-text answer against the knowledge base entry.
 * @returns {{ correct: boolean, feedback: string }}
 */
async function evaluateFreeText(question, userAnswer) {
  if (localMatch(question, userAnswer)) {
    return { correct: true, feedback: localSuccessFeedback(question, userAnswer) };
  }

  const prompt = `${TONE_RULES}

Question id: ${question.id}
Énoncé: ${question.question}
Réponse de référence: ${question.referenceAnswer}
Explication autorisée (source principale pour juger le SENS): ${question.explanation}

Réponse libre de l'utilisateur: """${userAnswer}"""

Tâche: juge le SENS, pas la forme.
- Si l'idée clé de referenceAnswer/explanation est présente (même mots différents, ordre différent, familier, plus court/long) → correct=true.
- Si la réponse rate le concept ou parle d'autre chose → correct=false.
- En cas de doute raisonnable entre "même idée" et hors-sujet, privilégie correct=true si le concept clé est identifiable.
Si correcte: feedback = courte félicitation (formulation variée).
Si incorrecte: feedback = encouragement doux qui annonce des choix (sans révéler la bonne réponse).

JSON attendu:
{"correct": true|false, "feedback": "texte en français"}`;

  try {
    const result = await getModel().generateContent(prompt);
    const text = result.response.text();
    const parsed = parseJsonResponse(text, null);
    if (parsed && typeof parsed.correct === 'boolean' && parsed.feedback) {
      return { correct: parsed.correct, feedback: String(parsed.feedback) };
    }
    console.warn('evaluateFreeText: unparseable response:', text?.slice?.(0, 200));
  } catch (err) {
    console.error('evaluateFreeText LLM error:', err.message);
  }

  return {
    correct: false,
    feedback: 'Pas tout à fait, mais on y est presque — regardez ces options.',
  };
}

async function feedbackCorrectChoice(question, stage) {
  const stageHint =
    stage === 'choice4'
      ? 'correct après 4 choix (score réduit)'
      : 'correct après 2 choix (score minimal)';

  const prompt = `${TONE_RULES}

L'utilisateur vient de trouver la bonne réponse (${stageHint}) pour:
Question: ${question.question}
Bonne réponse: ${question.referenceAnswer}

Écris un court feedback encourageant (1-2 phrases), félicitation variée, sans cours magistral.
JSON: {"feedback": "..."}`;

  try {
    const result = await getModel().generateContent(prompt);
    const parsed = parseJsonResponse(result.response.text(), null);
    if (parsed?.feedback) return String(parsed.feedback);
  } catch (err) {
    console.error('feedbackCorrectChoice error:', err.message);
  }
  return `${pickSuccess()}, on valide.`;
}

async function feedbackReveal(question) {
  const prompt = `${TONE_RULES}

L'utilisateur n'a pas trouvé la bonne réponse même après aide.
Question: ${question.question}
Bonne réponse: ${question.referenceAnswer}
Explication (seule source): ${question.explanation}

Écris un message encourageant qui révèle la bonne réponse et une explication COURTE tirée uniquement de l'explication fournie (1-3 phrases). Pas de ton négatif.
JSON: {"feedback": "..."}`;

  try {
    const result = await getModel().generateContent(prompt);
    const parsed = parseJsonResponse(result.response.text(), null);
    if (parsed?.feedback) return String(parsed.feedback);
  } catch (err) {
    console.error('feedbackReveal error:', err.message);
  }
  const short = question.explanation.split('.').slice(0, 2).join('.').trim();
  return `La bonne réponse était : ${question.referenceAnswer}. ${short}${short.endsWith('.') ? '' : '.'}`;
}

async function generateSummary({ name, totalScore, maxScore, level, recommendation, byCategory }) {
  const catLines = Object.entries(byCategory)
    .map(([cat, s]) => `- ${cat}: ${s.score}/${s.max}`)
    .join('\n');

  const prompt = `${TONE_RULES}

Rédige DEUX courts messages pour la fin du quiz (positifs, positifs quel que soit le niveau).

IMPORTANT — le quiz ne couvre QUE ces 3 catégories (aucune autre) :
1. Fondamentaux de l'IA
2. Fondamentaux de l'IA agentique
3. Confidentialité et chiffrement
Interdiction absolue de mentionner Cursor, GitHub, déploiement, ou toute autre catégorie/module hors de cette liste.

Prénom/nom (peut être vide): ${name || ''}
Score total: ${totalScore}/${maxScore}
Niveau: ${level}
Recommandation officielle: ${recommendation}
Scores par catégorie (uniquement ceux-ci):
${catLines}

1) closing: 1-2 phrases de clôture encourageantes (ex. belle performance / merci pour ce parcours).
2) advice: 1-2 phrases basées UNIQUEMENT sur la recommandation officielle et les 3 catégories ci-dessus (ex. souligner un point fort IA / IA agentique, et un axe priorité sur la confidentialité si pertinent). Ne pas inventer d'autres modules.

JSON: {"closing": "...", "advice": "..."}`;

  try {
    const result = await getModel().generateContent(prompt);
    const parsed = parseJsonResponse(result.response.text(), null);
    if (parsed?.closing && parsed?.advice) {
      return {
        closing: sanitizeSummaryText(String(parsed.closing)),
        advice: sanitizeSummaryText(String(parsed.advice)),
      };
    }
    if (parsed?.message) {
      return {
        closing: sanitizeSummaryText(String(parsed.message)),
        advice: recommendation,
      };
    }
  } catch (err) {
    console.error('generateSummary error:', err.message);
  }

  const who = name ? `${name}, ` : '';
  return {
    closing: `${who}merci pour ce parcours. Voici votre synthèse.`,
    advice: recommendation,
  };
}

/** Strip accidental Cursor / GitHub category mentions from agent summary copy. */
function sanitizeSummaryText(text) {
  return String(text || '')
    .replace(/\bCursor\b/gi, 'IA agentique')
    .replace(/\bd[ée]ploiement\s+(avec\s+)?GitHub\b/gi, 'confidentialité')
    .replace(/\bmodules?\s+2\s*[àa-]\s*4\b/gi, 'modules IA agentique et sécurité');
}

function parseJsonResponse(text, fallback) {
  if (!text || typeof text !== 'string') return fallback;
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return fallback;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return fallback;
  }
}

module.exports = {
  evaluateFreeText,
  feedbackCorrectChoice,
  feedbackReveal,
  generateSummary,
  rephraseQuestion,
  isClarificationRequest,
  localMatch,
  fuzzyEquals,
  normalize,
};
