import { Link } from 'react-router-dom'
import { Award, BookA, FolderOpen, ArrowRight } from 'lucide-react'
import { modules } from '../content/modules'
import { INDEPENDENCE_NOTICE, shortTitle, moduleNumber } from '../content/course'
import { NOVA_COMPANY, NOVA_SERVICES, formatMadHt } from '../content/nova'
import { globalProgress, useProgress } from '../lib/progress'
import CourseHero from '../components/course/CourseHero'
import ModuleCard from '../components/course/ModuleCard'
import ProgressTracker from '../components/ui/ProgressTracker'
import SecurityBanner from '../components/ui/SecurityBanner'

export default function Dashboard() {
  const progress = useProgress()
  const g = globalProgress(modules, progress)
  const nextIndex = g.per.findIndex((p) => p.status !== 'completed')
  const next = nextIndex >= 0 ? modules[nextIndex] : null
  const started = g.done > 0

  return (
    <div className="page stack-lg">
      <CourseHero continueTo={next ? `/modules/${next.slug}` : '/projet-final'} started={started} />

      <SecurityBanner />

      <section className="grid-2" aria-label="Votre progression">
        <div className="card">
          <p className="eyebrow">Votre progression</p>
          <ProgressTracker label="Parcours complet" percent={g.percent} detail={`${g.done}/${g.total} étapes`} />
          <ul className="meta-row">
            <li>{g.modulesCompleted} / {modules.length} modules terminés</li>
            <li>{g.lessonsDone} leçons</li>
            <li>{g.exercisesDone} exercices</li>
            <li>{g.quizzesPassed} quiz validés</li>
          </ul>
          <p className="muted small">La progression est enregistrée sur cet appareil uniquement.</p>
          <Link className="btn btn-ghost btn-sm" to="/progression">
            Détail de la progression <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="card">
          <p className="eyebrow">Prochaine étape</p>
          {next ? (
            <>
              <h2 className="h-md">
                Module {moduleNumber(next)} — {shortTitle(next)}
              </h2>
              <p className="muted">{next.situation.slice(0, 190).trim()}…</p>
              <Link className="btn btn-primary" to={`/modules/${next.slug}`}>
                {g.per[nextIndex].status === 'in-progress' ? 'Reprendre' : 'Commencer'} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="h-md">Parcours terminé</h2>
              <p className="muted">Tous les modules sont terminés. Passez au défi final et à l’attestation de participation.</p>
              <Link className="btn btn-primary" to="/projet-final">
                Projet final <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="modules-title" className="stack">
        <div className="section-head">
          <h2 id="modules-title" className="h-lg">
            Les {modules.length} modules
          </h2>
          <Link to="/programme" className="btn btn-link">
            Programme complet <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid-cards">
          {modules.map((m, i) => (
            <ModuleCard key={m.id} module={m} progress={g.per[i]} />
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="nova-title">
        <p className="eyebrow">Fil rouge</p>
        <h2 id="nova-title" className="h-lg">
          {NOVA_COMPANY.name}
        </h2>
        <p>
          {NOVA_COMPANY.sector}, {NOVA_COMPANY.city} ({NOVA_COMPANY.country}) · {NOVA_COMPANY.size}. <em>{NOVA_COMPANY.legalNote}.</em> Tous les exercices s’appuient sur son catalogue de cinq
          offres, exprimé en {NOVA_COMPANY.currency} {NOVA_COMPANY.priceBasis}.
        </p>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Catalogue NOVA">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Offre</th>
                <th scope="col">Unité</th>
                <th scope="col">Prix</th>
              </tr>
            </thead>
            <tbody>
              {NOVA_SERVICES.map((s) => (
                <tr key={s.code}>
                  <th scope="row">{s.code}</th>
                  <td>{s.name}</td>
                  <td>{s.unit}</td>
                  <td>{formatMadHt(s.priceMadHt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-3" aria-label="Accès rapides">
        <Link to="/ressources" className="card card-link">
          <FolderOpen size={20} aria-hidden="true" />
          <h3 className="h-md">Ressources</h3>
          <p className="muted small">Fichiers NOVA, prompts et gabarits à copier ou télécharger.</p>
        </Link>
        <Link to="/projet-final" className="card card-link">
          <Award size={20} aria-hidden="true" />
          <h3 className="h-md">Projet final</h3>
          <p className="muted small">Défi Océan Services, barème de 100 points, attestation de participation.</p>
        </Link>
        <Link to="/glossaire" className="card card-link">
          <BookA size={20} aria-hidden="true" />
          <h3 className="h-md">Glossaire</h3>
          <p className="muted small">Les termes clés de l’atelier, recherchables par module.</p>
        </Link>
      </section>

      <p className="callout" role="note">
        {INDEPENDENCE_NOTICE}
      </p>
    </div>
  )
}
