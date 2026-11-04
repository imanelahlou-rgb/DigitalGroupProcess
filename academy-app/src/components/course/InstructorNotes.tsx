import { Clock, GraduationCap, TriangleAlert } from 'lucide-react'
import type { InstructorNote } from '../../content/types'

export default function InstructorNotes({ notes }: { notes: InstructorNote[] }) {
  return (
    <section className="instructor-notes" aria-label="Notes formateur">
      <h3 className="h-md">
        <GraduationCap size={18} aria-hidden="true" /> Notes formateur
      </h3>
      <div className="stack-sm">
        {notes.map((n) => (
          <article className="card card-flat" key={n.id}>
            <h4 className="h-sm">{n.topic}</h4>
            {n.timingMin !== undefined && (
              <p className="muted small">
                <Clock size={14} aria-hidden="true" /> {n.timingMin} min
              </p>
            )}
            <p>{n.text}</p>
            {n.pitfalls && n.pitfalls.length > 0 && (
              <ul className="list-warn">
                {n.pitfalls.map((p) => (
                  <li key={p}>
                    <TriangleAlert size={14} aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
