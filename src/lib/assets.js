/** Map Firestore asset paths to Vite public URLs. */
import allCraftItems from '../../data/allCraftItems.json';

export function resolveAssetPath(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return path;
  return `/${path.replace(/^\/+/, '')}`;
}

export function habitatImageSrc(habitat) {
  return resolveAssetPath(habitat?.imagePath) || null;
}

export function pokemonSpriteSrc(pokemon) {
  return resolveAssetPath(pokemon?.spritePath) || null;
}

const SEREBII_ITEM_BASE = 'https://www.serebii.net/pokemonpokopia/items';

/** Serebii filenames use parentheses; not captured by the craft-list scraper. */
const ITEM_SEREBII_ID = {
  'music-mat-fa': 'musicmat(fa)',
  'music-mat-high-do': 'musicmat(highdo)',
  'music-mat-la': 'musicmat(la)',
  'music-mat-mi': 'musicmat(mi)',
  'music-mat-re': 'musicmat(re)',
  'music-mat-sol': 'musicmat(sol)',
  'music-mat-ti': 'musicmat(ti)',
  'music-mat-low-do': 'musicmat(lowdo)',
};

/** @type {Map<string, string>} */
const craftSerebiiIdByItemId = new Map(
  (allCraftItems.items ?? []).map((row) => [row.id, row.serebiiId || row.id]),
);

function serebiiIdForItem(item) {
  if (!item) return null;
  return (
    item.serebiiId ||
    ITEM_SEREBII_ID[item.id] ||
    craftSerebiiIdByItemId.get(item.id) ||
    null
  );
}

export function itemHasImage(item) {
  return itemImageCandidates(item).length > 0;
}

/** Ordered fallbacks: bundled path, guide URL, Serebii craft art. */
export function itemImageCandidates(item) {
  if (!item) return [];
  const candidates = [];
  const local = resolveAssetPath(item.imagePath);
  if (local) candidates.push(local);
  if (item.imageUrl?.startsWith('http')) candidates.push(item.imageUrl);
  const serebiiId = serebiiIdForItem(item);
  if (serebiiId) {
    candidates.push(`${SEREBII_ITEM_BASE}/${serebiiId}.png`);
  }
  return [...new Set(candidates)];
}

export function itemImageSrc(item) {
  return itemImageCandidates(item)[0] ?? null;
}

/** Representative item art for a favorite/preference (first linked item with an image). */
export function preferenceImageSrc(preference, itemsById) {
  if (!preference?.itemIds?.length || !itemsById) return null;
  for (const id of preference.itemIds) {
    const item = itemsById.get?.(id) ?? itemsById[id];
    const src = item && itemImageSrc(item);
    if (src) return src;
  }
  return null;
}
