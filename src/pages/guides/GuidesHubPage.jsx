import { Link } from 'react-router-dom';
import { guideSections } from '../../data/guides.js';
import { GUIDE_CREDIT } from '../../lib/appConfig.js';

export function GuidesHubPage() {
  return (
    <section className="guide-page glass-panel page-frame">
      <header className="browse-page__header">
        <h2 className="browse-page__title">Guides</h2>
        <p className="guide-page__subtitle">
          Dream Islands, paint mixing, Mosslax boosts, and litterbugs
        </p>
      </header>
      <div className="browse-page__scroll scroll-y guide-page__body">
        <ul className="guide-hub guide-hub--grid">
          {guideSections.map((section) => (
            <li key={section.id}>
              <Link to={section.path} className="guide-hub__card card-cozy">
                <span className="guide-hub__icon" aria-hidden>
                  {section.icon}
                </span>
                <div>
                  <h3 className="guide-hub__title">{section.title}</h3>
                  <p className="guide-hub__desc">{section.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <footer className="guide-page__credit">{GUIDE_CREDIT}</footer>
    </section>
  );
}
