import categoriesData from '../../data/favoriteCategories.json';

/** Preferences built from the repo JSON export when Firestore is empty or unavailable. */
export function buildPreferencesFromExport() {
  const documents = categoriesData?.documents;
  if (!Array.isArray(documents)) return [];

  const preferences = [];
  for (const cat of documents) {
    for (const fav of cat.favorites || []) {
      const itemIds = (fav.items || []).map((it) => it.slug).filter(Boolean);
      preferences.push({
        id: fav.slug,
        displayName: fav.displayName,
        category: cat.name,
        categoryId: cat.id,
        itemIds,
        habitatIds: [],
        pokemonIds: [],
        counts: {
          habitats: 0,
          items: itemIds.length,
          pokemon: 0,
        },
        sortKey: (fav.displayName || fav.slug || '').toLowerCase(),
      });
    }
  }

  return preferences.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}
