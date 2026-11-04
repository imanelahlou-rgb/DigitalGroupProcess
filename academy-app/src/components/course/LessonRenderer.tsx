import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Lesson } from '../../content/types'
import CodeExample from '../ui/CodeExample'
import ConceptCard from '../ui/ConceptCard'

const components: Components = {
  pre({ children }) {
    const child = Children.toArray(children)[0]
    if (isValidElement<{ className?: string; children?: ReactNode }>(child)) {
      const lang = /language-([\w-]+)/.exec(child.props.className ?? '')?.[1]
      const text = Children.toArray(child.props.children).join('')
      return <CodeExample code={text} language={lang} />
    }
    return <pre>{children}</pre>
  },
  table({ children }) {
    return (
      <div className="table-wrap" tabIndex={0} role="region" aria-label="Tableau">
        <table className="data-table">{children}</table>
      </div>
    )
  },
  a({ href, children }) {
    const external = Boolean(href && /^https?:\/\//.test(href))
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  },
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default function LessonRenderer({ lesson, showTitle = true }: { lesson: Lesson; showTitle?: boolean }) {
  return (
    <article className="lesson">
      {showTitle && <h2 className="h-lg">{lesson.title}</h2>}
      <Markdown>{lesson.body}</Markdown>
      {lesson.keyTerms && lesson.keyTerms.length > 0 && (
        <aside className="key-terms" aria-label="Termes clés">
          <h3 className="h-sm">Termes clés</h3>
          <dl className="grid-2">
            {lesson.keyTerms.map((k) => (
              <ConceptCard key={k.term} term={k.term} definition={k.definition} />
            ))}
          </dl>
        </aside>
      )}
    </article>
  )
}
