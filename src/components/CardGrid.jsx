export function CardGrid({ children, variant = 'habitats' }) {
  return <div className={`card-grid card-grid--${variant}`}>{children}</div>;
}
