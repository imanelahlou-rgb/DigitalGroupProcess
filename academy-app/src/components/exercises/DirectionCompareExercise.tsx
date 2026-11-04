import { useEffect } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { DirectionCompareExercise as DirectionData } from '../../content/types'
import { setExerciseDone, setNote, useProgress } from '../../lib/progress'
import HintStack from '../ui/HintStack'

export default function DirectionCompareExercise({ exercise }: { exercise: DirectionData }) {
  const progress = useProgress()
  const choiceKey = `dir:${exercise.id}:choice`
  const whyKey = `dir:${exercise.id}:why`
  const choice = progress.notes[choiceKey] ?? ''
  const why = progress.notes[whyKey] ?? ''
  const done = Boolean(choice) && why.trim().length >= 20

  useEffect(() => {
    if (done) setExerciseDone(exercise.id, true)
  }, [done, exercise.id])

  return (
    <div className="stack">
      <div className="direction-grid" role="radiogroup" aria-label="Directions de marque">
        {exercise.directions.map((d) => {
          const selected = choice === d.id
          return (
            <article key={d.id} className={`card direction ${selected ? 'is-selected' : ''}`}>
              <h3 className="h-md">{d.name}</h3>
              <p className="tagline">{d.tagline}</p>
              <div className="swatches" aria-label="Palette">
                {d.palette.map((c) => (
                  <div key={c.hex} className="swatch" title={`${c.name} ${c.hex} — ${c.role}`}>
                    <span className="swatch-chip" style={{ background: c.hex }} />
                    <span className="tiny">{c.name}</span>
                    <span className="tiny mono muted">{c.hex}</span>
                  </div>
                ))}
              </div>
              <dl className="kv">
                <dt>Titres</dt>
                <dd>{d.typography.heading}</dd>
                <dt>Texte</dt>
                <dd>{d.typography.body}</dd>
                <dt>Ton</dt>
                <dd>{d.tone}</dd>
                <dt>Idéal pour</dt>
                <dd>{d.bestFor}</dd>
              </dl>
              <ul className="list-ok">
                {d.strengths.map((s) => (
                  <li key={s}>
                    <ThumbsUp size={13} aria-hidden="true" /> {s}
                  </li>
                ))}
              </ul>
              <ul className="list-warn">
                {d.risks.map((s) => (
                  <li key={s}>
                    <ThumbsDown size={13} aria-hidden="true" /> {s}
                  </li>
                ))}
              </ul>
              <button type="button" role="radio" aria-checked={selected} className={`btn ${selected ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setNote(choiceKey, d.id)}>
                {selected ? 'Direction retenue' : 'Retenir cette direction'}
              </button>
            </article>
          )
        })}
      </div>
      <div>
        <h3 className="h-sm">Critères de comparaison</h3>
        <ul className="list-gold">
          {exercise.comparisonCriteria.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <label className="field">
        <span>Justifiez votre choix (20 caractères minimum)</span>
        <textarea className="textarea" rows={4} value={why} onChange={(e) => setNote(whyKey, e.target.value)} placeholder="Je retiens cette direction parce que…" />
      </label>
      {done ? (
        <p className="callout callout-ok" role="status">
          Choix argumenté : exercice complété.
        </p>
      ) : (
        <p className="muted small">Retenez une direction et justifiez-la pour valider l’exercice.</p>
      )}
      <HintStack hints={exercise.hints} />
    </div>
  )
}
