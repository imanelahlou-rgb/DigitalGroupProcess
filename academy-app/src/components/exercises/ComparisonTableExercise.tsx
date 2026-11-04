import { useEffect } from 'react'
import { Eye } from 'lucide-react'
import type { ComparisonTableExercise as ComparisonData } from '../../content/types'
import { setCheck, setExerciseDone, setNote, useProgress } from '../../lib/progress'
import ComparisonTable from '../ui/ComparisonTable'
import HintStack from '../ui/HintStack'

export default function ComparisonTableExercise({ exercise }: { exercise: ComparisonData }) {
  const progress = useProgress()
  const key = (id: string) => `cmp:${exercise.id}:${id}`
  const done = exercise.questions.every((q) => progress.checks[key(q.id)])

  useEffect(() => {
    if (done) setExerciseDone(exercise.id, true)
  }, [done, exercise.id])

  return (
    <div className="stack">
      <ComparisonTable table={exercise.table} />
      <div className="stack-sm">
        <h3 className="h-sm">Questions d’application</h3>
        {exercise.questions.map((q, i) => {
          const note = progress.notes[key(q.id)] ?? ''
          const shown = Boolean(progress.checks[key(q.id)])
          return (
            <div className="card card-flat" key={q.id}>
              <p>
                <span className="quiz-num">{i + 1}</span> {q.prompt}
              </p>
              <label className="field">
                <span className="sr-only">Votre réponse à la question {i + 1}</span>
                <textarea className="textarea" rows={2} placeholder="Votre réponse…" value={note} disabled={shown} onChange={(e) => setNote(key(q.id), e.target.value)} />
              </label>
              {shown ? (
                <div className="callout callout-ok">
                  <p className="eyebrow">Réponse attendue</p>
                  <p>{q.answer}</p>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCheck(key(q.id), false)}>
                    Modifier ma réponse
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-ghost btn-sm" disabled={note.trim().length < 3} onClick={() => setCheck(key(q.id), true)}>
                  <Eye size={14} aria-hidden="true" /> Voir la réponse attendue
                </button>
              )}
            </div>
          )
        })}
      </div>
      {done && (
        <p className="callout callout-ok" role="status">
          Toutes les questions sont traitées : exercice complété.
        </p>
      )}
      <HintStack hints={exercise.hints} />
    </div>
  )
}
