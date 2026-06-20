import { ItemMetaFilter } from './ItemCategoryFilter.jsx';
import { POKEMON_ENVIRONMENT_OPTIONS } from '../lib/pokemonFilters.js';

export function PokemonEnvironmentFilter(props) {
  return (
    <ItemMetaFilter
      {...props}
      options={POKEMON_ENVIRONMENT_OPTIONS}
      ariaLabel="Filter by preferred environment"
    />
  );
}

export function PokemonMetaSelect({
  value = 'all',
  onChange,
  options,
  ariaLabel,
  className = '',
}) {
  return (
    <label className={`pokemon-meta-select ${className}`.trim()}>
      <span className="visually-hidden">{ariaLabel}</span>
      <select
        className="pokemon-meta-select__control"
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
            {opt.count != null && opt.id !== 'all' ? ` (${opt.count})` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PokemonAbilityMultiFilter({
  value = [],
  onChange,
  options = [],
  counts = {},
  className = '',
}) {
  const selected = new Set(value);

  const toggle = (id) => {
    if (selected.has(id)) {
      onChange(value.filter((ability) => ability !== id));
      return;
    }
    onChange([...value, id]);
  };

  const visible = options.filter((opt) => (counts[opt.id] || 0) > 0);

  return (
    <div className={`pokemon-ability-filter ${className}`.trim()}>
      <div className="pokemon-ability-filter__header">
        <span className="pokemon-ability-filter__label">Abilities</span>
        {value.length > 0 ? (
          <button
            type="button"
            className="pokemon-ability-filter__clear"
            onClick={() => onChange([])}
          >
            Clear ({value.length})
          </button>
        ) : null}
      </div>
      <div
        className="item-category-filter pokemon-ability-filter__options"
        role="group"
        aria-label="Filter by ability"
      >
        {visible.map((opt) => {
          const active = selected.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              className={`item-category-filter__btn${active ? ' item-category-filter__btn--active' : ''}`}
              aria-pressed={active}
              onClick={() => toggle(opt.id)}
            >
              {opt.label}
              {counts[opt.id] != null ? (
                <span className="item-category-filter__count" aria-hidden>
                  {counts[opt.id]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PokemonFavoriteFilter({ options, ...props }) {
  return (
    <PokemonMetaSelect
      {...props}
      options={options}
      ariaLabel="Filter by preference"
    />
  );
}
