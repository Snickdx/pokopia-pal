export function CardGridSkeleton({ variant = 'habitats', count = 8, label }) {
  return (
    <div className="skeleton-grid-wrap" role="status" aria-live="polite">
      {label ? <span className="visually-hidden">{label}</span> : null}
      <div className={`card-grid card-grid--${variant} skeleton-grid`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card" aria-hidden />
        ))}
      </div>
    </div>
  );
}
