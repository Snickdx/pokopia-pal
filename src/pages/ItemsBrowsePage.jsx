import { useMemo, useState } from 'react';
import { getItems, filterBySearch } from '../lib/catalog.js';
import { itemMatchesItemFilters } from '../lib/itemCategories.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { SearchInput } from '../components/SearchInput.jsx';
import { ItemCategoryFilter, ItemTypeFilter } from '../components/ItemCategoryFilter.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { ItemCard } from '../components/cards/ItemCard.jsx';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

export function ItemsBrowsePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const { data, loading, error } = useFirestoreQuery(getItems, [], {
    cacheKey: catalogKey('items', 'all'),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const searched = filterBySearch(data, search, ['name', 'kind']);
    return searched.filter((item) => itemMatchesItemFilters(item, { category, type }));
  }, [data, search, category, type]);

  if (loading) {
    return (
      <section className="browse-page glass-panel page-frame">
        <LoadingState label="Loading items…" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="browse-page glass-panel page-frame page-frame--center">
        <ErrorState message={error.message} />
      </section>
    );
  }

  return (
    <section className="browse-page glass-panel">
      <header className="browse-page__header">
        <h2 className="browse-page__title">All items</h2>
        <SearchInput value={search} onChange={setSearch} placeholder="Search items…" />
        <div className="browse-page__item-filters">
          <ItemCategoryFilter value={category} onChange={setCategory} />
          <ItemTypeFilter value={type} onChange={setType} />
        </div>
      </header>
      <div className="browse-page__scroll scroll-y">
        {!filtered.length ? (
          <EmptyState title="No items found" />
        ) : (
          <CardGrid variant="items">
            {filtered.map((it, i) => (
              <ItemCard key={it.id} item={it} index={i} />
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  );
}
