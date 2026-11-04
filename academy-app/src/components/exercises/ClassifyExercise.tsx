import { useEffect, useState } from 'react'
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import type { ClassifyExercise as ClassifyData } from '../../content/types'
import { setExerciseDone } from '../../lib/progress'
import HintStack from '../ui/HintStack'

export default function ClassifyExercise({ exercise }: { exercise: ClassifyData }) {
  const [assign, setAssign] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  const allAssigned = exercise.cards.every((c) => assign[c.id])
  const correct = exercise.cards.filter((c) => assign[c.id] === c.correctCategoryId).length
  const allCorrect = checked && correct === exercise.cards.length

  useEffect(() => {
    if (allCorrect) setExerciseDone(exercise.id, true)
  }, [allCorrect, exercise.id])

  function put(cardId: string, categoryId: string) {
    setAssign((a) => ({ ...a, [cardId]: categoryId }))
    setChecked(false)
  }

  return (
    <div className="stack">
      <p className="muted small">Pour chaque carte, cliquez sur la catégorie qui convient (ou glissez-la sur une catégorie), puis vérifiez.</p>
      <div className="classify-board" style={{ ['--cols' as string]: String(exercise.categories.length) }}>
        {exercise.categories.map((cat) => (
          <div
            key={cat.id}
            className="classify-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) put(dragId, cat.id)
              setDragId(null)
            }}
          >
            <h3 className="h-sm">{cat.label}</h3>
            <ul>
              {exercise.cards
                .filter((c) => assign[c.id] === cat.id)
                .map((c) => (
                  <li key={c.id} className={`mini-card ${checked ? (c.correctCategoryId === cat.id ? 'is-ok' : 'is-ko') : ''}`}>
                    {c.text}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <ul className="stack-sm classify-cards">
        {exercise.cards.map((c) => {
          const ok = checked && assign[c.id] === c.correctCategoryId
          return (
            <li
              key={c.id}
              className={`card card-flat classify-card ${checked ? (ok ? 'is-ok' : 'is-ko') : ''}`}
              draggable
              onDragStart={() => setDragId(c.id)}
              onDragEnd={() => setDragId(null)}
            >
              <p>{c.text}</p>
              <div className="row wrap" role="radiogroup" aria-label={`Catégorie pour : ${c.text}`}>
                {exercise.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={assign[c.id] === cat.id}
                    className={`chip ${assign[c.id] === cat.id ? 'is-active' : ''}`}
                    onClick={() => put(c.id, cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {checked && (
                <p className={`feedback ${ok ? 'ok' : 'ko'}`}>
                  {ok ? <CircleCheck size={16} aria-hidden="true" /> : <CircleX size={16} aria-hidden="true" />} {ok ? c.explanation : 'Reconsidérez cette carte.'}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <div className="row wrap">
        <button type="button" className="btn btn-primary" disabled={!allAssigned} onClick={() => setChecked(true)}>
          Vérifier la classification
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setAssign({})
            setChecked(false)
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Recommencer
        </button>
        {checked && (
          <span className={allCorrect ? 'ok' : 'ko'} role="status">
            {correct} / {exercise.cards.length} bien classée{correct > 1 ? 's' : ''}
            {allCorrect && ' — exercice complété.'}
          </span>
        )}
      </div>
      <HintStack hints={exercise.hints} />
    </div>
  )
}
