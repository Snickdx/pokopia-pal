import { CardGridSkeleton } from '../skeletons/CardGridSkeleton.jsx';

export function LoadingState({ label = 'Loading…', variant = 'habitats', count = 8 }) {
  return (
    <div className="state-panel state-panel--scroll" role="status" aria-live="polite">
      <CardGridSkeleton variant={variant} count={count} label={label} />
      <p className="state-label">{label}</p>
    </div>
  );
}
