import { pokemonSpriteSrc } from '../../lib/assets.js';

export function RoommateChip({ pokemon, onRemove }) {
  const src = pokemonSpriteSrc(pokemon);

  return (
    <span className="roommate-chip">
      <span className="roommate-chip__sprite">
        {src ? <img src={src} alt="" /> : <span aria-hidden>?</span>}
      </span>
      <span className="roommate-chip__name">{pokemon.name}</span>
      <button
        type="button"
        className="roommate-chip__remove"
        onClick={() => onRemove(pokemon)}
        aria-label={`Remove ${pokemon.name} from room`}
      >
        ×
      </button>
    </span>
  );
}
