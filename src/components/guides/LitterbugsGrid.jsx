import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { getPokemonList } from '../../lib/catalog.js';
import { catalogKey } from '../../lib/catalogCache.js';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery.js';
import { useNavigationBackState } from '../../hooks/useNavigationBackState.js';
import { pokemonSpriteSrc } from '../../lib/assets.js';
import { pokemonPath } from '../../lib/routes.js';
import { GuideIcon } from './GuideIcon.jsx';

function LitterbugPokemonLink({ pokemon }) {
  const linkState = useNavigationBackState();
  const src = pokemonSpriteSrc(pokemon);

  return (
    <Link
      to={pokemonPath(pokemon)}
      state={linkState}
      className="litterbugs-table__mon"
      title={pokemon.name}
    >
      {src ? (
        <img src={src} alt={pokemon.name} loading="lazy" />
      ) : (
        <span className="litterbugs-table__mon-fallback" aria-hidden>
          ?
        </span>
      )}
    </Link>
  );
}

export function LitterbugsGrid({ categories }) {
  const { data: pokemonList, loading } = useFirestoreQuery(getPokemonList, [], {
    cacheKey: catalogKey('pokemon', 'all'),
  });

  const pokemonById = useMemo(() => {
    const map = new Map();
    for (const pokemon of pokemonList || []) map.set(pokemon.id, pokemon);
    return map;
  }, [pokemonList]);

  return (
    <div className="litterbugs-table-wrap">
      <table className="litterbugs-table">
        <thead>
          <tr>
            <th scope="col" className="litterbugs-table__th litterbugs-table__th--material">
              Material
            </th>
            <th scope="col" className="litterbugs-table__th litterbugs-table__th--pokemon">
              Pokémon
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const pokemon = category.pokemonIds
              .map((id) => pokemonById.get(id))
              .filter(Boolean);

            return (
              <tr key={category.id} className="litterbugs-table__row">
                <th scope="row" className="litterbugs-table__material">
                  <GuideIcon name={category.item} size="md" />
                  <span>{category.item}</span>
                </th>
                <td className="litterbugs-table__pokemon">
                  {loading && !pokemon.length ? (
                    <span className="litterbugs-table__loading">Loading…</span>
                  ) : (
                    <div className="litterbugs-table__mons">
                      {pokemon.map((mon) => (
                        <LitterbugPokemonLink key={mon.id} pokemon={mon} />
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
