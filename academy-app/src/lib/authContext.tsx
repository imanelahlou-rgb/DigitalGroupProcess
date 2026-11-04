import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchSession, login, logout } from './auth'

type Status = 'loading' | 'authenticated' | 'anonymous'

interface AuthValue {
  status: Status
  /** Message d'erreur du chargement de session (service injoignable) */
  sessionError: string | null
  /** Retourne un message d'erreur, ou null en cas de succès */
  signIn: (code: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    void fetchSession().then((r) => {
      if (!alive) return
      setSessionError(r.error ?? null)
      setStatus(r.authenticated ? 'authenticated' : 'anonymous')
    })
    return () => {
      alive = false
    }
  }, [])

  const signIn = useCallback(async (code: string) => {
    const r = await login(code)
    if (r.authenticated) {
      setSessionError(null)
      setStatus('authenticated')
      return null
    }
    return r.error ?? 'Code d’accès incorrect.'
  }, [])

  const signOut = useCallback(async () => {
    await logout()
    setStatus('anonymous')
  }, [])

  const value = useMemo(() => ({ status, sessionError, signIn, signOut }), [status, sessionError, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>.')
  return ctx
}
