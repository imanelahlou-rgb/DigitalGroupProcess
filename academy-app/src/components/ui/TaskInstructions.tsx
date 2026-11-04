import { Clock, ListChecks, Target } from 'lucide-react'
import type { Asset } from '../../content/types'
import DownloadAsset from './DownloadAsset'

interface Props {
  title?: string
  instructions: string
  durationMin?: number
  deliverables?: string[]
  successCriteria?: string[]
  assets?: Asset[]
}

export default function TaskInstructions({ title, instructions, durationMin, deliverables, successCriteria, assets }: Props) {
  return (
    <section className="task-instructions">
      {title && <h3 className="h-md">{title}</h3>}
      {durationMin !== undefined && (
        <p className="muted small">
          <Clock size={14} aria-hidden="true" /> Durée estimée : {durationMin} min
        </p>
      )}
      {instructions.split(/\n{2,}/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {deliverables && deliverables.length > 0 && (
        <div>
          <h4 className="h-sm">
            <ListChecks size={16} aria-hidden="true" /> Livrables attendus
          </h4>
          <ul className="list-gold">
            {deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {successCriteria && successCriteria.length > 0 && (
        <div>
          <h4 className="h-sm">
            <Target size={16} aria-hidden="true" /> Critères de réussite
          </h4>
          <ul className="list-gold">
            {successCriteria.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {assets && assets.length > 0 && (
        <div className="stack-sm">
          <h4 className="h-sm">Fichiers fournis</h4>
          {assets.map((a) => (
            <DownloadAsset key={a.id} asset={a} />
          ))}
        </div>
      )}
    </section>
  )
}
