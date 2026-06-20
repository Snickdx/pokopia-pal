import { CardGridSkeleton } from './CardGridSkeleton.jsx';

export function PreferenceDetailSkeleton({ showMenuButton = false }) {
  return (
    <section className="detail-panel glass-panel detail-panel--skeleton" aria-busy="true">
      <header className="detail-panel__header">
        {showMenuButton ? (
          <div className="skeleton-block skeleton-block--menu" aria-hidden />
        ) : null}
        <div className="detail-panel__heading">
          <div className="skeleton-line skeleton-line--eyebrow" aria-hidden />
          <div className="skeleton-line skeleton-line--title" aria-hidden />
        </div>
        <div className="detail-panel__actions">
          <div className="skeleton-block skeleton-block--badge" aria-hidden />
          <div className="skeleton-block skeleton-block--badge" aria-hidden />
          <div className="skeleton-block skeleton-block--badge" aria-hidden />
        </div>
      </header>
      <div className="detail-panel__tabs-wrap">
        <div className="skeleton-tabs" aria-hidden>
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
        </div>
      </div>
      <div className="detail-panel__body scroll-y">
        <CardGridSkeleton variant="habitats" count={8} label="Loading…" />
      </div>
    </section>
  );
}
