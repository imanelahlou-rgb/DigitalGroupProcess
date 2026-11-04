/**
 * Client d'authentification de l'Atelier.
 * Aucune vérification de code côté client : le code saisi est envoyé tel quel au serveur.
 */

export interface SessionResult {
  authenticated: boolean
  error?: string
}

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' }

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    const data: unknown = await res.json()
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function readMessage(data: Record<string, unknown>, fallback: string): string {
  const m = data.error ?? data.message
  return typeof m === 'string' && m.trim() ? m : fallback
}

export async function fetchSession(): Promise<SessionResult> {
  try {
    const res = await fetch('/api/academy/session', { credentials: 'include', headers: { Accept: 'application/json' } })
    if (!res.ok) return { authenticated: false }
    const data = await readJson(res)
    return { authenticated: data.authenticated === true || data.ok === true }
  } catch {
    return { authenticated: false, error: 'Le service d’authentification est injoignable. Réessayez dans un instant.' }
  }
}

export async function login(code: string): Promise<SessionResult> {
  try {
    const res = await fetch('/api/academy/login', {
      method: 'POST',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify({ code }),
    })
    const data = await readJson(res)
    if (res.ok && data.ok !== false && data.authenticated !== false) return { authenticated: true }
    if (res.status === 429) return { authenticated: false, error: readMessage(data, 'Trop de tentatives. Patientez avant de réessayer.') }
    return { authenticated: false, error: readMessage(data, 'Code d’accès incorrect.') }
  } catch {
    return { authenticated: false, error: 'Connexion impossible : le service est injoignable.' }
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/academy/logout', { method: 'POST', credentials: 'include', headers: JSON_HEADERS })
  } catch {
    /* la session locale est quand même fermée côté interface */
  }
}
