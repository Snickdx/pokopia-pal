import { useIsMobileCatalog } from '../../hooks/useMediaQuery.js';
import { PreferenceDetailSkeleton } from './PreferenceDetailSkeleton.jsx';

const SIDEBAR_GROUPS = [
  { heading: true, rows: 4 },
  { heading: true, rows: 3 },
  { heading: true, rows: 3 },
];

export function FavoritesPageSkeleton() {
  const isMobile = useIsMobileCatalog();

  return (
    <div
      className={`master-detail master-detail--skeleton${isMobile ? ' master-detail--mobile' : ''}`}
      aria-busy="true"
      aria-label="Loading preferences"
    >
      {!isMobile ? (
        <aside className="sidebar glass-panel sidebar--skeleton" aria-hidden>
          <div className="sidebar__header">
            <div className="skeleton-line skeleton-line--sidebar-title" />
            <div className="skeleton-block skeleton-block--search" />
          </div>
          <div className="preference-list scroll-y">
            {SIDEBAR_GROUPS.map((group, gi) => (
              <div key={gi}>
                <div className="skeleton-line skeleton-line--heading" />
                <ul>
                  {Array.from({ length: group.rows }).map((_, ri) => (
                    <li key={ri}>
                      <div className="skeleton-line skeleton-line--pref" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      ) : null}
      <div className="master-detail__content">
        <PreferenceDetailSkeleton showMenuButton={isMobile} />
      </div>
    </div>
  );
}
