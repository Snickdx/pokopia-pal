/** @returns {number[]} 0-based indices of the center row(s) or column(s). */
export function getCenterLineIndices(count) {
  if (count <= 0) return [];
  if (count % 2 === 1) return [Math.floor(count / 2)];
  return [count / 2 - 1, count / 2];
}

/** @param {number} index @param {number} count */
export function isCenterLineIndex(index, count) {
  return getCenterLineIndices(count).includes(index);
}
