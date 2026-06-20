import { useCallback, useMemo, useRef, useState } from 'react';
import {
  isEmptyTileId,
  tileUsesGridColor,
} from '../../lib/cityPlanner/blocks.js';
import {
  orderTilesForCategory,
  PALETTE_SECTION_IDS,
  PALETTE_SECTION_META,
  TILE_CATEGORY_TO_PALETTE_SECTION,
} from '../../lib/cityPlanner/palettePrefs.js';

function formatGridColor(color) {
  if (!color) return '—';
  return color.startsWith('#') ? color.toUpperCase() : color;
}

function PaletteTilePreview({ tile }) {
  const isEmpty = isEmptyTileId(tile.id);
  const showGridChip = tileUsesGridColor(tile) && tile.color && !isEmpty;

  return (
    <span
      className={`city-planner-palette__preview-wrap${
        showGridChip ? '' : ' city-planner-palette__preview-wrap--sprite-only'
      }`}
      aria-hidden
    >
      <span className="city-planner-palette__preview">
        {tile.imageSrc ? (
          <img src={tile.imageSrc} alt="" loading="lazy" decoding="async" />
        ) : tile.icon ? (
          <span className="city-planner-palette__icon">{tile.icon}</span>
        ) : (
          <span
            className="city-planner-palette__color"
            style={tile.color ? { backgroundColor: tile.color } : undefined}
          />
        )}
      </span>
      {showGridChip ? (
        <span
          className="city-planner-palette__grid-chip"
          style={{ backgroundColor: tile.color }}
          title={formatGridColor(tile.color)}
        />
      ) : null}
    </span>
  );
}

function PaletteSwatch({
  tile,
  isPrimary,
  isSecondary,
  onSelectPrimary,
  onSelectSecondary,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDropTarget,
  isMobile,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) {
  const longPressRef = useRef(null);
  const longPressActivatedRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const showGridLabel = tileUsesGridColor(tile) && !isEmptyTileId(tile.id);

  const clearLongPress = () => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const handlePointerDown = (event) => {
    if (!isMobile || event.pointerType === 'mouse') return;
    longPressActivatedRef.current = false;
    clearLongPress();
    longPressRef.current = window.setTimeout(() => {
      longPressActivatedRef.current = true;
      suppressNextClickRef.current = true;
      onSelectSecondary(tile.id);
      longPressRef.current = null;
    }, 450);
  };

  const handlePointerUp = (event) => {
    if (!isMobile || event.pointerType === 'mouse') return;
    clearLongPress();
    if (longPressActivatedRef.current) {
      longPressActivatedRef.current = false;
      event.preventDefault();
      return;
    }
    onSelectPrimary(tile.id);
  };

  const handleClick = (event) => {
    if (!isMobile) {
      onSelectPrimary(tile.id);
      return;
    }
    event.preventDefault();
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
    }
  };

  return (
    <div
      className={`city-planner-palette__swatch-row${
        isDragging ? ' city-planner-palette__swatch-row--dragging' : ''
      }${isDropTarget ? ' city-planner-palette__swatch-row--drop-target' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver?.();
      }}
      onDrop={(event) => onDrop?.(event)}
    >
      <button
        type="button"
        className="city-planner-palette__item-handle"
        draggable={!isMobile}
        aria-label={`Reorder ${tile.label}`}
        title="Drag to reorder"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        ⠿
      </button>
      {isMobile ? (
        <div className="city-planner-palette__item-move">
          <button
            type="button"
            className="city-planner-palette__item-move-btn"
            aria-label={`Move ${tile.label} up`}
            disabled={!canMoveUp}
            onClick={onMoveUp}
          >
            ↑
          </button>
          <button
            type="button"
            className="city-planner-palette__item-move-btn"
            aria-label={`Move ${tile.label} down`}
            disabled={!canMoveDown}
            onClick={onMoveDown}
          >
            ↓
          </button>
        </div>
      ) : null}
      <button
        type="button"
        role="option"
        aria-selected={isPrimary || isSecondary}
        className={`city-planner-palette__swatch${
          isPrimary ? ' city-planner-palette__swatch--primary' : ''
        }${isSecondary ? ' city-planner-palette__swatch--secondary' : ''}`}
        title={
          showGridLabel
            ? `${tile.label} (${formatGridColor(tile.color)}) — tap: primary, hold: secondary`
            : `${tile.label} — tap: primary, hold: secondary`
        }
        onClick={handleClick}
        onContextMenu={(event) => {
          event.preventDefault();
          if (!isMobile) onSelectSecondary(tile.id);
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          clearLongPress();
          longPressActivatedRef.current = false;
          suppressNextClickRef.current = false;
        }}
        onPointerLeave={() => {
          clearLongPress();
          longPressActivatedRef.current = false;
          suppressNextClickRef.current = false;
        }}
      >
        <PaletteTilePreview tile={tile} />
        <span className="city-planner-palette__body">
          <span className="city-planner-palette__label">{tile.label}</span>
          {showGridLabel ? (
            <span className="city-planner-palette__grid-color">
              {formatGridColor(tile.color)}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
}

function PaletteSectionPanel({
  sectionId,
  tiles,
  activeBlockId,
  secondaryBlockId,
  onSelectPrimary,
  onSelectSecondary,
  searchQuery,
  onReorderTiles,
  isMobile,
}) {
  const meta = PALETTE_SECTION_META[sectionId];
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  const filteredTiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tiles;
    return tiles.filter((tile) => tile.label.toLowerCase().includes(q));
  }, [searchQuery, tiles]);

  const canReorder = !searchQuery.trim();
  const allTileIds = useMemo(() => tiles.map((tile) => tile.id), [tiles]);

  const reorderByTileIndex = useCallback(
    (fromIndex, toIndex) => {
      if (!canReorder || fromIndex === toIndex) return;
      onReorderTiles(sectionId, fromIndex, toIndex, allTileIds);
    },
    [allTileIds, canReorder, onReorderTiles, sectionId],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  const handleDrop = useCallback(
    (index, event) => {
      event.preventDefault();
      if (!canReorder || dragIndex == null || dragIndex === index) {
        handleDragEnd();
        return;
      }
      const fromId = filteredTiles[dragIndex]?.id;
      const toId = filteredTiles[index]?.id;
      const from = allTileIds.indexOf(fromId);
      const to = allTileIds.indexOf(toId);
      if (from >= 0 && to >= 0) reorderByTileIndex(from, to);
      handleDragEnd();
    },
    [allTileIds, canReorder, dragIndex, filteredTiles, handleDragEnd, reorderByTileIndex],
  );

  if (!tiles.length) return null;

  return (
    <section className="city-planner-palette__section">
      <header className="city-planner-palette__section-head">
        <div className="city-planner-palette__section-head-text">
          <h4 className="city-planner-palette__section-title">{meta.title}</h4>
          <p className="city-planner-palette__section-hint">
            {searchQuery.trim()
              ? `${filteredTiles.length} of ${tiles.length} shown`
              : `${tiles.length} items · ${meta.hint}`}
          </p>
        </div>
      </header>
      <div className="city-planner-palette__section-scroll scroll-y" role="listbox" aria-label={meta.title}>
        {filteredTiles.length ? (
          filteredTiles.map((tile, index) => (
            <PaletteSwatch
              key={tile.id}
              tile={tile}
              isPrimary={activeBlockId === tile.id}
              isSecondary={secondaryBlockId === tile.id}
              onSelectPrimary={onSelectPrimary}
              onSelectSecondary={onSelectSecondary}
              isDragging={dragIndex === index}
              isDropTarget={dropIndex === index && dragIndex != null && dragIndex !== index}
              onDragStart={(event) => {
                if (!canReorder) {
                  event.preventDefault();
                  return;
                }
                setDragIndex(index);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(index));
              }}
              onDragOver={() => {
                if (canReorder) setDropIndex(index);
              }}
              onDrop={(event) => handleDrop(index, event)}
              onDragEnd={handleDragEnd}
              isMobile={isMobile}
              canMoveUp={canReorder && index > 0}
              canMoveDown={canReorder && index < filteredTiles.length - 1}
              onMoveUp={() => {
                const fromId = filteredTiles[index]?.id;
                const toId = filteredTiles[index - 1]?.id;
                const from = allTileIds.indexOf(fromId);
                const to = allTileIds.indexOf(toId);
                if (from >= 0 && to >= 0) reorderByTileIndex(from, to);
              }}
              onMoveDown={() => {
                const fromId = filteredTiles[index]?.id;
                const toId = filteredTiles[index + 1]?.id;
                const from = allTileIds.indexOf(fromId);
                const to = allTileIds.indexOf(toId);
                if (from >= 0 && to >= 0) reorderByTileIndex(from, to);
              }}
            />
          ))
        ) : (
          <p className="city-planner-palette__section-empty">No matches in this section.</p>
        )}
      </div>
    </section>
  );
}

export function CityPlannerPalette({
  tiles,
  tileOrder,
  activeBlockId,
  secondaryBlockId,
  onReorderTiles,
  onSelectPrimary,
  onSelectSecondary,
  onClose,
  isMobile = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const tilesByCategory = useMemo(() => {
    const grouped = Object.fromEntries(PALETTE_SECTION_IDS.map((id) => [id, []]));
    for (const tile of tiles) {
      const sectionId = TILE_CATEGORY_TO_PALETTE_SECTION[tile.category];
      if (sectionId) grouped[sectionId].push(tile);
    }
    for (const id of PALETTE_SECTION_IDS) {
      grouped[id] = orderTilesForCategory(grouped[id], id, tileOrder);
    }
    return grouped;
  }, [tileOrder, tiles]);

  return (
    <div className="city-planner-palette">
      <div className="city-planner-palette__toolbar">
        <div className="city-planner-palette__toolbar-row">
          <h3 className="city-planner-palette__title">Blocks</h3>
          {isMobile && onClose ? (
            <button
              type="button"
              className="city-planner-palette__close"
              onClick={onClose}
              aria-label="Close palette"
            >
              ✕
            </button>
          ) : null}
        </div>
        <label className="city-planner-palette__search">
          <span className="visually-hidden">Filter blocks</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Search blocks, terrain, buildings…"
            onChange={(event) => setSearchQuery(event.target.value)}
            enterKeyHint="search"
          />
        </label>
        <p className="city-planner-palette__hint">
          {isMobile
            ? 'Tap for primary · hold for secondary (applies immediately)'
            : 'Tap to set primary · right-click for secondary · drag ⠿ to reorder items'}
        </p>
      </div>

      <div className="city-planner-palette__sections">
        {PALETTE_SECTION_IDS.map((sectionId) => (
          <PaletteSectionPanel
            key={sectionId}
            sectionId={sectionId}
            tiles={tilesByCategory[sectionId]}
            activeBlockId={activeBlockId}
            secondaryBlockId={secondaryBlockId}
            onSelectPrimary={onSelectPrimary}
            onSelectSecondary={onSelectSecondary}
            searchQuery={searchQuery}
            onReorderTiles={onReorderTiles}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}
