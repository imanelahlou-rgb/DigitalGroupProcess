import { NavLink } from 'react-router-dom'
import { Award, BookA, FolderOpen, GraduationCap, House, ListTree, TrendingUp, X } from 'lucide-react'
import { modules } from '../../content/modules'
import { moduleNumber, shortTitle } from '../../content/course'
import { moduleProgress, useProgress } from '../../lib/progress'
import BrandMark from './BrandMark'

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: House, end: true },
  { to: '/programme', label: 'Programme', icon: ListTree },
  { to: '/ressources', label: 'Ressources', icon: FolderOpen },
  { to: '/progression', label: 'Progression', icon: TrendingUp },
  { to: '/projet-final', label: 'Projet final', icon: Award },
  { to: '/glossaire', label: 'Glossaire', icon: BookA },
  { to: '/formateur', label: 'Formateur', icon: GraduationCap },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const progress = useProgress()
  return (
    <>
      <div className={`scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} id="sidebar" aria-label="Navigation principale">
        <div className="sidebar-head">
          <BrandMark size="sm" />
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav>
          <ul className="nav-list">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`} onClick={onClose}>
                  <Icon size={17} aria-hidden="true" /> {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="nav-section">Modules</p>
          <ul className="nav-list nav-modules">
            {modules.map((m) => {
              const p = moduleProgress(m, progress)
              return (
                <li key={m.id}>
                  <NavLink to={`/modules/${m.slug}`} className={({ isActive }) => `nav-link nav-module ${isActive ? 'is-active' : ''}`} onClick={onClose}>
                    <span className={`nav-dot status-${p.status}`} aria-hidden="true">
                      {moduleNumber(m)}
                    </span>
                    <span className="nav-module-title">{shortTitle(m)}</span>
                    <span className="sr-only">{p.percent} % complété</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}
