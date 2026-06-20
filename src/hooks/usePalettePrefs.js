import { useCallback, useState } from 'react';
import {
  loadPalettePrefs,
  reorderTileIds,
  savePalettePrefs,
} from '../lib/cityPlanner/palettePrefs.js';

export function usePalettePrefs() {
  const [tileOrder, setTileOrder] = useState(() => loadPalettePrefs().tileOrder);

  const reorderTiles = useCallback((category, fromIndex, toIndex, categoryTileIds) => {
    if (fromIndex === toIndex) return;
    const nextIds = reorderTileIds(categoryTileIds, fromIndex, toIndex);
    setTileOrder((prev) => {
      const updated = { ...prev, [category]: nextIds };
      savePalettePrefs({ tileOrder: updated });
      return updated;
    });
  }, []);

  return { tileOrder, reorderTiles };
}
