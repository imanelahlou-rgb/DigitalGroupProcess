import { useState, type FormEvent, type ReactNode } from 'react'
import { Eye, EyeOff, KeyRound, LoaderCircle } from 'lucide-react'
import { useAuth } from '../../lib/authContext'
import { COURSE_TITLE, INDEPENDENCE_NOTICE } from '../../content/course'
import BrandMark from './BrandMark'
import SecurityBanner from '../ui/SecurityBanner'

function LoginPage() {
  const { signIn, sessionError } = useAuth()
  const [code, setCode] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!code.trim()) {
      setError('Saisissez votre code d’accès.')
      return
    }
    setLoading(true)
    setError(null)
    const err = await signIn(code)
    // En cas de succès le composant est démonté par la porte d'accès.
    if (err) {
      setError(err)
      setLoading(false)
    }
  }

  const message = error ?? sessionError

  return (
    <main className="login-page" id="main">
      <div className="login-card">
        <BrandMark size="lg" stacked logoOnly />
        <p className="eyebrow">Espace participants</p>
        <h1 className="login-title">{COURSE_TITLE}</h1>
        <form onSubmit={onSubmit} noValidate className="stack-sm">
          <label className="field" htmlFor="access-code">
            <span>Code d’accès</span>
          </label>
          <div className="input-icon">
            <KeyRound size={16} aria-hidden="true" />
            <input
              id="access-code"
              className="input"
              type={show ? 'text' : 'password'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'login-error' : undefined}
              disabled={loading}
            />
            <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Masquer le code' : 'Afficher le code'} aria-pressed={show}>
              {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {message && (
            <p id="login-error" className="form-error" role="alert">
              {message}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle size={18} className="spin" aria-hidden="true" /> Vérification…
              </>
            ) : (
              'Accéder à l’atelier'
            )}
          </button>
        </form>
        <SecurityBanner compact />
        <p className="muted tiny">{INDEPENDENCE_NOTICE}</p>
      </div>
    </main>
  )
}

export default function LoginGate({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="splash" role="status" aria-live="polite">
        <LoaderCircle size={28} className="spin" aria-hidden="true" />
        <span>Chargement de l’atelier…</span>
      </div>
    )
  }
  if (status === 'anonymous') return <LoginPage />
  return <>{children}</>
}
