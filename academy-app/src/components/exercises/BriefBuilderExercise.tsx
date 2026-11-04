import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import type { BriefBuilderExercise as BriefBuilderData } from '../../content/types'
import { setExerciseDone, setNote, useProgress } from '../../lib/progress'
import CodeExample from '../ui/CodeExample'
import HintStack from '../ui/HintStack'

export default function BriefBuilderExercise({ exercise }: { exercise: BriefBuilderData }) {
  const progress = useProgress()
  const [examples, setExamples] = useState<Record<string, boolean>>({})
  const key = (id: string) => `brief:${exercise.id}:${id}`
  const value = (id: string) => progress.notes[key(id)] ?? ''

  const missing = exercise.fields.filter((f) => f.required && value(f.id).trim().length < 3)
  const complete = missing.length === 0

  const assembled = exercise.outputTemplate.replace(/\{\{(\w+)\}\}/g, (_, id: string) => value(id).trim() || '[à compléter]')

  useEffect(() => {
    if (complete) setExerciseDone(exercise.id, true)
  }, [complete, exercise.id])

  return (
    <div className="stack">
      <div className="stack-sm">
        {exercise.fields.map((f) => (
          <div className="field" key={f.id}>
            <label htmlFor={`bf-${exercise.id}-${f.id}`}>
              {f.label} {f.required && <span className="req" title="Obligatoire">*</span>}
            </label>
            <p className="muted small" id={`bf-help-${exercise.id}-${f.id}`}>
              {f.helper}
            </p>
            <textarea
              id={`bf-${exercise.id}-${f.id}`}
              className="textarea"
              rows={3}
              placeholder={f.placeholder}
              aria-describedby={`bf-help-${exercise.id}-${f.id}`}
              value={value(f.id)}
              onChange={(e) => setNote(key(f.id), e.target.value)}
            />
            <button type="button" className="btn btn-link btn-sm" onClick={() => setExamples((s) => ({ ...s, [f.id]: !s[f.id] }))} aria-expanded={Boolean(examples[f.id])}>
              <Lightbulb size={14} aria-hidden="true" /> {examples[f.id] ? 'Masquer l’exemple' : 'Voir un exemple'}
            </button>
            {examples[f.id] && <p className="example">{f.example}</p>}
          </div>
        ))}
      </div>
      <div>
        <h3 className="h-sm">Document assemblé</h3>
        {!complete && (
          <p className="muted small" role="status">
            Champs obligatoires restants : {missing.map((m) => m.label).join(', ')}.
          </p>
        )}
        <CodeExample code={assembled} title="Document assemblé" maxHeight={380} />
        {complete && (
          <p className="callout callout-ok" role="status">
            Tous les champs obligatoires sont renseignés : exercice complété.
          </p>
        )}
      </div>
      <HintStack hints={exercise.hints} />
    </div>
  )
}
