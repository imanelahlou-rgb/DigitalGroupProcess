import { CircleCheck, CircleDashed, RotateCcw } from 'lucide-react'
import type { AssessmentRubric } from '../../content/types'
import { clearRubric, setRubricScore, useProgress } from '../../lib/progress'
import ProgressTracker from './ProgressTracker'

interface Props {
  rubric: AssessmentRubric
  moduleId: string
}

export function useRubricScore(rubric: AssessmentRubric, moduleId: string) {
  const progress = useProgress()
  const scores = progress.rubric[moduleId] ?? {}
  const total = rubric.criteria.reduce((s, c) => s + (scores[c.id] ?? 0), 0)
  const rated = rubric.criteria.filter((c) => scores[c.id] !== undefined).length
  return { scores, total, rated, count: rubric.criteria.length, percent: Math.round((total / rubric.maxPoints) * 100), passed: total >= rubric.passThreshold }
}

/** Auto-évaluation selon la grille : un niveau par critère, total et seuil. */
export default function RubricChecklist({ rubric, moduleId }: Props) {
  const { scores, total, rated, count, passed } = useRubricScore(rubric, moduleId)
  return (
    <section className="rubric" aria-label={rubric.title}>
      <h3 className="h-md">{rubric.title}</h3>
      <p className="muted small">
        Évaluez-vous honnêtement, critère par critère. Seuil de réussite : {rubric.passThreshold} sur {rubric.maxPoints} points.
      </p>
      <div className="stack-sm">
        {rubric.criteria.map((c) => (
          <fieldset className="rubric-criterion" key={c.id}>
            <legend>
              {c.label} <span className="badge">{c.maxPoints} pts</span>
            </legend>
            <p className="muted small">{c.description}</p>
            <div className="rubric-levels">
              {[...c.levels]
                .sort((a, b) => a.points - b.points)
                .map((lv) => {
                  const checked = scores[c.id] === lv.points
                  return (
                    <label key={lv.points} className={`rubric-level ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="radio"
                        name={`${moduleId}-${c.id}`}
                        checked={checked}
                        onChange={() => setRubricScore(moduleId, c.id, lv.points)}
                      />
                      <span className="rubric-points">{lv.points} pt{lv.points > 1 ? 's' : ''}</span>
                      <span>{lv.descriptor}</span>
                    </label>
                  )
                })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="rubric-total">
        <ProgressTracker label={`Score auto-évalué (${rated}/${count} critères)`} percent={(total / rubric.maxPoints) * 100} detail={`${total} / ${rubric.maxPoints} pts`} />
        <p className={passed ? 'ok' : 'muted'}>
          {passed ? <CircleCheck size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}{' '}
          {passed ? 'Seuil atteint.' : `Il manque ${Math.max(0, rubric.passThreshold - total)} point(s) pour atteindre le seuil.`}
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => clearRubric(moduleId)} disabled={rated === 0}>
          <RotateCcw size={14} aria-hidden="true" /> Réinitialiser l’auto-évaluation
        </button>
      </div>
    </section>
  )
}
