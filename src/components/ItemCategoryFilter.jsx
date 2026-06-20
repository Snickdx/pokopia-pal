import { CRAFT_CATEGORIES } from '../lib/itemCategories.js';

const TYPE_FILTER_OPTIONS = [
  { id: 'all', label: 'All types' },
  { id: 'Toy', label: 'Toy' },
  { id: 'Decoration', label: 'Decoration' },
  { id: 'Relaxation', label: 'Relaxation' },
  { id: 'Road', label: 'Road' },
  { id: 'none', label: 'None' },
];

export function ItemMetaFilter({
  options,
  value = 'all',
  onChange,
  counts = {},
  ariaLabel = 'Filter items',
  className = '',
}) {
  const visible = options.filter((opt) => {
    if (opt.id === 'all') return true;
    if (!counts || counts.all == null) return true;
    return (counts[opt.id] || 0) > 0;
  });

  return (
    <div
      className={`item-category-filter ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      {visible.map((opt) => {
        const count = opt.id === 'all' ? counts.all : counts[opt.id];
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            className={`item-category-filter__btn${active ? ' item-category-filter__btn--active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
            {count != null ? (
              <span className="item-category-filter__count" aria-hidden>
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ItemCategoryFilter(props) {
  const options = [{ id: 'all', label: 'All' }, ...CRAFT_CATEGORIES.map((c) => ({ id: c, label: c }))];
  return (
    <ItemMetaFilter
      {...props}
      options={options}
      ariaLabel="Filter by crafting category"
    />
  );
}

export function ItemTypeFilter(props) {
  return (
    <ItemMetaFilter
      {...props}
      options={TYPE_FILTER_OPTIONS}
      ariaLabel="Filter by item type"
    />
  );
}
