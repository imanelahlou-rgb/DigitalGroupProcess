import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleCheck, Undo2 } from 'lucide-react'
import { allExercises, findExercise, moduleNumber, shortTitle } from '../content/course'
import { setExerciseDone, useProgress } from '../lib/progress'
import ExerciseRenderer, { EXERCISE_KIND_LABEL } from '../components/exercises/ExerciseRenderer'
import PageHeader from '../components/ui/PageHeader'
import TaskInstructions from '../components/ui/TaskInstructions'
import NotFound from './NotFound'

export default function ExercisePage() {
  const { exerciseId } = useParams()
  const progress = useProgress()
  const found = exerciseId ? findExercise(exerciseId) : undefined
  if (!found) return <NotFound what="Cet exercice" />
  const { module, exercise } = found
  const done = Boolean(progress.exercises[exercise.id])
  const idx = allExercises.findIndex((e) => e.exercise.id === exercise.id)
  const prev = allExercises[idx - 1]
  const next = allExercises[idx + 1]

  return (
    <div className="page stack-lg">
      <PageHeader
        crumbs={[
          { label: 'Programme', to: '/programme' },
          { label: `Module ${moduleNumber(module)} — ${shortTitle(module)}`, to: `/modules/${module.slug}#exercices` },
          { label: 'Exercice' },
        ]}
        eyebrow={`${EXERCISE_KIND_LABEL[exercise.kind]}${done ? ' · terminé' : ''}`}
        title={exercise.title}
      />
      <div className="card">
        <TaskInstructions instructions={exercise.instructions} durationMin={exercise.durationMin} assets={exercise.assets} />
      </div>
      {/* key : réinitialise l'état local des composants quand l'exercice change */}
      <ExerciseRenderer key={exercise.id} exercise={exercise} />
      <div className="row wrap between exercise-footer">
        <button type="button" className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setExerciseDone(exercise.id, !done)}>
          {done ? (
            <>
              <Undo2 size={16} aria-hidden="true" /> Retirer le statut « terminé »
            </>
          ) : (
            <>
              <CircleCheck size={16} aria-hidden="true" /> Marquer comme terminé
            </>
          )}
        </button>
        <div className="row wrap">
          {prev && (
            <Link className="btn btn-ghost" to={`/exercices/${prev.exercise.id}`}>
              <ArrowLeft size={16} aria-hidden="true" /> Précédent
            </Link>
          )}
          {next ? (
            <Link className="btn btn-ghost" to={`/exercices/${next.exercise.id}`}>
              Suivant <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <Link className="btn btn-ghost" to="/projet-final">
              Projet final <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
