interface Props {
  size?: 'sm' | 'md' | 'lg'
  stacked?: boolean
  /** Affiche uniquement le logo image, sans le texte « Academy » à côté */
  logoOnly?: boolean
}

const SIZES = {
  sm: { height: 40, className: 'brand-logo--sm' },
  md: { height: 52, className: 'brand-logo--md' },
  lg: { height: 120, className: 'brand-logo--lg' },
} as const

export default function BrandMark({ size = 'md', stacked = false, logoOnly = false }: Props) {
  const { height, className } = SIZES[size]
  const showText = !logoOnly && !stacked

  return (
    <div className={`brand ${stacked ? 'brand-stacked' : ''}`}>
      <img
        src={`${import.meta.env.BASE_URL}logo-dpg.png`}
        alt="Digital Process Group"
        className={`brand-logo ${className}`}
        height={height}
        width="auto"
        decoding="async"
      />
      {showText && (
        <div className="brand-text">
          <span className="brand-sub">Academy</span>
        </div>
      )}
      {stacked && (
        <p className="brand-tagline muted tiny">Transform. Optimize. Innovate.</p>
      )}
    </div>
  )
}
