import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { INDEPENDENCE_NOTICE } from '../../content/course'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="shell-main">
        <Topbar onMenu={() => setOpen((o) => !o)} menuOpen={open} />
        <main id="main" ref={mainRef} tabIndex={-1} className="content">
          <Outlet />
        </main>
        <footer className="footer">
          <p>{INDEPENDENCE_NOTICE}</p>
          <p>© DPG Academy · Digital Process Group · Données fictives uniquement.</p>
        </footer>
      </div>
    </div>
  )
}
