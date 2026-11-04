import { Link } from 'react-router-dom'
import { Award, Clock, Target } from 'lucide-react'
import { module8 } from '../../content/modules'
import { challengeSteps, getScoreBand, oceanScenario, passThresholds, scoreBands } from '../../content/modules/module8'
import { formatMadHt } from '../../content/nova'
import { setCheck, setNote, useProgress } from '../../lib/progress'
import RubricChecklist, { useRubricScore } from '../ui/RubricChecklist'
import HintStack from '../ui/HintStack'
import PromptBuilderRISEN from '../exercises/PromptBuilderRISEN'
import CertificatePreview from './CertificatePreview'

export default function FinalProject() {
  const progress = useProgress()
  const { total, rated, count } = useRubricScore(module8.verification, module8.id)
  const band = getScoreBand(total)
  const stepKey = (stepId: string, i: number) => `final:${stepId}:${i}`
  const checked = challengeSteps.reduce((s, st) => s + st.successChecks.filter((_, i) => progress.checks[stepKey(st.id, i)]).length, 0)
  const checksTotal = challengeSteps.reduce((s, st) => s + st.successChecks.length, 0)
  const totalPoints = challengeSteps.reduce((s, st) => s + st.points, 0)

  return (
    <div className="stack-lg">
      <section className="card" aria-labelledby="ocean-title">
        <p className="eyebrow">Défi final · {module8.practicalMission.estimatedMin} min</p>
        <h2 id="ocean-title" className="h-lg">
          {module8.practicalMission.title}
        </h2>
        <p>{oceanScenario.brief}</p>
        <ul className="meta-row">
          <li>
            <Target size={14} aria-hidden="true" /> Budget : {formatMadHt(oceanScenario.budgetMadHt)}
          </li>
          {oceanScenario.offers.map((o) => (
            <li key={o.code}>
              {o.code} · {o.label} · {formatMadHt(o.priceMadHt)}
            </li>
          ))}
          <li>
            <strong>Total attendu : {formatMadHt(oceanScenario.totalMadHt)}</strong>
          </li>
        </ul>
        <h3 className="h-sm">Contraintes</h3>
        <ul className="list-gold">
          {oceanScenario.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="muted small">
          Déroulé détaillé, démonstration et quiz : <Link to={`/modules/${module8.slug}`}>page du module 8</Link>.
        </p>
      </section>

      <section aria-labelledby="steps-title" className="stack">
        <h2 id="steps-title" className="h-lg">
          Les dix étapes ({totalPoints} points)
        </h2>
        <p className="muted small" role="status">
          Points de contrôle cochés : {checked} / {checksTotal}
        </p>
        {challengeSteps.map((st) => (
          <article className="card card-flat" key={st.id}>
            <header className="step-head">
              <span className="module-num">{String(st.step).padStart(2, '0')}</span>
              <h3 className="h-md">{st.title}</h3>
              <span className="badge badge-gold">{st.points} pts</span>
              <span className="muted small">
                <Clock size={13} aria-hidden="true" /> {st.durationMin} min
              </span>
            </header>
            <p>{st.instruction}</p>
            <p>
              <strong>Livrable :</strong> {st.deliverable}
            </p>
            <fieldset className="check-list">
              <legend className="sr-only">Points de contrôle de l’étape {st.step}</legend>
              {st.successChecks.map((c, i) => (
                <label key={c} className="check-item">
                  <input type="checkbox" checked={Boolean(progress.checks[stepKey(st.id, i)])} onChange={(e) => setCheck(stepKey(st.id, i), e.target.checked)} />
                  <span>{c}</span>
                </label>
              ))}
            </fieldset>
            <HintStack hints={[{ id: `${st.id}-h`, level: 1, text: st.hint }]} />
            {st.rubricCriterionId === 'risen' && (
              <details className="preview">
                <summary>Ouvrir le constructeur de prompt RISEN</summary>
                <PromptBuilderRISEN storageKey="final-ocean" />
              </details>
            )}
            <label className="field">
              <span className="muted small">Notes personnelles pour cette étape (enregistrées sur cet appareil)</span>
              <textarea
                className="textarea"
                rows={2}
                value={progress.notes[`final-note:${st.id}`] ?? ''}
                onChange={(e) => setNote(`final-note:${st.id}`, e.target.value)}
              />
            </label>
          </article>
        ))}
      </section>

      <section aria-labelledby="rubric-title" className="stack">
        <h2 id="rubric-title" className="h-lg">
          Barème de {module8.verification.maxPoints} points
        </h2>
        <RubricChecklist rubric={module8.verification} moduleId={module8.id} />
        <div className={`card band band-${band.id}`} role="status">
          <p className="eyebrow">
            <Award size={14} aria-hidden="true" /> Résultat auto-évalué : {total} / {module8.verification.maxPoints} ({rated}/{count} critères notés)
          </p>
          <h3 className="h-md">{band.label}</h3>
          <p>{band.message}</p>
          <ul className="list-gold">
            {band.nextSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="muted small">
            Seuils : {passThresholds.maitrise} et plus = maîtrise ; {passThresholds.acquis} à {passThresholds.maitrise - 1} = acquis ; en dessous de {passThresholds.acquis} = à renforcer
            ({scoreBands.length} paliers). Auto-évaluation indicative : la notation officielle revient au formateur.
          </p>
        </div>
      </section>

      <section aria-labelledby="cert-title" className="stack">
        <h2 id="cert-title" className="h-lg">
          Attestation de participation
        </h2>
        <CertificatePreview
          name={progress.notes['certificate:name'] ?? ''}
          onNameChange={(n) => setNote('certificate:name', n)}
          scoreLabel={rated > 0 ? `Auto-évaluation du défi : ${total} / ${module8.verification.maxPoints} points` : undefined}
        />
      </section>
    </div>
  )
}
