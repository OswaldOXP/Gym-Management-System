export default function BrandMark({ compact = false, className = '' }) {
  return (
    <div className={`brand-mark ${compact ? 'is-compact' : ''} ${className}`.trim()}>
      <span className="brand-mark-badge" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.5 2.5L6 13h5l-1 8L18 11h-5l.5-8.5Z" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-mark-text">
          <span className="brand-mark-word">IRON</span>
          <span className="brand-mark-word brand-mark-word-accent">CORE</span>
        </span>
      )}
    </div>
  )
}