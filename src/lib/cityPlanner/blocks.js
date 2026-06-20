import { itemImageSrc } from '../assets.js';
import { getItemCraftCategory } from '../itemCategories.js';

/** @typedef {'terrain' | 'blocks' | 'buildings' | 'outdoor'} PlannerTileCategory */

/** @typedef {object} PlannerTileDef
 *  @property {string} id
 *  @property {string} label
 *  @property {string|null} itemId
 *  @property {string} icon
 *  @property {string} color
 *  @property {PlannerTileCategory} category
 *  @property {string[]} [legacyIds]
 */

/** @typedef {PlannerTileDef & { imageSrc: string|null, isSynthetic: boolean, itemName: string|null }} PlannerTile */

/** Curated terrain / flooring tiles. */
export const PLANNER_TERRAIN_DEFS = [
  {
    id: 'planner:grass-square',
    label: 'Grass square',
    itemId: null,
    icon: '🟩',
    color: '#7cb86a',
    category: 'terrain',
    legacyIds: ['grass'],
  },
  {
    id: 'asphalt-road',
    label: 'Path',
    itemId: 'asphalt-road',
    icon: '🛤️',
    color: '#c4a574',
    category: 'terrain',
    legacyIds: ['path'],
  },
  {
    id: 'stone-flooring',
    label: 'Stone',
    itemId: 'stone-flooring',
    icon: '🪨',
    color: '#9aa3a8',
    category: 'terrain',
    legacyIds: ['stone'],
  },
  {
    id: 'brick-flooring',
    label: 'Brick',
    itemId: 'brick-flooring',
    icon: '🧱',
    color: '#b8704f',
    category: 'terrain',
    legacyIds: [],
  },
  {
    id: 'simple-flooring',
    label: 'Sand',
    itemId: 'simple-flooring',
    icon: '🏖️',
    color: '#e8c872',
    category: 'terrain',
    legacyIds: ['sand', 'dirt'],
  },
  {
    id: 'tatami-mat',
    label: 'Tatami',
    itemId: 'tatami-mat',
    icon: '🎋',
    color: '#c9b882',
    category: 'terrain',
    legacyIds: [],
  },
  {
    id: 'foundation',
    label: 'Foundation',
    itemId: 'foundation',
    icon: '🏗️',
    color: '#b8a898',
    category: 'terrain',
    legacyIds: ['building'],
  },
  {
    id: 'planner:water',
    label: 'Water',
    itemId: null,
    icon: '💧',
    color: '#5ba4d9',
    category: 'terrain',
    legacyIds: ['water'],
  },
  {
    id: 'planner:cliff',
    label: 'Cliff',
    itemId: null,
    icon: '⛰️',
    color: '#6b5d54',
    category: 'terrain',
    legacyIds: ['cliff'],
  },
  {
    id: 'planner:forest',
    label: 'Forest',
    itemId: null,
    icon: '🌲',
    color: '#4a8f5c',
    category: 'terrain',
    legacyIds: ['forest'],
  },
  {
    id: 'planner:flower',
    label: 'Flowers',
    itemId: null,
    icon: '🌸',
    color: '#8ecf7a',
    category: 'terrain',
    legacyIds: ['flower'],
  },
  {
    id: 'planner:bridge',
    label: 'Bridge',
    itemId: null,
    icon: '🌉',
    color: '#b8895a',
    category: 'terrain',
    legacyIds: ['bridge'],
  },
  {
    id: 'planner:empty',
    label: 'Empty',
    itemId: null,
    icon: '⬜',
    color: '#f0ead6',
    category: 'terrain',
    legacyIds: ['empty'],
  },
];

/** @deprecated */
export const PLANNER_TILE_DEFS = PLANNER_TERRAIN_DEFS;

/** One-time migration: grass-flooring was previously the only terrain grass tile. */
export const LEGACY_TERRAIN_GRASS_BLOCK_ID = 'grass-flooring';

export const DEFAULT_TILE_ID = 'planner:grass-square';

export const DEFAULT_SECONDARY_TILE_ID = 'asphalt-road';

/** @deprecated Use DEFAULT_TILE_ID */
export const DEFAULT_BLOCK_ID = DEFAULT_TILE_ID;

/** Catalog craft categories surfaced in the planner palette (after terrain). */
const PLANNER_CATALOG_SECTIONS = [
  {
    category: 'blocks',
    craftCategory: 'Blocks',
    icon: '🧱',
    color: '#a89888',
  },
  {
    category: 'buildings',
    craftCategory: 'Buildings',
    icon: '🏠',
    color: '#c4b5a5',
  },
  {
    category: 'outdoor',
    craftCategory: 'Outdoor',
    icon: '🏕️',
    color: '#b8c9a8',
  },
];

const staticTileIds = new Set(PLANNER_TERRAIN_DEFS.map((d) => d.id));
const curatedItemIds = new Set(
  PLANNER_TERRAIN_DEFS.map((d) => d.itemId).filter(Boolean),
);

const legacyToTileId = new Map();
for (const def of PLANNER_TERRAIN_DEFS) {
  legacyToTileId.set(def.id, def.id);
  for (const legacy of def.legacyIds || []) {
    legacyToTileId.set(legacy, def.id);
  }
}

const FALLBACK_BY_CATEGORY = Object.fromEntries(
  PLANNER_CATALOG_SECTIONS.map((s) => [s.category, s.color]),
);

function resolveItem(itemId, byId, bySlug) {
  if (!itemId) return null;
  return byId.get(itemId) || bySlug.get(itemId) || null;
}

function defToTile(def, item) {
  return {
    ...def,
    isSynthetic: !def.itemId,
    imageSrc: item ? itemImageSrc(item) : null,
    itemName: item?.name ?? null,
  };
}

const PLANNER_BLOCK_LABELS = {
  'grass-flooring': 'Grass block',
};

/** @param {import('../catalog.js').Item} item @param {PlannerTileCategory} category @param {object} meta */
function catalogItemToTile(item, category, meta) {
  return {
    id: item.id,
    label: PLANNER_BLOCK_LABELS[item.id] ?? item.name,
    itemId: item.id,
    icon: meta.icon,
    color: meta.color,
    category,
    legacyIds: [],
    isSynthetic: false,
    imageSrc: itemImageSrc(item),
    itemName: item.name,
  };
}

function itemsForCraftCategory(items, craftCategory, usedIds) {
  return (items || [])
    .filter((item) => {
      if (usedIds.has(item.id)) return false;
      return getItemCraftCategory(item) === craftCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** @param {import('../catalog.js').Item[]|null|undefined} items */
export function buildPlannerTiles(items) {
  const byId = new Map();
  const bySlug = new Map();
  for (const item of items || []) {
    byId.set(item.id, item);
    if (item.slug) bySlug.set(item.slug, item);
  }

  const terrainTiles = PLANNER_TERRAIN_DEFS.map((def) =>
    defToTile(def, resolveItem(def.itemId, byId, bySlug)),
  );

  const usedIds = new Set(curatedItemIds);
  const catalogTiles = [];

  for (const section of PLANNER_CATALOG_SECTIONS) {
    const matches = itemsForCraftCategory(items, section.craftCategory, usedIds);
    for (const item of matches) {
      usedIds.add(item.id);
      catalogTiles.push(catalogItemToTile(item, section.category, section));
    }
  }

  return [...terrainTiles, ...catalogTiles];
}

/** @param {PlannerTile[]} tiles */
export function plannerTilesById(tiles) {
  return new Map(tiles.map((tile) => [tile.id, tile]));
}

/** @param {string} id */
export function normalizeTileId(id) {
  if (!id || typeof id !== 'string') return DEFAULT_TILE_ID;
  if (staticTileIds.has(id)) return id;
  if (legacyToTileId.has(id)) return legacyToTileId.get(id);
  if (!id.startsWith('planner:')) return id;
  return DEFAULT_TILE_ID;
}

/** @param {string} id @param {Map<string, PlannerTile>|null} [tilesById] */
export function isValidTileId(id, tilesById = null) {
  const normalized = normalizeTileId(id);
  if (staticTileIds.has(normalized)) return true;
  if (tilesById?.has(normalized)) return true;
  if (!normalized.startsWith('planner:') && normalized !== DEFAULT_TILE_ID) return true;
  return false;
}

/** @deprecated */
export function isValidBlockId(id) {
  return isValidTileId(id);
}

/** @param {string} id @param {Map<string, PlannerTile>} tilesById */
export function getPlannerTile(id, tilesById) {
  const normalized = normalizeTileId(id);
  const tile = tilesById.get(normalized);
  if (tile) return tile;
  if (staticTileIds.has(normalized)) {
    const def = PLANNER_TERRAIN_DEFS.find((d) => d.id === normalized);
    return def ? { ...def, isSynthetic: !def.itemId, imageSrc: null, itemName: null } : null;
  }
  if (!normalized.startsWith('planner:')) {
    return {
      id: normalized,
      label: normalized,
      itemId: normalized,
      icon: '📦',
      color: FALLBACK_BY_CATEGORY.outdoor,
      category: 'outdoor',
      isSynthetic: false,
      imageSrc: null,
      itemName: null,
    };
  }
  return tilesById.get(DEFAULT_TILE_ID) ?? null;
}

/** @param {PlannerTileCategory} category */
export function isPropTileCategory(category) {
  return category === 'outdoor' || category === 'buildings';
}

export function isEmptyTileId(id) {
  return normalizeTileId(id) === 'planner:empty';
}

/** Blocks and terrain render as solid grid colors; buildings/outdoor use sprites. */
export function tileUsesGridColor(tile) {
  if (!tile || isEmptyTileId(tile.id)) return false;
  return tile.category === 'blocks' || tile.category === 'terrain';
}

/** Buildings and outdoor props render sprites on the grid. */
export function tileUsesSpriteOnGrid(tile) {
  if (!tile || isEmptyTileId(tile.id)) return false;
  if (tile.category === 'blocks' || tile.category === 'terrain') return false;
  return Boolean(tile.imageSrc);
}

/** @deprecated */
export function getCityBlock(id) {
  const def = PLANNER_TERRAIN_DEFS.find((d) => d.id === normalizeTileId(id));
  return def ?? PLANNER_TERRAIN_DEFS[0];
}

/** @deprecated */
export const CITY_BLOCKS = PLANNER_TERRAIN_DEFS;
