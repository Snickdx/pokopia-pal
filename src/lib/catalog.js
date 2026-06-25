import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase.js';
import { buildPreferencesFromExport } from './localCatalog.js';
import {
  habitatDedupSlug,
  habitatTitle,
  isSpecialEncounterHabitat,
} from './normalize.js';
import { cacheFetch, cacheSet, catalogKey } from './catalogCache.js';
import { mergeCraftCatalogItems, getCraftCatalogItem } from './craftCatalog.js';

export {
  habitatTitle,
  habitatDedupSlug,
  isSpecialEncounterHabitat,
} from './normalize.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function col(name) {
  return collection(getDb(), name);
}

async function safeQuery(q) {
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function seedIndividualCache(collection, docs, getId) {
  for (const doc of docs) {
    const id = getId(doc);
    if (id) cacheSet(catalogKey(collection, id), doc);
  }
}

function isLegacyHashId(id) {
  return /^[a-f0-9]{28,32}$/i.test(id || '');
}

function mergeHabitatRecords(a, b) {
  const score = (h) => {
    if (h.routeSlug && h.id === h.routeSlug) return 3;
    if (!isLegacyHashId(h.id)) return 2;
    return 1;
  };
  const primary = score(a) >= score(b) ? a : b;
  const secondary = primary === a ? b : a;
  return {
    ...primary,
    alternateSlugs: [
      ...new Set(
        [
          ...(primary.alternateSlugs || []),
          primary.legacyId,
          secondary.id,
          secondary.legacyId,
          ...(secondary.alternateSlugs || []),
        ].filter(Boolean),
      ),
    ],
    pokemonIds: [...new Set([...(primary.pokemonIds || []), ...(secondary.pokemonIds || [])])],
    preferenceIds: [
      ...new Set([...(primary.preferenceIds || []), ...(secondary.preferenceIds || [])]),
    ],
    completed: Boolean(primary.completed || secondary.completed),
    imagePath: primary.imagePath || secondary.imagePath,
    details:
      (primary.details || '').length >= (secondary.details || '').length
        ? primary.details
        : secondary.details,
  };
}

async function habitatDedupKey(habitat) {
  if (habitat.contentKey) return habitat.contentKey;
  return habitatDedupSlug(habitat.label, habitat.details);
}

/** Collapse legacy hash docs and route-slug docs for the same habitat recipe. */
export async function dedupeHabitats(habitats) {
  const byKey = new Map();
  for (const h of habitats) {
    const key = await habitatDedupKey(h);
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeHabitatRecords(existing, h) : h);
  }
  return [...byKey.values()].sort((a, b) =>
    (a.title || habitatTitle(a.label, a.details) || '').localeCompare(
      b.title || habitatTitle(b.label, b.details) || '',
    ),
  );
}

/** Resolve document by route param (id, routeSlug, or legacy hash id). */
async function getDocByRouteParam(collectionName, param) {
  if (!param || !isFirebaseConfigured()) return null;

  const direct = await getDoc(doc(getDb(), collectionName, param));
  if (direct.exists()) {
    return { id: direct.id, ...direct.data() };
  }

  const lookups = [
    query(col(collectionName), where('legacyId', '==', param), limit(1)),
    query(col(collectionName), where('routeSlug', '==', param), limit(1)),
    query(col(collectionName), where('alternateSlugs', 'array-contains', param), limit(1)),
  ];

  for (const q of lookups) {
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() };
      }
    } catch {
      /* index may be missing for some fields */
    }
  }

  return null;
}

export async function getPreferences() {
  return cacheFetch(catalogKey('preferences', 'all'), fetchPreferences);
}

async function fetchPreferences() {
  const local = buildPreferencesFromExport;

  if (!isFirebaseConfigured()) {
    return local();
  }

  try {
    const q = query(col('preferences'), orderBy('sortKey'));
    const rows = asArray(await safeQuery(q));
    if (rows.length > 0) {
      seedIndividualCache('preference', rows, (d) => d.id);
      return rows;
    }
    return local();
  } catch (err) {
    console.warn('Firestore preferences unavailable, using local export.', err);
    return local();
  }
}

export async function getPreference(idOrSlug) {
  if (!idOrSlug) return null;
  return cacheFetch(catalogKey('preference', idOrSlug), () =>
    getDocByRouteParam('preferences', idOrSlug),
  );
}

export async function getHabitats() {
  return cacheFetch(catalogKey('habitats', 'all'), fetchHabitats);
}

async function fetchHabitats() {
  if (!isFirebaseConfigured()) return [];
  const q = query(col('habitats'), orderBy('title'));
  let rows;
  try {
    rows = await safeQuery(q);
  } catch {
    rows = await safeQuery(col('habitats'));
  }
  const deduped = await dedupeHabitats(rows);
  seedIndividualCache('habitat', deduped, (d) => d.id);
  return deduped;
}

export async function getHabitat(idOrSlug) {
  if (!idOrSlug) return null;
  return cacheFetch(catalogKey('habitat', idOrSlug), () =>
    getDocByRouteParam('habitats', idOrSlug),
  );
}

export async function getHabitatsByIds(ids = []) {
  if (!ids.length) return [];
  const sorted = [...ids].sort().join(',');
  return cacheFetch(catalogKey('habitats', 'ids', sorted), async () => {
    const results = await Promise.all(ids.map((id) => getHabitat(id)));
    return dedupeHabitats(results.filter(Boolean));
  });
}

export async function getItems() {
  return cacheFetch(catalogKey('items', 'all'), fetchItems);
}

async function fetchItems() {
  if (!isFirebaseConfigured()) return mergeCraftCatalogItems([]);
  const q = query(col('items'), orderBy('name'));
  const rows = await safeQuery(q);
  const merged = mergeCraftCatalogItems(rows);
  seedIndividualCache('item', merged, (d) => d.id);
  return merged;
}

export async function getItem(idOrSlug) {
  if (!idOrSlug) return null;
  return cacheFetch(catalogKey('item', idOrSlug), async () => {
    const doc = await getDocByRouteParam('items', idOrSlug);
    return doc || getCraftCatalogItem(idOrSlug);
  });
}

export async function getItemsByIds(ids = []) {
  if (!ids.length) return [];
  const sorted = [...ids].sort().join(',');
  return cacheFetch(catalogKey('items', 'ids', sorted), async () => {
    const results = await Promise.all(ids.map((id) => getItem(id)));
    return results.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  });
}

export async function getPokemonList() {
  return cacheFetch(catalogKey('pokemon', 'all'), fetchPokemonList);
}

async function fetchPokemonList() {
  if (!isFirebaseConfigured()) return [];
  const q = query(col('pokemon'), orderBy('dexSort'), orderBy('name'));
  let rows;
  try {
    rows = await safeQuery(q);
  } catch {
    rows = await safeQuery(col('pokemon'));
  }
  seedIndividualCache('pokemon', rows, (d) => d.id);
  return rows;
}

export async function getPokemon(idOrSlug) {
  if (!idOrSlug) return null;
  return cacheFetch(catalogKey('pokemon', idOrSlug), () =>
    getDocByRouteParam('pokemon', idOrSlug),
  );
}

export async function getPokemonByIds(ids = []) {
  if (!ids.length) return [];
  const sorted = [...ids].sort().join(',');
  return cacheFetch(catalogKey('pokemon', 'ids', sorted), async () => {
    const results = await Promise.all(ids.map((id) => getPokemon(id)));
    return results
      .filter(Boolean)
      .sort((a, b) => (a.dexSort - b.dexSort) || a.name.localeCompare(b.name));
  });
}

export async function getHabitatsForPreference(preference) {
  if (!preference?.habitatIds?.length) return [];
  const idsKey = [...preference.habitatIds].sort().join(',');
  return cacheFetch(
    catalogKey('preference', preference.id, 'habitats', idsKey),
    async () => {
      const habitats = await getHabitatsByIds(preference.habitatIds);
      return habitats.filter((h) => !isSpecialEncounterHabitat(h.label, h.details));
    },
  );
}

export async function getPokemonForPreference(preference) {
  if (!preference?.pokemonIds?.length) return [];
  const idsKey = [...preference.pokemonIds].sort().join(',');
  return cacheFetch(
    catalogKey('preference', preference.id, 'pokemon', idsKey),
    () => getPokemonByIds(preference.pokemonIds),
  );
}

export async function getItemsForPreference(preference) {
  if (!preference?.itemIds?.length) return [];
  const idsKey = [...preference.itemIds].sort().join(',');
  return cacheFetch(
    catalogKey('preference', preference.id, 'items', idsKey),
    () => getItemsByIds(preference.itemIds),
  );
}

export async function getPreferredItemsForPokemon(pokemon) {
  if (!pokemon?.id) return [];
  const prefKey = (pokemon.preferenceIds ?? []).slice().sort().join(',');
  return cacheFetch(
    catalogKey('pokemon', pokemon.id, 'preferred-items', prefKey),
    () => fetchPreferredItemsForPokemon(pokemon),
  );
}

function resolvePreferenceMeta(id, prefById, preferenceLabels) {
  const pref = prefById.get(id);
  const label = (preferenceLabels || []).find((p) => p.slug === id);
  return {
    slug: id,
    displayName: pref?.displayName || label?.displayName || id.replace(/-/g, ' '),
    category: pref?.category || label?.category || null,
  };
}

async function fetchPreferredItemsForPokemon(pokemon) {
  const prefIds = pokemon?.preferenceIds ?? [];
  if (!prefIds.length) return [];

  const prefIdSet = new Set(prefIds);
  const allPrefs = await getPreferences();
  const prefById = new Map(allPrefs.map((p) => [p.id, p]));
  const matched = allPrefs.filter((p) => prefIdSet.has(p.id));

  const itemMap = new Map();
  const itemPrefSources = new Map();

  for (const pref of matched) {
    const items = await getItemsForPreference(pref);
    for (const it of items) {
      if (!itemMap.has(it.id)) itemMap.set(it.id, it);
      if (!itemPrefSources.has(it.id)) itemPrefSources.set(it.id, new Set());
      itemPrefSources.get(it.id).add(pref.id);
    }
  }

  return [...itemMap.values()]
    .map((item) => {
      const prefSlugSet = new Set([
        ...(item.preferenceIds || []).filter((id) => prefIdSet.has(id)),
        ...itemPrefSources.get(item.id),
      ]);

      const preferences = [...prefSlugSet]
        .map((id) => resolvePreferenceMeta(id, prefById, pokemon.preferenceLabels))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));

      return { item, preferences };
    })
    .sort((a, b) => a.item.name.localeCompare(b.item.name));
}

export function searchPreferences(preferences, term) {
  const list = asArray(preferences);
  const t = term.trim().toLowerCase();
  if (!t) return list;
  return list.filter(
    (p) =>
      p.displayName?.toLowerCase().includes(t) ||
      p.category?.toLowerCase().includes(t),
  );
}

export function groupPreferencesByCategory(preferences) {
  const blocks = new Map();
  for (const p of asArray(preferences)) {
    const key = p.category || 'Other';
    if (!blocks.has(key)) blocks.set(key, []);
    blocks.get(key).push(p);
  }
  return [...blocks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({
      category,
      preferences: items.sort((a, b) =>
        (a.sortKey || a.displayName).localeCompare(b.sortKey || b.displayName),
      ),
    }));
}

export function filterBySearch(items, term, fields) {
  const t = term.trim().toLowerCase();
  if (!t) return items;
  return items.filter((item) =>
    fields.some((f) => String(item[f] ?? '').toLowerCase().includes(t)),
  );
}

export async function getPokemonForItemHabitats(item) {
  if (!item?.id) return [];
  return cacheFetch(catalogKey('item', item.id, 'pokemon'), async () => {
    const habitats = await getHabitatsByIds(item?.habitatIds ?? []);
    const ids = new Set();
    for (const h of habitats) {
      for (const pid of h.pokemonIds || []) ids.add(pid);
    }
    return getPokemonByIds([...ids]);
  });
}
