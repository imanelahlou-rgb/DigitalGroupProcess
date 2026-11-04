import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { collectResources } from '../content/resources'
import { modules } from '../content/modules'
import { moduleNumber } from '../content/course'
import DownloadAsset from '../components/ui/DownloadAsset'
import PageHeader from '../components/ui/PageHeader'
import PromptBuilderRISEN from '../components/exercises/PromptBuilderRISEN'

const resources = collectResources()

export default function Resources() {
  const [q, setQ] = useState('')
  const [moduleId, setModuleId] = useState('')

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim()
    return resources.filter((r) => {
      if (moduleId === 'nova' && r.moduleId) return false
      if (moduleId && moduleId !== 'nova' && r.moduleId !== moduleId) return false
      return !needle || `${r.filename} ${r.description}`.toLowerCase().includes(needle)
    })
  }, [q, moduleId])

  const files = filtered.filter((r) => r.kind === 'file')
  const copyables = filtered.filter((r) => r.kind !== 'file')

  return (
    <div className="page stack-lg">
      <PageHeader
        eyebrow="Ressources"
        title="Fichiers et textes de l’atelier"
        lead="Fichiers d’exemple à télécharger et textes à copier. Ils sont aussi publiés sous /academy/claude/resources/nova/. Données fictives uniquement."
      />
      <div className="toolbar">
        <label className="field field-inline grow">
          <span className="sr-only">Rechercher une ressource</span>
          <span className="input-icon">
            <Search size={16} aria-hidden="true" />
            <input type="search" className="input" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} />
          </span>
        </label>
        <label className="field field-inline">
          <span className="sr-only">Filtrer par origine</span>
          <select className="input" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            <option value="">Toutes les origines</option>
            <option value="nova">Données NOVA</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                Module {moduleNumber(m)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted small" aria-live="polite">
        {filtered.length} ressource{filtered.length > 1 ? 's' : ''}
      </p>

      <section className="stack" aria-labelledby="files-title">
        <h2 id="files-title" className="h-lg">
          Fichiers téléchargeables
        </h2>
        {files.length === 0 && <p className="callout">Aucun fichier ne correspond.</p>}
        {files.map((r) => (
          <DownloadAsset key={r.id} asset={r} origin={r.origin} showPreview />
        ))}
      </section>

      <section className="stack" aria-labelledby="copy-title">
        <h2 id="copy-title" className="h-lg">
          Textes à copier
        </h2>
        {copyables.length === 0 && <p className="callout">Aucun texte ne correspond.</p>}
        {copyables.map((r) => (
          <DownloadAsset key={r.id} asset={r} origin={r.origin} showPreview />
        ))}
      </section>

      <section className="stack" aria-labelledby="risen-title">
        <h2 id="risen-title" className="h-lg">
          Outil : constructeur de prompt RISEN
        </h2>
        <PromptBuilderRISEN storageKey="resources" />
      </section>
    </div>
  )
}
