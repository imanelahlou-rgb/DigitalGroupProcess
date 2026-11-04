import { useState } from 'react'
import { LayoutGrid, ListTree } from 'lucide-react'
import { modules } from '../content/modules'
import { courseStats, formatDuration } from '../content/course'
import { globalProgress, STATUS_LABEL, useProgress } from '../lib/progress'
import type { ProgressStatus } from '../content/types'
import ModuleCard from '../components/course/ModuleCard'
import ModuleTimeline from '../components/course/ModuleTimeline'
import PageHeader from '../components/ui/PageHeader'

type Filter = 'all' | ProgressStatus

export default function Programme() {
  const progress = useProgress()
  const g = globalProgress(modules, progress)
  const [filter, setFilter] = useState<Filter>('all')
  const [view, setView] = useState<'cards' | 'timeline'>('cards')

  const items = modules.map((m, i) => ({ m, p: g.per[i] })).filter((x) => filter === 'all' || x.p.status === filter)
  const counts: Record<Filter, number> = {
    all: modules.length,
    'not-started': g.per.filter((p) => p.status === 'not-started').length,
    'in-progress': g.per.filter((p) => p.status === 'in-progress').length,
    completed: g.per.filter((p) => p.status === 'completed').length,
  }
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'not-started', label: STATUS_LABEL['not-started'] },
    { id: 'in-progress', label: STATUS_LABEL['in-progress'] },
    { id: 'completed', label: STATUS_LABEL.completed },
  ]

  return (
    <div className="page stack-lg">
      <PageHeader
        eyebrow="Programme"
        title="Huit modules, une journée"
        lead={`${courseStats.lessons} leçons, ${courseStats.exercises} exercices et ${courseStats.quizQuestions} questions de quiz, soit ${formatDuration(courseStats.sessionDurationMin)} avec la pause de 20 minutes entre les modules 4 et 5.`}
      />
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filtrer par avancement">
          {filters.map((f) => (
            <button key={f.id} type="button" className={`chip ${filter === f.id ? 'is-active' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Mode d’affichage">
          <button type="button" className={`chip ${view === 'cards' ? 'is-active' : ''}`} aria-pressed={view === 'cards'} onClick={() => setView('cards')}>
            <LayoutGrid size={14} aria-hidden="true" /> Cartes
          </button>
          <button type="button" className={`chip ${view === 'timeline' ? 'is-active' : ''}`} aria-pressed={view === 'timeline'} onClick={() => setView('timeline')}>
            <ListTree size={14} aria-hidden="true" /> Chronologie
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="callout" role="status">
          Aucun module dans cette catégorie pour le moment.
        </p>
      ) : view === 'cards' ? (
        <div className="grid-cards">
          {items.map(({ m, p }) => (
            <ModuleCard key={m.id} module={m} progress={p} />
          ))}
        </div>
      ) : (
        <ModuleTimeline modules={items.map((x) => x.m)} progress={items.map((x) => x.p)} />
      )}
    </div>
  )
}
