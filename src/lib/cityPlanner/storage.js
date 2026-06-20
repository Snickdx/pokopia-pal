import {
  DEFAULT_SECONDARY_TILE_ID,
  DEFAULT_TILE_ID,
  isValidTileId,
  LEGACY_TERRAIN_GRASS_BLOCK_ID,
  normalizeTileId,
} from './blocks.js';
import { clampSize, createEmptyGrid, DEFAULT_GRID_SIZE } from './grid.js';

const STORAGE_KEY = 'pokopia-city-planner';

/** @typedef {{ width: number, height: number, cells: string[], activeBlockId: string, secondaryBlockId: string }} CityPlannerState */

function migrateStoredTileId(id) {
  if (id === LEGACY_TERRAIN_GRASS_BLOCK_ID) return DEFAULT_TILE_ID;
  return normalizeTileId(id);
}

function normalizeCells(cells, width, height) {
  const expected = width * height;
  if (!Array.isArray(cells) || cells.length !== expected) {
    return createEmptyGrid(width, height);
  }
  return cells.map((id) => migrateStoredTileId(id));
}

function normalizeBrushId(id, fallback) {
  const normalized = migrateStoredTileId(id);
  return isValidTileId(normalized) ? normalized : fallback;
}

/** @returns {CityPlannerState | null} */
export function loadCityPlanner() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const width = clampSize(parsed?.width);
    const height = clampSize(parsed?.height);
    const cells = normalizeCells(parsed?.cells, width, height);
    return {
      width,
      height,
      cells,
      activeBlockId: normalizeBrushId(parsed?.activeBlockId, DEFAULT_TILE_ID),
      secondaryBlockId: normalizeBrushId(
        parsed?.secondaryBlockId,
        DEFAULT_SECONDARY_TILE_ID,
      ),
    };
  } catch {
    return null;
  }
}

/** @param {CityPlannerState} state */
export function saveCityPlanner(state) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        width: state.width,
        height: state.height,
        cells: state.cells.map(normalizeTileId),
        activeBlockId: normalizeTileId(state.activeBlockId),
        secondaryBlockId: normalizeTileId(state.secondaryBlockId),
      }),
    );
  } catch {
    // Ignore quota / privacy mode errors.
  }
}

/** @returns {CityPlannerState} */
export function createDefaultPlannerState(width = DEFAULT_GRID_SIZE, height = DEFAULT_GRID_SIZE) {
  const w = clampSize(width);
  const h = clampSize(height);
  return {
    width: w,
    height: h,
    cells: createEmptyGrid(w, h),
    activeBlockId: DEFAULT_TILE_ID,
    secondaryBlockId: DEFAULT_SECONDARY_TILE_ID,
  };
}
