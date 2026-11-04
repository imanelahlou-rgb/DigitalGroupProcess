/**
 * Types du contenu pédagogique — DPG Academy · Atelier Claude.
 * Contenu rédigé en français. Aucune certification Anthropic n'est revendiquée.
 */

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8'

/** Mention à utiliser partout où l'interface de Claude peut varier. */
export const UI_VERIFY_NOTE = 'à vérifier selon compte et version'

/* -------------------------------------------------------------------------- */
/* Primitives                                                                  */
/* -------------------------------------------------------------------------- */

export interface Hint {
  id: string
  /** 1 = piste légère, 2 = piste précise, 3 = quasi-solution */
  level: 1 | 2 | 3
  text: string
}

export interface Reference {
  id: string
  label: string
  url?: string
  note?: string
  /** true si le contenu référencé dépend de l'interface/version de Claude */
  verifyUi?: boolean
}

export interface InstructorNote {
  id: string
  topic: string
  text: string
  /** Minutes suggérées pour cette séquence */
  timingMin?: number
  /** Points de vigilance ou questions fréquentes */
  pitfalls?: string[]
}

export interface Asset {
  id: string
  filename: string
  kind: 'file' | 'copyable-text' | 'image' | 'link'
  mimeType: string
  description: string
  /** Contenu texte intégré (fichier d'exemple ou texte à copier) */
  content?: string
  url?: string
}

/* -------------------------------------------------------------------------- */
/* Leçon, démo                                                                 */
/* -------------------------------------------------------------------------- */

export interface Lesson {
  id: string
  title: string
  durationMin: number
  /** Markdown : définitions, explication, exemple NOVA, erreurs fréquentes, bonnes pratiques */
  body: string
  keyTerms?: { term: string; definition: string }[]
}

export interface DemoStep {
  /** Numéro d'étape, à partir de 1 */
  number: number
  title: string
  instruction: string
  /** Résultat attendu à l'étape */
  expected?: string
}

export interface Demo {
  title: string
  prerequisites?: string[]
  steps: DemoStep[]
  expectedResult: string
  /** Rappel : les sorties d'un modèle de langage varient d'une exécution à l'autre */
  varianceNote: string
}

/* -------------------------------------------------------------------------- */
/* Exercices                                                                   */
/* -------------------------------------------------------------------------- */

export type ExerciseKind =
  | 'file-edit'
  | 'matching'
  | 'audit'
  | 'brief-builder'
  | 'direction-compare'
  | 'classify'
  | 'context-simulator'
  | 'comparison-table'

export interface ExerciseCheck {
  id: string
  description: string
  type:
    | 'contains'
    | 'regex'
    | 'json-valid'
    | 'json-has-keys'
    | 'csv-columns'
    | 'csv-min-rows'
    | 'md-has-heading'
    | 'md-has-list'
  /** Valeur attendue (texte, motif, liste de clés/colonnes, nombre de lignes) */
  value?: string | string[] | number
  failMessage: string
}

interface ExerciseBase {
  id: string
  title: string
  instructions: string
  durationMin: number
  hints: Hint[]
  assets?: Asset[]
}

export interface FileEditExercise extends ExerciseBase {
  kind: 'file-edit'
  format: 'markdown' | 'json' | 'csv'
  /** Contenu de départ proposé à l'apprenant */
  starter: string
  /** Proposition de correction (affichée après tentative) */
  solution: string
  checks: ExerciseCheck[]
}

export interface MatchingPair {
  id: string
  /** ex. « .json » */
  left: string
  /** Rôle ou description */
  right: string
  /** Catégorie : donnée, présentation, exécutable, document */
  category: 'données' | 'texte' | 'présentation' | 'document' | 'exécutable' | 'configuration'
  feedback: string
}

export interface MatchingExercise extends ExerciseBase {
  kind: 'matching'
  pairs: MatchingPair[]
}

export interface AuditCriterion {
  id: string
  label: string
  question: string
  /** Réponse attendue de l'audit pour le prompt faible fourni */
  expectedFinding: string
}

export interface AuditExercise extends ExerciseBase {
  kind: 'audit'
  /** Texte à auditer */
  target: string
  criteria: AuditCriterion[]
  /** Version améliorée de référence */
  improvedVersion: string
}

export interface BuilderField {
  id: string
  label: string
  placeholder: string
  helper: string
  required: boolean
  example: string
}

export interface BriefBuilderExercise extends ExerciseBase {
  kind: 'brief-builder'
  fields: BuilderField[]
  /** Gabarit de sortie avec marqueurs {{fieldId}} */
  outputTemplate: string
}

export interface BrandDirection {
  id: string
  name: string
  tagline: string
  palette: { name: string; hex: string; role: string }[]
  typography: { heading: string; body: string; note: string }
  tone: string
  moodKeywords: string[]
  strengths: string[]
  risks: string[]
  /** Pour quelle cible cette direction est la plus pertinente */
  bestFor: string
}

export interface DirectionCompareExercise extends ExerciseBase {
  kind: 'direction-compare'
  directions: BrandDirection[]
  comparisonCriteria: string[]
}

export interface ClassifyCategory {
  id: string
  label: string
}

export interface ClassifyCard {
  id: string
  text: string
  correctCategoryId: string
  explanation: string
}

export interface ClassifyExercise extends ExerciseBase {
  kind: 'classify'
  categories: ClassifyCategory[]
  cards: ClassifyCard[]
}

export interface ContextLayer {
  id: string
  label: string
  description: string
  /** Contenu illustratif de la couche */
  sample: string
}

export interface ContextOutcome {
  /** Ensemble de couches actives pour lequel cette réponse s'applique */
  requires: string[]
  /** Réponse illustrative (simulation statique, pas un appel au modèle) */
  response: string
  /** Qualité perçue de 1 à 5 */
  quality: 1 | 2 | 3 | 4 | 5
  commentary: string
}

export interface ContextSimulatorExercise extends ExerciseBase {
  kind: 'context-simulator'
  userRequest: string
  layers: ContextLayer[]
  outcomes: ContextOutcome[]
  /** Disclaimer : simulation pédagogique statique */
  disclaimer: string
}

export interface ComparisonTable {
  id: string
  caption: string
  columns: string[]
  rows: { id: string; label: string; cells: string[] }[]
  footnote?: string
}

export interface ComparisonTableExercise extends ExerciseBase {
  kind: 'comparison-table'
  table: ComparisonTable
  /** Questions d'application sur le tableau */
  questions: { id: string; prompt: string; answer: string }[]
}

export type Exercise =
  | FileEditExercise
  | MatchingExercise
  | AuditExercise
  | BriefBuilderExercise
  | DirectionCompareExercise
  | ClassifyExercise
  | ContextSimulatorExercise
  | ComparisonTableExercise

/* -------------------------------------------------------------------------- */
/* Quiz, mission pratique, vérification                                        */
/* -------------------------------------------------------------------------- */

export interface QuizChoice {
  id: string
  label: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  choices: QuizChoice[]
  correctId: string
  explanation: string
}

export interface PracticalTask {
  id: string
  title: string
  prompt: string
  deliverables: string[]
  successCriteria: string[]
  estimatedMin: number
  assets?: Asset[]
}

export interface RubricLevel {
  points: number
  descriptor: string
}

export interface RubricCriterion {
  id: string
  label: string
  description: string
  maxPoints: number
  levels: RubricLevel[]
}

export interface AssessmentRubric {
  id: string
  title: string
  criteria: RubricCriterion[]
  maxPoints: number
  /** Seuil de réussite en points */
  passThreshold: number
}

/* -------------------------------------------------------------------------- */
/* Synthèse, module, cours                                                     */
/* -------------------------------------------------------------------------- */

export interface Synthesis {
  /** Exactement 3 points à retenir */
  takeaways: [string, string, string]
  nextModule: {
    id: ModuleId
    slug: string
    title: string
    href: string
    teaser: string
  }
}

export interface Module {
  id: ModuleId
  slug: string
  title: string
  durationMin: number
  /** 3 à 5 objectifs */
  objectives: string[]
  /** Mise en situation NOVA (3 à 5 phrases) */
  situation: string
  lessons: Lesson[]
  demo: Demo
  exercises: Exercise[]
  quiz: QuizQuestion[]
  practicalMission: PracticalTask
  verification: AssessmentRubric
  synthesis: Synthesis
  instructorNotes: InstructorNote[]
  references?: Reference[]
  assets?: Asset[]
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  language: 'fr'
  modules: Module[]
  totalDurationMin: number
  disclaimer: string
}

/* -------------------------------------------------------------------------- */
/* Progression (état côté application)                                         */
/* -------------------------------------------------------------------------- */

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed'

export interface QuizAttempt {
  attemptedAt: string
  answers: Record<string, string>
  score: number
  total: number
}

export interface Progress {
  moduleId: ModuleId
  status: ProgressStatus
  completedLessonIds: string[]
  completedExerciseIds: string[]
  demoViewed: boolean
  quizAttempts: QuizAttempt[]
  bestQuizScore?: number
  practicalMissionSubmitted: boolean
  /** Notes d'auto-évaluation par critère de la grille */
  rubricSelfScores: Record<string, number>
  updatedAt: string
}
