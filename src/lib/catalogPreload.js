import {
  getPreferences,
  getHabitats,
  getItems,
  getPokemonList,
} from './catalog.js';

/** Prefetch main catalog collections at startup so Firestore SDK local cache is warm. */
export async function initCatalogCache() {
  if (typeof indexedDB !== 'undefined') {
    try { await indexedDB.deleteDatabase('pokopia-pal-catalog'); } catch { /* ignore */ }
  }

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
