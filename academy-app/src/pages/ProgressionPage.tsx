import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, RotateCcw, Upload } from 'lucide-react'
import { modules } from '../content/modules'
import { moduleNumber, shortTitle } from '../content/course'
import { downloadText } from '../lib/clipboard'
import { exportProgress, globalProgress, importProgress, resetProgress, STATUS_LABEL, STORAGE_KEY, useProgress } from '../lib/progress'
import PageHeader from '../components/ui/PageHeader'
import ProgressTracker from '../components/ui/ProgressTracker'

export default function ProgressionPage() {
  const progress = useProgress()
  const g = globalProgress(modules, progress)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'ko'; text: string } | null>(null)

  const submissions = modules.filter((m) => progress.practical[m.id])
  const notesCount = Object.keys(progress.notes).length

  async function onImport(file: File | undefined) {
    if (!file) return
    const text = await file.text()
    const r = importProgress(text)
    setMessage(r.ok ? { kind: 'ok', text: 'Progression importée avec succès.' } : { kind: 'ko', text: r.error })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Progression" title="Votre avancement" lead={`Données enregistrées localement sur cet appareil (clé ${STORAGE_KEY}). Exportez-les pour les sauvegarder ou les transférer.`} />

      <section className="card stack" aria-label="Avancement global">
        <ProgressTracker label="Parcours complet" percent={g.percent} detail={`${g.done}/${g.total} étapes`} />
        <ul className="meta-row">
          <li>{g.modulesCompleted} / {modules.length} modules terminés</li>
          <li>{g.lessonsDone} leçons terminées</li>
          <li>{g.exercisesDone} exercices terminés</li>
          <li>{g.quizzesPassed} quiz validés</li>
          <li>{submissions.length} missions rendues</li>
          <li>{notesCount} notes et brouillons</li>
        </ul>
      </section>

      <section className="stack" aria-labelledby="mods-title">
        <h2 id="mods-title" className="h-lg">
          Détail par module
        </h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Progression par module">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Module</th>
                <th scope="col">Leçons</th>
                <th scope="col">Exercices</th>
                <th scope="col">Démo</th>
                <th scope="col">Quiz (meilleur)</th>
                <th scope="col">Mission</th>
                <th scope="col">Statut</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m, i) => {
                const p = g.per[i]
                return (
                  <tr key={m.id}>
                    <th scope="row">
                      <Link to={`/modules/${m.slug}`}>
                        {moduleNumber(m)}. {shortTitle(m)}
                      </Link>
                    </th>
                    <td>{p.lessonsDone}/{p.lessonsTotal}</td>
                    <td>{p.exercisesDone}/{p.exercisesTotal}</td>
                    <td>{p.demoViewed ? 'Vue' : '—'}</td>
                    <td>{p.bestQuizPercent === null ? '—' : `${p.bestQuizPercent} %${p.quizPassed ? ' ✓' : ''}`}</td>
                    <td>{p.practicalSubmitted ? 'Rendue' : '—'}</td>
                    <td>
                      {STATUS_LABEL[p.status]} ({p.percent} %)
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {submissions.length > 0 && (
        <section className="stack" aria-labelledby="sub-title">
          <h2 id="sub-title" className="h-lg">
            Missions rendues
          </h2>
          {submissions.map((m) => (
            <article key={m.id} className="card card-flat">
              <p className="eyebrow">
                Module {moduleNumber(m)} · {new Date(progress.practical[m.id].submittedAt).toLocaleString('fr-FR')}
              </p>
              <h3 className="h-sm">{m.practicalMission.title}</h3>
              <p className="pre-wrap">{progress.practical[m.id].note}</p>
            </article>
          ))}
        </section>
      )}

      <section className="card stack" aria-labelledby="data-title">
        <h2 id="data-title" className="h-md">
          Sauvegarde et réinitialisation
        </h2>
        <div className="row wrap">
          <button type="button" className="btn btn-ghost" onClick={() => downloadText(`dpg-academy-progression-${new Date().toISOString().slice(0, 10)}.json`, exportProgress(), 'application/json')}>
            <Download size={16} aria-hidden="true" /> Exporter en JSON
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Upload size={16} aria-hidden="true" /> Importer un fichier JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Fichier de progression à importer" onChange={(e) => void onImport(e.target.files?.[0])} />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (resetProgress()) setMessage({ kind: 'ok', text: 'Progression réinitialisée.' })
            }}
          >
            <RotateCcw size={16} aria-hidden="true" /> Réinitialiser
          </button>
        </div>
        {message && (
          <p className={message.kind === 'ok' ? 'ok' : 'ko'} role="status">
            {message.text}
          </p>
        )}
        <p className="muted small">L’import remplace la progression actuelle. La réinitialisation demande une confirmation.</p>
      </section>
    </div>
  )
}
