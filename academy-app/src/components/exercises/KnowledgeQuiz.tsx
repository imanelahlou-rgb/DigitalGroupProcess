import { useState } from 'react'
import { CircleCheck, CircleX, RotateCcw, Trophy } from 'lucide-react'
import type { QuizQuestion } from '../../content/types'
import { QUIZ_PASS_THRESHOLD, requiredCorrect, scoreQuiz, type QuizResult } from '../../lib/quiz'
import { recordQuizAttempt, useProgress } from '../../lib/progress'

interface Props {
  moduleId: string
  questions: QuizQuestion[]
  threshold?: number
}

export default function KnowledgeQuiz({ moduleId, questions, threshold = QUIZ_PASS_THRESHOLD }: Props) {
  const progress = useProgress()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const attempts = progress.quizzes[moduleId] ?? []
  const allAnswered = questions.every((q) => answers[q.id])
  const needed = requiredCorrect(questions.length, threshold)

  function submit() {
    const r = scoreQuiz(questions, answers, threshold)
    setResult(r)
    recordQuizAttempt(moduleId, { score: r.score, total: r.total, percent: r.percent, passed: r.passed })
  }

  function retry() {
    setAnswers({})
    setResult(null)
  }

  return (
    <section className="quiz" aria-label="Quiz de connaissances">
      <p className="muted small">
        {questions.length} questions · seuil de réussite {threshold} % ({needed} bonne{needed > 1 ? 's' : ''} réponse{needed > 1 ? 's' : ''} sur {questions.length}).
        {attempts.length > 0 && ` Tentatives : ${attempts.length} · meilleur score : ${Math.max(...attempts.map((a) => a.percent))} %.`}
      </p>
      <ol className="quiz-list">
        {questions.map((q, qi) => {
          const detail = result?.details.find((d) => d.id === q.id)
          return (
            <li key={q.id} className="quiz-q">
              <fieldset disabled={Boolean(result)}>
                <legend>
                  <span className="quiz-num">{qi + 1}</span> {q.prompt}
                </legend>
                <div className="choices">
                  {q.choices.map((c) => {
                    const chosen = answers[q.id] === c.id
                    const isCorrect = result && c.id === q.correctId
                    const isWrong = result && chosen && c.id !== q.correctId
                    return (
                      <label key={c.id} className={`choice ${chosen ? 'is-chosen' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}>
                        <input type="radio" name={`${moduleId}-${q.id}`} value={c.id} checked={chosen} onChange={() => setAnswers((a) => ({ ...a, [q.id]: c.id }))} />
                        <span>{c.label}</span>
                        {isCorrect && <CircleCheck size={16} aria-label="Bonne réponse" />}
                        {isWrong && <CircleX size={16} aria-label="Réponse erronée" />}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
              {result && detail && (
                <p className={`feedback ${detail.correct ? 'ok' : 'ko'}`}>
                  <strong>{detail.correct ? 'Correct.' : 'Incorrect.'}</strong> {q.explanation}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      {!result && (
        <div className="row wrap">
          <button type="button" className="btn btn-primary" onClick={submit} disabled={!allAnswered}>
            Valider mes réponses
          </button>
          {!allAnswered && <span className="muted small">Répondez aux {questions.length} questions pour valider.</span>}
        </div>
      )}
      {result && (
        <div className={`callout ${result.passed ? 'callout-ok' : 'callout-warn'}`} role="status">
          <p>
            <Trophy size={16} aria-hidden="true" /> <strong>{result.score} / {result.total}</strong> — {result.percent} %.{' '}
            {result.passed ? 'Seuil atteint : quiz validé.' : `Seuil non atteint (${threshold} % requis). Relisez les explications puis réessayez.`}
          </p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
            <RotateCcw size={14} aria-hidden="true" /> Refaire le quiz
          </button>
        </div>
      )}
    </section>
  )
}
