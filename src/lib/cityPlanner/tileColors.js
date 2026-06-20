import gridColorMap from '../../data/blockGridColors.json';
import { hashTileColor, sampleSpriteGridColor } from './spriteColor.js';

const colorCache = new Map();
const staticById = gridColorMap.byId || {};

export { hashTileColor } from './spriteColor.js';

export function getStaticGridColor(id) {
  return staticById[id] || null;
}

/**
 * Extract a block-face color from a catalog sprite (browser fallback).
 * @param {string|null|undefined} imageUrl
 * @param {string} [fallbackId]
 */
export function extractBlockColor(imageUrl, fallbackId = '') {
  if (fallbackId && staticById[fallbackId]) {
    return Promise.resolve(staticById[fallbackId]);
  }
  if (!imageUrl) return Promise.resolve(fallbackId ? hashTileColor(fallbackId) : null);
  if (colorCache.has(imageUrl)) return colorCache.get(imageUrl);

  const promise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 72;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallbackId ? staticById[fallbackId] || hashTileColor(fallbackId) : null);
          return;
        }
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const color =
          sampleSpriteGridColor(data, size, size) ??
          (fallbackId ? staticById[fallbackId] || hashTileColor(fallbackId) : null);
        resolve(color);
      } catch {
        resolve(fallbackId ? staticById[fallbackId] || hashTileColor(fallbackId) : null);
      }
    };

    img.onerror = () => {
      resolve(fallbackId ? staticById[fallbackId] || hashTileColor(fallbackId) : null);
    };

    img.src = imageUrl;
  });

  colorCache.set(imageUrl, promise);
  return promise;
}

/** @deprecated */
export const extractPrimaryColor = extractBlockColor;

/** @param {import('./blocks.js').PlannerTile[]} tiles */
export async function enrichTilesWithPrimaryColors(tiles) {
  return Promise.all(
    tiles.map(async (tile) => {
      const usesSampledColor =
        (tile.category === 'blocks' || tile.category === 'terrain') &&
        (tile.imageSrc || staticById[tile.id]);

      if (!usesSampledColor) return tile;

      const staticColor = staticById[tile.id];
      if (staticColor) return { ...tile, color: staticColor };

      if (!tile.imageSrc) return tile;

      const color = await extractBlockColor(tile.imageSrc, tile.id);
      return color ? { ...tile, color } : tile;
    }),
  );
}
