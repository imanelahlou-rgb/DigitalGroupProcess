import { useEffect, useMemo, useState } from 'react'
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import type { MatchingExercise } from '../../content/types'
import { setExerciseDone } from '../../lib/progress'
import HintStack from '../ui/HintStack'

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

export default function MatchExercise({ exercise }: { exercise: MatchingExercise }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const options = useMemo(() => [...exercise.pairs].sort((a, b) => hash(a.id + a.right) - hash(b.id + b.right)), [exercise.pairs])
  const allAnswered = exercise.pairs.every((p) => answers[p.id])
  const correctCount = exercise.pairs.filter((p) => answers[p.id] === p.id).length
  const allCorrect = checked && correctCount === exercise.pairs.length

  useEffect(() => {
    if (allCorrect) setExerciseDone(exercise.id, true)
  }, [allCorrect, exercise.id])

  return (
    <div className="stack">
      <p className="muted small">Associez chaque élément à sa description, puis vérifiez. Vous pouvez corriger et revérifier autant de fois que nécessaire.</p>
      <ul className="match-list">
        {exercise.pairs.map((p) => {
          const ok = checked && answers[p.id] === p.id
          const ko = checked && answers[p.id] && answers[p.id] !== p.id
          return (
            <li key={p.id} className={`match-row ${ok ? 'is-ok' : ''} ${ko ? 'is-ko' : ''}`}>
              <label htmlFor={`m-${p.id}`} className="match-left mono">
                {p.left}
              </label>
              <select
                id={`m-${p.id}`}
                className="input"
                value={answers[p.id] ?? ''}
                onChange={(e) => {
                  setAnswers((a) => ({ ...a, [p.id]: e.target.value }))
                  setChecked(false)
                }}
              >
                <option value="">Choisir une description…</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.right}
                  </option>
                ))}
              </select>
              {checked && (
                <p className={`feedback ${ok ? 'ok' : 'ko'}`}>
                  {ok ? <CircleCheck size={16} aria-hidden="true" /> : <CircleX size={16} aria-hidden="true" />}{' '}
                  {ok ? p.feedback : `Pas tout à fait. Indice : famille « ${p.category} ».`}
                </p>
              )}
            </li>
          )
        })}
      </ul>
      <div className="row wrap">
        <button type="button" className="btn btn-primary" disabled={!allAnswered} onClick={() => setChecked(true)}>
          Vérifier mes associations
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setAnswers({})
            setChecked(false)
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Recommencer
        </button>
        {checked && (
          <span className={allCorrect ? 'ok' : 'ko'} role="status">
            {correctCount} / {exercise.pairs.length} correct{correctCount > 1 ? 'es' : 'e'}
            {allCorrect && ' — exercice complété.'}
          </span>
        )}
      </div>
      <HintStack hints={exercise.hints} />
    </div>
  )
}
