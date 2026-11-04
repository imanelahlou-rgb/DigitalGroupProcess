import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

interface Props {
  title: string
  eyebrow?: string
  lead?: string
  crumbs?: Crumb[]
  actions?: ReactNode
}

export default function PageHeader({ title, eyebrow, lead, crumbs, actions }: Props) {
  return (
    <header className="page-header">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Fil d’Ariane" className="crumbs">
          <ol>
            {crumbs.map((c, i) => (
              <li key={c.label}>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight size={13} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="page-title-row">
        <h1 className="page-title">{title}</h1>
        {actions && <div className="row wrap">{actions}</div>}
      </div>
      {lead && <p className="lead">{lead}</p>}
    </header>
  )
}
