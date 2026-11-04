import { useEffect, useMemo, type ReactNode } from 'react'
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import type { FileEditExercise } from '../../content/types'
import { runChecks } from '../../lib/validate'
import { setExerciseDone, setNote, useProgress } from '../../lib/progress'
import CopyButton from '../ui/CopyButton'
import HintStack from '../ui/HintStack'

interface Props {
  exercise: FileEditExercise
  /** Panneau complémentaire (aperçu, diagnostic) rendu à partir du texte courant */
  extra?: (text: string) => ReactNode
  rows?: number
}

const EXT: Record<FileEditExercise['format'], string> = { markdown: 'Markdown', json: 'JSON', csv: 'CSV' }

/** Éditeur commun aux exercices de fichiers : brouillon sauvegardé, vérifications en direct, indices, solution confirmée. */
export default function FileEditShell({ exercise, extra, rows = 16 }: Props) {
  const progress = useProgress()
  const draftKey = `draft:${exercise.id}`
  const text = progress.notes[draftKey] ?? exercise.starter
  const results = useMemo(() => runChecks(exercise.checks, text), [exercise.checks, text])
  const passed = results.filter((r) => r.ok).length
  const allOk = passed === results.length
  const modified = text !== exercise.starter

  useEffect(() => {
    if (allOk && modified) setExerciseDone(exercise.id, true)
  }, [allOk, modified, exercise.id])

  return (
    <div className="editor-layout">
      <div className="editor-col">
        <div className="editor-head">
          <label htmlFor={`ed-${exercise.id}`} className="eyebrow">
            Votre fichier ({EXT[exercise.format]})
          </label>
          <div className="row">
            <CopyButton text={text} />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (!modified || window.confirm('Revenir au texte de départ ? Vos modifications seront perdues.')) setNote(draftKey, '')
              }}
              disabled={!modified}
            >
              <RotateCcw size={14} aria-hidden="true" /> Réinitialiser
            </button>
          </div>
        </div>
        <textarea
          id={`ed-${exercise.id}`}
          className="textarea code-area"
          rows={rows}
          spellCheck={false}
          value={text}
          onChange={(e) => setNote(draftKey, e.target.value === exercise.starter ? '' : e.target.value)}
          aria-describedby={`ed-checks-${exercise.id}`}
        />
        {extra && <div className="editor-extra">{extra(text)}</div>}
      </div>

      <div className="editor-col" id={`ed-checks-${exercise.id}`}>
        <h3 className="h-sm">
          Vérifications en direct{' '}
          <span className={`badge ${allOk ? 'badge-ok' : ''}`}>
            {passed} / {results.length}
          </span>
        </h3>
        <ul className="checks" aria-live="polite">
          {results.map((r) => (
            <li key={r.id} className={r.ok ? 'is-ok' : 'is-ko'}>
              {r.ok ? <CircleCheck size={16} aria-label="Validé" /> : <CircleX size={16} aria-label="Non validé" />}
              <span>
                {r.description}
                {!r.ok && <em className="check-hint"> — {r.message}</em>}
              </span>
            </li>
          ))}
        </ul>
        {allOk && modified && (
          <p className="callout callout-ok" role="status">
            Toutes les vérifications sont validées : exercice complété.
          </p>
        )}
        <HintStack hints={exercise.hints} solution={exercise.solution} />
      </div>
    </div>
  )
}
