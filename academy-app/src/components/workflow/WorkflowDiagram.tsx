import { useState } from 'react'
import { Bot, BookOpen, Plug, Send, UserCheck, Wrench, Zap, type LucideIcon } from 'lucide-react'
import { novaWorkflowEdges, novaWorkflowNodes, type WorkflowNodeType } from '../../content/modules/module7'

export const NODE_TYPE_LABEL: Record<WorkflowNodeType, string> = {
  declencheur: 'Déclencheur',
  llm: 'Modèle (LLM)',
  skill: 'Skill',
  outil: 'Outil',
  mcp: 'Connecteur / MCP',
  humain: 'Validation humaine',
  sortie: 'Sortie',
}

const NODE_ICON: Record<WorkflowNodeType, LucideIcon> = {
  declencheur: Zap,
  llm: Bot,
  skill: BookOpen,
  outil: Wrench,
  mcp: Plug,
  humain: UserCheck,
  sortie: Send,
}

interface Props {
  /** Nœuds parcourus (mis en évidence) */
  visited?: string[]
  /** Nœud où le parcours s'arrête */
  stopId?: string | null
  /** Nœud courant (simulateur) */
  currentId?: string | null
}

export default function WorkflowDiagram({ visited = [], stopId = null, currentId = null }: Props) {
  const [selected, setSelected] = useState<string>(novaWorkflowNodes[0].id)
  const pos = (id: string) => {
    const n = novaWorkflowNodes.find((x) => x.id === id)!
    return { x: n.position.x, y: 28 + (n.position.y - 25) * 1.68 }
  }
  const sel = novaWorkflowNodes.find((n) => n.id === selected)!
  const interactive = visited.length === 0

  return (
    <div className="workflow">
      <div className="wf-scroll" tabIndex={0} role="region" aria-label="Diagramme du workflow NOVA en 9 étapes">
        <div className="wf-canvas">
          <svg className="wf-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {novaWorkflowEdges.map((e) => {
              const a = pos(e.from)
              const b = pos(e.to)
              const on = visited.includes(e.from) && visited.includes(e.to)
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={`wf-edge ${e.conditional ? 'is-conditional' : ''} ${on ? 'is-on' : ''}`}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>
          {novaWorkflowNodes.map((n) => {
            const p = pos(n.id)
            const Icon = NODE_ICON[n.type]
            const isVisited = visited.includes(n.id)
            return (
              <button
                key={n.id}
                type="button"
                className={`wf-node wf-${n.type} ${selected === n.id ? 'is-selected' : ''} ${isVisited ? 'is-visited' : ''} ${currentId === n.id ? 'is-current' : ''} ${stopId === n.id ? 'is-stop' : ''} ${
                  !interactive && !isVisited ? 'is-dim' : ''
                }`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={() => setSelected(n.id)}
                aria-pressed={selected === n.id}
                aria-label={`Étape ${n.step} : ${n.label} (${NODE_TYPE_LABEL[n.type]})`}
              >
                <span className="wf-step">{n.step}</span>
                <Icon size={16} aria-hidden="true" />
                <span className="wf-label">{n.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <article className="card wf-detail" aria-live="polite">
        <p className="eyebrow">
          Étape {sel.step} · {NODE_TYPE_LABEL[sel.type]}
          {sel.requiresHumanApproval && <span className="badge badge-gold">Approbation humaine</span>}
        </p>
        <h3 className="h-md">{sel.label}</h3>
        <p>{sel.description}</p>
        <dl className="kv">
          <dt>Entrée</dt>
          <dd>{sel.input}</dd>
          <dt>Sortie</dt>
          <dd>{sel.output}</dd>
          <dt>Risque</dt>
          <dd>{sel.risk}</dd>
          <dt>Garde-fou</dt>
          <dd>{sel.safeguard}</dd>
        </dl>
        <p className="muted small">
          Embranchements :{' '}
          {novaWorkflowEdges
            .filter((e) => e.from === sel.id)
            .map((e) => `→ étape ${novaWorkflowNodes.find((n) => n.id === e.to)?.step}${e.label ? ` (${e.label})` : ''}`)
            .join(' ; ') || 'fin du workflow'}
        </p>
      </article>
    </div>
  )
}
