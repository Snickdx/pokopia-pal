/** Roommate picker scoring & recommendations (client-side). */

/** How many roommates share at least one favorite with this Pokémon. */
export function scorePokemonForRoommates(pokemon, roommates) {
  if (!roommates?.length || !pokemon) {
    return { matchCount: 0, total: 0 };
  }
  const candidatePrefs = new Set(pokemon.preferenceIds || []);
  const matchCount = roommates.filter((mon) =>
    (mon.preferenceIds || []).some((id) => candidatePrefs.has(id)),
  ).length;
  return { matchCount, total: roommates.length };
}

export function getRecommendedRoommatePokemon(
  pokemonList,
  preferences,
  { limit = 8, excludeIds = new Set(), roommates = [] } = {},
) {
  const roomPrefIds = new Set(
    (roommates || []).flatMap((m) => m.preferenceIds || []),
  );

  if (roomPrefIds.size > 0) {
    return (pokemonList || [])
      .filter((p) => !excludeIds.has(p.id))
      .map((p) => {
        const overlap = (p.preferenceIds || []).filter((id) => roomPrefIds.has(id)).length;
        return { pokemon: p, score: overlap };
      })
      .filter((r) => r.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.pokemon.name.localeCompare(b.pokemon.name),
      )
      .map((r) => r.pokemon);
  }

  const prefPopularity = new Map(
    (preferences || []).map((p) => [p.id, p.counts?.pokemon ?? 0]),
  );

  return (pokemonList || [])
    .filter((p) => !excludeIds.has(p.id))
    .map((p) => {
      const score = (p.preferenceIds || []).reduce(
        (sum, id) => sum + (prefPopularity.get(id) || 0),
        0,
      );
      return { pokemon: p, score };
    })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.pokemon.name.localeCompare(b.pokemon.name),
    )
    .slice(0, limit)
    .map((r) => r.pokemon);
}

/** How many selected roommates share at least one favorite with this item. */
export function scoreItemForRoommates(item, roommates) {
  const itemPrefs = new Set(item?.preferenceIds || []);
  const matchedPokemon = (roommates || []).filter((mon) =>
    (mon.preferenceIds || []).some((id) => itemPrefs.has(id)),
  );
  return {
    matchCount: matchedPokemon.length,
    matchedPokemon,
  };
}

/** How many selected roommates match this habitat via favorites or habitat roster. */
export function scoreHabitatForRoommates(habitat, roommates) {
  const habitatPrefs = new Set(habitat?.preferenceIds || []);
  const habitatMonIds = new Set(habitat?.pokemonIds || []);
  const matchedPokemon = (roommates || []).filter((mon) => {
    const prefOverlap = (mon.preferenceIds || []).some((id) => habitatPrefs.has(id));
    return prefOverlap || habitatMonIds.has(mon.id);
  });
  return {
    matchCount: matchedPokemon.length,
    matchedPokemon,
  };
}

export function rankRoommateItems(items, roommates) {
  return (items || [])
    .map((item) => {
      const { matchCount, matchedPokemon } = scoreItemForRoommates(item, roommates);
      return { item, matchCount, matchedPokemon };
    })
    .filter((row) => row.matchCount > 0)
    .sort(
      (a, b) =>
        b.matchCount - a.matchCount ||
        a.item.name.localeCompare(b.item.name),
    );
}

export function rankRoommateHabitats(habitats, roommates) {
  return (habitats || [])
    .map((habitat) => {
      const { matchCount, matchedPokemon } = scoreHabitatForRoommates(habitat, roommates);
      return { habitat, matchCount, matchedPokemon };
    })
    .filter((row) => row.matchCount > 0)
    .sort(
      (a, b) =>
        b.matchCount - a.matchCount ||
        (a.habitat.title || a.habitat.label || '').localeCompare(
          b.habitat.title || b.habitat.label || '',
        ),
    );
}

/** Combined favorites across roommates with per-preference roommate counts. */
export function rankSharedFavorites(preferences, roommates) {
  const prefById = new Map((preferences || []).map((p) => [p.id, p]));
  const counts = new Map();

  for (const mon of roommates || []) {
    for (const prefId of mon.preferenceIds || []) {
      if (!counts.has(prefId)) counts.set(prefId, new Set());
      counts.get(prefId).add(mon.id);
    }
  }

  return [...counts.entries()]
    .map(([prefId, monIds]) => ({
      preference: prefById.get(prefId) || {
        id: prefId,
        displayName: prefId.replace(/-/g, ' '),
        category: null,
      },
      matchCount: monIds.size,
      matchedPokemon: (roommates || []).filter((m) => monIds.has(m.id)),
    }))
    .sort(
      (a, b) =>
        b.matchCount - a.matchCount ||
        a.preference.displayName.localeCompare(b.preference.displayName),
    );
}
