import { useMemo, useRef, useState } from 'react';
import { filterBySearch } from '../../lib/catalog.js';
import {
  getRecommendedRoommatePokemon,
  scorePokemonForRoommates,
} from '../../lib/roommates.js';
import { SearchInput } from '../SearchInput.jsx';
import { PokemonPickerRow } from './PokemonPickerRow.jsx';

const AUTOCOMPLETE_LIMIT = 6;
const RESULT_LIMIT = 40;

export function PokemonSearchPanel({
  pokemonList,
  preferences,
  roommates,
  selectedIds,
  onToggle,
}) {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const totalRoommates = roommates.length;

  const recommended = useMemo(
    () =>
      getRecommendedRoommatePokemon(pokemonList, preferences, {
        limit: 8,
        excludeIds: selectedSet,
        roommates,
      }),
    [pokemonList, preferences, selectedSet, roommates],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const rows = filterBySearch(pokemonList, search, ['name', 'dexDisplay']).slice(
      0,
      RESULT_LIMIT,
    );
    if (!totalRoommates) return rows;
    return [...rows].sort((a, b) => {
      const scoreA = scorePokemonForRoommates(a, roommates).matchCount;
      const scoreB = scorePokemonForRoommates(b, roommates).matchCount;
      return scoreB - scoreA || a.name.localeCompare(b.name);
    });
  }, [pokemonList, search, roommates, totalRoommates]);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return filtered.slice(0, AUTOCOMPLETE_LIMIT);
  }, [filtered, search]);

  const showAutocomplete = focused && search.trim().length > 0 && suggestions.length > 0;
  const showResults = search.trim().length > 0;

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setFocused(false), 150);
  };

  const pickSuggestion = (name) => {
    setSearch(name);
    setFocused(false);
  };

  return (
    <div className="roommate-search-panel">
      <div className="roommate-search-panel__field">
        <SearchInput
          id="roommate-pokemon-search"
          value={search}
          onChange={setSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search Pokémon…"
        />
        {showAutocomplete ? (
          <ul className="roommate-autocomplete" role="listbox">
            {suggestions.map((p) => (
              <li key={p.id} role="option">
                <button
                  type="button"
                  className="roommate-autocomplete__option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(p.name)}
                >
                  <span className="roommate-autocomplete__name">{p.name}</span>
                  {p.dexDisplay ? (
                    <span className="roommate-autocomplete__dex">{p.dexDisplay}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {showResults ? (
        <section className="roommate-search-section roommate-search-section--results">
          <h3 className="roommate-search-section__title">
            Results
            <span className="roommate-search-section__count">{filtered.length}</span>
          </h3>
          <div className="roommate-search-section__scroll scroll-y">
            {filtered.length ? (
              <div className="roommate-pick-list">
                {filtered.map((p) => {
                  const { matchCount } = scorePokemonForRoommates(p, roommates);
                  return (
                    <PokemonPickerRow
                      key={p.id}
                      pokemon={p}
                      selected={selectedSet.has(p.id)}
                      onToggle={onToggle}
                      matchCount={matchCount}
                      totalRoommates={totalRoommates}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="roommate-search-section__empty">No Pokémon match your search.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="roommate-search-section roommate-search-section--recommended">
        <h3 className="roommate-search-section__title">Recommended</h3>
        <p className="roommate-search-section__hint">
          {roommates.length
            ? 'Pokémon that share at least one preference with your current room — sorted by most overlap.'
            : 'Popular preferences across the dex — good starting picks for a shared room.'}
        </p>
        <div className="roommate-search-section__scroll scroll-y">
          {recommended.length ? (
            <div className="roommate-pick-list">
              {recommended.map((p) => {
                const { matchCount } = scorePokemonForRoommates(p, roommates);
                return (
                  <PokemonPickerRow
                    key={p.id}
                    pokemon={p}
                    selected={selectedSet.has(p.id)}
                    onToggle={onToggle}
                    compact
                    matchCount={matchCount}
                    totalRoommates={totalRoommates}
                  />
                );
              })}
            </div>
          ) : (
            <p className="roommate-search-section__empty">
              {roommates.length
                ? 'No other Pokémon share a preference with this room.'
                : 'All recommendations are in your room.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
