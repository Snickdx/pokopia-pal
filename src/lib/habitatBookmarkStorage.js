import { entityRouteSlug } from './normalize.js';

const STORAGE_KEY = 'pokopia-habitat-bookmarks';

const listeners = new Set();
let bookmarkIds = loadHabitatBookmarkIds();

function notify() {
  for (const listener of listeners) listener();
}

/** @returns {string[]} */
export function loadHabitatBookmarkIds() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

/** @param {string[]} ids */
export function saveHabitatBookmarkIds(ids) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore quota / privacy mode errors.
  }
}

export function habitatBookmarkKey(habitat) {
  return entityRouteSlug(habitat);
}

export function getHabitatBookmarkIds() {
  return bookmarkIds;
}

export function isHabitatBookmarked(habitat) {
  const key = typeof habitat === 'string' ? habitat : habitatBookmarkKey(habitat);
  return bookmarkIds.includes(key);
}

export function toggleHabitatBookmark(habitat) {
  const key = typeof habitat === 'string' ? habitat : habitatBookmarkKey(habitat);
  bookmarkIds = bookmarkIds.includes(key)
    ? bookmarkIds.filter((id) => id !== key)
    : [...bookmarkIds, key];
  saveHabitatBookmarkIds(bookmarkIds);
  notify();
  return bookmarkIds.includes(key);
}

/** @param {string[]} validKeys */
export function pruneHabitatBookmarks(validKeys) {
  const valid = new Set(validKeys);
  const next = bookmarkIds.filter((id) => valid.has(id));
  if (next.length === bookmarkIds.length) return bookmarkIds;
  bookmarkIds = next;
  saveHabitatBookmarkIds(bookmarkIds);
  notify();
  return bookmarkIds;
}

export function subscribeHabitatBookmarks(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
