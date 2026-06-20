import { DEFAULT_TILE_ID, isValidTileId, normalizeTileId } from './blocks.js';

export const MIN_GRID_SIZE = 4;
export const MAX_GRID_SIZE = 48;
export const DEFAULT_GRID_SIZE = 16;

/** @returns {string[]} */
export function createEmptyGrid(width, height, fill = DEFAULT_TILE_ID) {
  const w = clampSize(width);
  const h = clampSize(height);
  return Array.from({ length: w * h }, () => fill);
}

export function clampSize(value) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return DEFAULT_GRID_SIZE;
  return Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, n));
}

/** @param {string[]} cells @param {number} width @param {number} height */
export function resizeGrid(cells, oldWidth, oldHeight, newWidth, newHeight) {
  const w = clampSize(newWidth);
  const h = clampSize(newHeight);
  const next = createEmptyGrid(w, h);
  const copyW = Math.min(oldWidth, w);
  const copyH = Math.min(oldHeight, h);

  for (let y = 0; y < copyH; y += 1) {
    for (let x = 0; x < copyW; x += 1) {
      const oldIdx = y * oldWidth + x;
      const newIdx = y * w + x;
      const cell = cells[oldIdx];
      next[newIdx] = isValidTileId(cell) ? normalizeTileId(cell) : DEFAULT_TILE_ID;
    }
  }

  return next;
}

export function getCellIndex(x, y, width) {
  return y * width + x;
}

export function setCell(cells, x, y, width, height, blockId) {
  if (x < 0 || y < 0 || x >= width || y >= height) return cells;
  const idx = getCellIndex(x, y, width);
  if (cells[idx] === blockId) return cells;
  const next = cells.slice();
  next[idx] = blockId;
  return next;
}

export function fillRect(cells, x0, y0, x1, y1, width, height, blockId) {
  const minX = Math.max(0, Math.min(x0, x1));
  const maxX = Math.min(width - 1, Math.max(x0, x1));
  const minY = Math.max(0, Math.min(y0, y1));
  const maxY = Math.min(height - 1, Math.max(y0, y1));
  const next = cells.slice();
  let changed = false;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const idx = getCellIndex(x, y, width);
      if (next[idx] !== blockId) {
        next[idx] = blockId;
        changed = true;
      }
    }
  }

  return changed ? next : cells;
}

/** Flood-fill connected cells matching the clicked tile. */
export function floodFill(cells, x, y, width, height, fillId) {
  if (x < 0 || y < 0 || x >= width || y >= height) return cells;
  const startIdx = getCellIndex(x, y, width);
  const targetId = cells[startIdx];
  if (targetId === fillId) return cells;

  const next = cells.slice();
  const stack = [[x, y]];
  const seen = new Set();
  let changed = false;

  while (stack.length) {
    const [cx, cy] = stack.pop();
    const key = `${cx},${cy}`;
    if (seen.has(key)) continue;
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

    const idx = getCellIndex(cx, cy, width);
    if (next[idx] !== targetId) continue;

    seen.add(key);
    next[idx] = fillId;
    changed = true;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }

  return changed ? next : cells;
}
