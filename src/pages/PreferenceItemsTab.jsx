import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePreferenceDetail } from './PreferenceDetailLayout.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { ItemCard } from '../components/cards/ItemCard.jsx';
import { CardGridSkeleton } from '../components/skeletons/CardGridSkeleton.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

export function PreferenceItemsTab() {
  const { items, itemsLoading } = usePreferenceDetail();
  const [searchParams, setSearchParams] = useSearchParams();
  const kindFilter = searchParams.get('kind') || 'all';

  const kinds = useMemo(() => {
    const set = new Set(items.map((it) => it.kind || 'Item'));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (kindFilter === 'all') return items;
    return items.filter((it) => (it.kind || 'Item') === kindFilter);
  }, [items, kindFilter]);

  if (itemsLoading) return <CardGridSkeleton variant="items" count={6} label="Loading items…" />;

  return (
    <>
      {kinds.length > 1 && (
        <div className="kind-filters" role="group" aria-label="Item type">
          <button
            type="button"
            className={`kind-filter${kindFilter === 'all' ? ' kind-filter--active' : ''}`}
            onClick={() => setSearchParams({})}
          >
            ALL
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              className={`kind-filter${kindFilter === k ? ' kind-filter--active' : ''}`}
              onClick={() => setSearchParams({ kind: k })}
            >
              {k}
            </button>
          ))}
        </div>
      )}
      {!filtered.length ? (
        <EmptyState title="No items" message="No guide items mapped to this preference." />
      ) : (
        <CardGrid variant="items">
          {filtered.map((it, i) => (
            <ItemCard key={it.id} item={it} index={i} />
          ))}
        </CardGrid>
      )}
    </>
  );
}
