import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { glossary } from '../../content/glossary'
import { modules } from '../../content/modules'
import { moduleNumber } from '../../content/course'

function initial(term: string): string {
  const c = term.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

export default function GlossaryPanel() {
  const [q, setQ] = useState('')
  const [moduleId, setModuleId] = useState('')

  const filtered = useMemo(() => {
    const needle = q.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
    return glossary.filter((e) => {
      if (moduleId && e.moduleId !== moduleId) return false
      if (!needle) return true
      const hay = `${e.term} ${e.definition}`.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      return hay.includes(needle)
    })
  }, [q, moduleId])

  const groups = useMemo(() => {
    const m = new Map<string, typeof filtered>()
    for (const e of filtered) {
      const k = initial(e.term)
      m.set(k, [...(m.get(k) ?? []), e])
    }
    return [...m.entries()]
  }, [filtered])

  return (
    <section className="glossary" aria-label="Glossaire">
      <div className="toolbar">
        <label className="field field-inline grow">
          <span className="sr-only">Rechercher un terme</span>
          <span className="input-icon">
            <Search size={16} aria-hidden="true" />
            <input type="search" className="input" placeholder="Rechercher un terme…" value={q} onChange={(e) => setQ(e.target.value)} />
          </span>
        </label>
        <label className="field field-inline">
          <span className="sr-only">Filtrer par module</span>
          <select className="input" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            <option value="">Tous les modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                Module {moduleNumber(m)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted small" aria-live="polite">
        {filtered.length} terme{filtered.length > 1 ? 's' : ''}
      </p>
      {groups.length === 0 && <p className="callout">Aucun terme ne correspond à votre recherche.</p>}
      {groups.map(([letter, entries]) => (
        <div key={letter} className="gloss-group">
          <h2 className="gloss-letter" aria-hidden="true">
            {letter}
          </h2>
          <dl>
            {entries.map((e) => {
              const mod = modules.find((m) => m.id === e.moduleId)
              return (
                <div className="gloss-entry" key={e.term}>
                  <dt>
                    {e.term}
                    {mod && <span className="badge">Module {moduleNumber(mod)}</span>}
                  </dt>
                  <dd>{e.definition}</dd>
                </div>
              )
            })}
          </dl>
        </div>
      ))}
    </section>
  )
}
