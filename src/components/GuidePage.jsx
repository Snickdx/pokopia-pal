import { Link } from 'react-router-dom';
import { GUIDE_CREDIT } from '../lib/appConfig.js';

export function GuidePage({ title, subtitle, children }) {
  return (
    <section className="guide-page glass-panel page-frame">
      <header className="browse-page__header guide-page__header">
        <div className="guide-page__heading">
          <Link to="/guides" className="guide-page__back">
            ← Guides
          </Link>
          <h2 className="browse-page__title">{title}</h2>
          {subtitle ? <p className="guide-page__subtitle">{subtitle}</p> : null}
        </div>
      </header>
      <div className="browse-page__scroll scroll-y guide-page__body">{children}</div>
      <footer className="guide-page__credit">{GUIDE_CREDIT}</footer>
    </section>
  );
}
