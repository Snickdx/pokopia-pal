export function GuideHero({ sprite, emoji, title, subtitle }) {
  return (
    <div className="guide-hero">
      {sprite ? (
        <img className="guide-hero__sprite" src={sprite} alt="" />
      ) : (
        <span className="guide-hero__emoji" aria-hidden>
          {emoji}
        </span>
      )}
      <div>
        <p className="guide-hero__title">{title}</p>
        {subtitle ? <p className="guide-hero__subtitle">{subtitle}</p> : null}
      </div>
    </div>
  );
}
