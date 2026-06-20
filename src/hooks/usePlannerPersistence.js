import { useCallback, useEffect, useRef, useState } from 'react';
import { saveCityPlanner } from '../lib/cityPlanner/storage.js';

const SAVE_DEBOUNCE_MS = 350;

/**
 * Autosave planner grid + brushes to localStorage.
 * @param {import('../lib/cityPlanner/storage.js').CityPlannerState} state
 * @param {boolean} enabled
 */
export function usePlannerPersistence(state, enabled) {
  const [lastSaved, setLastSaved] = useState(null);
  const timerRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const flushSave = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    saveCityPlanner(stateRef.current);
    setLastSaved(Date.now());
  }, [enabled]);

  const scheduleSave = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
  }, [enabled, flushSave]);

  useEffect(() => {
    scheduleSave();
  }, [
    state.width,
    state.height,
    state.cells,
    state.activeBlockId,
    state.secondaryBlockId,
    scheduleSave,
  ]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onHide = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };

    window.addEventListener('beforeunload', flushSave);
    document.addEventListener('visibilitychange', onHide);

    return () => {
      window.removeEventListener('beforeunload', flushSave);
      document.removeEventListener('visibilitychange', onHide);
      if (timerRef.current) clearTimeout(timerRef.current);
      flushSave();
    };
  }, [enabled, flushSave]);

  return { flushSave, lastSaved };
}
