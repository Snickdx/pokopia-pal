import { ShareButton } from './ShareButton.jsx';
import { usePreferencesNav } from '../context/PreferencesNavContext.jsx';

export function DetailPanel({ eyebrow, title, badges, share, tabs, filters, children }) {
  const nav = usePreferencesNav();

  return (
    <section className="detail-panel glass-panel">
      <header className="detail-panel__header">
        {nav?.isMobile ? (
          <button
            type="button"
            className="detail-panel__menu-btn"
            aria-label="Open preferences list"
            onClick={nav.openSidebar}
          >
            <span aria-hidden>☰</span>
          </button>
        ) : null}
        <div className="detail-panel__heading">
          {eyebrow && <p className="detail-panel__eyebrow">{eyebrow}</p>}
          <h2 className="detail-panel__title">{title}</h2>
        </div>
        <div className="detail-panel__actions">
          {share ? <ShareButton {...share} /> : null}
          {badges ? <div className="detail-panel__badges">{badges}</div> : null}
        </div>
      </header>
      {tabs ? <div className="detail-panel__tabs-wrap">{tabs}</div> : null}
      {filters}
      <div className="detail-panel__body scroll-y">{children}</div>
    </section>
  );
}
