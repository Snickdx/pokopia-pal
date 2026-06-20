import { MOSSLAX_SPRITE } from '../../lib/appConfig.js';
import { GuideHero } from './GuideHero.jsx';
import { FlavorDishList } from './FlavorDishList.jsx';

export function FlavorGuideGrid({ flavors }) {
  return (
    <>
      <GuideHero
        sprite={MOSSLAX_SPRITE}
        title="Mosslax area boosts"
        subtitle="Cook by flavor tier — stronger meals stack bigger bonuses when Mosslax eats."
      />

      <div className="flavor-guide-grid">
        {flavors.map((flavor) => (
          <article
            key={flavor.id}
            className="flavor-panel"
            style={{
              '--flavor-panel': flavor.panel,
              '--flavor-border': flavor.border,
              '--flavor-accent': flavor.accent,
            }}
          >
            <header className="flavor-panel__head">
              <span className="flavor-panel__chip" style={{ background: flavor.accent }} />
              <div>
                <h3 className="flavor-panel__name">{flavor.name}</h3>
                <p className="flavor-panel__summary">{flavor.summary}</p>
              </div>
            </header>

            <div className="flavor-panel__tiers">
              {flavor.tiers.map((tier) => (
                <div key={tier.tier} className="flavor-tier-col">
                  <p className="flavor-tier-col__label">
                    <span className="flavor-tier-col__tier">Tier {tier.tier}</span>
                    <span className="flavor-tier-col__kind">{tier.kind}</span>
                  </p>
                  <FlavorDishList items={tier.items} />
                  <p className="flavor-tier-col__effect">{tier.effect}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
