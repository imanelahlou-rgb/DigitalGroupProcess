import { CircleCheck, CircleX, WandSparkles } from 'lucide-react'
import type { FileEditExercise } from '../../content/types'
import { jsonDiagnostic, parseJson } from '../../lib/validate'
import { setNote } from '../../lib/progress'
import FileEditShell from './FileEditShell'

export default function JsonExercise({ exercise }: { exercise: FileEditExercise }) {
  const draftKey = `draft:${exercise.id}`
  return (
    <FileEditShell
      exercise={exercise}
      extra={(text) => {
        const error = jsonDiagnostic(text)
        const parsed = parseJson(text)
        return (
          <div className="json-status" aria-live="polite">
            {error ? (
              <p className="ko">
                <CircleX size={16} aria-hidden="true" /> JSON invalide : <code>{error}</code>
              </p>
            ) : (
              <p className="ok">
                <CircleCheck size={16} aria-hidden="true" /> JSON syntaxiquement valide.
              </p>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={!parsed.ok}
              onClick={() => parsed.ok && setNote(draftKey, JSON.stringify(parsed.value, null, 2))}
            >
              <WandSparkles size={14} aria-hidden="true" /> Indenter le JSON
            </button>
          </div>
        )
      }}
    />
  )
}
