import type { Module } from '../types'
import { UI_VERIFY_NOTE } from '../types'
import { mcq, weightedCriterion } from '../helpers'

/**
 * Module 8 — Claude Code et défi final Océan Services (55 min)
 * Prix NOVA (MAD HT) : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000.
 * Océan Services = N01 + N04 = 10 000 MAD HT (budget 11 000).
 * Claude Code (installation, commandes, permissions) : à vérifier selon compte et version.
 */

/* -------------------------------------------------------------------------- */
/* Types locaux (barème, défi)                                                  */
/* -------------------------------------------------------------------------- */

export type RubricCriterionId =
  | 'formats'
  | 'risen'
  | 'design'
  | 'project'
  | 'skill'
  | 'scheduled'
  | 'workflow'
  | 'code'
  | 'security'

export interface ChallengeStep {
  id: string
  step: number
  title: string
  rubricCriterionId: RubricCriterionId
  durationMin: number
  instruction: string
  deliverable: string
  successChecks: string[]
  hint: string
  points: number
}

export interface ScoreBand {
  id: 'maitrise' | 'acquis' | 'renforcer'
  min: number
  max: number
  label: string
  message: string
  nextSteps: string[]
}

/* -------------------------------------------------------------------------- */
/* CLAUDE.md et démo Claude Code                                                */
/* -------------------------------------------------------------------------- */

export const CLAUDE_MD_EXAMPLE = `# CLAUDE.md — nova-devis-tools

## Contexte du projet
Petit outil interne de NOVA Conseil pour calculer et contrôler les devis NOVA.
Langue de travail : français. Les messages de commit et les commentaires sont en français.

## Catalogue NOVA (source de vérité, MAD HT)
- N01 : 4500
- N02 : 6500
- N03 : 3000
- N04 : 5500
- N05 : 9000
Ne jamais modifier ces prix sans demande explicite d'un responsable NOVA. Un seul fichier les contient : src/catalogue.ts.

## Commandes utiles
- Installer : npm install
- Tester : npm test
- Lancer le calcul : npm run devis -- N01 N04 --budget 11000

## Conventions de code
- TypeScript strict, pas de any.
- Fonctions pures pour les calculs, entrées et sorties typées.
- Les montants sont des entiers en MAD HT (pas de décimales flottantes).
- Chaque fonction exportée a au moins un test.

## Règles métier
- Total = somme exacte des prix du catalogue.
- Si total > budget : statut ALERTE_BUDGET, écart en MAD et en pourcentage. Aucune remise.
- Si budget absent : statut INFORMATIONS_MANQUANTES, aucun total.
- Un code d'offre inconnu provoque une erreur explicite.

## Sécurité
- Ne jamais lire ni écrire de fichiers .env, de clés d'API ou de données clients réelles.
- Ne jamais exécuter de commande destructive (suppression récursive, reset forcé) sans confirmation.
- Ne jamais pousser sur la branche principale ; travailler sur une branche dédiée.
- Utiliser uniquement des données fictives dans les tests.

## Définition de terminé
- Les tests passent.
- Le README décrit l'usage en 5 lignes.
- Un résumé des changements est fourni avant toute fusion.
`

export const CLAUDE_CODE_DEMO_PROMPT = `Lis d'abord CLAUDE.md.

Objectif : créer un petit calculateur de devis NOVA en TypeScript.

À faire :
1. Crée src/catalogue.ts avec le catalogue N01 à N05 (prix en MAD HT : 4500, 6500, 3000, 5500, 9000).
2. Crée src/devis.ts avec une fonction calculerDevis(codes, budget) qui retourne : statut, offres, total, reliquat ou écart (MAD et pourcentage).
3. Gère les cas : budget dépassé (ALERTE_BUDGET, aucune remise), budget absent (INFORMATIONS_MANQUANTES, pas de total), code inconnu (erreur explicite).
4. Crée src/devis.test.ts avec au moins 5 tests : Atlas Distribution (N02, budget 12000), Rif Atelier (N03, budget 2500), Océan Services (N01 + N04, budget 11000), budget absent, code inconnu.
5. Ajoute un README de 5 lignes maximum.

Contraintes :
- Montants en entiers, TypeScript strict.
- Données fictives uniquement.
- Montre-moi d'abord ton plan et attends ma validation avant d'écrire les fichiers.
- Ne lance aucune commande hors npm test sans me la demander.`

const riskyClaudeCodeSetup = `# CLAUDE.md
Clé d'API de test : sk-demo-0000 (à utiliser pour tous les appels)
Dossier de travail : C:\\Users\\Equipe\\Documents\\Clients (contient les dossiers clients réels)
Tu peux tout faire sans me demander, y compris supprimer des fichiers.
Les prix NOVA sont dans le fichier Excel du dossier, utilise ce que tu y trouves.
Pousse directement sur la branche principale quand c'est terminé.`

/* -------------------------------------------------------------------------- */
/* Défi Océan Services et barème                                                */
/* -------------------------------------------------------------------------- */

export const oceanScenario = {
  client: 'Océan Services',
  sector: 'Services aux entreprises (exemple fictif)',
  brief:
    'Océan Services souhaite d’abord un diagnostic digital, puis une cartographie de processus. Le budget global est de 11 000 MAD HT. La direction veut une proposition claire, un suivi hebdomadaire et la garantie qu’aucun document n’est envoyé sans validation d’un consultant.',
  budgetMadHt: 11000,
  offers: [
    { code: 'N01', label: 'Diagnostic digital', priceMadHt: 4500 },
    { code: 'N04', label: 'Cartographie de processus', priceMadHt: 5500 },
  ],
  totalMadHt: 10000,
  constraints: [
    'Total exact : N01 4 500 + N04 5 500 = 10 000 MAD HT, reliquat 1 000 sur le budget de 11 000',
    'La cartographie N04 s’appuie sur les conclusions du diagnostic N01',
    'Aucune remise ni offre inventée',
    'Aucune donnée personnelle ni donnée client réelle dans les livrables',
    'Validation humaine avant tout envoi',
  ],
  expectedFinalStatus: 'PRET_A_VALIDER',
} as const

export const challengeSteps: ChallengeStep[] = [
  {
    id: 'ch1', step: 1, title: 'Formats de sortie', rubricCriterionId: 'formats', durationMin: 2, points: 10,
    instruction: 'À partir du brief Océan, demandez à Claude trois formats : un tableau récapitulatif (offres, prix, total), un e-mail court et une liste de 5 points d’attention.',
    deliverable: 'Trois sorties lisibles et cohérentes, total 10 000 MAD HT.',
    successChecks: ['Tableau avec N01 4 500, N04 5 500 et TOTAL 10 000 MAD HT', 'E-mail de moins de 120 mots, vouvoiement', 'Liste de 5 points d’attention'],
    hint: 'Précisez le format dans la consigne : « Réponds sous forme de tableau Markdown à 3 colonnes ».',
  },
  {
    id: 'ch2', step: 2, title: 'Prompt RISEN', rubricCriterionId: 'risen', durationMin: 3, points: 15,
    instruction: 'Rédigez un prompt structuré RISEN (Role, Input, Steps, Expectation, Narrowing) pour préparer la proposition Océan.',
    deliverable: 'Un prompt RISEN complet en 5 blocs identifiables.',
    successChecks: ['Role défini (assistant commercial NOVA)', 'Input fourni (client Océan Services, besoin, budget 11 000 MAD HT, offres N01 et N04)', 'Steps numérotés', 'Expectation précise (livrable attendu, total 10 000 MAD HT)', 'Narrowing : pas de remise, HT, validation humaine'],
    hint: 'Le Narrowing (limites) évite les dérives : écrivez ce que Claude ne doit pas faire.',
  },
  {
    id: 'ch3', step: 3, title: 'Design : page de synthèse', rubricCriterionId: 'design', durationMin: 3, points: 10,
    instruction: 'Demandez à Claude de concevoir une page de synthèse de proposition pour Océan : en-tête, offres, total, calendrier, prochaine étape.',
    deliverable: 'Une page claire et hiérarchisée, sans promesse non validée.',
    successChecks: ['Hiérarchie visuelle : titre, offres, total en évidence', 'Montants exacts en MAD HT', 'Une seule action de prochaine étape', 'Mention « Brouillon — à valider »'],
    hint: 'Décrivez la hiérarchie : « le total en grand, les offres en cartes, la prochaine étape en bouton ».',
  },
  {
    id: 'ch4', step: 4, title: 'Projet Claude', rubricCriterionId: 'project', durationMin: 3, points: 10,
    instruction: 'Créez un projet « NOVA — Propositions » avec des instructions de projet et deux fichiers de connaissances fictifs : catalogue et modèle de proposition.',
    deliverable: 'Un projet configuré : instructions, catalogue et modèle ajoutés.',
    successChecks: ['Instructions du projet : rôle, ton, règles de prix', 'Catalogue N01 à N05 exact dans les connaissances', 'Modèle de proposition fictif', 'Aucune donnée client réelle'],
    hint: `Les instructions de projet s’appliquent à toutes les conversations du projet (${UI_VERIFY_NOTE}).`,
  },
  {
    id: 'ch5', step: 5, title: 'Skill : adapter preparer-devis-nova', rubricCriterionId: 'skill', durationMin: 3, points: 12,
    instruction: 'Importez ou rédigez le skill preparer-devis-nova : frontmatter valide, catalogue exact, cas incomplet et contradictoire, validation humaine.',
    deliverable: 'Un fichier SKILL.md valide (name, description, procédure, format, sécurité).',
    successChecks: ['name en kebab-case, description avec déclencheur', 'Prix 4 500 · 6 500 · 3 000 · 5 500 · 9 000', 'Cas « information manquante » et « contradiction » traités', 'Interdiction de remise inventée et d’envoi automatique'],
    hint: 'Partez du skill du module 5, ne repartez pas de zéro.',
  },
  {
    id: 'ch6', step: 6, title: 'Test du skill sur Océan et sur un dépassement', rubricCriterionId: 'skill', durationMin: 2, points: 8,
    instruction: 'Collez le brief Océan et vérifiez la sortie. Testez ensuite un dépassement (budget 2 500 pour N03) pour contrôler le garde-fou.',
    deliverable: 'Deux sorties : Océan (PRET_A_VALIDER, 10 000) et un ALERTE_BUDGET (+500, +20 %).',
    successChecks: ['Total Océan Services = 10 000 MAD HT, reliquat 1 000 (budget 11 000)', 'Dépendance N01 puis N04 signalée', 'Aucune remise sur le cas de dépassement', 'Mention de validation humaine'],
    hint: 'Si le skill échoue, corrigez le skill (une règle), puis relancez.',
  },
  {
    id: 'ch7', step: 7, title: 'Tâche planifiée : suivi hebdomadaire', rubricCriterionId: 'scheduled', durationMin: 2, points: 5,
    instruction: 'Rédigez la tâche planifiée du vendredi 17 h qui produit le suivi des dossiers, avec gestion des montants manquants.',
    deliverable: 'Un prompt autonome et une fréquence (vendredi 17 h).',
    successChecks: ['Fréquence : chaque vendredi à 17 h', 'Cas « À COMPLÉTER » pour une donnée manquante', 'Brouillon uniquement, relecture humaine'],
    hint: `Reprenez le prompt du module 6 et adaptez-le à Océan (${UI_VERIFY_NOTE}).`,
  },
  {
    id: 'ch8', step: 8, title: 'Workflow en 9 étapes', rubricCriterionId: 'workflow', durationMin: 3, points: 15,
    instruction: 'Schématisez le workflow NOVA appliqué à Océan : 9 étapes, types, sortie anticipée et point de validation humaine.',
    deliverable: 'Un tableau à 9 lignes : étape, type, risque, garde-fou.',
    successChecks: ['Les 9 étapes présentes dans le bon ordre', 'Sortie anticipée si budget absent (étape 3)', 'Contrôle du total par un outil (étape 6)', 'Validation humaine avant l’envoi (étape 8)'],
    hint: 'Aidez-vous du diagramme du module 7.',
  },
  {
    id: 'ch9', step: 9, title: 'Code : calculateur testé', rubricCriterionId: 'code', durationMin: 2, points: 5,
    instruction: 'Avec Claude Code (ou plan B en conversation), produisez ou présentez le calculateur de devis avec CLAUDE.md et au moins 3 tests (Atlas Distribution, Rif Atelier, Océan Services).',
    deliverable: 'CLAUDE.md et un extrait de code ou une capture des tests.',
    successChecks: ['CLAUDE.md : catalogue, commandes, règles métier, sécurité', 'Test Océan : 10 000 MAD HT', 'Test Rif : écart 500'],
    hint: 'Exigez le plan avant le code dans le prompt.',
  },
  {
    id: 'ch10', step: 10, title: 'Revue de sécurité et restitution', rubricCriterionId: 'security', durationMin: 2, points: 10,
    instruction: 'Faites votre revue de sécurité : données personnelles, permissions, absence d’envoi automatique, absence de remise inventée. Présentez le dossier en 2 minutes.',
    deliverable: 'Une checklist de sécurité remplie et une restitution orale de 2 minutes.',
    successChecks: ['Aucune donnée personnelle ni secret dans les livrables', 'Permissions minimales (lecture seule quand possible)', 'Validation humaine explicite avant envoi', 'Limites de l’IA mentionnées (vérification des montants)'],
    hint: 'Posez-vous : « Que se passe-t-il si Claude se trompe ici ? »',
  },
]

export const scoreBands: ScoreBand[] = [
  {
    id: 'maitrise', min: 80, max: 100, label: 'Maîtrise — objectif atteint',
    message: 'Vous maîtrisez la chaîne complète : prompt, skill, planification, workflow et sécurité. Attestation de réussite DPG Academy : modalités à confirmer par DPG (aucune certification Anthropic).',
    nextSteps: ['Appliquer le skill sur 3 demandes réelles anonymisées', 'Mettre en place la tâche du vendredi avec un responsable', 'Documenter vos cas limites dans le skill'],
  },
  {
    id: 'acquis', min: 60, max: 79, label: 'Acquis avec axes de progression',
    message: 'Les fondamentaux sont solides. Reprenez les critères en dessous de 70 % avant un usage en conditions réelles.',
    nextSteps: ['Refaire l’étape la moins bien notée avec le formateur', 'Tester le skill sur les 5 cas du module 5', 'Relire les règles de sécurité'],
  },
  {
    id: 'renforcer', min: 0, max: 59, label: 'À renforcer',
    message: 'Certains fondamentaux ne sont pas encore stabilisés. Un accompagnement complémentaire est recommandé avant tout usage professionnel.',
    nextSteps: ['Reprendre les modules 3 à 5 avec le support', 'Refaire le défi Océan en binôme', 'Planifier une session de rattrapage'],
  },
]

export const passThresholds = { maitrise: 80, acquis: 60 } as const

export function getScoreBand(score: number): ScoreBand {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  return scoreBands.find((b) => clamped >= b.min && clamped <= b.max) ?? scoreBands[scoreBands.length - 1]
}

/* -------------------------------------------------------------------------- */
/* Leçons                                                                      */
/* -------------------------------------------------------------------------- */

const lesson1Body = `## 1. Définition

**Claude Code** est un outil qui permet à Claude de **lire un projet, écrire du code, lancer des commandes et des tests**, depuis un terminal ou un éditeur. Contrairement à une conversation, il **agit sur vos fichiers** : le niveau de risque est plus élevé.

## 2. Ce qu'il apporte

- Comprendre un projet existant.
- Écrire et corriger du code avec des tests.
- Automatiser des tâches techniques répétitives (par exemple un calculateur de devis).

## 3. Ce qu'il exige de vous

1. **Un périmètre limité** : un dossier dédié, jamais votre disque entier.
2. **Des permissions lues** : accepter en connaissance de cause, jamais « tout accepter ».
3. **Des données fictives** pendant la formation.
4. **Une relecture** du code avant tout usage réel.

## 4. Exemple NOVA

Salma veut un petit outil qui calcule les devis avec exactitude : N01 + N04 = 10 000 MAD HT pour Océan, +500 MAD d'écart pour Rif. Karim utilise Claude Code dans un dossier de test : plan validé d'abord, puis code, puis tests.

## 5. Erreurs fréquentes

- Donner accès à un dossier contenant des documents clients réels.
- Accepter les permissions sans les lire.
- Stocker une clé d'API dans un fichier du projet.
- Utiliser le code généré sans relecture ni test.

## 6. Bonnes pratiques

- Demander un **plan** avant toute écriture.
- Travailler sur une branche ou un dossier dédié, avec sauvegarde.
- Installation, plans compatibles, commandes et permissions : ${UI_VERIFY_NOTE}.
`

const lesson2Body = `## 1. Définition

**CLAUDE.md** est un fichier lu au démarrage : il décrit pour l'agent le contexte, les commandes, les conventions, les règles métier, la sécurité et la définition de « terminé ».

## 2. Structure recommandée

1. Contexte du projet et langue de travail
2. Catalogue NOVA (source de vérité)
3. Commandes utiles (installer, tester, lancer)
4. Conventions de code
5. Règles métier (pas de remise, budget absent = pas de total)
6. Sécurité (pas de secrets, pas de commande destructive)
7. Définition de terminé

## 3. Exemple NOVA

Dans CLAUDE.md, les prix sont dans un seul fichier source, \`src/catalogue.ts\`. La règle métier « Si total > budget : ALERTE_BUDGET, écart en MAD et %, aucune remise » est la même que dans le skill du module 5 : la cohérence entre skill, workflow et code est un gage de fiabilité.

## 4. Erreurs fréquentes

- Un fichier trop long que personne n'actualise.
- Des intentions (« sois prudent ») au lieu de règles vérifiables.
- Un mot de passe ou une clé d'API dans CLAUDE.md.

## 5. Bonnes pratiques

- Court et précis : l'agent doit pouvoir s'y référer vite.
- Règles vérifiables : « Aucune remise », « Montants en entiers ».
- **Jamais** de secret dans le fichier.
- Fonctionnement exact de la lecture du fichier : ${UI_VERIFY_NOTE}.
`

const lesson3Body = `## 1. Le défi en dix étapes

**Brief** : Océan Services souhaite un diagnostic digital puis une cartographie de processus. Budget : 11 000 MAD HT. Offres : **N01 (4 500) + N04 (5 500) = 10 000 MAD HT**.

| # | Étape | Points |
|---|---|---|
| 1 | Formats de sortie | 10 |
| 2 | Prompt RISEN | 15 |
| 3 | Design : page de synthèse | 10 |
| 4 | Projet Claude | 10 |
| 5 | Skill : rédaction | 12 |
| 6 | Skill : test Océan et dépassement | 8 |
| 7 | Tâche planifiée du vendredi 17 h | 5 |
| 8 | Workflow en 9 étapes | 15 |
| 9 | Code : CLAUDE.md et tests | 5 |
| 10 | Sécurité et restitution | 10 |

## 2. Barème sur 100 points

- **80 et plus** : maîtrise.
- **60 à 79** : acquis avec axes de progression.
- **Moins de 60** : à renforcer.

Chaque critère est évalué à trois niveaux : complet (100 % des points), partiel (50 %), insuffisant (0).

## 3. Règles du défi

- Données fictives uniquement.
- Aucune remise, aucune offre inventée.
- Validation humaine avant tout envoi.
- Demandez de l'aide après 3 minutes de blocage.

## 4. Erreurs fréquentes

- Passer trop de temps sur le design et négliger skill et workflow (35 points en jeu).
- Ajouter une remise pour « faire rentrer » le budget.
- Oublier de vérifier le total avant la restitution.

## 5. Bonnes pratiques

- Vérifier chaque total au dirham près : 4 500 + 5 500 = 10 000.
- Garder une trace de chaque prompt utilisé.
- Terminer par la revue de sécurité : « Que se passe-t-il si Claude se trompe ici ? »
`

/* -------------------------------------------------------------------------- */
/* Module                                                                      */
/* -------------------------------------------------------------------------- */

export const module8: Module = {
  id: 'm8',
  slug: 'm8-claude-code-defi-final',
  title: 'Module 8 — Claude Code et défi final Océan Services',
  durationMin: 55,
  objectives: [
    'Expliquer ce qu’est Claude Code et les précautions d’usage (périmètre, permissions, plan préalable).',
    'Rédiger un CLAUDE.md utile et sûr, sans secret.',
    'Réaliser le défi final Océan Services (N01 + N04 = 10 000 MAD HT) en 10 étapes.',
    'Se situer sur le barème de 100 points (seuils 80 et 60).',
    'Appliquer une revue de sécurité sur l’ensemble de la chaîne.',
  ],
  situation:
    "Salma Benjelloun reçoit une nouvelle demande d'Océan Services : un diagnostic digital, puis une cartographie de processus, pour un budget de 11 000 MAD HT. Elle veut une réponse irréprochable, un suivi hebdomadaire et la certitude qu'aucun document ne part sans validation. Karim propose de tout assembler : formats, prompt RISEN, skill, tâche du vendredi, workflow et même un petit calculateur de devis testé avec Claude Code. C'est le moment de prouver que la chaîne complète tient.",
  lessons: [
    {
      id: 'm8-l1',
      title: 'Claude Code : un agent de code qui agit sur vos fichiers',
      durationMin: 8,
      body: lesson1Body,
      keyTerms: [
        { term: 'Claude Code', definition: 'Outil qui permet à Claude de lire un projet, écrire du code et lancer des commandes.' },
        { term: 'Permission', definition: 'Autorisation demandée avant une action sensible (écriture, commande) : à lire avant d’accepter.' },
        { term: 'Plan préalable', definition: 'Plan présenté par l’agent et validé avant toute écriture de fichier.' },
      ],
    },
    {
      id: 'm8-l2',
      title: 'CLAUDE.md : la mémoire et les règles du projet',
      durationMin: 8,
      body: lesson2Body,
      keyTerms: [
        { term: 'CLAUDE.md', definition: 'Fichier de contexte et de règles lu par Claude Code au démarrage.' },
        { term: 'Définition de terminé', definition: 'Critères qui indiquent qu’une tâche est achevée (tests passent, README rédigé).' },
      ],
    },
    {
      id: 'm8-l3',
      title: 'Le défi Océan Services et le barème de 100 points',
      durationMin: 10,
      body: lesson3Body,
      keyTerms: [
        { term: 'Maîtrise', definition: 'Score de 80 à 100 sur 100.' },
        { term: 'Acquis', definition: 'Score de 60 à 79 sur 100, avec axes de progression.' },
      ],
    },
  ],
  demo: {
    title: 'Démo Claude Code : un calculateur de devis NOVA testé',
    prerequisites: [
      `Claude Code installé et connecté (procédure et plan requis : ${UI_VERIFY_NOTE}).`,
      'Un dossier vide nova-devis-tools contenant un fichier CLAUDE.md (exemple fourni).',
      'Node.js installé.',
      'Aucune donnée client réelle dans le dossier.',
    ],
    steps: [
      {
        number: 1,
        title: 'Préparer le dossier',
        instruction: 'Créez un dossier de test vide et ajoutez-y le CLAUDE.md d’exemple. Ouvrez Claude Code dans ce dossier uniquement.',
        expected: 'Le périmètre est limité à un dossier sans donnée réelle.',
      },
      {
        number: 2,
        title: 'Lancer le prompt de démonstration',
        instruction: 'Collez le prompt : lire CLAUDE.md, créer catalogue, fonction de calcul et 5 tests, présenter d’abord un plan.',
        expected: 'Claude Code présente un plan et attend votre validation avant d’écrire.',
      },
      {
        number: 3,
        title: 'Lire les permissions',
        instruction: 'Validez le plan, puis lisez chaque demande de permission avant de l’accepter (création de fichiers, lancement de npm test).',
        expected: 'Seules la création de fichiers du projet et la commande npm test sont autorisées.',
      },
      {
        number: 4,
        title: 'Contrôler le catalogue',
        instruction: 'Ouvrez src/catalogue.ts et vérifiez les prix.',
        expected: 'N01 4500, N02 6500, N03 3000, N04 5500, N05 9000.',
      },
      {
        number: 5,
        title: 'Lancer les tests',
        instruction: 'Exécutez npm test et observez les cinq cas : Atlas Distribution, Rif Atelier, Océan Services, budget absent, code inconnu.',
        expected: 'Atlas Distribution : 6 500, reliquat 5 500. Rif Atelier : 3 000, écart 500 (20 %), ALERTE_BUDGET. Océan Services : 10 000, reliquat 1 000. Budget absent : aucun total. Code inconnu : erreur explicite.',
      },
      {
        number: 6,
        title: 'Relire avant usage',
        instruction: 'Relisez le code et le README généré ; notez ce que vous modifieriez avant tout usage réel.',
        expected: 'Au moins une remarque de relecture documentée : le code généré se relit toujours.',
      },
    ],
    expectedResult:
      'Un projet avec src/catalogue.ts, src/devis.ts, src/devis.test.ts et un README ; cinq tests au vert dont Océan = 10 000 MAD HT et Rif = écart de 500 MAD, après plan validé et permissions lues.',
    varianceNote:
      "Les sorties d'un agent de code varient d'une exécution à l'autre : noms de fonctions, structure des tests ou texte du README peuvent différer. Vérifiez les résultats métier (totaux, statuts), les prix et les permissions accordées, pas la ressemblance avec l'exemple.",
  },
  exercises: [
    {
      id: 'm8-e1',
      kind: 'file-edit',
      format: 'markdown',
      title: 'Compléter le CLAUDE.md du projet nova-devis-tools',
      instructions:
        "Complétez le squelette : catalogue exact, commandes, règles métier (aucune remise, budget absent = aucun total, code inconnu = erreur) et règles de sécurité (aucun secret, aucune commande destructive, aucune donnée client réelle, branche dédiée).",
      durationMin: 8,
      starter: `# CLAUDE.md — nova-devis-tools

## Contexte du projet
Petit outil interne de NOVA Conseil pour calculer les devis NOVA.

## Catalogue NOVA (MAD HT)
- N01 : 4500
- N02 : à compléter
- N03 : à compléter
- N04 : à compléter
- N05 : à compléter

## Commandes utiles
- Tester : npm test

## Règles métier
À compléter.

## Sécurité
À compléter.
`,
      solution: CLAUDE_MD_EXAMPLE,
      checks: [
        { id: 'c1', description: 'Titre de niveau 1 et sections de niveau 2', type: 'md-has-heading', value: '2', failMessage: 'Utilisez des sections « ## ».' },
        { id: 'c2', description: 'Prix N02 = 6500', type: 'regex', value: 'N02[^\\n]*6[\\s\\u202F\\u00A0]?500', failMessage: 'N02 vaut 6500 MAD HT.' },
        { id: 'c3', description: 'Prix N03 = 3000', type: 'regex', value: 'N03[^\\n]*3[\\s\\u202F\\u00A0]?000', failMessage: 'N03 vaut 3000 MAD HT.' },
        { id: 'c4', description: 'Prix N04 = 5500', type: 'regex', value: 'N04[^\\n]*5[\\s\\u202F\\u00A0]?500', failMessage: 'N04 vaut 5500 MAD HT.' },
        { id: 'c5', description: 'Prix N05 = 9000', type: 'regex', value: 'N05[^\\n]*9[\\s\\u202F\\u00A0]?000', failMessage: 'N05 vaut 9000 MAD HT.' },
        { id: 'c6', description: 'Commande de test npm test', type: 'contains', value: 'npm test', failMessage: 'Indiquez la commande de test.' },
        { id: 'c7', description: 'Règle « aucune remise »', type: 'regex', value: '[Aa]ucune remise', failMessage: 'Ajoutez « Aucune remise » dans les règles métier.' },
        { id: 'c8', description: 'Budget absent : aucun total', type: 'regex', value: 'INFORMATIONS_MANQUANTES|[Bb]udget absent', failMessage: 'Traitez le cas du budget absent.' },
        { id: 'c9', description: 'Aucun secret ni fichier .env', type: 'regex', value: 'Ne jamais[^\\n]*(\\.env|API|secret)', failMessage: 'Interdisez la lecture de .env et des clés d’API.' },
        { id: 'c10', description: 'Aucune commande destructive sans confirmation', type: 'regex', value: 'destructive', failMessage: 'Interdisez les commandes destructives sans confirmation.' },
      ],
      hints: [
        { id: 'm8-e1-h1', level: 1, text: 'CLAUDE.md doit contenir des règles vérifiables, pas des intentions.' },
        { id: 'm8-e1-h2', level: 2, text: 'Sécurité : pas de .env ni de clé d’API, pas de commande destructive sans confirmation, pas de données clients réelles, branche dédiée.' },
      ],
      assets: [
        {
          id: 'm8-a-claude-md',
          filename: 'CLAUDE.md',
          kind: 'file',
          mimeType: 'text/markdown',
          description: 'CLAUDE.md de référence pour nova-devis-tools.',
          content: CLAUDE_MD_EXAMPLE,
        },
      ],
    },
    {
      id: 'm8-e2',
      kind: 'audit',
      title: 'Auditer une configuration Claude Code dangereuse',
      instructions: 'Relevez les risques de sécurité de ce CLAUDE.md avant de comparer avec la version corrigée.',
      durationMin: 7,
      target: riskyClaudeCodeSetup,
      criteria: [
        { id: 'a1', label: 'Secrets', question: 'Un secret est-il stocké dans le fichier ?', expectedFinding: 'Oui : une clé d’API figure dans CLAUDE.md. Jamais de secret dans un fichier du projet.' },
        { id: 'a2', label: 'Périmètre', question: 'Le dossier de travail est-il limité et sans donnée réelle ?', expectedFinding: 'Non : il pointe vers un dossier de documents clients réels. Utiliser un dossier de test dédié.' },
        { id: 'a3', label: 'Permissions', question: 'Les actions sensibles exigent-elles une confirmation ?', expectedFinding: 'Non : « tout faire sans demander, y compris supprimer » supprime le contrôle humain.' },
        { id: 'a4', label: 'Source de prix', question: 'Les prix sont-ils exacts et centralisés ?', expectedFinding: 'Non : « ce que tu y trouves » dans un Excel. Il faut un catalogue unique et exact (4 500, 6 500, 3 000, 5 500, 9 000).' },
        { id: 'a5', label: 'Branche', question: 'Le travail est-il isolé ?', expectedFinding: 'Non : poussée directe sur la branche principale. Travailler sur une branche dédiée avec résumé avant fusion.' },
      ],
      improvedVersion: CLAUDE_MD_EXAMPLE,
      hints: [
        { id: 'm8-e2-h1', level: 1, text: 'Posez-vous : « que se passe-t-il si Claude se trompe ici ? »' },
        { id: 'm8-e2-h2', level: 2, text: 'Cinq risques : secret, dossier réel, suppression sans confirmation, prix non maîtrisés, branche principale.' },
      ],
    },
    {
      id: 'm8-e3',
      kind: 'brief-builder',
      title: 'Cadrer le défi Océan Services',
      instructions:
        'Avant de lancer le chrono, construisez la fiche de cadrage de votre dossier Océan : offres, total, contraintes, livrables et garde-fous.',
      durationMin: 5,
      fields: [
        { id: 'client', label: 'Client et besoin', placeholder: 'Qui, et pour quoi ?', helper: 'Reprenez le brief sans l’embellir.', required: true, example: 'Océan Services : diagnostic digital puis cartographie de processus.' },
        { id: 'offres', label: 'Offres et total', placeholder: 'Codes, prix, total MAD HT', helper: 'Additionnez les prix du catalogue.', required: true, example: 'N01 4 500 + N04 5 500 = 10 000 MAD HT, budget 11 000, reliquat 1 000.' },
        { id: 'contraintes', label: 'Contraintes', placeholder: 'Ce qu’il ne faut pas faire', helper: 'Interdits et dépendances.', required: true, example: 'Aucune remise, aucune donnée réelle, le plan N04 s’appuie sur le diagnostic N01.' },
        { id: 'livrables', label: 'Livrables des 10 étapes', placeholder: 'Quels livrables produire ?', helper: 'Un livrable par étape.', required: true, example: 'Formats, prompt RISEN, page de synthèse, projet, SKILL.md et test, tâche du vendredi, workflow 9 étapes, CLAUDE.md et tests, checklist de sécurité.' },
        { id: 'securite', label: 'Garde-fous', placeholder: 'Validation, permissions, limites', helper: 'Validation humaine avant envoi.', required: true, example: 'Validation par un consultant avant tout envoi, permissions minimales, vérification des totaux.' },
      ],
      outputTemplate: `# Fiche de cadrage — Défi Océan Services

**Client et besoin** : {{client}}

**Offres et total** : {{offres}}

**Contraintes** : {{contraintes}}

**Livrables** : {{livrables}}

**Garde-fous** : {{securite}}
`,
      hints: [
        { id: 'm8-e3-h1', level: 1, text: 'Le total attendu est 10 000 MAD HT, soit un reliquat de 1 000 MAD HT sur le budget de 11 000.' },
      ],
    },
    {
      id: 'm8-e4',
      kind: 'comparison-table',
      title: 'Repérer où se jouent les points du défi',
      instructions: 'Lisez le barème puis répondez aux questions avant de lancer le chrono.',
      durationMin: 5,
      hints: [
        { id: 'm8-e4-h1', level: 1, text: 'Additionnez les points des critères concernés : skill 20, workflow 15, etc.' },
      ],
      table: {
        id: 'm8-t1',
        caption: 'Barème de 100 points du défi Océan Services',
        columns: ['Points', 'Niveau complet', 'Niveau partiel (50 %)'],
        rows: [
          { id: 'r1', label: 'Formats de sortie', cells: ['10', 'Trois formats cohérents', 'Deux formats corrects'] },
          { id: 'r2', label: 'Prompt RISEN', cells: ['15', 'Cinq blocs précis', 'Trois ou quatre blocs'] },
          { id: 'r3', label: 'Design', cells: ['10', 'Page claire, montants exacts', 'Hiérarchie faible'] },
          { id: 'r4', label: 'Projet Claude', cells: ['10', 'Instructions et connaissances correctes', 'Incomplet'] },
          { id: 'r5', label: 'Skill (rédaction et test)', cells: ['20', 'Valide, testé sur Océan et dépassement', 'Cas limites ou test manquants'] },
          { id: 'r6', label: 'Tâche planifiée', cells: ['5', 'Vendredi 17 h, À COMPLÉTER', 'Prompt incomplet'] },
          { id: 'r7', label: 'Workflow', cells: ['15', '9 étapes, risques et garde-fous', 'Garde-fous incomplets'] },
          { id: 'r8', label: 'Code', cells: ['5', 'CLAUDE.md et tests corrects', 'Partiel'] },
          { id: 'r9', label: 'Sécurité', cells: ['10', 'Checklist complète', 'Mesures peu précises'] },
        ],
        footnote: 'Seuils : 80 et plus = maîtrise ; 60 à 79 = acquis ; moins de 60 = à renforcer.',
      },
      questions: [
        { id: 'q1', prompt: 'Quels critères pèsent ensemble 35 points et méritent la priorité en cas de manque de temps ?', answer: 'Le skill (20) et le workflow (15).' },
        { id: 'q2', prompt: 'Un participant obtient la moitié des points partout. Quel est son score et sa catégorie ?', answer: '50 points environ : « à renforcer » (moins de 60).' },
        { id: 'q3', prompt: 'Quel total doit apparaître dans les formats, le skill et le test de code pour Océan ?', answer: '10 000 MAD HT (N01 4 500 + N04 5 500).' },
      ],
    },
  ],
  quiz: [
    mcq(
      'm8-q1',
      'À quoi sert le fichier CLAUDE.md dans un projet Claude Code ?',
      [
        'À stocker les mots de passe du projet',
        'À donner à Claude Code le contexte, les conventions, les règles métier et de sécurité du projet',
        'À remplacer les tests',
        'À publier le projet en ligne',
      ],
      1,
      `CLAUDE.md cadre le comportement de l’agent de code. Fonctionnement exact : ${UI_VERIFY_NOTE}.`,
    ),
    mcq(
      'm8-q2',
      'Pour Océan Services, quel total doit afficher le calculateur ?',
      ['9 000 MAD HT', '10 000 MAD HT', '12 000 MAD HT', '15 500 MAD HT'],
      1,
      'N01 (4 500) + N04 (5 500) = 10 000 MAD HT.',
    ),
    mcq(
      'm8-q3',
      'Quelle pratique est la plus sûre avec Claude Code ?',
      [
        'Accepter automatiquement toutes les permissions',
        'Lui donner accès à votre dossier de documents clients',
        'Demander un plan, lire les demandes de permission et travailler sur un dossier de test',
        'Stocker les clés d’API dans CLAUDE.md',
      ],
      2,
      'Plan préalable, permissions lues, périmètre limité, aucune donnée sensible.',
    ),
    mcq(
      'm8-q4',
      'Un participant obtient 74 / 100 au défi. Quel est son résultat ?',
      [
        'Maîtrise (80 et plus)',
        'Acquis avec axes de progression (60 à 79)',
        'À renforcer (moins de 60)',
        'Non évaluable',
      ],
      1,
      'Barème : 80 et plus = maîtrise ; 60 à 79 = acquis avec axes de progression ; moins de 60 = à renforcer.',
    ),
  ],
  practicalMission: {
    id: 'm8-mission',
    title: 'Défi final : le dossier Océan Services en 10 étapes',
    prompt:
      "Réalisez le dossier Océan Services (N01 + N04 = 10 000 MAD HT) en suivant les dix étapes : formats de sortie, prompt RISEN, page de synthèse, projet Claude, skill preparer-devis-nova (rédaction puis test sur Océan et sur un dépassement), tâche planifiée du vendredi 17 h, workflow en 9 étapes, calculateur testé avec CLAUDE.md, revue de sécurité. Présentez ensuite votre dossier en 2 minutes. Données fictives uniquement, aucune remise, validation humaine avant tout envoi.",
    deliverables: [
      'Trois sorties de format (tableau, e-mail, liste) avec le total 10 000 MAD HT',
      'Prompt RISEN en 5 blocs et page de synthèse « Brouillon — à valider »',
      'Projet « NOVA — Propositions » configuré (instructions, catalogue, modèle)',
      'SKILL.md valide et résultats de test (Océan, dépassement de 500 MAD)',
      'Prompt de la tâche du vendredi 17 h',
      'Tableau du workflow en 9 étapes',
      'CLAUDE.md et extrait de tests (Atlas Distribution, Rif Atelier, Océan Services)',
      'Checklist de sécurité remplie et restitution orale de 2 minutes',
    ],
    successCriteria: [
      'Le total Océan est exact partout : N01 4 500 + N04 5 500 = 10 000 MAD HT.',
      'Aucune remise ni offre inventée ; le cas Rif donne +500 MAD (+20 %).',
      'Validation humaine explicite avant tout envoi.',
      'Aucune donnée personnelle ni secret dans les livrables.',
      'Le score auto-évalué atteint au moins 60 points sur 100.',
    ],
    estimatedMin: 25,
    assets: [
      {
        id: 'm8-a-demo-prompt',
        filename: 'prompt_claude_code_demo.txt',
        kind: 'copyable-text',
        mimeType: 'text/plain',
        description: 'Prompt de démonstration Claude Code pour le calculateur de devis.',
        content: CLAUDE_CODE_DEMO_PROMPT,
      },
    ],
  },
  verification: {
    id: 'm8-rubric',
    title: 'Barème du défi final — 100 points (maîtrise dès 80, acquis dès 60)',
    maxPoints: 100,
    passThreshold: 60,
    criteria: [
      weightedCriterion('r-formats', 'Formats de sortie', 'Tableau, e-mail et liste cohérents, total exact 10 000 MAD HT.', 10,
        'Les trois formats sont corrects, cohérents et conformes à la consigne.',
        'Deux formats corrects ou incohérences mineures.',
        'Format non respecté ou montants erronés.'),
      weightedCriterion('r-risen', 'Prompt RISEN', 'Role, Input, Steps, Expectation, Narrowing.', 15,
        'Les cinq blocs sont présents, précis et exploitables.',
        'Trois ou quatre blocs présents, ou blocs trop vagues.',
        'Moins de trois blocs ou prompt non structuré.'),
      weightedCriterion('r-design', 'Design', 'Hiérarchie visuelle, lisibilité, montants exacts, mention « Brouillon — à valider ».', 10,
        'Page claire, hiérarchisée, sans promesse non validée.',
        'Contenu correct mais hiérarchie faible.',
        'Page confuse ou informations fausses.'),
      weightedCriterion('r-project', 'Projet Claude', 'Instructions, catalogue exact en connaissances, modèle fictif, aucune donnée réelle.', 10,
        'Projet complet, instructions précises, connaissances correctes.',
        'Projet créé mais instructions ou connaissances incomplètes.',
        'Projet absent ou données sensibles ajoutées.'),
      weightedCriterion('r-skill', 'Skill', 'Frontmatter valide, catalogue exact, cas limites, garde-fous, test Océan et dépassement.', 20,
        'Skill valide, testé sur Océan et un dépassement, tous les garde-fous présents.',
        'Skill utilisable mais cas limites ou tests manquants.',
        'Skill invalide ou prix erronés.'),
      weightedCriterion('r-scheduled', 'Tâche planifiée', 'Vendredi 17 h, cas « À COMPLÉTER », brouillon relu.', 5,
        'Fréquence correcte, prompt autonome, gestion des données manquantes.',
        'Fréquence correcte mais prompt incomplet.',
        'Tâche absente ou sans garde-fous.'),
      weightedCriterion('r-workflow', 'Workflow', 'Neuf étapes ordonnées, sortie anticipée, contrôle du total par un outil, validation humaine.', 15,
        'Workflow complet, risques et garde-fous identifiés à chaque étape.',
        'Workflow correct mais risques ou garde-fous incomplets.',
        'Étapes manquantes ou absence de validation humaine.'),
      weightedCriterion('r-code', 'Code', 'CLAUDE.md pertinent, tests Atlas Distribution, Rif Atelier, Océan Services, plan avant écriture.', 5,
        'CLAUDE.md complet et tests corrects (ou plan B bien argumenté).',
        'CLAUDE.md ou tests partiels.',
        'Aucun livrable de code.'),
      weightedCriterion('r-security', 'Sécurité', 'Aucune donnée personnelle ou secret, permissions minimales, validation humaine, limites de l’IA.', 10,
        'Checklist complète, risques et mesures clairement formulés.',
        'Checklist partielle ou mesures peu précises.',
        'Données sensibles exposées ou aucune revue.'),
    ],
  },
  synthesis: {
    takeaways: [
      'L’IA prépare, l’humain décide : plan préalable, permissions lues et validation avant tout envoi, du devis Océan (N01 + N04 = 10 000 MAD HT) au code généré.',
      'Un résultat fiable se juge sur ses cas limites : dépassement de 500 MAD pour Rif, budget absent, contradiction, code inconnu.',
      'La sécurité se conçoit dès le départ : données fictives, aucun secret dans CLAUDE.md, permissions minimales, périmètre limité.',
    ],
    nextModule: {
      id: 'm1',
      slug: 'm1-formats-de-fichiers',
      title: 'Parcours terminé — retour au sommaire de l’Atelier Claude',
      href: '/',
      teaser: 'Le parcours est achevé : revoyez les modules où vous avez perdu des points, puis appliquez la chaîne à trois cas réels anonymisés avec un responsable.',
    },
  },
  instructorNotes: [
    {
      id: 'm8-n1',
      topic: 'Claude Code et CLAUDE.md (16 min)',
      text: 'Présenter l’outil, le périmètre et les permissions (8 min), puis commenter l’exemple de CLAUDE.md : catalogue, commandes, règles, sécurité (8 min). « Claude Code agit sur vos fichiers : prudence renforcée. »',
      timingMin: 16,
      pitfalls: [`Installation et plans : ${UI_VERIFY_NOTE}.`, 'Aucun secret dans CLAUDE.md.'],
    },
    {
      id: 'm8-n2',
      topic: 'Démonstration calculateur (9 min)',
      text: 'Lancer le prompt de démonstration : demander le plan, valider, lire les permissions à voix haute, lancer npm test. Résultats : Atlas 6 500 ; Rif +500 ; Océan 10 000.',
      timingMin: 9,
      pitfalls: [
        'Ne jamais lancer la démo dans un dossier contenant des données réelles.',
        'Si la démo échoue : plan B immédiat, ne pas déboguer en public plus de 2 minutes.',
      ],
    },
    {
      id: 'm8-n3',
      topic: 'Défi final (25 min)',
      text: 'Lancer le chrono ; circuler ; noter avec le barème de 100 points ; aider après 3 minutes de blocage. Rappels : Océan = N01 4 500 + N04 5 500 = 10 000 MAD HT ; aucune remise ; aucune donnée réelle ; validation humaine.',
      timingMin: 25,
      pitfalls: [
        'Participants qui passent trop de temps sur le design : recentrer sur skill et workflow (35 points).',
        'Participants qui ajoutent des remises : rappeler la règle.',
      ],
    },
    {
      id: 'm8-n4',
      topic: 'Restitution, quiz et clôture (5 min)',
      text: 'Restitutions de 2 minutes, quiz de 4 questions, retours individuels. Trois principes : l’IA prépare et l’humain décide ; cas limites ; sécurité dès la conception. Attestation : modalités à confirmer par DPG, sans certification Anthropic.',
      timingMin: 5,
    },
    {
      id: 'm8-n5',
      topic: 'Plan B sans Claude ni Claude Code',
      text: 'Démo : projeter fichiers attendus et sortie de tests pré-enregistrée. Défi : gabarits sur papier ou éditeur, même barème. Prévoir 5 minutes de restitution en plus si le défi se fait sur papier.',
    },
  ],
  references: [
    { id: 'm8-ref1', label: 'Documentation Claude Code', note: `Installation, plans et permissions : ${UI_VERIFY_NOTE}.`, verifyUi: true },
    { id: 'm8-ref2', label: 'Rappel de positionnement', note: 'Atelier DPG Academy ; aucune certification Anthropic n’est revendiquée.' },
  ],
  assets: [
    {
      id: 'm8-asset-claude-md',
      filename: 'CLAUDE.md',
      kind: 'copyable-text',
      mimeType: 'text/markdown',
      description: 'CLAUDE.md d’exemple pour le calculateur de devis NOVA.',
      content: CLAUDE_MD_EXAMPLE,
    },
  ],
}

export default module8
