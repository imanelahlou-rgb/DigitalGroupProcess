import { useEffect, useMemo, useState } from 'react'
import { Info, Star } from 'lucide-react'
import type { ContextOutcome, ContextSimulatorExercise as ContextData } from '../../content/types'
import { setExerciseDone, setNote, useProgress } from '../../lib/progress'
import { Markdown } from '../course/LessonRenderer'
import HintStack from '../ui/HintStack'

/** Règle d'affichage : la combinaison la plus complète parmi celles dont toutes les couches requises sont actives. */
function pickOutcome(outcomes: ContextOutcome[], active: string[]): { outcome: ContextOutcome; index: number } | null {
  let best: { outcome: ContextOutcome; index: number } | null = null
  outcomes.forEach((o, index) => {
    if (!o.requires.every((r) => active.includes(r))) return
    if (!best || o.requires.length > best.outcome.requires.length || (o.requires.length === best.outcome.requires.length && o.quality > best.outcome.quality)) {
      best = { outcome: o, index }
    }
  })
  return best
}

export default function ContextSimulatorExercise({ exercise }: { exercise: ContextData }) {
  const progress = useProgress()
  const noteKey = `ctx:${exercise.id}:note`
  const note = progress.notes[noteKey] ?? ''
  const [active, setActive] = useState<string[]>([])
  const [seen, setSeen] = useState<number[]>([])

  const picked = useMemo(() => pickOutcome(exercise.outcomes, active), [exercise.outcomes, active])
  const pickedIndex = picked?.index

  useEffect(() => {
    if (pickedIndex !== undefined) setSeen((s) => (s.includes(pickedIndex) ? s : [...s, pickedIndex]))
  }, [pickedIndex])

  const done = seen.length >= 3 && note.trim().length >= 20
  useEffect(() => {
    if (done) setExerciseDone(exercise.id, true)
  }, [done, exercise.id])

  return (
    <div className="stack">
      <p className="callout">
        <Info size={16} aria-hidden="true" /> {exercise.disclaimer}
      </p>
      <p>
        <span className="eyebrow">Demande</span>
        <br />« {exercise.userRequest} »
      </p>
      <fieldset className="layers">
        <legend className="h-sm">Couches de contexte actives</legend>
        {exercise.layers.map((l) => {
          const on = active.includes(l.id)
          return (
            <label key={l.id} className={`layer ${on ? 'is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => setActive((a) => (on ? a.filter((x) => x !== l.id) : [...a, l.id]))} />
              <span>
                <strong>{l.label}</strong>
                <span className="muted small"> — {l.description}</span>
                {on && <em className="layer-sample">{l.sample}</em>}
              </span>
            </label>
          )
        })}
      </fieldset>
      {picked ? (
        <div className="card sim-output" aria-live="polite">
          <p className="eyebrow">
            Réponse simulée · qualité{' '}
            <span className="stars" aria-label={`${picked.outcome.quality} sur 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={14} className={n <= picked.outcome.quality ? 'star-on' : 'star-off'} aria-hidden="true" />
              ))}
            </span>
          </p>
          <Markdown>{picked.outcome.response}</Markdown>
          <p className="muted small">{picked.outcome.commentary}</p>
        </div>
      ) : (
        <p className="muted">Aucune réponse simulée pour cette combinaison.</p>
      )}
      <label className="field">
        <span>Ce que chaque couche apporte (3 lignes, 20 caractères minimum)</span>
        <textarea className="textarea" rows={4} value={note} onChange={(e) => setNote(noteKey, e.target.value)} />
      </label>
      <p className="muted small" role="status">
        Combinaisons observées : {seen.length} / 3 minimum.{' '}
        {done && <span className="ok">Exercice complété.</span>}
      </p>
      <HintStack hints={exercise.hints} />
    </div>
  )
}
