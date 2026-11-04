import { Link } from 'react-router-dom'
import { ArrowRight, ListTree } from 'lucide-react'
import { COURSE_SUBTITLE, COURSE_TITLE, courseStats, formatDuration } from '../../content/course'
import BrandMark from '../layout/BrandMark'

interface Props {
  continueTo: string
  started: boolean
}

export default function CourseHero({ continueTo, started }: Props) {
  const stats = [
    { label: 'Modules', value: courseStats.modules },
    { label: 'Leçons', value: courseStats.lessons },
    { label: 'Exercices', value: courseStats.exercises },
    { label: 'Questions de quiz', value: courseStats.quizQuestions },
    { label: 'Durée', value: formatDuration(courseStats.sessionDurationMin) },
  ]
  return (
    <section className="hero" aria-labelledby="hero-title">
      <BrandMark size="lg" />
      <p className="eyebrow">Atelier Claude · fil rouge NOVA Conseil</p>
      <h1 id="hero-title" className="hero-title">
        {COURSE_TITLE}
      </h1>
      <p className="hero-sub">{COURSE_SUBTITLE}</p>
      <div className="row wrap">
        <Link to={continueTo} className="btn btn-primary btn-lg">
          {started ? 'Reprendre l’atelier' : 'Commencer l’atelier'} <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link to="/programme" className="btn btn-ghost btn-lg">
          <ListTree size={18} aria-hidden="true" /> Voir le programme
        </Link>
      </div>
      <dl className="stat-row">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
