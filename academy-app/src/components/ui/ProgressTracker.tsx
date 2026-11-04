interface Props {
  percent: number
  label?: string
  detail?: string
  size?: 'sm' | 'md'
}

export default function ProgressTracker({ percent, label = 'Progression', detail, size = 'md' }: Props) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className={`progress progress-${size}`}>
      <div className="progress-meta">
        <span>{label}</span>
        <span>
          {detail ? `${detail} · ` : ''}
          <strong>{p} %</strong>
        </span>
      </div>
      <div className="progress-bar" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
        <div className="progress-fill" style={{ width: `${p}%` }} />
      </div>
    </div>
  )
}
