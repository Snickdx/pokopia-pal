import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getHabitats,
  getItems,
  getPokemonList,
  getPreferences,
} from '../lib/catalog.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { PokemonSearchPanel } from '../components/roommates/PokemonSearchPanel.jsx';
import { RoommatePanel } from '../components/roommates/RoommatePanel.jsx';
import { loadRoommateIds, saveRoommateIds } from '../lib/roommateStorage.js';

const MOBILE_ROOMMATES_QUERY = '(max-width: 899px)';

export function RoommatesPage() {
  const [selectedIds, setSelectedIds] = useState(loadRoommateIds);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE_ROOMMATES_QUERY);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  useEffect(() => {
    if (!isMobile) setPickerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    saveRoommateIds(selectedIds);
  }, [selectedIds]);

  const pokemonQuery = useFirestoreQuery(getPokemonList, [], {
    cacheKey: catalogKey('pokemon', 'all'),
  });
  const prefsQuery = useFirestoreQuery(getPreferences, [], {
    cacheKey: catalogKey('preferences', 'all'),
  });
  const itemsQuery = useFirestoreQuery(getItems, [], {
    cacheKey: catalogKey('items', 'all'),
  });
  const habitatsQuery = useFirestoreQuery(getHabitats, [], {
    cacheKey: catalogKey('habitats', 'all'),
  });

  const loading =
    pokemonQuery.loading ||
    prefsQuery.loading ||
    itemsQuery.loading ||
    habitatsQuery.loading;
  const error =
    pokemonQuery.error ||
    prefsQuery.error ||
    itemsQuery.error ||
    habitatsQuery.error;

  const pokemonById = useMemo(() => {
    const map = new Map();
    for (const p of pokemonQuery.data || []) map.set(p.id, p);
    return map;
  }, [pokemonQuery.data]);

  useEffect(() => {
    if (!pokemonQuery.data?.length) return;
    const valid = new Set(pokemonQuery.data.map((p) => p.id));
    setSelectedIds((ids) => {
      const filtered = ids.filter((id) => valid.has(id));
      return filtered.length === ids.length ? ids : filtered;
    });
  }, [pokemonQuery.data]);

  const roommates = useMemo(
    () => selectedIds.map((id) => pokemonById.get(id)).filter(Boolean),
    [selectedIds, pokemonById],
  );

  const togglePokemon = useCallback((pokemon) => {
    setSelectedIds((ids) =>
      ids.includes(pokemon.id)
        ? ids.filter((id) => id !== pokemon.id)
        : [...ids, pokemon.id],
    );
  }, []);

  const removePokemon = useCallback((pokemon) => {
    setSelectedIds((ids) => ids.filter((id) => id !== pokemon.id));
  }, []);

  if (loading) {
    return <LoadingState label="Loading roommate data…" />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <>
      {isMobile && pickerOpen ? (
        <button
          type="button"
          className="sidebar-backdrop sidebar-backdrop--visible"
          aria-label="Close Pokémon search"
          onClick={closePicker}
        />
      ) : null}

      <aside
        className={`roommates-layout__picker glass-panel${
          isMobile && pickerOpen ? ' roommates-layout__picker--open' : ''
        }`}
      >
        {isMobile ? (
          <header className="roommates-picker__head">
            <h3 className="roommates-picker__title">Add Pokémon</h3>
            <button
              type="button"
              className="roommates-picker__close"
              aria-label="Close search"
              onClick={closePicker}
            >
              ✕
            </button>
          </header>
        ) : null}
        <PokemonSearchPanel
          pokemonList={pokemonQuery.data || []}
          preferences={prefsQuery.data || []}
          roommates={roommates}
          selectedIds={selectedIds}
          onToggle={togglePokemon}
        />
      </aside>

      <main className="roommates-layout__room">
        <RoommatePanel
          roommates={roommates}
          onRemove={removePokemon}
          habitats={habitatsQuery.data || []}
          items={itemsQuery.data || []}
          preferences={prefsQuery.data || []}
          isMobile={isMobile}
          onOpenPicker={openPicker}
        />
      </main>
    </>
  );
}
