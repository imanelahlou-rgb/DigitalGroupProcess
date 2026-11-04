import { setNote, useProgress } from '../../lib/progress'
import CodeExample from '../ui/CodeExample'

interface Props {
  storageKey?: string
}

const BLOCKS = [
  { id: 'role', letter: 'R', name: 'Role (Rôle)', help: 'Qui est Claude pour cette tâche ?', placeholder: 'Tu es l’assistant commercial de NOVA Conseil…' },
  { id: 'input', letter: 'I', name: 'Input (données / contexte fournis)', help: 'Quelles données et quel contexte lui fournissez-vous ?', placeholder: 'Client : Atlas Distribution. Besoin : organisation documentaire. Budget : 12 000 MAD HT. Offre N02 : 6 500 MAD HT…' },
  { id: 'steps', letter: 'S', name: 'Steps (étapes)', help: 'Dans quel ordre procéder ?', placeholder: '1. Extrais le besoin\n2. Choisis les offres dans le catalogue N01 à N05\n3. Calcule le total' },
  { id: 'expectation', letter: 'E', name: 'Expectation (livrable attendu)', help: 'Quel livrable, quel format, quel critère de réussite ?', placeholder: 'Un tableau Markdown et un e-mail de moins de 120 mots…' },
  { id: 'narrowing', letter: 'N', name: 'Narrowing (limites)', help: 'Ce qu’il ne doit pas faire : contraintes, exclusions, format.', placeholder: 'Aucune remise, prix en MAD HT, ne jamais deviner, validation humaine avant envoi.' },
] as const

/** Constructeur de prompt RISEN : Role, Input, Steps, Expectation, Narrowing. */
export default function PromptBuilderRISEN({ storageKey = 'risen-free' }: Props) {
  const progress = useProgress()
  const key = (id: string) => `risen:${storageKey}:${id}`
  const val = (id: string) => progress.notes[key(id)] ?? ''
  const filled = BLOCKS.filter((b) => val(b.id).trim()).length

  const prompt = BLOCKS.map((b) => `## ${b.name}\n${val(b.id).trim() || '[à compléter]'}`).join('\n\n')

  return (
    <section className="risen" aria-label="Constructeur de prompt RISEN">
      <div className="risen-grid">
        <div className="stack-sm">
          {BLOCKS.map((b) => (
            <div className="field" key={b.id}>
              <label htmlFor={`risen-${storageKey}-${b.id}`}>
                <span className="risen-letter" aria-hidden="true">
                  {b.letter}
                </span>{' '}
                {b.name}
              </label>
              <p className="muted small">{b.help}</p>
              <textarea
                id={`risen-${storageKey}-${b.id}`}
                className="textarea"
                rows={b.id === 'steps' ? 4 : 3}
                placeholder={b.placeholder}
                value={val(b.id)}
                onChange={(e) => setNote(key(b.id), e.target.value)}
              />
            </div>
          ))}
        </div>
        <div>
          <p className="muted small" role="status">
            {filled} / {BLOCKS.length} blocs renseignés
          </p>
          <CodeExample code={prompt} title="Prompt RISEN assemblé" maxHeight={460} />
        </div>
      </div>
    </section>
  )
}
