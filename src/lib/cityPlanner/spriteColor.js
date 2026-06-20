export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`;
}

export function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

export function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Weight pixels on the top face of isometric block sprites. */
export function isometricTopFaceWeight(x, y, width, height) {
  const nx = x / Math.max(width - 1, 1);
  const ny = y / Math.max(height - 1, 1);

  if (ny > 0.62) return 0.12;

  const topBand = 1.15 - ny * 0.95;
  const centerBand = 1.05 - Math.abs(nx - 0.5) * 1.1;
  return Math.max(0.08, topBand * centerBand);
}

/**
 * Sample a representative grid color from raw RGBA sprite pixels.
 * Biased toward the top face of isometric cubes and saturated surface colors.
 * @param {Uint8Array|Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 */
export function sampleSpriteGridColor(data, width, height) {
  const buckets = new Map();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a < 120) continue;

      const lum = luminance(r, g, b);
      if (lum > 252 || lum < 8) continue;

      const sat = saturation(r, g, b);
      if (sat < 0.05 && lum > 225) continue;
      if (sat < 0.04 && lum < 28) continue;

      const faceWeight = isometricTopFaceWeight(x, y, width, height);
      const weight = faceWeight * (0.45 + sat * 2.2 + (lum > 40 && lum < 230 ? 0.25 : 0));

      const qr = r >> 2;
      const qg = g >> 2;
      const qb = b >> 2;
      const key = (qr << 12) | (qg << 6) | qb;

      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, weight: 0, count: 0 };
      bucket.r += r * weight;
      bucket.g += g * weight;
      bucket.b += b * weight;
      bucket.weight += weight;
      bucket.count += 1;
      buckets.set(key, bucket);
    }
  }

  let best = null;
  for (const bucket of buckets.values()) {
    const avgR = bucket.r / bucket.weight;
    const avgG = bucket.g / bucket.weight;
    const avgB = bucket.b / bucket.weight;
    const avgSat = saturation(avgR, avgG, avgB);
    const score = bucket.weight * (0.35 + avgSat * 1.4);
    if (!best || score > best.score) {
      best = { score, avgR, avgG, avgB };
    }
  }

  if (!best) return null;
  return rgbToHex(best.avgR, best.avgG, best.avgB);
}

export function hashTileColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 38%, 52%)`;
}
