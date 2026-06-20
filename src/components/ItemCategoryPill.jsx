import { TagPill } from './TagPill.jsx';
import { getItemCraftCategory, getItemType } from '../lib/itemCategories.js';

export function ItemCategoryPill({ item, className = '' }) {
  const category = getItemCraftCategory(item);
  return (
    <TagPill variant="craft" className={className} title="Crafting category">
      {category}
    </TagPill>
  );
}

export function ItemTypePill({ item, className = '' }) {
  const type = getItemType(item);
  if (!type) return null;
  return (
    <TagPill variant="type" className={className} title="Item type">
      {type}
    </TagPill>
  );
}

export function ItemMetaPills({ item, className = '' }) {
  return (
    <div className={`item-meta-pills ${className}`.trim()}>
      <ItemCategoryPill item={item} />
      <ItemTypePill item={item} />
    </div>
  );
}
