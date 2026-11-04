import { BookMarked } from 'lucide-react'

interface Props {
  term: string
  definition: string
}

export default function ConceptCard({ term, definition }: Props) {
  return (
    <div className="concept-card">
      <BookMarked size={16} aria-hidden="true" />
      <div>
        <dt>{term}</dt>
        <dd>{definition}</dd>
      </div>
    </div>
  )
}
