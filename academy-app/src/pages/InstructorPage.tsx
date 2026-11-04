import { GraduationCap, LifeBuoy, Lock, ShieldAlert } from 'lucide-react'
import { buildAgenda, closingScript, globalPlanB, globalSafetyReminders, instructorRundown, openingScript, preSessionChecklist, totalDurationMin } from '../content/instructor'
import { modules } from '../content/modules'
import { formatDuration, moduleNumber, shortTitle } from '../content/course'
import { setInstructorMode, useInstructorMode } from '../lib/progress'
import InstructorNotes from '../components/course/InstructorNotes'
import PageHeader from '../components/ui/PageHeader'
import CopyButton from '../components/ui/CopyButton'

const KIND_LABEL: Record<string, string> = {
  expose: 'Exposé',
  demo: 'Démo',
  atelier: 'Atelier',
  quiz: 'Quiz',
  debrief: 'Débrief',
  transition: 'Transition',
  pause: 'Pause',
  evaluation: 'Évaluation',
}

export default function InstructorPage() {
  const on = useInstructorMode()
  const agenda = buildAgenda('09:00')

  if (!on) {
    return (
      <div className="page stack-lg">
        <PageHeader eyebrow="Formateur" title="Support formateur" lead="Déroulé minute par minute, scripts oraux, rappels de sécurité et plans B." />
        <div className="card stack">
          <p>
            <Lock size={18} aria-hidden="true" /> Le mode formateur est désactivé sur cet appareil.
          </p>
          <p className="muted small">
            Ce réglage est local au navigateur : il masque simplement les notes pour ne pas gêner les participants. Il ne constitue pas une protection d’accès.
          </p>
          <div>
            <button type="button" className="btn btn-primary" onClick={() => setInstructorMode(true)}>
              <GraduationCap size={16} aria-hidden="true" /> Activer le mode formateur
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page stack-lg">
      <PageHeader
        eyebrow="Formateur"
        title="Support formateur"
        lead={`Journée de ${formatDuration(totalDurationMin)} (hors déjeuner), pause de 20 minutes entre les modules 4 et 5.`}
        actions={
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInstructorMode(false)}>
            Désactiver le mode formateur
          </button>
        }
      />

      <section className="stack" aria-labelledby="agenda-title">
        <h2 id="agenda-title" className="h-lg">
          Agenda indicatif (début 09:00)
        </h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Agenda">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Horaire</th>
                <th scope="col">Séquence</th>
                <th scope="col">Durée</th>
              </tr>
            </thead>
            <tbody>
              {agenda.map((a) => (
                <tr key={a.id}>
                  <td className="nowrap">
                    {a.startClock} – {a.endClock}
                  </td>
                  <th scope="row">{a.title}</th>
                  <td>{a.durationMin} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-2" aria-label="Scripts oraux">
        <div className="card stack-sm">
          <h2 className="h-md">Script d’ouverture</h2>
          {openingScript.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <CopyButton text={openingScript.join('\n\n')} />
        </div>
        <div className="card stack-sm">
          <h2 className="h-md">Script de clôture</h2>
          {closingScript.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <CopyButton text={closingScript.join('\n\n')} />
        </div>
      </section>

      <section className="stack" aria-labelledby="pre-title">
        <h2 id="pre-title" className="h-lg">
          Check-list avant la session
        </h2>
        <ul className="list-gold">
          {preSessionChecklist.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="stack" aria-labelledby="safe-title">
        <h2 id="safe-title" className="h-lg">
          <ShieldAlert size={20} aria-hidden="true" /> Rappels de sécurité
        </h2>
        <div className="grid-cards">
          {globalSafetyReminders.map((s) => (
            <article key={s.id} className="card card-flat">
              <h3 className="h-sm">{s.title}</h3>
              <p>{s.message}</p>
              <p className="muted small">À dire : {s.whenToSay}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card stack-sm" aria-labelledby="planb-title">
        <h2 id="planb-title" className="h-md">
          <LifeBuoy size={18} aria-hidden="true" /> Plan B global
        </h2>
        <p>
          <strong>Déclencheur :</strong> {globalPlanB.trigger}
        </p>
        <ol className="steps">
          {globalPlanB.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="muted small">Matériel : {globalPlanB.materialsNeeded.join(' · ')}</p>
        <p className="muted small">Impact sur le temps : {globalPlanB.timeImpact}</p>
      </section>

      <section className="stack" aria-labelledby="rundown-title">
        <h2 id="rundown-title" className="h-lg">
          Déroulé détaillé
        </h2>
        {instructorRundown.map((r) => (
          <details className="card lesson-card" key={r.id}>
            <summary>
              <span className="lesson-card-title">{r.title}</span>
              <span className="muted small">{r.durationMin} min</span>
            </summary>
            <p className="muted">{r.objective}</p>
            <h3 className="h-sm">Matériel</h3>
            <ul className="list-gold">
              {r.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <h3 className="h-sm">Séquences</h3>
            <div className="stack-sm">
              {r.segments.map((s) => (
                <article key={`${s.fromMin}-${s.title}`} className="card card-flat">
                  <p className="eyebrow">
                    {s.fromMin}–{s.toMin} min · {KIND_LABEL[s.kind] ?? s.kind}
                  </p>
                  <h4 className="h-sm">{s.title}</h4>
                  <p>
                    <strong>Formateur :</strong> {s.trainerAction}
                  </p>
                  <p>
                    <strong>Participants :</strong> {s.learnerAction}
                  </p>
                  {s.oralNotes.length > 0 && (
                    <ul className="list-gold">
                      {s.oralNotes.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                  {s.watchOut && s.watchOut.length > 0 && (
                    <ul className="list-warn">
                      {s.watchOut.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
            {r.oralKeyMessages.length > 0 && (
              <>
                <h3 className="h-sm">Messages clés à l’oral</h3>
                <ul className="list-gold">
                  {r.oralKeyMessages.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </>
            )}
            <h3 className="h-sm">Plan B sans Claude</h3>
            <p>
              <strong>Si :</strong> {r.planBWithoutClaude.trigger}
            </p>
            <ol className="steps">
              {r.planBWithoutClaude.steps.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ol>
            <p className="muted small">Impact : {r.planBWithoutClaude.timeImpact}</p>
          </details>
        ))}
      </section>

      <section className="stack" aria-labelledby="notes-title">
        <h2 id="notes-title" className="h-lg">
          Notes par module
        </h2>
        {modules.map((m) => (
          <details className="card lesson-card" key={m.id}>
            <summary>
              <span className="lesson-card-title">
                Module {moduleNumber(m)} — {shortTitle(m)}
              </span>
              <span className="muted small">{m.instructorNotes.length} notes</span>
            </summary>
            <InstructorNotes notes={m.instructorNotes} />
          </details>
        ))}
      </section>
    </div>
  )
}
