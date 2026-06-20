import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getItems } from '../lib/catalog.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { usePlannerHistory } from '../hooks/usePlannerHistory.js';
import { usePlannerPersistence } from '../hooks/usePlannerPersistence.js';
import { usePlannerTileColors } from '../hooks/usePlannerTileColors.js';
import { usePalettePrefs } from '../hooks/usePalettePrefs.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import {
  buildPlannerTiles,
  DEFAULT_SECONDARY_TILE_ID,
  DEFAULT_TILE_ID,
  normalizeTileId,
  plannerTilesById,
} from '../lib/cityPlanner/blocks.js';
import { createEmptyGrid, resizeGrid } from '../lib/cityPlanner/grid.js';
import {
  createDefaultPlannerState,
  loadCityPlanner,
} from '../lib/cityPlanner/storage.js';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { CityPlannerCanvas } from '../components/cityPlanner/CityPlannerCanvas.jsx';
import { CityPlannerBrushBar } from '../components/cityPlanner/CityPlannerBrushBar.jsx';
import { CityPlannerPalette } from '../components/cityPlanner/CityPlannerPalette.jsx';
import { CityPlannerSetup } from '../components/cityPlanner/CityPlannerSetup.jsx';

function loadInitialPlanner() {
  return loadCityPlanner() ?? createDefaultPlannerState();
}

export function CityPlannerPage() {
  const [initial] = useState(loadInitialPlanner);
  const [meta, setMeta] = useState(() => ({
    width: initial.width,
    height: initial.height,
    activeBlockId: initial.activeBlockId,
    secondaryBlockId: initial.secondaryBlockId ?? DEFAULT_SECONDARY_TILE_ID,
  }));
  const {
    cells,
    setCells,
    startStroke,
    updateStroke,
    endStroke,
    undo,
    redo,
    replaceCells,
    canUndo,
    canRedo,
  } = usePlannerHistory(initial.cells);

  const [tool, setTool] = useState('brush');
  const [showSetup, setShowSetup] = useState(false);
  const [started, setStarted] = useState(() => Boolean(loadCityPlanner()));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paintTarget, setPaintTarget] = useState('primary');
  const isMobilePlanner = useMediaQuery('(max-width: 767px)');
  const { tileOrder, reorderTiles } = usePalettePrefs();

  const itemsQuery = useFirestoreQuery(getItems, [], {
    cacheKey: catalogKey('items', 'all'),
  });

  const tiles = useMemo(() => buildPlannerTiles(itemsQuery.data), [itemsQuery.data]);
  const coloredTiles = usePlannerTileColors(tiles);
  const tilesById = useMemo(() => plannerTilesById(coloredTiles), [coloredTiles]);

  const plannerState = useMemo(
    () => ({
      width: meta.width,
      height: meta.height,
      cells,
      activeBlockId: meta.activeBlockId,
      secondaryBlockId: meta.secondaryBlockId,
    }),
    [cells, meta.activeBlockId, meta.height, meta.secondaryBlockId, meta.width],
  );

  const { flushSave, lastSaved } = usePlannerPersistence(plannerState, started);

  const handleStrokeEnd = useCallback(() => {
    endStroke();
    flushSave();
  }, [endStroke, flushSave]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;

      if (mod && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if ((mod && key === 'y') || (mod && event.shiftKey && key === 'z')) {
        event.preventDefault();
        redo();
        return;
      }
      if (event.altKey || mod) return;

      if (key === 'b') setTool('brush');
      else if (key === 'e') setTool('eraser');
      else if (key === 'f') setTool('fill');
      else if (key === 'i') setTool('eyedropper');
      else if (key === 'z') undo();
      else if (key === 'y') redo();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [redo, undo]);

  const handleCellsChange = useCallback(
    (updater, { mode = 'immediate' } = {}) => {
      if (mode === 'stroke') {
        updateStroke(updater);
        return;
      }
      setCells(updater, { record: true });
    },
    [setCells, updateStroke],
  );

  const handleEyedropperPick = useCallback((tileId, button) => {
    if (button === 2) {
      setMeta((prev) => ({ ...prev, secondaryBlockId: tileId }));
      if (isMobilePlanner) setPaintTarget('secondary');
    } else {
      setMeta((prev) => ({ ...prev, activeBlockId: tileId }));
      setTool('brush');
      if (isMobilePlanner) setPaintTarget('primary');
    }
  }, [isMobilePlanner]);

  const handleSelectPrimary = useCallback((id) => {
    setMeta((prev) => ({ ...prev, activeBlockId: normalizeTileId(id) }));
    setTool('brush');
    if (isMobilePlanner) {
      setPaintTarget('primary');
      setSidebarOpen(false);
    }
  }, [isMobilePlanner]);

  const handleSelectSecondary = useCallback((id) => {
    setMeta((prev) => ({ ...prev, secondaryBlockId: normalizeTileId(id) }));
    setTool('brush');
    if (isMobilePlanner) {
      setPaintTarget('secondary');
      setSidebarOpen(false);
    }
  }, [isMobilePlanner]);

  useEffect(() => {
    if (!isMobilePlanner) setSidebarOpen(false);
  }, [isMobilePlanner]);

  const handleCreateGrid = (width, height) => {
    const nextCells = started
      ? resizeGrid(cells, meta.width, meta.height, width, height)
      : createEmptyGrid(width, height);
    replaceCells(nextCells, { record: started });
    setMeta((prev) => ({ ...prev, width, height }));
    setStarted(true);
    setShowSetup(false);
  };

  const handleClear = () => {
    replaceCells(createEmptyGrid(meta.width, meta.height, 'planner:empty'), { record: true });
  };

  const handleFillGrass = () => {
    replaceCells(createEmptyGrid(meta.width, meta.height, DEFAULT_TILE_ID), { record: true });
  };

  if (!started && !showSetup) {
    return (
      <section className="city-planner glass-panel page-frame">
        <header className="city-planner__header">
          <h2 className="city-planner__title">City planner</h2>
          <p className="city-planner__subtitle">
            Design your Pokopia town layout — terrain, blocks, buildings, and outdoor items.
          </p>
        </header>
        <div className="city-planner__welcome">
          <CityPlannerSetup onCreate={handleCreateGrid} />
        </div>
      </section>
    );
  }

  if (itemsQuery.loading && !itemsQuery.data) {
    return <LoadingState label="Loading catalog tiles…" />;
  }

  return (
    <section className="city-planner glass-panel page-frame">
      <header className="city-planner__header">
        <div className="city-planner__header-controls">
          <div className="city-planner__toolbar-scroll">
            <div className="city-planner__toolbar" role="toolbar" aria-label="City planner tools">
            <CityPlannerBrushBar
              tilesById={tilesById}
              activeBlockId={meta.activeBlockId}
              secondaryBlockId={meta.secondaryBlockId}
              paintTarget={paintTarget}
              onPaintTargetChange={isMobilePlanner ? setPaintTarget : undefined}
              compact={isMobilePlanner}
            />
            <span className="city-planner__toolbar-sep" aria-hidden="true" />
            <button
              type="button"
              className={`city-planner__tool${tool === 'brush' ? ' city-planner__tool--active' : ''}`}
              aria-pressed={tool === 'brush'}
              title="Brush (B)"
              onClick={() => setTool('brush')}
            >
              🖌️ Brush
            </button>
            <button
              type="button"
              className={`city-planner__tool${tool === 'eraser' ? ' city-planner__tool--active' : ''}`}
              aria-pressed={tool === 'eraser'}
              title="Eraser (E)"
              onClick={() => setTool('eraser')}
            >
              🧹 Eraser
            </button>
            <button
              type="button"
              className={`city-planner__tool${tool === 'fill' ? ' city-planner__tool--active' : ''}`}
              aria-pressed={tool === 'fill'}
              title="Fill bucket (F)"
              onClick={() => setTool('fill')}
            >
              🪣 Fill
            </button>
            <button
              type="button"
              className={`city-planner__tool${tool === 'eyedropper' ? ' city-planner__tool--active' : ''}`}
              aria-pressed={tool === 'eyedropper'}
              title="Eyedropper (I)"
              onClick={() => setTool('eyedropper')}
            >
              💧 Pick
            </button>
            <span className="city-planner__toolbar-sep" aria-hidden="true" />
            <button
              type="button"
              className="city-planner__action"
              title="Undo (Ctrl+Z)"
              disabled={!canUndo}
              onClick={undo}
            >
              ↩ Undo
            </button>
            <button
              type="button"
              className="city-planner__action"
              title="Redo (Ctrl+Y)"
              disabled={!canRedo}
              onClick={redo}
            >
              ↪ Redo
            </button>
            <button
              type="button"
              className="city-planner__action"
              onClick={() => setShowSetup(true)}
            >
              Resize
            </button>
            <button type="button" className="city-planner__action" onClick={handleClear}>
              Clear
            </button>
            <button type="button" className="city-planner__action" onClick={handleFillGrass}>
              Fill grass squares
            </button>
            </div>
          </div>
          <p className="city-planner__subtitle">
            {meta.width}×{meta.height} grid
            {lastSaved ? (
              <span className="city-planner__saved-hint"> · Saved locally</span>
            ) : null}
          </p>
        </div>
      </header>

      {showSetup ? (
        <div className="city-planner__setup-overlay">
          <CityPlannerSetup
            initialWidth={meta.width}
            initialHeight={meta.height}
            onCreate={handleCreateGrid}
            onCancel={() => setShowSetup(false)}
          />
        </div>
      ) : null}

      <div className="city-planner__body">
        {isMobilePlanner && sidebarOpen ? (
          <button
            type="button"
            className="city-planner-sidebar-backdrop city-planner-sidebar-backdrop--visible"
            aria-label="Close palette"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <aside
          className={`city-planner__sidebar${
            isMobilePlanner
              ? sidebarOpen
                ? ' city-planner__sidebar--open'
                : ' city-planner__sidebar--drawer'
              : ''
          }`}
        >
          <CityPlannerPalette
            tiles={coloredTiles}
            tileOrder={tileOrder}
            activeBlockId={meta.activeBlockId}
            secondaryBlockId={meta.secondaryBlockId}
            onReorderTiles={reorderTiles}
            onSelectPrimary={handleSelectPrimary}
            onSelectSecondary={handleSelectSecondary}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobilePlanner}
          />
        </aside>
        <div className="city-planner__main">
          {!isMobilePlanner || sidebarOpen ? null : (
            <button
              type="button"
              className="city-planner__palette-fab"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              🎨 Blocks
            </button>
          )}
          <CityPlannerCanvas
            width={meta.width}
            height={meta.height}
            cells={cells}
            activeBlockId={meta.activeBlockId}
            secondaryBlockId={meta.secondaryBlockId}
            paintTarget={paintTarget}
            tool={tool}
            tilesById={tilesById}
            onCellsChange={handleCellsChange}
            onStrokeStart={startStroke}
            onStrokeEnd={handleStrokeEnd}
            onEyedropperPick={handleEyedropperPick}
          />
        </div>
      </div>
    </section>
  );
}
