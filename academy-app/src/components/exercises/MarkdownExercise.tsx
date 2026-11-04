import type { FileEditExercise } from '../../content/types'
import { Markdown } from '../course/LessonRenderer'
import FileEditShell from './FileEditShell'

export default function MarkdownExercise({ exercise }: { exercise: FileEditExercise }) {
  return (
    <FileEditShell
      exercise={exercise}
      extra={(text) => (
        <details className="preview" open>
          <summary>Aperçu rendu</summary>
          <Markdown>{text}</Markdown>
        </details>
      )}
    />
  )
}
