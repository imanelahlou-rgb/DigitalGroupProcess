import type { ExerciseCheck } from '../content/types'

export interface CheckResult {
  id: string
  description: string
  ok: boolean
  message: string
}

/* ------------------------------ analyses ------------------------------ */

function stripBom(text: string): string {
  return text.replace(/^\uFEFF/, '')
}

function collectKeys(value: unknown, into: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((v) => collectKeys(v, into))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      into.add(k)
      collectKeys(v, into)
    }
  }
}

export function parseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(stripBom(text)) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'JSON invalide' }
  }
}

/** Découpe une ligne CSV en gérant les guillemets doubles. */
export function parseCsvLine(line: string, sep = ','): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') inQuotes = false
      else cur += c
    } else if (c === '"') inQuotes = true
    else if (c === sep) {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function parseCsv(text: string): { header: string[]; rows: string[][] } {
  const lines = stripBom(text)
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '')
  const header = lines.length ? parseCsvLine(lines[0]) : []
  const rows = lines.slice(1).map((l) => parseCsvLine(l))
  return { header, rows }
}

function mdHeadingLevels(text: string): number[] {
  const levels: number[] = []
  let inFence = false
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (inFence) continue
    const m = /^(#{1,6})\s+\S/.exec(line)
    if (m) levels.push(m[1].length)
  }
  return levels
}

/* ------------------------------ vérifications ------------------------------ */

export function runCheck(check: ExerciseCheck, text: string): CheckResult {
  let ok = false
  const value = check.value
  switch (check.type) {
    case 'contains':
      ok = typeof value === 'string' && text.toLowerCase().includes(value.toLowerCase())
      break
    case 'regex':
      try {
        ok = typeof value === 'string' && new RegExp(value, 'i').test(text)
      } catch {
        ok = false
      }
      break
    case 'json-valid':
      ok = parseJson(text).ok
      break
    case 'json-has-keys': {
      const parsed = parseJson(text)
      if (parsed.ok && Array.isArray(value)) {
        const keys = new Set<string>()
        collectKeys(parsed.value, keys)
        ok = value.every((k) => keys.has(k))
      }
      break
    }
    case 'csv-columns': {
      const { header } = parseCsv(text)
      ok = Array.isArray(value) && value.length === header.length && value.every((c, i) => header[i]?.toLowerCase() === c.toLowerCase())
      break
    }
    case 'csv-min-rows': {
      const { header, rows } = parseCsv(text)
      const expectedCols = header.length
      const complete = rows.filter((r) => r.length === expectedCols && r.every((c) => c !== ''))
      ok = typeof value === 'number' && complete.length >= value
      break
    }
    case 'md-has-heading': {
      const wanted = Number(value)
      const levels = mdHeadingLevels(text)
      ok = Number.isFinite(wanted) && wanted > 0 ? levels.includes(wanted) : levels.length > 0
      break
    }
    case 'md-has-list':
      ok = /^\s*([-*+]|\d+[.)])\s+\S/m.test(text)
      break
  }
  return { id: check.id, description: check.description, ok, message: ok ? 'Validé' : check.failMessage }
}

export function runChecks(checks: ExerciseCheck[], text: string): CheckResult[] {
  return checks.map((c) => runCheck(c, text))
}

/** Aide de diagnostic JSON : message d'erreur lisible pour l'apprenant. */
export function jsonDiagnostic(text: string): string | null {
  const r = parseJson(text)
  return r.ok ? null : r.error
}

/** Aperçu structurel d'un CSV (colonnes, lignes incohérentes). */
export function csvDiagnostic(text: string): { columns: number; rows: number; badRows: number[] } {
  const { header, rows } = parseCsv(text)
  const badRows = rows.map((r, i) => (r.length !== header.length ? i + 2 : 0)).filter(Boolean)
  return { columns: header.length, rows: rows.length, badRows }
}
