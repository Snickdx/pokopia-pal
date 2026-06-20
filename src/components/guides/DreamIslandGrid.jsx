import { GuideIcon, GuideIconRow } from './GuideIcon.jsx';

export function DreamIslandGrid({ islands }) {
  return (
    <div className="dream-island-grid">
      {islands.map((island) => (
        <article
          key={island.id}
          className="dream-island-panel"
          style={{
            '--island-panel': island.panel,
            '--island-border': island.border,
          }}
        >
          <header className="dream-island-panel__head">
            <GuideIcon name={island.doll} size="lg" />
            <h3 className="dream-island-panel__title">{island.doll}</h3>
          </header>
          <GuideIconRow items={island.items} size="sm" />
          <ul className="dream-island-panel__labels">
            {island.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {island.note ? <p className="dream-island-panel__note">{island.note}</p> : null}
        </article>
      ))}
    </div>
  );
}
