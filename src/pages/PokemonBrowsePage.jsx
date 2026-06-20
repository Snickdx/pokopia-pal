import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPokemonList, getPreferences } from '../lib/catalog.js';
import {
  buildPokemonBrowseSearchParams,
  parsePokemonBrowseParams,
} from '../lib/pokemonBrowseParams.js';
import {
  buildPokemonAbilityOptions,
  buildPokemonFavoriteOptions,
  buildPokemonFilterCounts,
  filterPokemonList,
  searchPokemonList,
} from '../lib/pokemonFilters.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { SearchInput } from '../components/SearchInput.jsx';
import {
  PokemonAbilityMultiFilter,
  PokemonEnvironmentFilter,
  PokemonFavoriteFilter,
} from '../components/PokemonFilter.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { PokemonCard } from '../components/cards/PokemonCard.jsx';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

export function PokemonBrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => parsePokemonBrowseParams(searchParams),
    [searchParams],
  );

  const patchFilters = useCallback(
    (patch) => {
      setSearchParams(
        buildPokemonBrowseSearchParams({ ...filters, ...patch }),
        { replace: true },
      );
    },
    [filters, setSearchParams],
  );

  const { data, loading, error } = useFirestoreQuery(getPokemonList, [], {
    cacheKey: catalogKey('pokemon', 'all'),
  });
  const prefsQuery = useFirestoreQuery(getPreferences, [], {
    cacheKey: catalogKey('preferences', 'all'),
  });

  const filterCounts = useMemo(
    () => buildPokemonFilterCounts(data || []),
    [data],
  );

  const abilityOptions = useMemo(
    () => buildPokemonAbilityOptions(data || []),
    [data],
  );

  const favoriteOptions = useMemo(
    () => buildPokemonFavoriteOptions(prefsQuery.data, data || []),
    [prefsQuery.data, data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const searched = searchPokemonList(data, filters.search);
    return filterPokemonList(searched, filters);
  }, [data, filters]);

  if (loading) {
    return (
      <section className="browse-page glass-panel page-frame">
        <LoadingState label="Loading Pokémon…" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="browse-page glass-panel page-frame page-frame--center">
        <ErrorState message={error.message} />
      </section>
    );
  }

  return (
    <section className="browse-page glass-panel">
      <header className="browse-page__header">
        <h2 className="browse-page__title">All Pokémon</h2>
        <SearchInput
          value={filters.search}
          onChange={(search) => patchFilters({ search })}
          placeholder="Search name, dex #, ability, preference…"
        />
        <div className="browse-page__pokemon-filters">
          <div className="browse-page__pokemon-meta-row">
            <PokemonEnvironmentFilter
              value={filters.environment}
              onChange={(environment) => patchFilters({ environment })}
              counts={filterCounts.environment}
            />
            <PokemonFavoriteFilter
              value={filters.favorite}
              onChange={(favorite) => patchFilters({ favorite })}
              options={favoriteOptions}
            />
          </div>
          <PokemonAbilityMultiFilter
            value={filters.abilities}
            onChange={(abilities) => patchFilters({ abilities })}
            options={abilityOptions}
            counts={filterCounts.ability}
          />
        </div>
      </header>
      <div className="browse-page__scroll scroll-y">
        {!filtered.length ? (
          <EmptyState title="No Pokémon found" />
        ) : (
          <CardGrid variant="pokemon">
            {filtered.map((p, i) => (
              <PokemonCard key={p.id} pokemon={p} index={i} />
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  );
}
