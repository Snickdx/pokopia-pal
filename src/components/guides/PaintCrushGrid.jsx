import { berryPaint, paintCrushMeta } from '../../data/guides.js';
import { CRUSH_POKEMON, PAINT_PALETTE_18, swatchHex } from '../../lib/guideAssets.js';
import { GuideIcon } from './GuideIcon.jsx';
import { GuideHero } from './GuideHero.jsx';

export function PaintCrushGrid() {
  return (
    <>
      <GuideHero
        sprite="/assets/poketracker/sprites/119_smeargle.png"
        title="Smearguru paint"
        subtitle={paintCrushMeta.intro}
      />

      <div className="berry-paint-grid">
        {berryPaint.map((row) => (
          <article key={row.berry} className="berry-paint-card">
            <div className="berry-paint-card__berry">
              <GuideIcon name={`${row.berry} Berry`} size="lg" />
              <span className="berry-paint-card__name">{row.berry}</span>
            </div>
            <div className="berry-paint-card__colors">
              <div className="berry-paint-card__color">
                <span
                  className="color-dot color-dot--lg"
                  style={{ background: swatchHex(row.common) }}
                />
                <span className="berry-paint-card__color-label">Common</span>
                <span className="berry-paint-card__color-name">{row.common}</span>
              </div>
              <div className="berry-paint-card__color">
                <span
                  className="color-dot color-dot--lg"
                  style={{ background: swatchHex(row.bonus) }}
                />
                <span className="berry-paint-card__color-label">Bonus</span>
                <span className="berry-paint-card__color-name">{row.bonus}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="guide-strip">
        <h3 className="guide-strip__title">Early Pokémon with Crush</h3>
        <ul className="crush-pokemon-row">
          {CRUSH_POKEMON.map((mon) => (
            <li key={mon.name} className="crush-pokemon">
              <img src={mon.sprite} alt="" loading="lazy" />
              <span>{mon.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-strip">
        <h3 className="guide-strip__title">
          Mix paints for {paintCrushMeta.totalColors} colors
        </h3>
        <div className="paint-palette-row" aria-label="18 paint colors">
          {PAINT_PALETTE_18.map((hex, i) => (
            <span
              key={hex + i}
              className="color-dot"
              style={{ background: hex }}
              title={`Color ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
