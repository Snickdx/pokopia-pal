import { useEffect, useMemo, useState } from 'react';
import { getHabitats, filterBySearch } from '../lib/catalog.js';
import { habitatBookmarkKey, pruneHabitatBookmarks } from '../lib/habitatBookmarkStorage.js';
import { useHabitatBookmarks } from '../hooks/useHabitatBookmarks.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { SearchInput } from '../components/SearchInput.jsx';
import { ItemMetaFilter } from '../components/ItemCategoryFilter.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { HabitatCard } from '../components/cards/HabitatCard.jsx';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

const BOOKMARK_FILTER_OPTIONS = [
  { id: 'all', label: 'All habitats' },
  { id: 'bookmarked', label: 'Bookmarked' },
];

export function HabitatsBrowsePage() {
  const [search, setSearch] = useState('');
  const [bookmarkFilter, setBookmarkFilter] = useState('all');
  const { bookmarkIds } = useHabitatBookmarks();
  const { data, loading, error } = useFirestoreQuery(getHabitats, [], {
    cacheKey: catalogKey('habitats', 'all'),
  });

  useEffect(() => {
    if (!data?.length) return;
    pruneHabitatBookmarks(data.map((habitat) => habitatBookmarkKey(habitat)));
  }, [data]);

  const bookmarkCounts = useMemo(() => {
    if (!data?.length) return { all: 0, bookmarked: 0 };
    const bookmarkedSet = new Set(bookmarkIds);
    const bookmarked = data.filter((habitat) => bookmarkedSet.has(habitatBookmarkKey(habitat))).length;
    return { all: data.length, bookmarked };
  }, [data, bookmarkIds]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows = filterBySearch(data, search, ['title', 'label', 'details']);
    if (bookmarkFilter === 'bookmarked') {
      const bookmarkedSet = new Set(bookmarkIds);
      rows = rows.filter((habitat) => bookmarkedSet.has(habitatBookmarkKey(habitat)));
    }
    return rows;
  }, [data, search, bookmarkFilter, bookmarkIds]);

  if (loading) {
    return (
      <section className="browse-page glass-panel page-frame">
        <LoadingState label="Loading habitats…" />
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
        <h2 className="browse-page__title">All habitats</h2>
        <SearchInput value={search} onChange={setSearch} placeholder="Search habitats…" />
        <ItemMetaFilter
          className="browse-page__bookmark-filter"
          value={bookmarkFilter}
          onChange={setBookmarkFilter}
          options={BOOKMARK_FILTER_OPTIONS}
          counts={bookmarkCounts}
          ariaLabel="Filter bookmarked habitats"
        />
      </header>
      <div className="browse-page__scroll scroll-y">
        {!filtered.length ? (
          <EmptyState
            title={bookmarkFilter === 'bookmarked' ? 'No bookmarked habitats' : 'No habitats found'}
            message={
              bookmarkFilter === 'bookmarked'
                ? 'Bookmark habitats from a habitat page or from a Pokémon’s habitat list.'
                : 'Try a different search or seed Firestore.'
            }
          />
        ) : (
          <CardGrid variant="habitats">
            {filtered.map((h, i) => (
              <HabitatCard key={h.id} habitat={h} index={i} showBookmark />
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  );
}
