import { ShieldCheck } from 'lucide-react'
import { SECURITY_NOTICE } from '../../content/course'

export default function SecurityBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`security-banner ${compact ? 'is-compact' : ''}`} role="note" aria-label="Rappel de sécurité">
      <ShieldCheck size={compact ? 18 : 22} aria-hidden="true" />
      <div>
        {!compact && <p className="eyebrow">Sécurité des données</p>}
        <p>{SECURITY_NOTICE}</p>
      </div>
    </aside>
  )
}
