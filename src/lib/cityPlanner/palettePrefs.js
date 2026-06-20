const STORAGE_KEY = 'pokopia-planner-palette';

export const PALETTE_SECTION_IDS = ['terrain-blocks', 'buildings-outdoor'];

/** @typedef {'terrain-blocks' | 'buildings-outdoor'} PaletteSectionId */

export const PALETTE_SECTION_META = {
  'terrain-blocks': {
    title: 'Blocks & terrain',
    hint: 'Flooring, roads, walls, and land tiles.',
  },
  'buildings-outdoor': {
    title: 'Buildings & outdoor',
    hint: 'Structures, props, and decorations.',
  },
};

/** @type {Record<'terrain' | 'blocks' | 'buildings' | 'outdoor', PaletteSectionId>} */
export const TILE_CATEGORY_TO_PALETTE_SECTION = {
  terrain: 'terrain-blocks',
  blocks: 'terrain-blocks',
  buildings: 'buildings-outdoor',
  outdoor: 'buildings-outdoor',
};

/** @returns {Record<PaletteSectionId, string[]>} */
function emptyTileOrder() {
  return {
    'terrain-blocks': [],
    'buildings-outdoor': [],
  };
}

/** @param {unknown} value @returns {Record<PaletteSectionId, string[]>} */
function normalizeTileOrder(value) {
  const base = emptyTileOrder();
  if (!value || typeof value !== 'object') return base;
  for (const id of PALETTE_SECTION_IDS) {
    const list = value[id];
    base[id] = Array.isArray(list) ? list.filter((entry) => typeof entry === 'string') : [];
  }
  return base;
}

/** @param {Record<string, string[]>} raw */
function migrateLegacyTileOrder(raw) {
  const hasLegacy =
    Array.isArray(raw.terrain) ||
    Array.isArray(raw.blocks) ||
    Array.isArray(raw.buildings) ||
    Array.isArray(raw.outdoor);
  if (!hasLegacy) return normalizeTileOrder(raw);

  const dedupe = (ids) => [...new Set(ids.filter((id) => typeof id === 'string'))];

  return {
    'terrain-blocks': dedupe([...(raw.terrain ?? []), ...(raw.blocks ?? [])]),
    'buildings-outdoor': dedupe([...(raw.buildings ?? []), ...(raw.outdoor ?? [])]),
  };
}

/** @returns {{ tileOrder: Record<PaletteSectionId, string[]> }} */
export function loadPalettePrefs() {
  if (typeof localStorage === 'undefined') {
    return { tileOrder: emptyTileOrder() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tileOrder: emptyTileOrder() };
    const parsed = JSON.parse(raw);
    if (parsed?.sectionOrder) {
      return { tileOrder: emptyTileOrder() };
    }
    return { tileOrder: migrateLegacyTileOrder(parsed?.tileOrder ?? {}) };
  } catch {
    return { tileOrder: emptyTileOrder() };
  }
}

/** @param {{ tileOrder: Record<PaletteSectionId, string[]> }} prefs */
export function savePalettePrefs(prefs) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tileOrder: normalizeTileOrder(prefs.tileOrder) }),
    );
  } catch {
    // Ignore quota errors.
  }
}

/** @param {{ id: string }[]} tiles @param {PaletteSectionId} category @param {Record<PaletteSectionId, string[]>} tileOrder */
export function orderTilesForCategory(tiles, category, tileOrder) {
  const saved = tileOrder[category];
  if (!saved?.length) return tiles;
  const byId = new Map(tiles.map((tile) => [tile.id, tile]));
  const ordered = [];
  for (const id of saved) {
    const tile = byId.get(id);
    if (tile) {
      ordered.push(tile);
      byId.delete(id);
    }
  }
  for (const tile of byId.values()) ordered.push(tile);
  return ordered;
}

/** @param {string[]} ids @param {number} fromIndex @param {number} toIndex */
export function reorderTileIds(ids, fromIndex, toIndex) {
  if (fromIndex === toIndex) return ids;
  const next = [...ids];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
