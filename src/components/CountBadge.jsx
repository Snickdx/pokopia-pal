const VARIANTS = {
  habitats: 'habitats',
  items: 'items',
  pokemon: 'pokemon',
};

export function CountBadge({ count, type = 'habitats', label }) {
  const variant = VARIANTS[type] || type;
  const text = label ?? `${count} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return <span className={`count-badge count-badge--${variant}`}>{text}</span>;
}

export function CountBadgeGroup({ counts }) {
  if (!counts) return null;
  return (
    <div className="count-badge-group">
      <CountBadge count={counts.habitats} type="habitats" label={`${counts.habitats} Habitats`} />
      <CountBadge count={counts.items} type="items" label={`${counts.items} Items`} />
      <CountBadge count={counts.pokemon} type="pokemon" label={`${counts.pokemon} Pokémon`} />
    </div>
  );
}
