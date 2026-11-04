import { Check, Copy, TriangleAlert } from 'lucide-react'
import { useCopy } from '../../lib/clipboard'

interface Props {
  text: string
  label?: string
  className?: string
  small?: boolean
}

export default function CopyButton({ text, label = 'Copier', className = '', small = true }: Props) {
  const { state, copy } = useCopy()
  const Icon = state === 'copied' ? Check : state === 'error' ? TriangleAlert : Copy
  const text2 = state === 'copied' ? 'Copié' : state === 'error' ? 'Échec de la copie' : label
  return (
    <button
      type="button"
      className={`btn btn-ghost ${small ? 'btn-sm' : ''} ${state === 'copied' ? 'is-success' : ''} ${className}`}
      onClick={() => void copy(text)}
      aria-label={state === 'idle' ? `${label} dans le presse-papiers` : text2}
    >
      <Icon size={small ? 14 : 16} aria-hidden="true" />
      <span aria-live="polite">{text2}</span>
    </button>
  )
}
