import { useMemo, useState } from 'react'
import { CheckCircle2, Play, RotateCcw, AlertTriangle } from 'lucide-react'
import { skillSimulatorCases, type SimulatorCase } from '../../content/modules/module5'
import { formatMadHt } from '../../content/nova'

const STATUS_OPTIONS: SimulatorCase['expected']['status'][] = [
  'PRET_A_VALIDER',
  'ALERTE_BUDGET',
  'INFORMATIONS_MANQUANTES',
  'INCOHERENCE',
]

const STATUS_LABEL: Record<SimulatorCase['expected']['status'], string> = {
  PRET_A_VALIDER: 'Prêt à valider',
  ALERTE_BUDGET: 'Alerte budget',
  INFORMATIONS_MANQUANTES: 'Informations manquantes',
  INCOHERENCE: 'Incohérence',
}

/**
 * Simulateur pédagogique des 5 cas limites du skill preparer-devis-nova.
 * Déterministe : aucun appel à un modèle.
 */
export default function SkillSimulator() {
  const [caseId, setCaseId] = useState(skillSimulatorCases[0].id)
  const [statusGuess, setStatusGuess] = useState('')
  const [totalGuess, setTotalGuess] = useState('')
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const dossier = useMemo(
    () => skillSimulatorCases.find((c) => c.id === caseId) ?? skillSimulatorCases[0],
    [caseId],
  )

  function reset(next?: string) {
    if (next) setCaseId(next)
    setStatusGuess('')
    setTotalGuess('')
    setChecked(false)
    setRevealed(false)
  }

  const expectedTotal = dossier.expected.totalMadHt
  const totalOk =
    expectedTotal === null
      ? totalGuess.trim() === '' || totalGuess.trim().toLowerCase() === 'null' || totalGuess.trim() === '—'
      : Number(totalGuess.replace(/\s/g, '')) === expectedTotal
  const statusOk = statusGuess === dossier.expected.status

  return (
    <section className="stack" aria-label="Simulateur de devis skill">
      <p className="callout">
        Simulation pédagogique du skill <strong>preparer-devis-nova</strong> — aucun modèle n’est appelé. Pronostiquez le statut et le total HT, puis comparez.
      </p>

      <div className="toolbar">
        <label className="field field-inline grow">
          <span>Cas</span>
          <select className="input" value={caseId} onChange={(e) => reset(e.target.value)}>
            {skillSimulatorCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <article className="card card-flat">
        <p className="eyebrow">Demande reçue · {dossier.client}</p>
        <p>« {dossier.input} »</p>
        <p className="muted small">
          Budget connu :{' '}
          {dossier.extracted.budgetMadHt === null ? 'non fourni' : formatMadHt(dossier.extracted.budgetMadHt)}
        </p>
      </article>

      <div className="grid-2">
        <label className="field">
          <span>Statut attendu</span>
          <select className="input" value={statusGuess} onChange={(e) => setStatusGuess(e.target.value)} disabled={checked}>
            <option value="">Choisir…</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Total MAD HT (vide si non chiffrable)</span>
          <input
            className="input"
            inputMode="numeric"
            placeholder="ex. 6500"
            value={totalGuess}
            disabled={checked}
            onChange={(e) => setTotalGuess(e.target.value)}
          />
        </label>
      </div>

      <div className="row wrap">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!statusGuess || checked}
          onClick={() => setChecked(true)}
        >
          <Play size={14} aria-hidden="true" /> Vérifier mon pronostic
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => reset()}>
          <RotateCcw size={14} aria-hidden="true" /> Rejouer
        </button>
        {checked && (
          <button type="button" className="btn btn-ghost" onClick={() => setRevealed(true)}>
            Afficher le corrigé
          </button>
        )}
      </div>

      {checked && (
        <div className={`callout ${statusOk && totalOk ? 'callout-ok' : 'callout-warn'}`} role="status">
          <p className="eyebrow">Résultat de votre pronostic</p>
          <p className={statusOk ? 'ok' : 'ko'}>
            {statusOk ? (
              <>
                <CheckCircle2 size={14} aria-hidden="true" /> Statut correct
              </>
            ) : (
              <>
                <AlertTriangle size={14} aria-hidden="true" /> Statut attendu : {STATUS_LABEL[dossier.expected.status]}
              </>
            )}
          </p>
          <p className={totalOk ? 'ok' : 'ko'}>
            {totalOk ? (
              <>
                <CheckCircle2 size={14} aria-hidden="true" /> Total correct
              </>
            ) : (
              <>
                <AlertTriangle size={14} aria-hidden="true" /> Total attendu :{' '}
                {expectedTotal === null ? 'aucun (non chiffrable)' : formatMadHt(expectedTotal)}
              </>
            )}
          </p>
          <p className="muted small">Piège à éviter : {dossier.trap}</p>
        </div>
      )}

      {revealed && (
        <article className="card">
          <p className="eyebrow">Corrigé modèle</p>
          <p>{dossier.modelAnswer}</p>
          <p className="muted">{dossier.debrief}</p>
          <p className="muted small">{dossier.expected.summary}</p>
        </article>
      )}
    </section>
  )
}
