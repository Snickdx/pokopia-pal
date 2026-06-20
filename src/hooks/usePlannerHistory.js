import { useCallback, useRef, useState } from 'react';
import {
  applyCells,
  cloneCells,
  createHistory,
  MAX_PLANNER_HISTORY,
  redoHistory,
  undoHistory,
} from '../lib/cityPlanner/history.js';

/**
 * Undo/redo for planner cell grids. Supports batched strokes (drag painting).
 * @param {string[]} initialCells
 */
export function usePlannerHistory(initialCells) {
  const [history, setHistory] = useState(() => createHistory(initialCells));
  const strokeBase = useRef(null);

  const setCells = useCallback((updater, { record = true } = {}) => {
    setHistory((prev) => {
      const nextCells =
        typeof updater === 'function' ? updater(prev.cells) : cloneCells(updater);
      return applyCells(prev, nextCells, { record });
    });
  }, []);

  const startStroke = useCallback(() => {
    setHistory((prev) => {
      strokeBase.current = cloneCells(prev.cells);
      return prev;
    });
  }, []);

  const updateStroke = useCallback((updater) => {
    setHistory((prev) => {
      const nextCells = typeof updater === 'function' ? updater(prev.cells) : cloneCells(updater);
      if (nextCells === prev.cells) return prev;
      return { ...prev, cells: nextCells };
    });
  }, []);

  const endStroke = useCallback(() => {
    const base = strokeBase.current;
    strokeBase.current = null;
    if (!base) return;
    setHistory((prev) => {
      const changed =
        base.length !== prev.cells.length || base.some((cell, i) => cell !== prev.cells[i]);
      if (!changed) return prev;
      const undo = [...prev.undo, base].slice(-MAX_PLANNER_HISTORY);
      return { ...prev, undo, redo: [] };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => undoHistory(prev));
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => redoHistory(prev));
  }, []);

  const replaceCells = useCallback((cells, { record = true } = {}) => {
    setCells(() => cloneCells(cells), { record });
  }, [setCells]);

  return {
    cells: history.cells,
    setCells,
    startStroke,
    updateStroke,
    endStroke,
    undo,
    redo,
    replaceCells,
    canUndo: history.undo.length > 0,
    canRedo: history.redo.length > 0,
  };
}
