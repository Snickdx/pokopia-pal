export const MAX_PLANNER_HISTORY = 50;

function cellsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** @param {string[]} cells */
export function cloneCells(cells) {
  return cells.slice();
}

/**
 * @param {{ undo: string[][], redo: string[][], cells: string[] }} history
 * @param {string[]} cells
 */
export function pushHistory(history, cells) {
  const undo = [...history.undo, cloneCells(history.cells)].slice(-MAX_PLANNER_HISTORY);
  return { undo, redo: [], cells };
}

/**
 * @param {{ undo: string[][], redo: string[][], cells: string[] }} history
 * @param {string[]} cells
 * @param {{ record?: boolean }} [options]
 */
export function applyCells(history, cells, { record = true } = {}) {
  if (cellsEqual(history.cells, cells)) return history;
  if (!record) return { ...history, cells };
  return pushHistory(history, cells);
}

/** @param {{ undo: string[][], redo: string[][], cells: string[] }} history */
export function undoHistory(history) {
  if (!history.undo.length) return history;
  const previous = history.undo[history.undo.length - 1];
  const undo = history.undo.slice(0, -1);
  const redo = [...history.redo, cloneCells(history.cells)];
  return { undo, redo, cells: previous };
}

/** @param {{ undo: string[][], redo: string[][], cells: string[] }} history */
export function redoHistory(history) {
  if (!history.redo.length) return history;
  const next = history.redo[history.redo.length - 1];
  const redo = history.redo.slice(0, -1);
  const undo = [...history.undo, cloneCells(history.cells)];
  return { undo, redo, cells: next };
}

/** @param {string[]} cells */
export function createHistory(cells) {
  return { undo: [], redo: [], cells: cloneCells(cells) };
}

export { cellsEqual };
