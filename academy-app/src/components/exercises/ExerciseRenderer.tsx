import type { Exercise } from '../../content/types'
import AuditExercise from './AuditExercise'
import BriefBuilderExercise from './BriefBuilderExercise'
import ClassifyExercise from './ClassifyExercise'
import ComparisonTableExercise from './ComparisonTableExercise'
import ContextSimulatorExercise from './ContextSimulatorExercise'
import CsvExercise from './CsvExercise'
import DirectionCompareExercise from './DirectionCompareExercise'
import JsonExercise from './JsonExercise'
import MarkdownExercise from './MarkdownExercise'
import MatchExercise from './MatchExercise'

export const EXERCISE_KIND_LABEL: Record<Exercise['kind'], string> = {
  'file-edit': 'Édition de fichier',
  matching: 'Association',
  audit: 'Audit',
  'brief-builder': 'Construction de brief',
  'direction-compare': 'Comparaison de directions',
  classify: 'Classification',
  'context-simulator': 'Simulateur de contexte',
  'comparison-table': 'Tableau comparatif',
}

/** Aiguillage par type d'exercice. */
export default function ExerciseRenderer({ exercise }: { exercise: Exercise }) {
  switch (exercise.kind) {
    case 'file-edit':
      if (exercise.format === 'json') return <JsonExercise exercise={exercise} />
      if (exercise.format === 'csv') return <CsvExercise exercise={exercise} />
      return <MarkdownExercise exercise={exercise} />
    case 'matching':
      return <MatchExercise exercise={exercise} />
    case 'audit':
      return <AuditExercise exercise={exercise} />
    case 'brief-builder':
      return <BriefBuilderExercise exercise={exercise} />
    case 'direction-compare':
      return <DirectionCompareExercise exercise={exercise} />
    case 'classify':
      return <ClassifyExercise exercise={exercise} />
    case 'context-simulator':
      return <ContextSimulatorExercise exercise={exercise} />
    case 'comparison-table':
      return <ComparisonTableExercise exercise={exercise} />
  }
}
