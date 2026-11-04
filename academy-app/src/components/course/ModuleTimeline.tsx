import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Check, Coffee } from 'lucide-react'
import type { Module } from '../../content/types'
import { formatDuration, moduleNumber, shortTitle } from '../../content/course'
import { STATUS_LABEL, type ModuleProgress } from '../../lib/progress'

interface Props {
  modules: Module[]
  progress: ModuleProgress[]
}

/** Parcours vertical : 8 modules + pause de 20 minutes entre les modules 4 et 5. */
export default function ModuleTimeline({ modules, progress }: Props) {
  return (
    <ol className="timeline" aria-label="Chronologie des modules">
      {modules.map((m, i) => {
        const p = progress[i]
        return (
          <Fragment key={m.id}>
            {m.id === 'm5' && modules[i - 1]?.id === 'm4' && (
              <li className="timeline-break">
                <Coffee size={14} aria-hidden="true" /> Pause de 20 minutes
              </li>
            )}
            <li className={`timeline-item status-${p.status}`}>
              <span className="timeline-dot" aria-hidden="true">
                {p.status === 'completed' ? <Check size={14} /> : moduleNumber(m)}
              </span>
              <div className="timeline-body">
                <Link to={`/modules/${m.slug}`} className="timeline-title">
                  Module {moduleNumber(m)} — {shortTitle(m)}
                </Link>
                <p className="muted small">
                  {formatDuration(m.durationMin)} · {m.lessons.length} leçons · {m.exercises.length} exercices · {STATUS_LABEL[p.status]} ({p.percent} %)
                </p>
              </div>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
