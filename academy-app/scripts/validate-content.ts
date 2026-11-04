/**
 * Validation du contenu pédagogique (quiz, prix, structure, RISEN).
 * Exécution : npm run validate:content
 */
import { modules } from '../src/content/modules'
import { NOVA_SERVICES, CLIENT_ATLAS, CLIENT_RIF, CLIENT_OCEAN } from '../src/content/nova'
import { runChecks } from '../src/lib/validate'

const errors: string[] = []
const warns: string[] = []
const err = (m: string) => errors.push(m)
const warn = (m: string) => warns.push(m)

/* ------------------------------ prix ------------------------------ */
const EXPECTED: Record<string, number> = { N01: 4500, N02: 6500, N03: 3000, N04: 5500, N05: 9000 }
for (const s of NOVA_SERVICES) {
  if (EXPECTED[s.code] !== s.priceMadHt) err(`Catalogue ${s.code}: ${s.priceMadHt} != ${EXPECTED[s.code]}`)
}
const price = (c: string) => EXPECTED[c]
if (price('N01') + price('N04') !== 10000) err('Océan N01+N04 != 10000')
if (CLIENT_OCEAN.budget_mad !== 11000) err('Océan budget != 11000')
if (CLIENT_ATLAS.budget_mad !== 12000) err('Atlas budget != 12000')
if (CLIENT_RIF.budget_mad !== 2500) err('Rif budget != 2500')
if (price('N02') !== 6500 || 12000 - price('N02') !== 5500) err('Atlas N02 / reliquat 5500')
if (price('N03') - 2500 !== 500) err('Rif dépassement 500')
if (11000 - 10000 !== 1000) err('Océan reliquat 1000')

const num = (s: string) => Number(s.replace(/[\s\u00a0\u202f]/g, ''))
const NUM = '(\\d{1,2}[\\s\\u00a0\\u202f]?\\d{3}|\\d{4,5})'
const priceRegexes = Object.keys(EXPECTED).map((c) => ({
  code: c,
  // « N02 = 6 500 », « N02 à 6500 », « N02 (6 500 », « N02 — 6 500 », « N02 | nom | 6 500 »
  re: new RegExp(`(?<!\\+\\s)\\b${c}\\b(?:\\s*(?:=|à|:|—|–|-|vaut|est)\\s*|\\s*\\([^)\\d]{0,40}?\\s*|\\s+[A-Za-zÀ-ÿ' ]{3,40}?\\s+(?:—\\s*)?)${NUM}(?!\\d)`, 'g'),
}))

const KNOWN_CONTRADICTIONS = /promis|affichait|erron|faux|incorrect|contradict|piège|ancien|remise|spontan|proposer|inventée|plaisir|ramener|budget|prix en MAD HT : 4500|N0\d \+ N0\d/i

/* ------------------------------ parcours ------------------------------ */
const allText: { where: string; text: string }[] = []
function walk(value: unknown, path: string) {
  if (typeof value === 'string') allText.push({ where: path, text: value })
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`))
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`)
}

const exerciseIds = new Set<string>()
let quizTotal = 0

for (const m of modules) {
  const tag = m.id
  walk(m, tag)

  if (!m.situation || m.situation.length < 150) err(`${tag}: situation absente/courte`)
  if (m.objectives.length < 3 || m.objectives.length > 5) warn(`${tag}: ${m.objectives.length} objectifs (3–5 attendus)`)
  if (m.lessons.length < 2) err(`${tag}: < 2 leçons`)
  m.lessons.forEach((l) => {
    if (l.body.length < 800) warn(`${tag}/${l.id}: corps de leçon court (${l.body.length} car.)`)
  })
  if (!m.demo || m.demo.steps.length < 3) err(`${tag}: démo absente ou < 3 étapes`)
  if (m.exercises.length < 1) err(`${tag}: aucun exercice interactif`)
  if (m.quiz.length < 5) warn(`${tag}: quiz de ${m.quiz.length} questions`)
  if (!m.practicalMission?.prompt) err(`${tag}: mission pratique absente`)
  if (!m.practicalMission?.deliverables?.length) err(`${tag}: livrables de mission absents`)
  if (!m.verification?.criteria?.length) err(`${tag}: grille absente`)
  else {
    const sum = m.verification.criteria.reduce((s, c) => s + c.maxPoints, 0)
    if (sum !== m.verification.maxPoints) err(`${tag}: grille somme ${sum} != maxPoints ${m.verification.maxPoints}`)
    if (m.verification.passThreshold > m.verification.maxPoints) err(`${tag}: seuil > max`)
    for (const c of m.verification.criteria) {
      const top = Math.max(...c.levels.map((l) => l.points))
      if (top !== c.maxPoints) err(`${tag}/${c.id}: niveau max ${top} != maxPoints ${c.maxPoints}`)
    }
  }
  if (!m.synthesis || m.synthesis.takeaways.length !== 3) err(`${tag}: synthèse != 3 points`)

  // quiz
  const qIds = new Set<string>()
  for (const q of m.quiz) {
    quizTotal++
    if (qIds.has(q.id)) err(`${tag}/${q.id}: id de question dupliqué`)
    qIds.add(q.id)
    const ids = q.choices.map((c) => c.id)
    if (new Set(ids).size !== ids.length) err(`${tag}/${q.id}: ids de choix dupliqués`)
    if (!ids.includes(q.correctId)) err(`${tag}/${q.id}: correctId « ${q.correctId} » absent des choix [${ids}]`)
    if (q.choices.length < 3) warn(`${tag}/${q.id}: < 3 choix`)
    if (!q.explanation || q.explanation.length < 20) err(`${tag}/${q.id}: explication absente/courte`)
    const labels = q.choices.map((c) => c.label.trim().toLowerCase())
    if (new Set(labels).size !== labels.length) err(`${tag}/${q.id}: libellés de choix dupliqués`)
  }
  const correctDist = m.quiz.map((q) => q.correctId).join('')
  if (m.quiz.length >= 5 && new Set(m.quiz.map((q) => q.correctId)).size === 1) warn(`${tag}: toutes les bonnes réponses identiques (${correctDist})`)

  // exercices
  for (const ex of m.exercises) {
    if (exerciseIds.has(ex.id)) err(`${tag}/${ex.id}: id d'exercice dupliqué`)
    exerciseIds.add(ex.id)
    if (ex.hints.length < 1) warn(`${tag}/${ex.id}: aucun indice`)
    if (ex.kind === 'classify') {
      const cats = new Set(ex.categories.map((c) => c.id))
      for (const c of ex.cards) if (!cats.has(c.correctCategoryId)) err(`${tag}/${ex.id}/${c.id}: catégorie ${c.correctCategoryId} inconnue`)
    }
    if (ex.kind === 'file-edit') {
      const res = runChecks(ex.checks, ex.solution)
      res.filter((r) => !r.ok).forEach((r) => err(`${tag}/${ex.id}: la solution échoue au contrôle « ${r.id} »`))
      const starterRes = runChecks(ex.checks, ex.starter)
      if (starterRes.every((r) => r.ok)) warn(`${tag}/${ex.id}: le texte de départ réussit déjà tous les contrôles`)
    }
    if (ex.kind === 'brief-builder') {
      const fieldIds = ex.fields.map((f) => f.id)
      for (const mt of ex.outputTemplate.matchAll(/\{\{([^}]+)\}\}/g)) if (!fieldIds.includes(mt[1])) err(`${tag}/${ex.id}: marqueur {{${mt[1]}}} sans champ`)
    }
    if (ex.kind === 'context-simulator') {
      const layerIds = new Set(ex.layers.map((l) => l.id))
      ex.outcomes.forEach((o, i) => o.requires.forEach((r) => !layerIds.has(r) && err(`${tag}/${ex.id}: outcome ${i} requiert couche inconnue ${r}`)))
    }
  }

  // navigation
  if (!m.synthesis.nextModule.href) err(`${tag}: nextModule.href vide`)
}

/* ------------------------------ scan textuel ------------------------------ */
let priceMentions = 0
for (const { where, text } of allText) {
  for (const { code, re } of priceRegexes) {
    re.lastIndex = 0
    for (const mt of text.matchAll(re)) {
      priceMentions++
      const v = num(mt[1])
      if (v !== EXPECTED[code]) {
        const ctx = text.slice(Math.max(0, mt.index! - 80), mt.index! + mt[0].length + 80)
        if (KNOWN_CONTRADICTIONS.test(ctx)) warn(`prix ${code}=${v} dans contexte de contradiction volontaire @ ${where}`)
        else err(`prix ${code}=${v} (attendu ${EXPECTED[code]}) @ ${where}: …${mt[0]}…`)
      }
    }
  }
  // RISEN : lettres erronées
  if (/RISEN/.test(text)) {
    if (/\bI\b\s*[—-]\s*Instructions?\b|\bE\b\s*[—-]\s*(Examples?|Exemples?)\b|\bN\b\s*[—-]\s*(Notes?|Next)\b|\bS\b\s*[—-]\s*(Situation|Style)\b/i.test(text))
      err(`RISEN: lettre erronée @ ${where}`)
  }
  if (/objectif final/i.test(text)) err(`« Objectif final » @ ${where}`)
  if (/\b(lorem|todo|fixme|coming soon|à venir|bientôt disponible)\b/i.test(text)) err(`marqueur de contenu provisoire @ ${where}`)
}

// RISEN : tout module qui cite les 5 lettres doit citer les 5 mots
const risenOk = /Role[^.]{0,40}Input[^.]{0,40}Steps[^.]{0,40}Expectation[^.]{0,40}Narrowing/
const risenAll = allText.filter((t) => /RISEN/.test(t.text) && /Narrowing|Expectation|Steps/.test(t.text))
if (!risenAll.some((t) => risenOk.test(t.text))) err('RISEN: définition canonique Role/Input/Steps/Expectation/Narrowing introuvable')

/* ------------------------------ rapport ------------------------------ */
console.log(`Modules: ${modules.length} | Questions de quiz: ${quizTotal} | Exercices: ${exerciseIds.size} | Mentions de prix vérifiées: ${priceMentions}`)
console.log(`Arithmétique: N01+N04=${price('N01') + price('N04')} (budget 11000), Atlas N02=${price('N02')} (budget 12000, reliquat ${12000 - price('N02')}), Rif N03=${price('N03')} (budget 2500, écart +${price('N03') - 2500})`)
console.log('\nmodule | min | obj | leçons(car.) | démo | exercices | quiz | grille(max/seuil) | next')
for (const m of modules) {
  console.log(
    [
      m.id,
      m.durationMin,
      m.objectives.length,
      m.lessons.map((l) => l.body.length).join('/'),
      m.demo.steps.length,
      m.exercises.map((e) => e.kind).join('+'),
      m.quiz.length,
      `${m.verification.maxPoints}/${m.verification.passThreshold}`,
      m.synthesis.nextModule.id,
    ].join(' | '),
  )
}
if (warns.length) console.log(`\nAVERTISSEMENTS (${warns.length})\n- ` + warns.join('\n- '))
if (errors.length) {
  console.log(`\nERREURS (${errors.length})\n- ` + errors.join('\n- '))
  process.exit(1)
}
console.log('\nOK : aucune erreur bloquante.')

