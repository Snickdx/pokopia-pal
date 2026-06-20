import categoryMaps from '../data/itemCraftCategories.json';

export const CRAFT_CATEGORIES = categoryMaps.categories;
export const ITEM_TYPES = categoryMaps.itemTypes || [];

export function getItemCraftCategory(item) {
  if (!item) return 'Other';
  if (item.craftCategory && CRAFT_CATEGORIES.includes(item.craftCategory)) {
    return item.craftCategory;
  }
  const { bySlug, byName } = categoryMaps;
  return (
    bySlug[item.id] ||
    bySlug[item.slug] ||
    byName[item.name] ||
    byName[item.name?.toLowerCase()] ||
    'Other'
  );
}

/** Toy, Decoration, Relaxation, Road — or null when the item has no in-game type. */
export function getItemType(item) {
  if (!item) return null;
  if (item.itemType && ITEM_TYPES.includes(item.itemType)) return item.itemType;
  if (item.itemType === null || item.itemType === 'None') return null;
  const { typeBySlug, typeByName } = categoryMaps;
  return (
    typeBySlug?.[item.id] ||
    typeBySlug?.[item.slug] ||
    typeByName?.[item.name] ||
    typeByName?.[item.name?.toLowerCase()] ||
    null
  );
}

export function itemMatchesCraftCategory(item, category) {
  if (!category || category === 'all') return true;
  return getItemCraftCategory(item) === category;
}

export function itemMatchesItemType(item, type) {
  if (!type || type === 'all') return true;
  if (type === 'none') return !getItemType(item);
  return getItemType(item) === type;
}

export function itemMatchesItemFilters(item, { category = 'all', type = 'all' } = {}) {
  return itemMatchesCraftCategory(item, category) && itemMatchesItemType(item, type);
}
