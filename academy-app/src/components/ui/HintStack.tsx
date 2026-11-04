import { useState } from 'react'
import { Eye, Lightbulb, ShieldAlert } from 'lucide-react'
import type { Hint } from '../../content/types'
import CodeExample from './CodeExample'

interface Props {
  hints: Hint[]
  solution?: string
  solutionTitle?: string
  /** true : la solution est du code/texte brut ; false : texte courant */
  solutionIsCode?: boolean
}

/** Indices progressifs ; la solution n'apparaît qu'après confirmation explicite. */
export default function HintStack({ hints, solution, solutionTitle = 'Proposition de correction', solutionIsCode = true }: Props) {
  const sorted = [...hints].sort((a, b) => a.level - b.level)
  const [shown, setShown] = useState(0)
  const [phase, setPhase] = useState<'hidden' | 'confirm' | 'shown'>('hidden')

  if (sorted.length === 0 && !solution) return null

  return (
    <section className="hint-stack" aria-label="Aide">
      <h3 className="h-sm">
        <Lightbulb size={16} aria-hidden="true" /> Besoin d’aide ?
      </h3>
      {sorted.slice(0, shown).map((h, i) => (
        <div className="hint" key={h.id}>
          <span className="badge">Indice {i + 1}</span>
          <p>{h.text}</p>
        </div>
      ))}
      <div className="row wrap">
        {shown < sorted.length && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShown((n) => n + 1)}>
            <Lightbulb size={14} aria-hidden="true" /> Afficher l’indice {shown + 1} sur {sorted.length}
          </button>
        )}
        {solution && phase === 'hidden' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhase('confirm')}>
            <Eye size={14} aria-hidden="true" /> Voir la solution
          </button>
        )}
      </div>
      {phase === 'confirm' && (
        <div className="callout callout-warn" role="alertdialog" aria-label="Confirmer l’affichage de la solution">
          <p>
            <ShieldAlert size={16} aria-hidden="true" /> <strong>Avez-vous essayé d’abord ?</strong> Chercher soi-même, c’est ce qui fait progresser. Afficher la
            solution maintenant ?
          </p>
          <div className="row wrap">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setPhase('shown')}>
              Oui, afficher la solution
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhase('hidden')}>
              Non, je continue
            </button>
          </div>
        </div>
      )}
      {phase === 'shown' && solution && (
        <div className="solution">
          <p className="eyebrow">{solutionTitle}</p>
          {solutionIsCode ? <CodeExample code={solution} title={solutionTitle} maxHeight={420} /> : <p>{solution}</p>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhase('hidden')}>
            Masquer la solution
          </button>
        </div>
      )}
    </section>
  )
}
