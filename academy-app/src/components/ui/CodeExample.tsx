import CopyButton from './CopyButton'

interface Props {
  code: string
  language?: string
  title?: string
  maxHeight?: number
}

export default function CodeExample({ code, language, title, maxHeight }: Props) {
  const clean = code.replace(/\n$/, '')
  return (
    <figure className="code-example">
      <figcaption className="code-head">
        <span className="code-title">{title ?? language ?? 'Exemple'}</span>
        <CopyButton text={clean} />
      </figcaption>
      <pre tabIndex={0} style={maxHeight ? { maxHeight } : undefined}>
        <code>{clean}</code>
      </pre>
    </figure>
  )
}
