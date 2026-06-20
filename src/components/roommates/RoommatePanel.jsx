import { useMemo, useState } from 'react';
import {
  rankRoommateHabitats,
  rankRoommateItems,
  rankSharedFavorites,
} from '../../lib/roommates.js';
import { getItemCraftCategory, getItemType, itemMatchesItemFilters } from '../../lib/itemCategories.js';
import { CardGrid } from '../CardGrid.jsx';
import { EmptyState } from '../states/EmptyState.jsx';
import { ItemCategoryFilter, ItemTypeFilter } from '../ItemCategoryFilter.jsx';
import {
  RoommateFavoriteTile,
  RoommateHabitatTile,
  RoommateItemTile,
} from './RoommateMatchTiles.jsx';
import { RoommateChip } from './RoommateChip.jsx';

const TABS = [
  { id: 'habitats', label: 'Habitats', icon: '🏠' },
  { id: 'items', label: 'Items', icon: '✦' },
  { id: 'favorites', label: 'Preferences', icon: '♥' },
];

export function RoommatePanel({
  roommates,
  onRemove,
  habitats,
  items,
  preferences,
  isMobile = false,
  onOpenPicker,
}) {
  const [tab, setTab] = useState('items');
  const [itemCategory, setItemCategory] = useState('all');
  const [itemType, setItemType] = useState('all');
  const total = roommates.length;

  const rankedItems = useMemo(
    () => rankRoommateItems(items, roommates),
    [items, roommates],
  );

  const itemCategoryCounts = useMemo(() => {
    const counts = { all: rankedItems.length };
    for (const row of rankedItems) {
      const cat = getItemCraftCategory(row.item);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [rankedItems]);

  const itemTypeCounts = useMemo(() => {
    const counts = { all: rankedItems.length, none: 0 };
    for (const row of rankedItems) {
      const type = getItemType(row.item);
      if (type) counts[type] = (counts[type] || 0) + 1;
      else counts.none += 1;
    }
    return counts;
  }, [rankedItems]);

  const filteredRankedItems = useMemo(
    () =>
      rankedItems.filter((row) =>
        itemMatchesItemFilters(row.item, { category: itemCategory, type: itemType }),
      ),
    [rankedItems, itemCategory, itemType],
  );
  const rankedHabitats = useMemo(
    () => rankRoommateHabitats(habitats, roommates),
    [habitats, roommates],
  );
  const rankedFavorites = useMemo(
    () => rankSharedFavorites(preferences, roommates),
    [preferences, roommates],
  );

  const itemsById = useMemo(() => {
    const map = new Map();
    for (const it of items || []) map.set(it.id, it);
    return map;
  }, [items]);

  return (
    <div className="roommate-panel">
      <header className="roommate-panel__head">
        <div className="roommate-panel__head-row">
          {isMobile ? (
            <button
              type="button"
              className="detail-panel__menu-btn"
              aria-label="Open Pokémon search"
              onClick={onOpenPicker}
            >
              <span aria-hidden>☰</span>
            </button>
          ) : null}
          <div className="roommate-panel__head-text">
            <h2 className="roommate-panel__title">Your room</h2>
            <p className="roommate-panel__subtitle">
              {total
                ? `${total} roommate${total === 1 ? '' : 's'} — browse shared picks below.`
                : isMobile
                  ? 'Tap ☰ to search and add Pokémon to your room.'
                  : 'Select Pokémon on the left to build a roommate group.'}
            </p>
          </div>
        </div>
      </header>

      <div className="roommate-panel__chips">
        {roommates.length ? (
          roommates.map((p) => (
            <RoommateChip key={p.id} pokemon={p} onRemove={onRemove} />
          ))
        ) : (
          <p className="roommate-panel__empty-chips">No roommates yet.</p>
        )}
      </div>

      {total > 0 ? (
        <>
          <nav className="roommate-tabs" role="tablist" aria-label="Roommate matches">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`roommate-tabs__tab${tab === t.id ? ' roommate-tabs__tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span aria-hidden>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="roommate-panel__tab-body scroll-y">
            {tab === 'items' ? (
              rankedItems.length ? (
                <>
                  <div className="roommate-panel__filters">
                    <ItemCategoryFilter
                      value={itemCategory}
                      onChange={setItemCategory}
                      counts={itemCategoryCounts}
                      className="roommate-panel__category-filter"
                    />
                    <ItemTypeFilter
                      value={itemType}
                      onChange={setItemType}
                      counts={itemTypeCounts}
                      className="roommate-panel__category-filter"
                    />
                  </div>
                  {filteredRankedItems.length ? (
                    <CardGrid variant="favorites">
                      {filteredRankedItems.map((row) => (
                        <RoommateItemTile
                          key={row.item.id}
                          row={row}
                          totalRoommates={total}
                        />
                      ))}
                    </CardGrid>
                  ) : (
                    <EmptyState
                      title="No items match these filters"
                      message="Try another category or type, or add roommates with different preferences."
                    />
                  )}
                </>
              ) : (
                <EmptyState title="No shared items" message="These roommates have no overlapping preference items." />
              )
            ) : null}

            {tab === 'habitats' ? (
              rankedHabitats.length ? (
                <CardGrid variant="habitats">
                  {rankedHabitats.map((row, i) => (
                    <RoommateHabitatTile
                      key={row.habitat.id}
                      row={row}
                      totalRoommates={total}
                      index={i}
                    />
                  ))}
                </CardGrid>
              ) : (
                <EmptyState title="No shared habitats" message="No habitats match this group's preferences yet." />
              )
            ) : null}

            {tab === 'favorites' ? (
              rankedFavorites.length ? (
                <CardGrid variant="favorites">
                  {rankedFavorites.map((row, i) => (
                    <RoommateFavoriteTile
                      key={row.preference.id}
                      row={row}
                      totalRoommates={total}
                      itemsById={itemsById}
                    />
                  ))}
                </CardGrid>
              ) : (
                <EmptyState title="No preferences" message="Selected Pokémon have no preference data." />
              )
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
