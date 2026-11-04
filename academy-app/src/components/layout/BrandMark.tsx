interface Props {
  size?: 'sm' | 'md' | 'lg'
  stacked?: boolean
}

export default function BrandMark({ size = 'md', stacked = false }: Props) {
  const px = size === 'lg' ? 64 : size === 'md' ? 42 : 34
  return (
    <div className={`brand ${stacked ? 'brand-stacked' : ''}`}>
      <svg width={px} height={px} viewBox="0 0 64 64" role="img" aria-label="DPG" className="brand-svg">
        <rect x="2" y="2" width="60" height="60" rx="12" fill="#0A0A0A" stroke="#C9A84C" strokeWidth="2" />
        <rect x="7" y="7" width="50" height="50" rx="8" fill="none" stroke="rgba(201,168,76,.35)" strokeWidth="1" />
        <text x="32" y="40" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="23" fontWeight="700" fill="#E8C87A">
          DPG
        </text>
      </svg>
      <div className="brand-text">
        <span className="brand-name">Digital Process Group</span>
        <span className="brand-sub">Academy</span>
      </div>
    </div>
  )
}
