import type { QuizQuestion, RubricCriterion, RubricLevel } from './types'

/**
 * Construit les 4 niveaux d'une grille (0 à 3 points) à partir de 4 descripteurs.
 */
export function levels(d0: string, d1: string, d2: string, d3: string): RubricLevel[] {
  return [
    { points: 0, descriptor: d0 },
    { points: 1, descriptor: d1 },
    { points: 2, descriptor: d2 },
    { points: 3, descriptor: d3 },
  ]
}

/** Construit un critère de grille noté sur 3. */
export function criterion(
  id: string,
  label: string,
  description: string,
  lv: RubricLevel[],
): RubricCriterion {
  return { id, label, description, maxPoints: 3, levels: lv }
}

/**
 * Construit un critère pondéré (maxPoints libre) à 3 niveaux : complet, partiel (moitié), insuffisant.
 * Utilisé pour les grilles sur 100 points.
 */
export function weightedCriterion(
  id: string,
  label: string,
  description: string,
  maxPoints: number,
  full: string,
  partial: string,
  none: string,
): RubricCriterion {
  return {
    id,
    label,
    description,
    maxPoints,
    levels: [
      { points: 0, descriptor: none },
      { points: Math.round(maxPoints / 2), descriptor: partial },
      { points: maxPoints, descriptor: full },
    ],
  }
}

const CHOICE_IDS = ['a', 'b', 'c', 'd', 'e'] as const

/**
 * Construit une question de quiz à choix unique.
 * @param correctIndex index (0 = a, 1 = b, …) de la bonne réponse.
 */
export function mcq(
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): QuizQuestion {
  return {
    id,
    prompt,
    choices: options.map((label, i) => ({ id: CHOICE_IDS[i], label })),
    correctId: CHOICE_IDS[correctIndex],
    explanation,
  }
}
