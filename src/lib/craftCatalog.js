import allCraftItems from '../../data/allCraftItems.json';
import { getItemType } from './itemCategories.js';

const SEREBII_ITEM_BASE = 'https://www.serebii.net/pokemonpokopia/items';

function craftRowToItem(craftItem) {
  const serebiiId = craftItem.serebiiId || craftItem.id;
  const item = {
    id: craftItem.id,
    routeSlug: craftItem.id,
    name: craftItem.name,
    link: `${SEREBII_ITEM_BASE}/${serebiiId}.shtml`,
    imagePath: null,
    imageUrl: `${SEREBII_ITEM_BASE}/${serebiiId}.png`,
    kind: 'Item',
    gamertwCategory: null,
    craftCategory: craftItem.craftCategory,
    preferenceIds: [],
    habitatIds: [],
  };
  item.itemType = getItemType(item);
  return item;
}

/** Merge Serebii craft catalog rows missing from Firestore (Buildings, Blocks, etc.). */
export function mergeCraftCatalogItems(items) {
  const byId = new Map((items || []).map((item) => [item.id, item]));
  for (const craftItem of allCraftItems.items || []) {
    if (!byId.has(craftItem.id)) {
      byId.set(craftItem.id, craftRowToItem(craftItem));
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getCraftCatalogItem(id) {
  if (!id) return null;
  const craftItem = (allCraftItems.items || []).find((row) => row.id === id);
  return craftItem ? craftRowToItem(craftItem) : null;
}
