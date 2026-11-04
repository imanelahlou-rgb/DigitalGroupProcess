import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { plannerSimulator, weeklyTimeline } from '../../content/modules/module6'

/**
 * Simulateur local de tâche planifiée (vendredi 17 h).
 * Aucun service distant n’est activé.
 */
export default function PlannerSimulator() {
  const cfg = plannerSimulator
  const defaultFreq = cfg.frequencyOptions.find((f) => f.isDefault)?.id ?? cfg.frequencyOptions[0].id
  const [freq, setFreq] = useState(defaultFreq)
  const [day, setDay] = useState(5)
  const [hour, setHour] = useState(17)
  const [checked, setChecked] = useState(false)

  const freqOpt = useMemo(() => cfg.frequencyOptions.find((f) => f.id === freq) ?? cfg.frequencyOptions[0], [freq, cfg.frequencyOptions])

  const checks = useMemo(() => {
    const fridayOk = day === 5
    const hourOk = hour === 17
    const freqOk = freq === 'vendredi' || (fridayOk && hourOk && freqOpt.cron.includes('5'))
    return [
      { id: 'jour', ok: fridayOk, label: 'Jour = vendredi', fail: 'Le rapport hebdomadaire doit partir le vendredi.' },
      { id: 'heure', ok: hourOk, label: 'Heure = 17 h', fail: 'Fixez 17 h pour laisser un contrôle à 16 h 30.' },
      { id: 'freq', ok: freqOk || (fridayOk && hourOk), label: 'Fréquence cohérente avec vendredi 17 h', fail: 'Choisissez « Chaque vendredi à 17 h ».' },
    ]
  }, [day, hour, freq, freqOpt.cron])

  const allOk = checks.every((c) => c.ok)

  return (
    <section className="stack" aria-label="Simulateur de planification">
      <p className="callout">
        Configuration locale uniquement — <strong>aucun service réel n’est activé</strong>. Fuseau : {cfg.timezone}.
      </p>

      <div className="grid-3">
        <label className="field">
          <span>Fréquence</span>
          <select className="input" value={freq} onChange={(e) => { setFreq(e.target.value); setChecked(false) }}>
            {cfg.frequencyOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Jour</span>
          <select className="input" value={day} onChange={(e) => { setDay(Number(e.target.value)); setChecked(false) }}>
            {cfg.weekDays.map((d) => (
              <option key={d.index} value={d.index}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Heure</span>
          <select className="input" value={hour} onChange={(e) => { setHour(Number(e.target.value)); setChecked(false) }}>
            {[9, 12, 16, 17, 18].map((h) => (
              <option key={h} value={h}>
                {h} h 00
              </option>
            ))}
          </select>
        </label>
      </div>

      <article className="card card-flat">
        <p className="eyebrow">
          <Clock size={14} aria-hidden="true" /> Aperçu de configuration
        </p>
        <p>
          <strong>{cfg.defaultTask.name}</strong>
        </p>
        <p className="muted small">
          Cron indicatif : <code>{freqOpt.cron}</code> · Sortie : brouillon à relire · Propriétaire : {cfg.defaultTask.owner}
        </p>
      </article>

      <div className="card">
        <p className="eyebrow">Timeline de la semaine (indicative)</p>
        <ol className="steps">
          {weeklyTimeline.map((ev) => (
            <li key={`${ev.day}-${ev.time}-${ev.label}`}>
              <strong>
                J{ev.day} {ev.time} · {ev.label}
              </strong>
              <p className="muted small">{ev.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="row wrap">
        <button type="button" className="btn btn-primary" onClick={() => setChecked(true)}>
          Vérifier la configuration
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setFreq(defaultFreq)
            setDay(5)
            setHour(17)
            setChecked(false)
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Remettre vendredi 17 h
        </button>
      </div>

      {checked && (
        <div className={`callout ${allOk ? 'callout-ok' : 'callout-warn'}`} role="status">
          <p className="eyebrow">Contrôles</p>
          <ul className="list-gold">
            {checks.map((c) => (
              <li key={c.id} className={c.ok ? 'ok' : 'ko'}>
                {c.ok ? (
                  <>
                    <CheckCircle2 size={14} aria-hidden="true" /> {c.label}
                  </>
                ) : (
                  <>
                    {c.label} — {c.fail}
                  </>
                )}
              </li>
            ))}
          </ul>
          {allOk && <p>Configuration conforme au cas pédagogique. N’oubliez pas : produire un brouillon, jamais un envoi automatique.</p>}
        </div>
      )}
    </section>
  )
}
