import { hydrateCatalogCache } from './catalogCache.js';
import {
  getPreferences,
  getHabitats,
  getItems,
  getPokemonList,
} from './catalog.js';

/** Restore IDB snapshots and prefetch main catalog collections when online. */
export async function initCatalogCache() {
  await hydrateCatalogCache();

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return;
  }

  await Promise.allSettled([
    getPreferences(),
    getHabitats(),
    getItems(),
    getPokemonList(),
  ]);
}
