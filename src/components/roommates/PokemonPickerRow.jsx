import { pokemonSpriteSrc } from '../../lib/assets.js';
import { RoommateMatchBadge } from './RoommateMatchTiles.jsx';

export function PokemonPickerRow({
  pokemon,
  selected,
  onToggle,
  compact = false,
  matchCount,
  totalRoommates,
}) {
  const src = pokemonSpriteSrc(pokemon);
  const inputId = `roommate-pick-${pokemon.id}`;
  const showRating = totalRoommates > 0 && matchCount != null;

  return (
    <label
      className={`roommate-pick-row${selected ? ' roommate-pick-row--selected' : ''}${compact ? ' roommate-pick-row--compact' : ''}`}
      htmlFor={inputId}
    >
      <input
        id={inputId}
        type="checkbox"
        className="roommate-pick-row__check"
        checked={selected}
        onChange={() => onToggle(pokemon)}
      />
      <span className="roommate-pick-row__sprite">
        {src ? (
          <img src={src} alt="" loading="lazy" />
        ) : (
          <span aria-hidden>?</span>
        )}
      </span>
      <span className="roommate-pick-row__body">
        <span className="roommate-pick-row__name">{pokemon.name}</span>
        {!compact && pokemon.dexDisplay ? (
          <span className="roommate-pick-row__dex">{pokemon.dexDisplay}</span>
        ) : null}
      </span>
      {showRating ? (
        <RoommateMatchBadge matchCount={matchCount} total={totalRoommates} />
      ) : null}
    </label>
  );
}