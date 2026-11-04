import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, CircleCheck, Clock, ExternalLink, Play, Send, Undo2 } from 'lucide-react'
import { modules, getModuleBySlug } from '../content/modules'
import { UI_VERIFY_NOTE, type Module } from '../content/types'
import { formatDuration, moduleNumber, shortTitle } from '../content/course'
import {
  markDemoViewed,
  moduleProgress,
  setLessonDone,
  setNote,
  submitPractical,
  useInstructorMode,
  useProgress,
  withdrawPractical,
} from '../lib/progress'
import LessonRenderer from '../components/course/LessonRenderer'
import InstructorNotes from '../components/course/InstructorNotes'
import KnowledgeQuiz from '../components/exercises/KnowledgeQuiz'
import PromptBuilderRISEN from '../components/exercises/PromptBuilderRISEN'
import SkillSimulator from '../components/exercises/SkillSimulator'
import PlannerSimulator from '../components/exercises/PlannerSimulator'
import { EXERCISE_KIND_LABEL } from '../components/exercises/ExerciseRenderer'
import WorkflowDiagram from '../components/workflow/WorkflowDiagram'
import WorkflowSimulator from '../components/workflow/WorkflowSimulator'
import DownloadAsset from '../components/ui/DownloadAsset'
import PageHeader from '../components/ui/PageHeader'
import ProgressTracker from '../components/ui/ProgressTracker'
import RubricChecklist from '../components/ui/RubricChecklist'
import TaskInstructions from '../components/ui/TaskInstructions'
import NotFound from './NotFound'

const SECTIONS = [
  ['objectifs', 'Objectifs'],
  ['lecons', 'Leçons'],
  ['demo', 'Démonstration'],
  ['exercices', 'Exercices'],
  ['quiz', 'Quiz'],
  ['mission', 'Mission'],
  ['verification', 'Auto-évaluation'],
  ['synthese', 'Synthèse'],
] as const

export default function ModulePage() {
  const { moduleId } = useParams()
  const module = moduleId ? getModuleBySlug(moduleId) : undefined
  if (!module) return <NotFound what="Ce module" />
  return <ModuleView module={module} />
}

function ModuleView({ module }: { module: Module }) {
  const progress = useProgress()
  const instructor = useInstructorMode()
  const p = moduleProgress(module, progress)
  const n = moduleNumber(module)
  const practical = progress.practical[module.id]
  const draftKey = `practical-draft:${module.id}`
  const draft = progress.notes[draftKey] ?? ''
  const moduleAssets = [...(module.assets ?? [])]

  return (
    <div className="page stack-lg">
      <PageHeader
        crumbs={[{ label: 'Programme', to: '/programme' }, { label: `Module ${n}` }]}
        eyebrow={`Module ${n} sur ${modules.length}`}
        title={shortTitle(module)}
        lead={`${formatDuration(module.durationMin)} · ${module.lessons.length} leçons · ${module.exercises.length} exercices · ${module.quiz.length} questions`}
      />
      <ProgressTracker label="Progression du module" percent={p.percent} detail={`${p.done}/${p.total}`} />
      <nav className="section-nav" aria-label="Sections du module">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="chip">
            {label}
          </a>
        ))}
      </nav>

      <section id="objectifs" className="stack" aria-labelledby="obj-title">
        <h2 id="obj-title" className="h-lg">
          Objectifs
        </h2>
        <ul className="list-gold">
          {module.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        <div className="card card-quote">
          <p className="eyebrow">Mise en situation · NOVA Conseil</p>
          <p>{module.situation}</p>
        </div>
      </section>

      <section id="lecons" className="stack" aria-labelledby="lec-title">
        <h2 id="lec-title" className="h-lg">
          Leçons
        </h2>
        {module.lessons.map((l, i) => {
          const done = Boolean(progress.lessons[l.id])
          return (
            <details className="card lesson-card" key={l.id} open={i === 0 && p.lessonsDone === 0}>
              <summary>
                <span className={`status-pill ${done ? 'is-done' : ''}`}>{done ? <Check size={13} aria-hidden="true" /> : i + 1}</span>
                <span className="lesson-card-title">{l.title}</span>
                <span className="muted small">
                  <Clock size={13} aria-hidden="true" /> {l.durationMin} min
                </span>
                {done && <span className="sr-only">Leçon terminée</span>}
              </summary>
              <LessonRenderer lesson={l} showTitle={false} />
              <div className="row wrap lesson-actions">
                <button type="button" className={`btn btn-sm ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setLessonDone(l.id, !done)}>
                  {done ? (
                    <>
                      <Undo2 size={14} aria-hidden="true" /> Marquer comme à revoir
                    </>
                  ) : (
                    <>
                      <CircleCheck size={14} aria-hidden="true" /> Marquer comme terminée
                    </>
                  )}
                </button>
                <Link className="btn btn-ghost btn-sm" to={`/modules/${module.slug}/lecons/${l.id}`}>
                  Ouvrir la page de la leçon <ExternalLink size={14} aria-hidden="true" />
                </Link>
              </div>
            </details>
          )
        })}
      </section>

      <section id="demo" className="stack" aria-labelledby="demo-title">
        <h2 id="demo-title" className="h-lg">
          Démonstration
        </h2>
        <article className="card">
          <h3 className="h-md">
            <Play size={16} aria-hidden="true" /> {module.demo.title}
          </h3>
          {module.demo.prerequisites && module.demo.prerequisites.length > 0 && (
            <>
              <h4 className="h-sm">Prérequis</h4>
              <ul className="list-gold">
                {module.demo.prerequisites.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
          <ol className="steps">
            {module.demo.steps.map((s) => (
              <li key={s.number}>
                <strong>{s.title}</strong>
                <p>{s.instruction}</p>
                {s.expected && <p className="muted small">Attendu : {s.expected}</p>}
              </li>
            ))}
          </ol>
          <div className="callout callout-ok">
            <p className="eyebrow">Résultat attendu</p>
            <p>{module.demo.expectedResult}</p>
          </div>
          <p className="callout callout-warn">{module.demo.varianceNote}</p>
          <label className="check-item">
            <input type="checkbox" checked={p.demoViewed} onChange={(e) => markDemoViewed(module.id, e.target.checked)} />
            <span>J’ai suivi ou rejoué cette démonstration</span>
          </label>
        </article>
        {module.id === 'm2' && (
          <div className="stack-sm">
            <h3 className="h-md">Atelier : construisez un prompt RISEN</h3>
            <PromptBuilderRISEN storageKey="m2-atelier" />
          </div>
        )}
        {module.id === 'm5' && (
          <div className="stack">
            <h3 className="h-md">Simulateur de devis (5 cas limites)</h3>
            <SkillSimulator />
          </div>
        )}
        {module.id === 'm6' && (
          <div className="stack">
            <h3 className="h-md">Simulateur de planification locale</h3>
            <PlannerSimulator />
          </div>
        )}
        {module.id === 'm7' && (
          <div className="stack">
            <h3 className="h-md">Le workflow NOVA en 9 étapes</h3>
            <WorkflowDiagram />
            <h3 className="h-md">Simulateur de dossiers</h3>
            <WorkflowSimulator />
          </div>
        )}
      </section>

      <section id="exercices" className="stack" aria-labelledby="exo-title">
        <h2 id="exo-title" className="h-lg">
          Exercices
        </h2>
        <ul className="grid-cards">
          {module.exercises.map((e) => {
            const done = Boolean(progress.exercises[e.id])
            return (
              <li key={e.id}>
                <Link to={`/exercices/${e.id}`} className={`card card-link exercise-link ${done ? 'is-done' : ''}`}>
                  <span className={`badge ${done ? 'badge-ok' : ''}`}>{done ? 'Terminé' : EXERCISE_KIND_LABEL[e.kind]}</span>
                  <h3 className="h-md">{e.title}</h3>
                  <p className="muted small">
                    <Clock size={13} aria-hidden="true" /> {e.durationMin} min · {EXERCISE_KIND_LABEL[e.kind]}
                  </p>
                  <span className="card-cta">
                    {done ? 'Revoir' : 'Ouvrir'} <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section id="quiz" className="stack" aria-labelledby="quiz-title">
        <h2 id="quiz-title" className="h-lg">
          Quiz de connaissances
        </h2>
        <KnowledgeQuiz moduleId={module.id} questions={module.quiz} />
      </section>

      <section id="mission" className="stack" aria-labelledby="mission-title">
        <h2 id="mission-title" className="h-lg">
          Mission pratique
        </h2>
        <div className="card">
          <TaskInstructions
            title={module.practicalMission.title}
            instructions={module.practicalMission.prompt}
            durationMin={module.practicalMission.estimatedMin}
            deliverables={module.practicalMission.deliverables}
            successCriteria={module.practicalMission.successCriteria}
            assets={module.practicalMission.assets}
          />
          <label className="field">
            <span>Compte rendu de votre mission (enregistré sur cet appareil)</span>
            <textarea
              className="textarea"
              rows={4}
              value={practical ? practical.note : draft}
              disabled={Boolean(practical)}
              onChange={(e) => setNote(draftKey, e.target.value)}
              placeholder="Ce que vous avez produit, ce qui a fonctionné, ce que vous referiez…"
            />
          </label>
          {practical ? (
            <div className="row wrap">
              <span className="ok" role="status">
                <CircleCheck size={16} aria-hidden="true" /> Mission rendue le {new Date(practical.submittedAt).toLocaleDateString('fr-FR')}.
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => withdrawPractical(module.id)}>
                <Undo2 size={14} aria-hidden="true" /> Rouvrir la mission
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={draft.trim().length < 10}
              onClick={() => {
                submitPractical(module.id, draft.trim())
                setNote(draftKey, '')
              }}
            >
              <Send size={16} aria-hidden="true" /> Marquer la mission comme rendue
            </button>
          )}
          {!practical && draft.trim().length < 10 && <p className="muted small">Rédigez au moins quelques mots de compte rendu pour valider la mission.</p>}
        </div>
      </section>

      <section id="verification" className="stack" aria-labelledby="ver-title">
        <h2 id="ver-title" className="h-lg">
          Auto-évaluation
        </h2>
        <RubricChecklist rubric={module.verification} moduleId={module.id} />
      </section>

      <section id="synthese" className="stack" aria-labelledby="syn-title">
        <h2 id="syn-title" className="h-lg">
          Synthèse : trois points à retenir
        </h2>
        <ol className="takeaways">
          {module.synthesis.takeaways.map((t) => (
            <li key={t} className="card card-flat">
              {t}
            </li>
          ))}
        </ol>
        <div className="card card-quote">
          <p className="eyebrow">Suite du parcours</p>
          <h3 className="h-md">{module.synthesis.nextModule.title}</h3>
          <p className="muted">{module.synthesis.nextModule.teaser}</p>
          <Link className="btn btn-primary" to={module.synthesis.nextModule.href}>
            {module.synthesis.nextModule.href === '/' ? 'Retour au tableau de bord' : 'Module suivant'} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {(moduleAssets.length > 0 || (module.references && module.references.length > 0)) && (
        <section className="stack" aria-labelledby="res-title">
          <h2 id="res-title" className="h-lg">
            Ressources du module
          </h2>
          {moduleAssets.map((a) => (
            <DownloadAsset key={a.id} asset={a} showPreview />
          ))}
          {module.references && module.references.length > 0 && (
            <ul className="list-gold">
              {module.references.map((r) => (
                <li key={r.id}>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      {r.label} <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  ) : (
                    <strong>{r.label}</strong>
                  )}
                  {r.note && <span className="muted small"> — {r.note}</span>}
                  {r.verifyUi && !r.note?.includes(UI_VERIFY_NOTE) && <span className="badge"> {UI_VERIFY_NOTE}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {instructor && <InstructorNotes notes={module.instructorNotes} />}
    </div>
  )
}
