import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Dumbbell, HelpCircle } from 'lucide-react'
import type { Module } from '../../content/types'
import { formatDuration, moduleNumber, shortTitle } from '../../content/course'
import { STATUS_LABEL, type ModuleProgress } from '../../lib/progress'
import ProgressTracker from '../ui/ProgressTracker'

interface Props {
  module: Module
  progress: ModuleProgress
}

export default function ModuleCard({ module, progress }: Props) {
  return (
    <article className={`card module-card status-${progress.status}`}>
      <div className="module-card-head">
        <span className="module-num" aria-hidden="true">
          {String(moduleNumber(module)).padStart(2, '0')}
        </span>
        <span className={`badge badge-${progress.status}`}>{STATUS_LABEL[progress.status]}</span>
      </div>
      <h3 className="h-md">
        <Link to={`/modules/${module.slug}`} className="stretched">
          {shortTitle(module)}
        </Link>
      </h3>
      <ul className="meta-row">
        <li>
          <Clock size={14} aria-hidden="true" /> {formatDuration(module.durationMin)}
        </li>
        <li>
          <BookOpen size={14} aria-hidden="true" /> {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
        </li>
        <li>
          <Dumbbell size={14} aria-hidden="true" /> {module.exercises.length} exercice{module.exercises.length > 1 ? 's' : ''}
        </li>
        <li>
          <HelpCircle size={14} aria-hidden="true" /> {module.quiz.length} questions
        </li>
      </ul>
      <p className="muted small clamp-3">{module.objectives[0]}</p>
      <ProgressTracker size="sm" label="Progression" percent={progress.percent} detail={`${progress.done}/${progress.total}`} />
      <span className="card-cta">
        {progress.status === 'not-started' ? 'Commencer' : progress.status === 'completed' ? 'Revoir' : 'Continuer'} <ArrowRight size={14} aria-hidden="true" />
      </span>
    </article>
  )
}
