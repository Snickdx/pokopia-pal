export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  id = 'catalog-search',
  onFocus,
  onBlur,
}) {
  return (
    <label className="search-input" htmlFor={id}>
      <span className="search-input__icon" aria-hidden>
        ⌕
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </label>
  );
}
