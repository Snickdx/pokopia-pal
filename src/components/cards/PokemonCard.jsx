import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pokemonSpriteSrc } from '../../lib/assets.js';
import { pokemonPath } from '../../lib/routes.js';
import { useNavigationBackState } from '../../hooks/useNavigationBackState.js';
import { pokemonAbilityTags } from '../../lib/litterbugs.js';

export function PokemonCard({ pokemon, index = 0, showTags = true }) {
  const src = pokemonSpriteSrc(pokemon);
  const linkState = useNavigationBackState();
  const tags = (pokemon.preferenceLabels || [])
    .slice(0, 2)
    .map((p) => p.category)
    .filter(Boolean);
  const tagParts = [pokemon.ambientLight, ...pokemonAbilityTags(pokemon)].filter(Boolean);

  return (
    <motion.article
      className="pokemon-card card-cozy"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
    >
      <Link to={pokemonPath(pokemon)} state={linkState} className="pokemon-card__link">
        <div className="pokemon-card__sprite">
          {src ? (
            <img src={src} alt="" loading="lazy" />
          ) : (
            <span className="pokemon-card__placeholder" aria-hidden>
              ?
            </span>
          )}
        </div>
        <div className="pokemon-card__body">
          <p className="pokemon-card__dex">{pokemon.dexDisplay}</p>
          <p className="pokemon-card__name">{pokemon.name}</p>
          {showTags && (
            <p className="pokemon-card__tags">
              {tagParts.join(' · ')}
              {tags.length > 0 && `${tagParts.length ? ' · ' : ''}${[...new Set(tags)].join(' · ')}`}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
