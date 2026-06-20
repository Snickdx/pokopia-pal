import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { habitatImageSrc } from '../../lib/assets.js';
import { habitatTitle, habitatCardItemLines } from '../../lib/normalize.js';
import { habitatPath } from '../../lib/routes.js';
import { useHabitatBookmarks } from '../../hooks/useHabitatBookmarks.js';
import { useNavigationBackState } from '../../hooks/useNavigationBackState.js';
import { BookmarkButton } from '../BookmarkButton.jsx';

export function HabitatCard({ habitat, index = 0, pokemonNames, showBookmark = false }) {
  const src = habitatImageSrc(habitat);
  const title = habitat.title || habitatTitle(habitat.label, habitat.details) || 'Habitat';
  const itemLines = habitatCardItemLines(habitat.label, habitat.details);
  const { isBookmarked, toggleBookmark } = useHabitatBookmarks();
  const bookmarked = isBookmarked(habitat);
  const linkState = useNavigationBackState();

  return (
    <motion.article
      className={`habitat-card card-cozy${showBookmark ? ' habitat-card--bookmarkable' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.35) }}
    >
      {showBookmark ? (
        <BookmarkButton
          className="habitat-card__bookmark"
          bookmarked={bookmarked}
          title={title}
          onToggle={() => toggleBookmark(habitat)}
        />
      ) : null}
      <Link to={habitatPath(habitat)} state={linkState} className="habitat-card__link">
        <div className="habitat-card__image-wrap">
          {src ? (
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ) : (
            <span className="habitat-card__placeholder" aria-hidden>
              🏠
            </span>
          )}
        </div>
        <div className="habitat-card__text">
          {title && <p className="habitat-card__title">{title}</p>}
          {itemLines.length > 0 && (
            <ul className="habitat-card__items" aria-label="Items in habitat">
              {itemLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {pokemonNames?.length > 0 && (
            <p className="habitat-card__pokemon">
              <span className="habitat-card__pokemon-label">Pokémon</span>{' '}
              {pokemonNames.join(', ')}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
