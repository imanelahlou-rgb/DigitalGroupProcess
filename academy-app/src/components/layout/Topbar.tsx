import { GraduationCap, LogOut, Menu } from 'lucide-react'
import { modules } from '../../content/modules'
import { globalProgress, setInstructorMode, useInstructorMode, useProgress } from '../../lib/progress'
import { useAuth } from '../../lib/authContext'
import ProgressTracker from '../ui/ProgressTracker'

export default function Topbar({ onMenu, menuOpen }: { onMenu: () => void; menuOpen: boolean }) {
  const { signOut } = useAuth()
  const progress = useProgress()
  const instructor = useInstructorMode()
  const g = globalProgress(modules, progress)
  return (
    <header className="topbar">
      <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Ouvrir le menu" aria-expanded={menuOpen} aria-controls="sidebar">
        <Menu size={20} aria-hidden="true" />
      </button>
      <div className="topbar-title">
        <span className="eyebrow">Atelier Claude</span>
      </div>
      <div className="topbar-progress">
        <ProgressTracker size="sm" label="Parcours" percent={g.percent} />
      </div>
      <button
        type="button"
        className={`btn btn-ghost btn-sm ${instructor ? 'is-active' : ''}`}
        onClick={() => setInstructorMode(!instructor)}
        aria-pressed={instructor}
        title="Affiche les notes formateur sur cet appareil (réglage local, non sécurisé)"
      >
        <GraduationCap size={14} aria-hidden="true" /> <span className="hide-sm">Mode formateur : {instructor ? 'activé' : 'désactivé'}</span>
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
        <LogOut size={14} aria-hidden="true" /> <span className="hide-sm">Se déconnecter</span>
      </button>
    </header>
  )
}
