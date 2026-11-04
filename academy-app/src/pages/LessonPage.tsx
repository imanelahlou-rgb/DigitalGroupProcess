import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleCheck, Undo2 } from 'lucide-react'
import { findLesson, formatDuration, moduleNumber, shortTitle } from '../content/course'
import { setLessonDone, useProgress } from '../lib/progress'
import LessonRenderer from '../components/course/LessonRenderer'
import PageHeader from '../components/ui/PageHeader'
import NotFound from './NotFound'

export default function LessonPage() {
  const { moduleId, lessonId } = useParams()
  const progress = useProgress()
  const found = moduleId && lessonId ? findLesson(moduleId, lessonId) : undefined
  if (!found) return <NotFound what="Cette leçon" />
  const { module, lesson, index } = found
  const done = Boolean(progress.lessons[lesson.id])
  const prev = module.lessons[index - 1]
  const next = module.lessons[index + 1]

  return (
    <div className="page stack-lg">
      <PageHeader
        crumbs={[
          { label: 'Programme', to: '/programme' },
          { label: `Module ${moduleNumber(module)} — ${shortTitle(module)}`, to: `/modules/${module.slug}` },
          { label: `Leçon ${index + 1}` },
        ]}
        eyebrow={`Leçon ${index + 1} sur ${module.lessons.length} · ${formatDuration(lesson.durationMin)}`}
        title={lesson.title}
      />
      <div className="card">
        <LessonRenderer lesson={lesson} showTitle={false} />
      </div>
      <div className="row wrap between">
        <button type="button" className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setLessonDone(lesson.id, !done)}>
          {done ? (
            <>
              <Undo2 size={16} aria-hidden="true" /> Marquer comme à revoir
            </>
          ) : (
            <>
              <CircleCheck size={16} aria-hidden="true" /> Marquer comme terminée
            </>
          )}
        </button>
        <div className="row wrap">
          {prev && (
            <Link className="btn btn-ghost" to={`/modules/${module.slug}/lecons/${prev.id}`}>
              <ArrowLeft size={16} aria-hidden="true" /> Leçon précédente
            </Link>
          )}
          {next ? (
            <Link className="btn btn-ghost" to={`/modules/${module.slug}/lecons/${next.id}`}>
              Leçon suivante <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <Link className="btn btn-ghost" to={`/modules/${module.slug}#demo`}>
              Démonstration et exercices <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
