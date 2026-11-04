import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'
import { novaWorkflowNodes, workflowSimulatorCases, type WorkflowDossierCase } from '../../content/modules/module7'
import { formatMadHt } from '../../content/nova'
import WorkflowDiagram from './WorkflowDiagram'

const STATUS_LABEL: Record<WorkflowDossierCase['finalStatus'], string> = {
  PRET_A_VALIDER: 'Prêt à valider',
  ALERTE_BUDGET: 'Alerte budget',
  INFORMATIONS_MANQUANTES: 'Informations manquantes',
  INCOHERENCE: 'Incohérence détectée',
  APPROUVE: 'Approuvé après relecture',
}

export default function WorkflowSimulator() {
  const [caseId, setCaseId] = useState(workflowSimulatorCases[0].id)
  const [step, setStep] = useState(0) // nombre de nœuds déjà parcourus
  const [guess, setGuess] = useState('')
  const [started, setStarted] = useState(false)

  const dossier = workflowSimulatorCases.find((c) => c.id === caseId)!
  const visited = dossier.path.slice(0, step)
  const finished = started && step >= dossier.path.length
  const current = started && step > 0 ? dossier.path[Math.min(step, dossier.path.length) - 1] : null
  const currentNode = novaWorkflowNodes.find((n) => n.id === current)

  function reset(nextCase?: string) {
    if (nextCase) setCaseId(nextCase)
    setStep(0)
    setStarted(false)
    setGuess('')
  }

  return (
    <section className="stack" aria-label="Simulateur de workflow">
      <p className="callout">
        Simulation pédagogique : les parcours sont écrits à l’avance et ne font appel à aucun modèle. Choisissez un dossier, pronostiquez le résultat, puis avancez étape par étape.
      </p>
      <div className="toolbar">
        <label className="field field-inline grow">
          <span>Dossier</span>
          <select className="input" value={caseId} onChange={(e) => reset(e.target.value)}>
            {workflowSimulatorCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.client}
              </option>
            ))}
          </select>
        </label>
      </div>
      <article className="card card-flat">
        <p className="eyebrow">Demande reçue</p>
        <p>« {dossier.request} »</p>
        <p className="muted small">
          Budget : {dossier.budgetMadHt === null ? 'non fourni' : formatMadHt(dossier.budgetMadHt)}
        </p>
      </article>

      {!started ? (
        <div className="row wrap">
          <label className="field field-inline">
            <span>Votre pronostic</span>
            <select className="input" value={guess} onChange={(e) => setGuess(e.target.value)}>
              <option value="">Je ne sais pas encore…</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setStarted(true)
              setStep(1)
            }}
          >
            <Play size={14} aria-hidden="true" /> Lancer la simulation
          </button>
        </div>
      ) : (
        <div className="row wrap">
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step <= 1}>
            <ChevronLeft size={14} aria-hidden="true" /> Étape précédente
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setStep((s) => Math.min(dossier.path.length, s + 1))} disabled={finished}>
            Étape suivante <ChevronRight size={14} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => reset()}>
            <RotateCcw size={14} aria-hidden="true" /> Rejouer
          </button>
        </div>
      )}

      <WorkflowDiagram visited={visited} currentId={current} stopId={finished ? dossier.stopsAt : null} />

      {started && currentNode && (
        <p className="muted" role="status">
          Parcouru : étape {currentNode.step} — {currentNode.label} ({step} / {dossier.path.length}).
        </p>
      )}

      {finished && (
        <div className="callout callout-ok" role="status">
          <p className="eyebrow">Résultat</p>
          <p>
            <strong>{STATUS_LABEL[dossier.finalStatus]}</strong>
            {dossier.totalMadHt !== null && ` · total ${formatMadHt(dossier.totalMadHt)}`}
          </p>
          {guess && (
            <p className={guess === dossier.finalStatus ? 'ok' : 'ko'}>
              {guess === dossier.finalStatus ? 'Votre pronostic était juste.' : `Votre pronostic (${STATUS_LABEL[guess as WorkflowDossierCase['finalStatus']]}) différait du résultat.`}
            </p>
          )}
          <p>{dossier.expectedExplanation}</p>
          <p>
            <strong>Décision humaine :</strong> {dossier.humanDecision}
          </p>
          <p className="muted small">À retenir : {dossier.teachingPoint}</p>
        </div>
      )}
    </section>
  )
}
