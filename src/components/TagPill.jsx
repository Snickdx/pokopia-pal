export function TagPill({ children, variant = 'default', className = '' }) {
  return (
    <span className={`tag-pill tag-pill--${variant} ${className}`.trim()}>{children}</span>
  );
}
