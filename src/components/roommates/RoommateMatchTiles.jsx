import { Link } from 'react-router-dom';
import { itemHasImage, preferenceImageSrc } from '../../lib/assets.js';
import { ItemImage } from '../ItemImage.jsx';
import { itemPath, preferencePath } from '../../lib/routes.js';
import { TagPill } from '../TagPill.jsx';
import { HabitatCard } from '../cards/HabitatCard.jsx';
import { ItemMetaPills } from '../ItemCategoryPill.jsx';

export function RoommateMatchBadge({ matchCount, total, className = '' }) {
  if (!total) return null;
  return (
    <span
      className={`roommate-match-badge${className ? ` ${className}` : ''}`}
      title={`Matches ${matchCount} of ${total} roommates`}
    >
      {matchCount}/{total}
    </span>
  );
}

export function RoommateHabitatTile({ row, totalRoommates, index = 0 }) {
  const { habitat, matchCount, matchedPokemon } = row;
  const pokemonNames = matchedPokemon?.map((m) => m.name);

  return (
    <div className="roommate-tile">
      <HabitatCard habitat={habitat} index={index} pokemonNames={pokemonNames} />
      <RoommateMatchBadge
        matchCount={matchCount}
        total={totalRoommates}
        className="roommate-tile__badge"
      />
    </div>
  );
}

export function RoommateItemTile({ row, totalRoommates }) {
  const { item, matchCount, matchedPokemon } = row;
  return (
    <article className="roommate-catalog-tile card-cozy">
      <Link to={itemPath(item)} className="roommate-catalog-tile__link">
        <div className="roommate-catalog-tile__image-wrap">
          {itemHasImage(item) ? (
            <ItemImage item={item} loading="lazy" decoding="async" />
          ) : (
            <span className="roommate-catalog-tile__placeholder" aria-hidden>
              ?
            </span>
          )}
          <RoommateMatchBadge
            matchCount={matchCount}
            total={totalRoommates}
            className="roommate-tile__badge"
          />
        </div>
        <div className="roommate-catalog-tile__body">
          <p className="roommate-catalog-tile__title">{item.name}</p>
          <ItemMetaPills item={item} className="roommate-catalog-tile__cat" />
          {matchedPokemon?.length ? (
            <p className="roommate-catalog-tile__meta">
              {matchedPokemon.map((m) => m.name).join(', ')}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

export function RoommateFavoriteTile({ row, totalRoommates, itemsById }) {
  const { preference, matchCount, matchedPokemon } = row;
  const src = preferenceImageSrc(preference, itemsById);

  return (
    <article className="roommate-catalog-tile card-cozy">
      <Link
        to={preferencePath({ id: preference.id }, 'items')}
        className="roommate-catalog-tile__link"
      >
        <div className="roommate-catalog-tile__image-wrap">
          {src ? (
            <img src={src} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className="roommate-catalog-tile__placeholder" aria-hidden>
              ♥
            </span>
          )}
          <RoommateMatchBadge
            matchCount={matchCount}
            total={totalRoommates}
            className="roommate-tile__badge"
          />
        </div>
        <div className="roommate-catalog-tile__body">
          <p className="roommate-catalog-tile__title">{preference.displayName}</p>
          {preference.category ? (
            <TagPill variant="pref" className="roommate-catalog-tile__cat">
              {preference.category}
            </TagPill>
          ) : null}
          {matchedPokemon?.length ? (
            <p className="roommate-catalog-tile__meta">
              {matchedPokemon.map((m) => m.name).join(', ')}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
