import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_TILE_ID,
  getPlannerTile,
  isEmptyTileId,
  isPropTileCategory,
  normalizeTileId,
  tileUsesGridColor,
  tileUsesSpriteOnGrid,
} from '../../lib/cityPlanner/blocks.js';
import { floodFill, getCellIndex, setCell } from '../../lib/cityPlanner/grid.js';
import { getCenterLineIndices } from '../../lib/cityPlanner/gridMarkers.js';

export function CityPlannerCanvas({
  width,
  height,
  cells,
  activeBlockId,
  secondaryBlockId,
  paintTarget = 'primary',
  tool,
  tilesById,
  onCellsChange,
  onStrokeStart,
  onStrokeEnd,
  onEyedropperPick,
}) {
  const gridRef = useRef(null);
  const gridScrollRef = useRef(null);
  const colTrackRef = useRef(null);
  const rowTrackRef = useRef(null);
  const paintingRef = useRef(false);
  const paintButtonRef = useRef(0);
  const lastPaintedRef = useRef(null);
  const documentMoveRef = useRef(null);
  const longPressRef = useRef(null);
  const longPressActivatedRef = useRef(false);
  const touchTapPendingRef = useRef(null);
  const [hoverCell, setHoverCell] = useState(null);

  const LONG_PRESS_MS = 450;

  const clearTouchLongPress = useCallback(() => {
    if (longPressRef.current) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const cellSize = useMemo(() => {
    const maxDim = Math.max(width, height);
    const isCoarsePointer =
      typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (maxDim <= 12) return isCoarsePointer ? 26 : 28;
    if (maxDim <= 24) return isCoarsePointer ? 20 : 22;
    if (maxDim <= 32) return isCoarsePointer ? 16 : 18;
    return isCoarsePointer ? 12 : 14;
  }, [width, height]);

  const centerColIndices = useMemo(() => new Set(getCenterLineIndices(width)), [width]);
  const centerRowIndices = useMemo(() => new Set(getCenterLineIndices(height)), [height]);
  const markerFontSize = Math.max(8, Math.round(cellSize * 0.42));
  const markerBandSize = Math.max(14, Math.round(cellSize * 0.72));

  const handleGridScroll = useCallback(() => {
    const gridScroll = gridScrollRef.current;
    if (!gridScroll) return;
    if (colTrackRef.current) {
      colTrackRef.current.scrollLeft = gridScroll.scrollLeft;
    }
    if (rowTrackRef.current) {
      rowTrackRef.current.scrollTop = gridScroll.scrollTop;
    }
  }, []);

  const resolvePaintTileId = useCallback(
    (button) => {
      if (tool === 'eraser') {
        return button === 2 ? 'planner:empty' : DEFAULT_TILE_ID;
      }
      return button === 2 ? secondaryBlockId : activeBlockId;
    },
    [activeBlockId, secondaryBlockId, tool],
  );

  const resolvePaintButton = useCallback(
    (eventButton, pointerType) => {
      if (eventButton === 2) return 2;
      if (pointerType === 'touch' || pointerType === 'pen') {
        return paintTarget === 'secondary' ? 2 : 0;
      }
      return 0;
    },
    [paintTarget],
  );

  const paintAt = useCallback(
    (x, y, button) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const tileId = resolvePaintTileId(button);
      onCellsChange((prev) => setCell(prev, x, y, width, height, tileId), { mode: 'stroke' });
    },
    [height, onCellsChange, resolvePaintTileId, width],
  );

  const fillAt = useCallback(
    (x, y, button) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const tileId = resolvePaintTileId(button);
      onCellsChange((prev) => floodFill(prev, x, y, width, height, tileId), { mode: 'immediate' });
    },
    [height, onCellsChange, resolvePaintTileId, width],
  );

  const sampleAt = useCallback(
    (x, y, button) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const idx = getCellIndex(x, y, width);
      onEyedropperPick?.(normalizeTileId(cells[idx]), button);
    },
    [cells, height, onEyedropperPick, width],
  );

  const cellFromPoint = useCallback((clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const cell = el?.closest?.('.city-planner-canvas__cell');
    if (!cell || !gridRef.current?.contains(cell)) return null;
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }, []);

  const applyAtCell = useCallback(
    (cell, button) => {
      if (!cell) return;
      setHoverCell(cell);
      if (tool === 'eyedropper') {
        const key = `${cell.x},${cell.y},pick,${button}`;
        if (lastPaintedRef.current === key) return;
        lastPaintedRef.current = key;
        sampleAt(cell.x, cell.y, button);
        return;
      }
      if (tool === 'fill') {
        const key = `${cell.x},${cell.y},fill,${button}`;
        if (lastPaintedRef.current === key) return;
        lastPaintedRef.current = key;
        fillAt(cell.x, cell.y, button);
        return;
      }
      const key = `${cell.x},${cell.y}`;
      if (lastPaintedRef.current === key) return;
      lastPaintedRef.current = key;
      paintAt(cell.x, cell.y, button);
    },
    [fillAt, paintAt, sampleAt, tool],
  );

  const applyPointer = useCallback(
    (clientX, clientY, shouldPaint) => {
      const cell = cellFromPoint(clientX, clientY);
      if (!cell) return;
      setHoverCell(cell);
      if (!shouldPaint) return;

      if (tool === 'eyedropper') {
        const key = `${cell.x},${cell.y},pick`;
        if (lastPaintedRef.current === key) return;
        lastPaintedRef.current = key;
        sampleAt(cell.x, cell.y, paintButtonRef.current);
        return;
      }

      if (tool === 'fill') {
        const key = `${cell.x},${cell.y},fill`;
        if (lastPaintedRef.current === key) return;
        lastPaintedRef.current = key;
        fillAt(cell.x, cell.y, paintButtonRef.current);
        return;
      }

      const key = `${cell.x},${cell.y}`;
      if (lastPaintedRef.current === key) return;
      lastPaintedRef.current = key;
      paintAt(cell.x, cell.y, paintButtonRef.current);
    },
    [cellFromPoint, fillAt, paintAt, sampleAt, tool],
  );

  const detachDocumentPointerMove = useCallback(() => {
    if (documentMoveRef.current) {
      document.removeEventListener('pointermove', documentMoveRef.current);
      documentMoveRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (event.button !== 0 && event.button !== 2) return;
      event.preventDefault();
      gridRef.current?.setPointerCapture(event.pointerId);
      lastPaintedRef.current = null;

      const isTouchTapTool =
        event.pointerType === 'touch' && (tool === 'eyedropper' || tool === 'fill');

      if (isTouchTapTool) {
        const cell = cellFromPoint(event.clientX, event.clientY);
        if (!cell) return;
        paintingRef.current = true;
        longPressActivatedRef.current = false;
        touchTapPendingRef.current = cell;
        setHoverCell(cell);
        clearTouchLongPress();
        longPressRef.current = window.setTimeout(() => {
          longPressActivatedRef.current = true;
          touchTapPendingRef.current = null;
          longPressRef.current = null;
          applyAtCell(cell, 2);
          paintingRef.current = false;
        }, LONG_PRESS_MS);
        return;
      }

      paintingRef.current = true;
      paintButtonRef.current = resolvePaintButton(event.button, event.pointerType);

      detachDocumentPointerMove();
      documentMoveRef.current = (moveEvent) => {
        if (!paintingRef.current) return;
        moveEvent.preventDefault();
        applyPointer(moveEvent.clientX, moveEvent.clientY, true);
      };
      document.addEventListener('pointermove', documentMoveRef.current, { passive: false });

      if (tool === 'brush' || tool === 'eraser') {
        onStrokeStart?.();
      }

      applyPointer(event.clientX, event.clientY, true);
    },
    [
      applyAtCell,
      applyPointer,
      cellFromPoint,
      clearTouchLongPress,
      detachDocumentPointerMove,
      onStrokeStart,
      resolvePaintButton,
      tool,
    ],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (touchTapPendingRef.current) {
        clearTouchLongPress();
        touchTapPendingRef.current = null;
      }
      if (tool === 'fill' || tool === 'eyedropper') {
        applyPointer(event.clientX, event.clientY, false);
        return;
      }
      applyPointer(event.clientX, event.clientY, paintingRef.current);
    },
    [applyPointer, clearTouchLongPress, tool],
  );

  const stopPainting = useCallback(
    (event) => {
      const pendingTouchTap = touchTapPendingRef.current;
      const wasLongPress = longPressActivatedRef.current;
      clearTouchLongPress();

      if (pendingTouchTap && !wasLongPress && (tool === 'eyedropper' || tool === 'fill')) {
        applyAtCell(pendingTouchTap, 0);
      }

      touchTapPendingRef.current = null;
      longPressActivatedRef.current = false;

      const wasPainting = paintingRef.current;
      paintingRef.current = false;
      lastPaintedRef.current = null;
      detachDocumentPointerMove();
      if (event && gridRef.current?.hasPointerCapture(event.pointerId)) {
        gridRef.current.releasePointerCapture(event.pointerId);
      }
      if (wasPainting && (tool === 'brush' || tool === 'eraser')) {
        onStrokeEnd?.();
      }
    },
    [applyAtCell, clearTouchLongPress, detachDocumentPointerMove, onStrokeEnd, tool],
  );

  useEffect(() => {
    window.addEventListener('pointerup', stopPainting);
    return () => {
      window.removeEventListener('pointerup', stopPainting);
      detachDocumentPointerMove();
      clearTouchLongPress();
    };
  }, [clearTouchLongPress, detachDocumentPointerMove, stopPainting]);

  const hoverTile =
    hoverCell != null
      ? getPlannerTile(cells[getCellIndex(hoverCell.x, hoverCell.y, width)], tilesById)
      : null;

  const cursorClass =
    tool === 'eyedropper'
      ? ' city-planner-canvas--eyedropper'
      : tool === 'fill'
        ? ' city-planner-canvas--fill'
        : '';

  return (
    <div className="city-planner-canvas-wrap scroll-y">
      <div className="city-planner-canvas-scaffold">
        <div
          className="city-planner-canvas-scaffold__corner"
          aria-hidden="true"
          style={{ width: markerBandSize, minWidth: markerBandSize }}
        />
        <div ref={colTrackRef} className="city-planner-canvas-scaffold__cols-track">
          <div
            className="city-planner-canvas-scaffold__cols"
            aria-hidden="true"
            style={{
              gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
              height: markerBandSize,
            }}
          >
            {Array.from({ length: width }, (_, x) => (
              <span
                key={`col-${x}`}
                className={`city-planner-canvas__marker city-planner-canvas__marker--col${
                  centerColIndices.has(x) ? ' city-planner-canvas__marker--center' : ''
                }`}
                style={{ width: cellSize, fontSize: markerFontSize }}
              >
                {x + 1}
              </span>
            ))}
          </div>
        </div>
        <div ref={rowTrackRef} className="city-planner-canvas-scaffold__rows-track">
          <div
            className="city-planner-canvas-scaffold__rows"
            aria-hidden="true"
            style={{
              gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
              width: markerBandSize,
            }}
          >
            {Array.from({ length: height }, (_, y) => (
              <span
                key={`row-${y}`}
                className={`city-planner-canvas__marker city-planner-canvas__marker--row${
                  centerRowIndices.has(y) ? ' city-planner-canvas__marker--center' : ''
                }`}
                style={{ height: cellSize, fontSize: markerFontSize }}
              >
                {y + 1}
              </span>
            ))}
          </div>
        </div>
        <div
          ref={gridScrollRef}
          className="city-planner-canvas-scaffold__grid-scroll scroll-y"
          onScroll={handleGridScroll}
        >
          <div
            ref={gridRef}
            className={`city-planner-canvas${cursorClass}`}
            role="img"
            aria-label={`City layout grid, ${width} by ${height} cells`}
            style={{
              gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPainting}
            onPointerCancel={stopPainting}
            onPointerLeave={() => setHoverCell(null)}
            onContextMenu={(event) => event.preventDefault()}
          >
            {cells.map((tileId, index) => {
              const x = index % width;
              const y = Math.floor(index / width);
              const tile = getPlannerTile(tileId, tilesById);
              const isHover = hoverCell?.x === x && hoverCell?.y === y;
              const isEmpty = isEmptyTileId(tileId);
              const useColor = tileUsesGridColor(tile);
              const useSprite = tileUsesSpriteOnGrid(tile);
              const style = {};
              if (useColor && tile?.color) {
                style.backgroundColor = tile.color;
              }
              if (useSprite && tile?.imageSrc) {
                style.backgroundImage = `url(${tile.imageSrc})`;
                style.backgroundSize = isPropTileCategory(tile.category) ? 'contain' : 'cover';
                style.backgroundPosition = 'center';
                style.backgroundRepeat = 'no-repeat';
              }
              return (
                <div
                  key={index}
                  className={`city-planner-canvas__cell${
                    isHover ? ' city-planner-canvas__cell--hover' : ''
                  }${isEmpty ? ' city-planner-canvas__cell--empty' : ''}${
                    useSprite ? ' city-planner-canvas__cell--image' : ''
                  }${useSprite && isPropTileCategory(tile?.category)
                    ? ' city-planner-canvas__cell--prop'
                    : ''}${
                    centerColIndices.has(x) ? ' city-planner-canvas__cell--center-col' : ''
                  }${centerRowIndices.has(y) ? ' city-planner-canvas__cell--center-row' : ''}`}
                  style={style}
                  data-x={x}
                  data-y={y}
                />
              );
            })}
          </div>
        </div>
      </div>
      <p className="city-planner-canvas__hint">
        {tool === 'eyedropper'
          ? 'Tap to pick primary · hold for secondary'
          : tool === 'fill'
            ? 'Tap to fill · hold for secondary brush'
            : 'Drag to paint · hold palette item for secondary'}
        · Grid: {width}×{height} ({width * height} cells)
        {hoverTile && tool === 'eyedropper' ? ` · Sample: ${hoverTile.label}` : ''}
      </p>
    </div>
  );
}
