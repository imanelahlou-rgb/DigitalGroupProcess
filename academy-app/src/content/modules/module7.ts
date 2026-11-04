import type { Module } from '../types'
import { UI_VERIFY_NOTE } from '../types'
import { criterion, levels, mcq } from '../helpers'

/**
 * Module 7 — Agents et workflows (45 min)
 * Prix NOVA (MAD HT) : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000.
 * Connecteurs, MCP et fonctions agentiques : à vérifier selon compte et version.
 */

/* -------------------------------------------------------------------------- */
/* Types locaux (diagramme interactif, simulateur de dossiers)                  */
/* -------------------------------------------------------------------------- */

export type WorkflowNodeType = 'declencheur' | 'llm' | 'skill' | 'outil' | 'mcp' | 'humain' | 'sortie'

export interface WorkflowNode {
  id: string
  step: number
  label: string
  type: WorkflowNodeType
  description: string
  input: string
  output: string
  /** Position dans le diagramme interactif (grille 0-100) */
  position: { x: number; y: number }
  next: string[]
  risk: string
  safeguard: string
  requiresHumanApproval: boolean
}

export interface WorkflowEdge {
  from: string
  to: string
  label?: string
  conditional?: boolean
}

export interface WorkflowDossierCase {
  id: string
  client: string
  request: string
  budgetMadHt: number | null
  offers: string[]
  totalMadHt: number | null
  /** Identifiants de nœuds réellement parcourus */
  path: string[]
  stopsAt: string | null
  finalStatus: 'PRET_A_VALIDER' | 'ALERTE_BUDGET' | 'INFORMATIONS_MANQUANTES' | 'INCOHERENCE' | 'APPROUVE'
  humanDecision: string
  expectedExplanation: string
  teachingPoint: string
}

export interface ShortAnswerQuestion {
  id: string
  question: string
  expectedKeywords: string[]
  minKeywordsToValidate: number
  modelAnswer: string
  rubric: { criterion: string; points: number }[]
}

/* -------------------------------------------------------------------------- */
/* Workflow NOVA en 9 étapes                                                   */
/* -------------------------------------------------------------------------- */

export const novaWorkflowNodes: WorkflowNode[] = [
  {
    id: 'n1', step: 1, label: 'Réception de la demande', type: 'declencheur',
    description: 'Une demande client arrive (e-mail, formulaire, message).',
    input: 'Message brut du client', output: 'Demande enregistrée avec horodatage',
    position: { x: 5, y: 50 }, next: ['n2'],
    risk: 'Demande perdue ou doublon.', safeguard: 'Journalisation et identifiant unique de dossier.',
    requiresHumanApproval: false,
  },
  {
    id: 'n2', step: 2, label: 'Extraction des données', type: 'llm',
    description: 'Claude extrait client, besoin, budget, échéance et offres demandées.',
    input: 'Texte de la demande', output: 'Fiche structurée ; « NON FOURNI » si absent',
    position: { x: 16, y: 25 }, next: ['n3'],
    risk: 'Valeur devinée au lieu d’être signalée absente.', safeguard: 'Consigne « Ne jamais deviner » et sortie structurée.',
    requiresHumanApproval: false,
  },
  {
    id: 'n3', step: 3, label: 'Contrôle de complétude', type: 'outil',
    description: 'Vérification automatique : client, besoin et budget sont-ils renseignés ?',
    input: 'Fiche structurée', output: 'Complet / Incomplet',
    position: { x: 28, y: 50 }, next: ['n4', 'n9'],
    risk: 'Dossier incomplet traité comme complet.', safeguard: 'Règle déterministe (hors IA) : budget absent = arrêt et questions au client.',
    requiresHumanApproval: false,
  },
  {
    id: 'n4', step: 4, label: 'Qualification du besoin', type: 'llm',
    description: 'Claude reformule le besoin et détecte les contradictions (budget, délai, ambition).',
    input: 'Fiche complète', output: 'Besoin qualifié ou statut INCOHERENCE',
    position: { x: 40, y: 25 }, next: ['n5'],
    risk: 'Contradiction ignorée.', safeguard: 'Exposer les deux versions ; ne pas trancher seul.',
    requiresHumanApproval: false,
  },
  {
    id: 'n5', step: 5, label: 'Choix des offres (skill)', type: 'skill',
    description: 'Le skill preparer-devis-nova sélectionne les offres N01 à N05.',
    input: 'Besoin qualifié, budget', output: 'Offres recommandées et total MAD HT',
    position: { x: 52, y: 50 }, next: ['n6'],
    risk: 'Offre inventée ou prix modifié.', safeguard: 'Catalogue en tableau dans le skill ; contrôle par outil à l’étape suivante.',
    requiresHumanApproval: false,
  },
  {
    id: 'n6', step: 6, label: 'Contrôle des prix et du budget', type: 'mcp',
    description: 'Un outil de calcul (via connecteur) recalcule le total et compare au budget.',
    input: 'Offres recommandées', output: 'Total vérifié, reliquat ou écart',
    position: { x: 64, y: 25 }, next: ['n7'],
    risk: 'Erreur de calcul de l’IA.', safeguard: 'Calcul déterministe : N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000.',
    requiresHumanApproval: false,
  },
  {
    id: 'n7', step: 7, label: 'Rédaction de la proposition', type: 'llm',
    description: 'Claude rédige un brouillon de proposition (skill rediger-proposition-nova).',
    input: 'Devis vérifié', output: 'Brouillon d’e-mail ou de document',
    position: { x: 76, y: 50 }, next: ['n8'],
    risk: 'Promesses non prévues, remise inventée.', safeguard: 'Reprendre les montants à l’identique ; aucune garantie de résultat.',
    requiresHumanApproval: false,
  },
  {
    id: 'n8', step: 8, label: 'Validation humaine (HITL)', type: 'humain',
    description: 'Un consultant NOVA relit, corrige, approuve ou rejette.',
    input: 'Brouillon + fiche + contrôle budget', output: 'Décision : approuvé, corrigé ou rejeté',
    position: { x: 88, y: 25 }, next: ['n9'],
    risk: 'Validation distraite (« clic automatique »).', safeguard: 'Écran récapitulatif avec alertes en tête ; journal de décision.',
    requiresHumanApproval: true,
  },
  {
    id: 'n9', step: 9, label: 'Envoi, archivage et suivi', type: 'sortie',
    description: 'Envoi par le consultant, archivage, mise à jour du statut ; ou retour au client pour questions.',
    input: 'Brouillon approuvé, ou questions à poser', output: 'Dossier archivé et statut mis à jour',
    position: { x: 95, y: 50 }, next: [],
    risk: 'Envoi non tracé ou envoi automatique non souhaité.', safeguard: 'Envoi uniquement après approbation ; statut tracé dans le suivi.',
    requiresHumanApproval: true,
  },
]

export const novaWorkflowEdges: WorkflowEdge[] = [
  { from: 'n1', to: 'n2' },
  { from: 'n2', to: 'n3' },
  { from: 'n3', to: 'n4', label: 'Complet' },
  { from: 'n3', to: 'n9', label: 'Incomplet : questions au client', conditional: true },
  { from: 'n4', to: 'n5' },
  { from: 'n5', to: 'n6' },
  { from: 'n6', to: 'n7' },
  { from: 'n7', to: 'n8' },
  { from: 'n8', to: 'n9', label: 'Approuvé' },
]

export const workflowSimulatorCases: WorkflowDossierCase[] = [
  {
    id: 'd-atlas', client: 'Atlas Distribution',
    request: 'Organisation documentaire. Budget 12 000 MAD HT.',
    budgetMadHt: 12000, offers: ['N02'], totalMadHt: 6500,
    path: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'], stopsAt: null,
    finalStatus: 'APPROUVE',
    humanDecision: 'Approuvé après relecture ; envoi par le consultant.',
    expectedExplanation: 'N02 = 6 500 MAD HT, reliquat 5 500. Les 9 étapes sont parcourues ; la validation humaine a lieu à l’étape 8.',
    teachingPoint: 'Cas nominal : même ici, rien n’est envoyé sans approbation.',
  },
  {
    id: 'd-rif', client: 'Rif Atelier',
    request: 'Atelier IA initiation. Budget maximum 2 500 MAD HT.',
    budgetMadHt: 2500, offers: ['N03'], totalMadHt: 3000,
    path: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'], stopsAt: 'n8',
    finalStatus: 'ALERTE_BUDGET',
    humanDecision: 'Le consultant décide : appeler le client pour proposer un budget de 3 000 MAD HT ou différer.',
    expectedExplanation: 'N03 = 3 000 MAD HT, écart +500 MAD (+20 %). L’étape 6 déclenche l’alerte ; à l’étape 8 l’humain tranche. Aucune remise automatique.',
    teachingPoint: 'Le workflow signale ; la décision commerciale appartient à l’humain.',
  },
  {
    id: 'd-ocean', client: 'Océan Services',
    request: 'Diagnostic digital puis cartographie de processus. Budget 11 000 MAD HT.',
    budgetMadHt: 11000, offers: ['N01', 'N04'], totalMadHt: 10000,
    path: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9'], stopsAt: null,
    finalStatus: 'APPROUVE',
    humanDecision: 'Approuvé avec une correction : préciser que le plan dépend des conclusions du diagnostic.',
    expectedExplanation: 'N01 4 500 + N04 5 500 = 10 000 MAD HT. L’étape 6 confirme le total ; le consultant ajoute une précision de séquencement.',
    teachingPoint: 'L’humain améliore le brouillon : la validation n’est pas qu’un clic.',
  },
  {
    id: 'd-incomplet', client: 'Maroc Textile',
    request: 'Nous voulons automatiser des choses. Pouvez-vous nous faire un devis ?',
    budgetMadHt: null, offers: [], totalMadHt: null,
    path: ['n1', 'n2', 'n3', 'n9'], stopsAt: 'n3',
    finalStatus: 'INFORMATIONS_MANQUANTES',
    humanDecision: 'Le consultant valide l’envoi d’un message de 3 questions au client.',
    expectedExplanation: 'À l’étape 3, la règle déterministe détecte le budget absent : court-circuit vers l’étape 9 (questions au client), aucune offre.',
    teachingPoint: 'Un bon workflow sait s’arrêter tôt.',
  },
  {
    id: 'd-contradictoire', client: 'Casa Santé Plus',
    request: 'Pilote de déploiement complet sur 6 mois (N05), budget 4 000 MAD HT, démarrage lundi.',
    budgetMadHt: 4000, offers: ['N05'], totalMadHt: 9000,
    path: ['n1', 'n2', 'n3', 'n4'], stopsAt: 'n4',
    finalStatus: 'INCOHERENCE',
    humanDecision: 'Le consultant contacte le client : budget ferme ? démarrage par une première étape ? date impérative ?',
    expectedExplanation: 'À l’étape 4, la contradiction est détectée : N05 = 9 000 MAD HT contre 4 000 de budget (écart 5 000) et délai irréaliste. Le workflow remonte à un humain.',
    teachingPoint: 'Face à l’ambiguïté, on escalade ; on ne devine pas.',
  },
]

export const shortAnswerHumanApproval: ShortAnswerQuestion = {
  id: 'm7-short-1',
  question:
    'Dans le workflow NOVA, pourquoi l’approbation humaine est-elle indispensable avant l’envoi d’un devis, même quand tous les contrôles automatiques sont passés ? Répondez en 3 à 5 phrases.',
  expectedKeywords: ['engage', 'responsabilité', 'erreur', 'contexte', 'relation client', 'décision', 'validation', 'traçabilité', 'client'],
  minKeywordsToValidate: 3,
  modelAnswer:
    'Un devis engage NOVA : la responsabilité ne peut pas être déléguée à un modèle. Même avec des contrôles automatiques, l’IA peut se tromper ou mal interpréter le contexte du client. Le consultant connaît la relation client et décide, par exemple, comment traiter le dépassement de budget de Rif. Sa validation laisse aussi une trace de décision. L’IA accélère la préparation ; l’humain reste responsable de l’envoi.',
  rubric: [
    { criterion: 'Mentionne l’engagement ou la responsabilité de NOVA', points: 2 },
    { criterion: 'Reconnaît le risque d’erreur ou de mauvaise interprétation', points: 2 },
    { criterion: 'Cite un apport humain (contexte, relation client, décision commerciale)', points: 2 },
    { criterion: 'Évoque la traçabilité ou l’absence d’envoi automatique', points: 1 },
    { criterion: 'Réponse claire, structurée, en français professionnel', points: 1 },
  ],
}

/* -------------------------------------------------------------------------- */
/* Leçons                                                                      */
/* -------------------------------------------------------------------------- */

const lesson1Body = `## 1. Pourquoi un vocabulaire commun ?

« Agent », « workflow », « skill », « outil »… Ces mots sont souvent confondus. Pourtant, ils déterminent le niveau d'autonomie accordé à l'IA, donc le niveau de risque.

## 2. Définitions : huit termes

| Terme | En une phrase |
|---|---|
| **LLM** | Le modèle qui comprend et génère du texte (Claude). |
| **Outil** | Une capacité extérieure appelée : lire un tableau, calculer, créer un brouillon. |
| **Skill** | Une procédure packagée (SKILL.md) que Claude applique quand la demande correspond. |
| **Agent** | Un LLM qui choisit ses étapes et ses outils pour atteindre un objectif. |
| **Workflow** | Un enchaînement d'étapes défini à l'avance, avec conditions et contrôles. |
| **Orchestration** | La coordination des étapes, outils et validations. |
| **MCP** | Un protocole standard pour connecter l'IA aux outils et aux données. |
| **HITL** | Un point de validation humaine avant une action à impact. |

## 3. Les six briques à distinguer (carte de classement)

| Brique | Question à se poser | Exemple NOVA |
|---|---|---|
| Skill | Une méthode à appliquer ? | preparer-devis-nova |
| Outil | Une action extérieure ? | Calcul exact N01 + N04 = 10 000 |
| Projet | Un espace de contexte partagé ? | « NOVA — Propositions » |
| Workflow | Un ordre d'étapes fixé ? | Les 9 étapes du devis |
| Tâche planifiée | Une heure de déclenchement ? | Rapport du vendredi 17 h |
| Agent | Un objectif, des étapes laissées à l'IA ? | Analyse libre d'un dossier |

## 4. Principe de conception

> Utilisez le **niveau d'autonomie minimal** qui résout le problème. Pour un processus connu comme le devis NOVA, un **workflow avec points de validation** vaut mieux qu'un agent libre.

## 5. Erreurs fréquentes

- Confondre agent et workflow : dans un workflow, l'ordre est prévu ; dans un agent, il est improvisé.
- Croire que MCP sécurise : il connecte, les permissions restent à contrôler.
- Confier un calcul de montants au seul modèle au lieu d'un outil exact.

## 6. Bonnes pratiques

- Donner à chaque brique un rôle clair et unique.
- Permissions minimales (lecture seule quand c'est possible).
- Connecteurs, MCP et fonctions agentiques : ${UI_VERIFY_NOTE}.
`

const lesson2Body = `## 1. De la demande au devis validé

| # | Étape | Type | Humain ? |
|---|---|---|---|
| 1 | Réception de la demande | Déclencheur | Non |
| 2 | Extraction des données | LLM | Non |
| 3 | Contrôle de complétude | Règle / outil | Non |
| 4 | Qualification du besoin | LLM | Non |
| 5 | Choix des offres | Skill | Non |
| 6 | Contrôle des prix et du budget | Outil (via MCP) | Non |
| 7 | Rédaction de la proposition | LLM | Non |
| 8 | **Validation humaine** | HITL | **Oui** |
| 9 | Envoi, archivage, suivi | Sortie | Oui (envoi) |

## 2. Trois idées de conception

1. **Court-circuiter tôt** : si le budget est absent, étape 3 puis questions au client.
2. **Doubler l'IA par une règle** : le total est recalculé par un outil (N01 4 500, N02 6 500, N03 3 000, N04 5 500, N05 9 000 MAD HT).
3. **Placer l'humain avant l'irréversible** : l'envoi.

## 3. Exemple NOVA : cinq dossiers, cinq chemins

| Dossier | Chemin | Résultat |
|---|---|---|
| Atlas | 9 étapes | N02 = 6 500, reliquat 5 500 |
| Rif | 9 étapes, alerte à l'étape 6 | N03 = 3 000 pour 2 500 : +500 (+20 %), l'humain décide |
| Océan Services | 9 étapes | N01 + N04 = 10 000, budget 11 000, reliquat 1 000 |
| Maroc Textile | Arrêt à l'étape 3 | Budget absent : 3 questions |
| Casa Santé Plus | Arrêt à l'étape 4 | N05 = 9 000 contre 4 000 : contradiction, escalade |

## 4. Erreurs fréquentes

- Laisser le modèle seul calculer le total.
- Valider en lot, sans lire les alertes.
- Faire parcourir les neuf étapes à un dossier déjà incomplet.

## 5. Bonnes pratiques

- Un risque et un garde-fou identifiés à chaque étape.
- Un écran de validation avec les alertes en tête et un journal de décision.
- Prédire le chemin d'un dossier **avant** de lancer la simulation.
`

const lesson3Body = `## 1. Le point de validation humaine (HITL)

Un **HITL** n'est pas une formalité : c'est un point de décision. Pour qu'il soit utile, le validateur doit avoir les informations nécessaires (brouillon, fiche extraite, contrôle du budget, alertes).

## 2. Pourquoi l'approbation est indispensable

- **Responsabilité** : un devis engage NOVA ; elle ne se délègue pas à un modèle.
- **Erreur possible** : l'IA peut mal interpréter un contexte ou produire une formulation inadaptée.
- **Relation client** : le consultant sait comment traiter un dépassement comme celui de Rif.
- **Traçabilité** : la décision est journalisée.

## 3. Exemple NOVA

Pour Océan, le brouillon est correct (10 000 MAD HT), mais Karim ajoute que la cartographie de processus N04 dépend des conclusions du diagnostic N01. Cette précision, qui vient de son expérience, n'aurait pas été ajoutée par un clic automatique.

## 4. Erreurs fréquentes

- Valider sans lire parce que « les contrôles sont passés ».
- Supprimer l'étape de validation pour gagner du temps.
- Donner à un agent des permissions d'écriture ou d'envoi non nécessaires.

## 5. Bonnes pratiques

- Récapitulatif en une page avec alertes en tête.
- Décision tracée : approuvé, corrigé ou rejeté.
- Permissions minimales pour chaque outil ou connecteur.
- Réponse type à la question « pourquoi un humain ? » : responsabilité, risque d'erreur, contexte, traçabilité.
`

/* -------------------------------------------------------------------------- */
/* Module                                                                      */
/* -------------------------------------------------------------------------- */

export const module7: Module = {
  id: 'm7',
  slug: 'm7-agents-workflows',
  title: 'Module 7 — Agents et workflows : concevoir un enchaînement fiable',
  durationMin: 45,
  objectives: [
    'Distinguer skill, outil, projet, workflow, tâche planifiée et agent.',
    'Définir LLM, outil, agent, workflow, orchestration, MCP et HITL.',
    'Décrire le workflow NOVA en 9 étapes, avec ses risques et garde-fous.',
    'Prévoir le chemin de cinq dossiers types (Atlas, Rif, Océan, Maroc Textile, Casa Santé Plus).',
    'Justifier l’approbation humaine avant tout envoi.',
  ],
  situation:
    "NOVA Conseil dispose désormais d'un skill de devis et d'un rapport hebdomadaire. Salma Benjelloun veut aller plus loin : relier la réception d'une demande au devis validé, sans y passer ses journées. Karim hésite entre « un agent qui fait tout » et un enchaînement d'étapes contrôlées. Après le cas de Rif Atelier, où le budget était dépassé de 500 MAD, Salma tranche : l'IA prépare, un outil recalcule les montants, et un consultant valide avant tout envoi.",
  lessons: [
    {
      id: 'm7-l1',
      title: 'Vocabulaire : skill, outil, projet, workflow, planifié, agent',
      durationMin: 10,
      body: lesson1Body,
      keyTerms: [
        { term: 'Agent', definition: 'LLM qui décide lui-même de ses étapes et outils pour atteindre un objectif.' },
        { term: 'Workflow', definition: 'Enchaînement d’étapes défini à l’avance, avec conditions et contrôles.' },
        { term: 'Orchestration', definition: 'Coordination des étapes, outils, modèles et validations.' },
        { term: 'MCP', definition: 'Protocole ouvert pour connecter l’IA à des outils et sources de données.' },
        { term: 'HITL', definition: 'Human in the loop : validation humaine avant une action à impact.' },
      ],
    },
    {
      id: 'm7-l2',
      title: 'Le workflow NOVA en 9 étapes',
      durationMin: 12,
      body: lesson2Body,
      keyTerms: [
        { term: 'Contrôle déterministe', definition: 'Règle ou calcul exact, hors IA, qui double le modèle (ex. recalcul du total).' },
        { term: 'Sortie anticipée', definition: 'Arrêt volontaire du workflow dès qu’une condition l’impose (budget absent).' },
      ],
    },
    {
      id: 'm7-l3',
      title: 'Validation humaine, permissions et garde-fous',
      durationMin: 8,
      body: lesson3Body,
      keyTerms: [
        { term: 'Permissions minimales', definition: 'N’accorder à un outil que les droits strictement nécessaires.' },
      ],
    },
  ],
  demo: {
    title: 'Parcourir le workflow NOVA avec cinq dossiers',
    prerequisites: [
      'Le diagramme interactif du workflow (ou la table des 9 étapes).',
      'Les cinq dossiers : Atlas, Rif, Océan, Maroc Textile, Casa Santé Plus.',
      `Accès à Claude pour jouer les étapes 2, 4 et 7 (${UI_VERIFY_NOTE}) ; sinon simulation à la main.`,
    ],
    steps: [
      {
        number: 1,
        title: 'Lire le diagramme',
        instruction: 'Pour chaque nœud, relevez l’entrée, la sortie, le risque et le garde-fou.',
        expected: 'Neuf nœuds, dont deux avec approbation humaine (étapes 8 et 9).',
      },
      {
        number: 2,
        title: 'Prédire avant de simuler',
        instruction: 'Pour chacun des cinq dossiers, notez sur papier jusqu’à quelle étape il ira.',
        expected: 'Atlas, Rif, Océan : 9 étapes ; Maroc Textile : arrêt étape 3 ; Casa Santé Plus : arrêt étape 4.',
      },
      {
        number: 3,
        title: 'Simuler Atlas, Rif et Océan',
        instruction: 'Faites passer les trois dossiers complets dans le workflow et notez totaux et statuts.',
        expected: 'Atlas Distribution 6 500 (reliquat 5 500) ; Rif Atelier 3 000 pour 2 500 (+500, +20 %) ; Océan Services 10 000 pour 11 000 (N01 + N04, reliquat 1 000).',
      },
      {
        number: 4,
        title: 'Simuler les deux arrêts anticipés',
        instruction: 'Passez Maroc Textile (budget absent) puis Casa Santé Plus (N05 = 9 000 contre 4 000, démarrage lundi).',
        expected: 'Arrêt à l’étape 3 avec 3 questions ; arrêt à l’étape 4 avec statut INCOHERENCE et escalade vers un humain.',
      },
      {
        number: 5,
        title: 'Observer la décision humaine',
        instruction: 'Pour Rif, formulez la décision du consultant à l’étape 8 : appel au client, budget confirmé, ou report.',
        expected: 'Aucune remise automatique : la décision commerciale est humaine et tracée.',
      },
    ],
    expectedResult:
      'Cinq chemins différents expliqués : trois dossiers complets (totaux 6 500, 3 000, 10 000 MAD HT), un arrêt à l’étape 3 et un arrêt à l’étape 4, avec une décision humaine documentée pour chaque alerte.',
    varianceNote:
      "Les étapes confiées à un modèle (extraction, qualification, rédaction) varient d'une exécution à l'autre ; les étapes déterministes (complétude, calcul du total) ne varient pas. Concentrez-vous sur le chemin parcouru et les montants, pas sur la formulation.",
  },
  exercises: [
    {
      id: 'm7-e1',
      kind: 'classify',
      title: 'Classer six briques : skill, agent, outil, projet, workflow, tâche planifiée',
      instructions:
        'Associez chaque situation NOVA à la brique qui la décrit le mieux : skill, agent, outil, projet, workflow ou tâche planifiée.',
      durationMin: 8,
      categories: [
        { id: 'skill', label: 'Skill' },
        { id: 'agent', label: 'Agent' },
        { id: 'tool', label: 'Outil' },
        { id: 'project', label: 'Projet' },
        { id: 'workflow', label: 'Workflow' },
        { id: 'scheduled', label: 'Tâche planifiée' },
      ],
      cards: [
        { id: 'c1', text: 'preparer-devis-nova : un SKILL.md qui impose le catalogue, les quatre statuts et la validation humaine.', correctCategoryId: 'skill', explanation: 'Procédure packagée appliquée par Claude quand la demande correspond.' },
        { id: 'c2', text: 'rediger-proposition-nova : ne rédige que si le devis est confirmé comme validé.', correctCategoryId: 'skill', explanation: 'Autre procédure packagée, avec un prérequis explicite.' },
        { id: 'c3', text: 'Calculer N01 + N04 = 10 000 MAD HT avec une fonction exacte.', correctCategoryId: 'tool', explanation: 'Un calcul déterministe est un outil, plus fiable que le calcul du modèle.' },
        { id: 'c4', text: 'Lire en lecture seule le tableau de suivi des dossiers via un connecteur.', correctCategoryId: 'tool', explanation: 'Capacité extérieure appelée avec permissions minimales.' },
        { id: 'c5', text: 'L’espace « NOVA — Propositions » réunissant instructions, catalogue et conversations de l’équipe commerciale.', correctCategoryId: 'project', explanation: 'Un projet centralise contexte et connaissances partagés.' },
        { id: 'c6', text: 'Un espace de travail où le catalogue N01 à N05 et le modèle de proposition sont joints comme connaissances.', correctCategoryId: 'project', explanation: 'Les connaissances d’un projet servent de contexte, sans exécuter d’action.' },
        { id: 'c7', text: 'Réception, extraction, contrôle, choix d’offre, validation, envoi : toujours dans cet ordre.', correctCategoryId: 'workflow', explanation: 'Ordre défini à l’avance, avec conditions : c’est un workflow.' },
        { id: 'c8', text: 'Si le budget est absent, l’enchaînement s’arrête à l’étape 3 et prépare trois questions au client.', correctCategoryId: 'workflow', explanation: 'Condition prédéfinie dans l’enchaînement : logique de workflow.' },
        { id: 'c9', text: 'Chaque vendredi à 17 h, produire le rapport des dossiers NOVA.', correctCategoryId: 'scheduled', explanation: 'Le déclencheur est une heure et une récurrence.' },
        { id: 'c10', text: 'Chaque 1er du mois à 9 h, synthétiser les dossiers du mois précédent.', correctCategoryId: 'scheduled', explanation: 'Récurrence mensuelle à heure fixe.' },
        { id: 'c11', text: 'On donne l’objectif « prépare la réponse à ce dossier » ; le système choisit seul ses étapes et ses outils.', correctCategoryId: 'agent', explanation: 'Objectif en entrée, étapes décidées dynamiquement : c’est un agent.' },
        { id: 'c12', text: 'Un système qui analyse librement le dossier de Casa Santé Plus, consulte le catalogue, décide s’il doit calculer puis rédige.', correctCategoryId: 'agent', explanation: 'Le chemin n’est pas prévu : plus autonome, donc à encadrer par une validation humaine.' },
      ],
      hints: [
        { id: 'm7-e1-h1', level: 1, text: 'Cherchez le mot clé : « objectif » → agent ; « toujours dans cet ordre » → workflow ; « chaque vendredi » → tâche planifiée.' },
        { id: 'm7-e1-h2', level: 2, text: 'Un calcul exact ou un accès à un tableau est un outil ; une procédure rédigée dans un SKILL.md est un skill.' },
      ],
    },
    {
      id: 'm7-e2',
      kind: 'classify',
      title: 'Classer les termes clés du vocabulaire',
      instructions: 'Associez chaque phrase au terme correspondant : LLM, outil, agent, workflow, MCP ou validation humaine (HITL).',
      durationMin: 5,
      categories: [
        { id: 'llm', label: 'LLM' },
        { id: 'outil', label: 'Outil' },
        { id: 'agent', label: 'Agent' },
        { id: 'workflow', label: 'Workflow' },
        { id: 'mcp', label: 'MCP' },
        { id: 'hitl', label: 'Validation humaine (HITL)' },
      ],
      cards: [
        { id: 'c1', text: 'Claude rédige un brouillon de proposition à partir d’un texte fourni.', correctCategoryId: 'llm', explanation: 'Génération de texte par le modèle seul.' },
        { id: 'c2', text: 'Lire le tableau de suivi et renvoyer les lignes au statut « en attente ».', correctCategoryId: 'outil', explanation: 'Capacité extérieure appelée par le modèle ou le workflow.' },
        { id: 'c3', text: 'Le système reçoit un objectif et choisit lui-même ses étapes.', correctCategoryId: 'agent', explanation: 'Étapes décidées dynamiquement.' },
        { id: 'c4', text: 'Les neuf étapes du devis NOVA, dans un ordre fixé.', correctCategoryId: 'workflow', explanation: 'Chemin défini à l’avance.' },
        { id: 'c5', text: 'Protocole standard pour brancher Claude à un tableau de suivi et à d’autres applications.', correctCategoryId: 'mcp', explanation: 'MCP standardise la connexion aux outils et aux données.' },
        { id: 'c6', text: 'Un consultant NOVA relit le devis et clique sur « Approuver » avant l’envoi.', correctCategoryId: 'hitl', explanation: 'Point de validation humaine avant action à impact.' },
        { id: 'c7', text: 'Calculer le total avec une fonction exacte : N01 + N04 = 10 000 MAD HT.', correctCategoryId: 'outil', explanation: 'Un calcul déterministe est un outil.' },
        { id: 'c8', text: 'Le responsable refuse un brouillon dont la remise n’a jamais été autorisée.', correctCategoryId: 'hitl', explanation: 'Décision humaine de rejet : exactement le rôle du HITL.' },
      ],
      hints: [
        { id: 'm7-e2-h1', level: 1, text: 'Qui décide de l’ordre des étapes : le concepteur (workflow) ou le modèle (agent) ?' },
      ],
    },
    {
      id: 'm7-e3',
      kind: 'comparison-table',
      title: 'Lire la table des 9 étapes et prédire les chemins',
      instructions: 'Étudiez le tableau, puis répondez aux questions avant de lancer la simulation.',
      durationMin: 8,
      hints: [
        { id: 'm7-e3-h1', level: 1, text: 'Cherchez la première étape où une règle déterministe peut arrêter le dossier.' },
        { id: 'm7-e3-h2', level: 2, text: 'Étape 3 : budget absent. Étape 4 : contradiction. Étape 6 : alerte budget. Étape 8 : décision humaine.' },
      ],
      table: {
        id: 'm7-t1',
        caption: 'Workflow NOVA en 9 étapes : type, risque et garde-fou',
        columns: ['Type', 'Risque principal', 'Garde-fou'],
        rows: [
          { id: 's1', label: '1. Réception', cells: ['Déclencheur', 'Demande perdue ou doublon', 'Journalisation, identifiant unique'] },
          { id: 's2', label: '2. Extraction', cells: ['LLM', 'Valeur devinée', 'Consigne « NON FOURNI » si absent'] },
          { id: 's3', label: '3. Complétude', cells: ['Règle / outil', 'Dossier incomplet traité comme complet', 'Règle déterministe : budget absent = arrêt'] },
          { id: 's4', label: '4. Qualification', cells: ['LLM', 'Contradiction ignorée', 'Exposer les deux versions'] },
          { id: 's5', label: '5. Choix des offres', cells: ['Skill', 'Offre inventée ou prix modifié', 'Catalogue en tableau dans le skill'] },
          { id: 's6', label: '6. Contrôle prix et budget', cells: ['Outil (MCP)', 'Erreur de calcul de l’IA', 'Calcul déterministe N01 à N05'] },
          { id: 's7', label: '7. Rédaction', cells: ['LLM', 'Remise ou promesse inventée', 'Montants repris à l’identique'] },
          { id: 's8', label: '8. Validation humaine', cells: ['HITL', 'Validation distraite', 'Récapitulatif avec alertes, journal'] },
          { id: 's9', label: '9. Envoi et suivi', cells: ['Sortie', 'Envoi non tracé', 'Envoi après approbation uniquement'] },
        ],
        footnote: 'Prix : N01 4 500 · N02 6 500 · N03 3 000 · N04 5 500 · N05 9 000 MAD HT.',
      },
      questions: [
        { id: 'q1', prompt: 'À quelle étape Maroc Textile (sans budget) s’arrête-t-il, et que se passe-t-il ensuite ?', answer: 'À l’étape 3 : sortie anticipée vers l’étape 9 pour envoyer 3 questions au client, aucune offre ni total.' },
        { id: 'q2', prompt: 'Quelle étape détecte l’écart de +500 MAD (+20 %) de Rif et qui décide ensuite ?', answer: 'L’étape 6 (contrôle des prix et du budget) déclenche l’alerte ; à l’étape 8 le consultant décide, sans remise automatique.' },
        { id: 'q3', prompt: 'Pourquoi le total est-il recalculé par un outil à l’étape 6 plutôt que laissé au modèle ?', answer: 'Un calcul déterministe est exact et auditable : N01 4 500 + N04 5 500 = 10 000 MAD HT pour Océan.' },
        { id: 'q4', prompt: 'À quelle étape Casa Santé Plus s’arrête-t-il et pourquoi ?', answer: 'À l’étape 4 : N05 = 9 000 MAD HT contre 4 000 de budget (écart 5 000) et démarrage lundi irréaliste : INCOHERENCE, escalade humaine.' },
      ],
    },
    {
      id: 'm7-e4',
      kind: 'brief-builder',
      title: 'Concevoir une fiche de workflow avec validation humaine',
      instructions:
        'Remplissez les champs pour produire une fiche de conception d’un workflow de devis : déclencheur, contrôles, sortie anticipée, point de validation et garde-fous. Prenez Océan Services (N01 + N04 = 10 000 MAD HT) comme dossier test.',
      durationMin: 8,
      fields: [
        { id: 'declencheur', label: 'Déclencheur', placeholder: 'Quel événement lance le workflow ?', helper: 'Un événement précis, pas « quand on veut ».', required: true, example: 'Réception d’une demande de devis par e-mail ou formulaire.' },
        { id: 'extraction', label: 'Étapes confiées à Claude', placeholder: 'Extraction, qualification, rédaction…', helper: 'Listez uniquement ce qui exige du langage.', required: true, example: 'Extraction des données (étape 2), qualification du besoin (étape 4), rédaction du brouillon (étape 7).' },
        { id: 'controles', label: 'Contrôles déterministes', placeholder: 'Quelles règles ou calculs hors IA ?', helper: 'Les chiffres et la complétude se vérifient par règle.', required: true, example: 'Complétude (étape 3) et recalcul du total par outil (étape 6) : N01 4 500 + N04 5 500 = 10 000 MAD HT.' },
        { id: 'sortie', label: 'Sortie anticipée', placeholder: 'Quand le workflow s’arrête-t-il ?', helper: 'Le plus tôt possible, avec une action claire.', required: true, example: 'Budget absent : arrêt à l’étape 3, 3 questions au client, aucun total.' },
        { id: 'validation', label: 'Point de validation humaine', placeholder: 'Qui valide, avec quelles informations ?', helper: 'Avant tout envoi ; alertes en tête.', required: true, example: 'Consultant NOVA à l’étape 8 : brouillon, fiche extraite, contrôle budget et alertes.' },
        { id: 'garde-fous', label: 'Garde-fous et permissions', placeholder: 'Interdits, permissions, traçabilité', helper: 'Permissions minimales, aucune remise inventée.', required: true, example: 'Lecture seule sur le suivi, aucune remise, aucun envoi automatique, décision journalisée.' },
      ],
      outputTemplate: `# Fiche de workflow — Devis NOVA

**Déclencheur** : {{declencheur}}

**Étapes confiées à Claude** : {{extraction}}

**Contrôles déterministes** : {{controles}}

**Sortie anticipée** : {{sortie}}

**Point de validation humaine** : {{validation}}

**Garde-fous et permissions** : {{garde-fous}}

Principe : l'IA prépare, l'humain décide.
`,
      hints: [
        { id: 'm7-e4-h1', level: 1, text: 'Séparez ce qui demande du langage (Claude) de ce qui demande de l’exactitude (outil).' },
        { id: 'm7-e4-h2', level: 2, text: 'Le point de validation précède toujours l’envoi, jamais l’inverse.' },
      ],
    },
  ],
  quiz: [
    mcq(
      'm7-q1',
      'Quelle est la différence essentielle entre un workflow et un agent ?',
      [
        'Le workflow utilise l’IA, pas l’agent',
        'Dans un workflow l’ordre des étapes est défini à l’avance ; l’agent décide lui-même de ses étapes',
        'L’agent est toujours plus sûr',
        'Il n’y a aucune différence',
      ],
      1,
      'Workflow = chemin prévu. Agent = chemin choisi dynamiquement pour atteindre un objectif.',
    ),
    mcq(
      'm7-q2',
      'Que standardise le MCP (Model Context Protocol) ?',
      [
        'La tarification des modèles',
        'La connexion entre un assistant IA et des outils ou sources de données',
        'Le format des devis NOVA',
        'La validation humaine',
      ],
      1,
      `MCP est un protocole de connexion aux outils et aux données ; il ne sécurise pas à lui seul. Disponibilité : ${UI_VERIFY_NOTE}.`,
    ),
    mcq(
      'm7-q3',
      'À quelle étape du workflow NOVA une demande sans budget doit-elle être arrêtée ?',
      [
        'Étape 3 : contrôle de complétude',
        'Étape 7 : rédaction',
        'Étape 8 : validation humaine',
        'Étape 9 : archivage',
      ],
      0,
      'Le contrôle de complétude, règle déterministe, détecte l’absence de budget et renvoie vers des questions au client.',
    ),
    mcq(
      'm7-q4',
      'Pourquoi recalculer le total avec un outil plutôt que de faire confiance au seul modèle ?',
      [
        'Parce que les outils rédigent mieux',
        'Parce qu’un calcul déterministe est exact et auditable : N01 + N04 = 10 000 MAD HT',
        'Parce que Claude refuse de calculer',
        'Parce que le modèle ne connaît pas les chiffres',
      ],
      1,
      'Les montants engagent NOVA : on double l’IA d’un contrôle déterministe.',
    ),
    mcq(
      'm7-q5',
      'Rif Atelier (budget 2 500, N03 = 3 000) arrive à l’étape 8. Que doit présenter le workflow ?',
      [
        'Une remise automatique de 500 MAD',
        'Le devis sans l’alerte',
        'L’alerte budget (+500 MAD, +20 %) au consultant, qui décide',
        'Un dossier supprimé',
      ],
      2,
      'Le workflow signale l’écart ; la décision commerciale est humaine.',
    ),
    mcq(
      'm7-q6',
      'Quelle bonne pratique réduit le risque d’une validation humaine « automatique » (clic sans lecture) ?',
      [
        'Masquer les alertes pour aller plus vite',
        'Afficher un récapitulatif avec les alertes en tête et journaliser la décision',
        'Valider tous les dossiers en lot',
        'Supprimer l’étape de validation',
      ],
      1,
      'Un HITL bien conçu rend la décision éclairée et traçable.',
    ),
  ],
  practicalMission: {
    id: 'm7-mission',
    title: 'Concevoir le workflow de devis d’Océan Services',
    prompt:
      "Produisez un tableau à 9 lignes décrivant le workflow NOVA appliqué à Océan Services (N01 + N04 = 10 000 MAD HT) : étape, type (LLM, skill, outil, humain), entrée, sortie, risque, garde-fou. Marquez la sortie anticipée en cas de budget absent (étape 3), le contrôle du total par un outil (étape 6) et la validation humaine avant l’envoi (étape 8). Terminez par 3 à 5 phrases expliquant pourquoi l’approbation humaine reste indispensable même quand tous les contrôles passent.",
    deliverables: [
      'Tableau à 9 lignes : étape, type, entrée, sortie, risque, garde-fou',
      'Repérage de la sortie anticipée, du contrôle du total et du HITL',
      'Réponse de 3 à 5 phrases sur la nécessité de l’approbation humaine',
    ],
    successCriteria: [
      'Les neuf étapes sont présentes dans le bon ordre.',
      'Le total Océan est exact : 4 500 + 5 500 = 10 000 MAD HT, recalculé par un outil.',
      'La validation humaine précède l’envoi.',
      'La réponse cite au moins trois idées : responsabilité, risque d’erreur, contexte ou traçabilité.',
    ],
    estimatedMin: 10,
  },
  verification: {
    id: 'm7-rubric',
    title: 'Grille de vérification — Module 7',
    maxPoints: 15,
    passThreshold: 10,
    criteria: [
      criterion('r1', 'Vocabulaire', 'Les six briques et les termes clés (LLM, outil, MCP, HITL…) sont distingués.', levels(
        'Confusion générale agent / workflow.',
        'Deux ou trois briques correctement distinguées.',
        'Quatre ou cinq briques correctement distinguées.',
        'Les six briques distinguées avec un exemple NOVA chacune.',
      )),
      criterion('r2', 'Structure du workflow', 'Les neuf étapes sont ordonnées et typées.', levels(
        'Moins de cinq étapes.',
        'Cinq à sept étapes.',
        'Neuf étapes sans types ou avec des types erronés.',
        'Neuf étapes ordonnées et typées correctement.',
      )),
      criterion('r3', 'Contrôles déterministes', 'Complétude et total vérifiés hors IA.', levels(
        'Tout est laissé au modèle.',
        'Un seul contrôle déterministe.',
        'Les deux contrôles, sans montants exacts.',
        'Complétude (étape 3) et total (étape 6) avec les bons montants.',
      )),
      criterion('r4', 'Validation humaine', 'Le point HITL est placé avant l’envoi et bien conçu.', levels(
        'Aucun point de validation.',
        'Validation placée après l’envoi.',
        'Validation avant l’envoi sans alertes ni journal.',
        'Validation avant l’envoi, alertes en tête, décision journalisée.',
      )),
      criterion('r5', 'Justification', 'La réponse argumente l’approbation humaine.', levels(
        'Aucun argument.',
        'Un argument.',
        'Deux arguments.',
        'Trois arguments ou plus (responsabilité, erreur, contexte, traçabilité).',
      )),
    ],
  },
  synthesis: {
    takeaways: [
      'Un workflow encadre (ordre prévu), un agent improvise (étapes choisies par l’IA) : choisissez l’autonomie minimale qui résout le problème.',
      'Le workflow NOVA en 9 étapes combine LLM, skill et outils : le total est recalculé par un outil, et un budget absent arrête le dossier dès l’étape 3.',
      'Un point de validation humaine précède toujours l’envoi : l’IA prépare, le consultant décide et reste responsable.',
    ],
    nextModule: {
      id: 'm8',
      slug: 'm8-claude-code-defi-final',
      title: 'Module 8 — Claude Code et défi final Océan Services',
      href: '/modules/m8-claude-code-defi-final',
      teaser: 'Dernier module : découvrez Claude Code puis assemblez toute la chaîne dans le défi Océan Services noté sur 100 points.',
    },
  },
  instructorNotes: [
    {
      id: 'm7-n1',
      topic: 'Vocabulaire (10 min)',
      text: 'Définir les termes clés (LLM, outil, skill, agent, workflow, orchestration, MCP, HITL) avec une analogie chacun. Message : « Workflow = chemin prévu ; agent = chemin décidé par l’IA. MCP connecte, il ne sécurise pas à lui seul. »',
      timingMin: 10,
      pitfalls: ['Confusion fréquente agent / workflow : insister sur l’ordre des étapes.', `Connecteurs et MCP : ${UI_VERIFY_NOTE}.`],
    },
    {
      id: 'm7-n2',
      topic: 'Workflow en 9 étapes (12 min)',
      text: 'Parcourir le diagramme, cliquer chaque nœud. Étape 3 : sortie anticipée si budget absent ; étape 6 : calcul par un outil ; étape 8 : validation avant l’envoi.',
      timingMin: 12,
    },
    {
      id: 'm7-n3',
      topic: 'Simulateur : cinq dossiers (13 min)',
      text: 'Faire prédire le chemin avant de lancer. Atlas Distribution 6 500 (reliquat 5 500) ; Rif Atelier +500 (+20 %) ; Océan Services 10 000 (reliquat 1 000) ; Maroc Textile arrêt étape 3 ; Casa Santé Plus arrêt étape 4 (N05 9 000 contre 4 000).',
      timingMin: 13,
      pitfalls: ['Participants qui proposent une remise pour Rif : rappeler que l’humain décide.'],
    },
    {
      id: 'm7-n4',
      topic: 'Cartes à classer et fiche de workflow (6 min)',
      text: 'Lancer le tri des 12 cartes (skill, agent, outil, projet, workflow, tâche planifiée) puis la fiche de conception. Réponse attendue sur le HITL : responsabilité, risque d’erreur, contexte, traçabilité.',
      timingMin: 6,
    },
    {
      id: 'm7-n5',
      topic: 'Quiz et transition (4 min)',
      text: 'Lancer le quiz de 6 questions, puis annoncer : « Dernier module : on assemble tout dans le défi Océan Services. » Plan B : diagramme et simulateur fonctionnent sans Claude.',
      timingMin: 4,
    },
  ],
  references: [
    { id: 'm7-ref1', label: 'Model Context Protocol (MCP)', url: 'https://modelcontextprotocol.io/', note: `Protocole ouvert ; disponibilité côté Claude : ${UI_VERIFY_NOTE}.`, verifyUi: true },
    { id: 'm7-ref2', label: 'Anthropic : construire des agents efficaces', note: 'Distinction workflows / agents ; consulter la version en vigueur.' },
  ],
}

export default module7
