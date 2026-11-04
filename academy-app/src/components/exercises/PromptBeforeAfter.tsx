import { ArrowRight } from 'lucide-react'
import CodeExample from '../ui/CodeExample'

interface Props {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
}

export default function PromptBeforeAfter({ before, after, beforeLabel = 'Avant', afterLabel = 'Après' }: Props) {
  return (
    <div className="before-after">
      <div className="ba-col ba-before">
        <p className="eyebrow">{beforeLabel}</p>
        <CodeExample code={before} title={beforeLabel} maxHeight={360} />
      </div>
      <ArrowRight className="ba-arrow" size={22} aria-hidden="true" />
      <div className="ba-col ba-after">
        <p className="eyebrow">{afterLabel}</p>
        <CodeExample code={after} title={afterLabel} maxHeight={360} />
      </div>
    </div>
  )
}
