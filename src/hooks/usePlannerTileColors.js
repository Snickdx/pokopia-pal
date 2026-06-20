import { useEffect, useState } from 'react';
import { enrichTilesWithPrimaryColors } from '../lib/cityPlanner/tileColors.js';

/** Resolve grid colors from catalog sprites (Blocks and Terrain). */
export function usePlannerTileColors(tiles) {
  const [resolved, setResolved] = useState(tiles);

  useEffect(() => {
    let active = true;
    enrichTilesWithPrimaryColors(tiles).then((next) => {
      if (active) setResolved(next);
    });
    return () => {
      active = false;
    };
  }, [tiles]);

  return resolved;
}
