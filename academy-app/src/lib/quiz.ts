import type { QuizQuestion } from '../content/types'

/** Seuil de réussite par défaut (pourcentage). */
export const QUIZ_PASS_THRESHOLD = 80

export interface QuizQuestionResult {
  id: string
  answered: boolean
  correct: boolean
  chosenId?: string
  correctId: string
}

export interface QuizResult {
  score: number
  total: number
  percent: number
  passed: boolean
  threshold: number
  details: QuizQuestionResult[]
}

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: Record<string, string>,
  threshold: number = QUIZ_PASS_THRESHOLD,
): QuizResult {
  const details = questions.map((q) => {
    const chosenId = answers[q.id]
    return { id: q.id, answered: Boolean(chosenId), correct: chosenId === q.correctId, chosenId, correctId: q.correctId }
  })
  const score = details.filter((d) => d.correct).length
  const total = questions.length
  const percent = total === 0 ? 0 : Math.round((score / total) * 100)
  return { score, total, percent, passed: percent >= threshold, threshold, details }
}

/** Nombre minimal de bonnes réponses pour atteindre le seuil. */
export function requiredCorrect(total: number, threshold: number = QUIZ_PASS_THRESHOLD): number {
  return Math.ceil((total * threshold) / 100)
}
