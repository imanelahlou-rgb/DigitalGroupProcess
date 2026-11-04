import { useEffect } from 'react'
import { Eye } from 'lucide-react'
import type { AuditExercise as AuditExerciseData } from '../../content/types'
import { setCheck, setExerciseDone, setNote, useProgress } from '../../lib/progress'
import CodeExample from '../ui/CodeExample'
import HintStack from '../ui/HintStack'
import PromptBeforeAfter from './PromptBeforeAfter'

export default function AuditExercise({ exercise }: { exercise: AuditExerciseData }) {
  const progress = useProgress()
  const noteKey = (id: string) => `audit:${exercise.id}:${id}`
  const done = exercise.criteria.every((c) => progress.checks[noteKey(c.id)])

  useEffect(() => {
    if (done) setExerciseDone(exercise.id, true)
  }, [done, exercise.id])

  return (
    <div className="stack">
      <div>
        <h3 className="h-sm">Texte à auditer</h3>
        <CodeExample code={exercise.target} title="Texte à auditer" maxHeight={320} />
      </div>
      <div className="stack-sm">
        <h3 className="h-sm">Grille d’audit</h3>
        <p className="muted small">Pour chaque critère, notez votre constat, puis comparez-le au constat attendu.</p>
        {exercise.criteria.map((c) => {
          const note = progress.notes[noteKey(c.id)] ?? ''
          const revealed = Boolean(progress.checks[noteKey(c.id)])
          return (
            <div className="card card-flat audit-criterion" key={c.id}>
              <p>
                <span className="badge">{c.label}</span> <strong>{c.question}</strong>
              </p>
              <label className="field">
                <span className="sr-only">Votre constat pour « {c.label} »</span>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Votre constat…"
                  value={note}
                  onChange={(e) => setNote(noteKey(c.id), e.target.value)}
                  disabled={revealed}
                />
              </label>
              {!revealed ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={note.trim().length < 8}
                  onClick={() => setCheck(noteKey(c.id), true)}
                  title={note.trim().length < 8 ? 'Rédigez d’abord votre constat (8 caractères minimum)' : undefined}
                >
                  <Eye size={14} aria-hidden="true" /> Comparer avec le constat attendu
                </button>
              ) : (
                <div className="callout callout-ok">
                  <p className="eyebrow">Constat attendu</p>
                  <p>{c.expectedFinding}</p>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCheck(noteKey(c.id), false)}>
                    Modifier mon constat
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {done ? (
        <div className="stack-sm">
          <p className="callout callout-ok" role="status">
            Audit complet : exercice complété. Comparez maintenant avec la version améliorée.
          </p>
          <PromptBeforeAfter before={exercise.target} after={exercise.improvedVersion} beforeLabel="Version auditée" afterLabel="Version améliorée de référence" />
        </div>
      ) : (
        <HintStack hints={exercise.hints} solution={exercise.improvedVersion} solutionTitle="Version améliorée de référence" />
      )}
    </div>
  )
}
