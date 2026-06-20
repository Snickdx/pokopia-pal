/** In-memory + IndexedDB cache for catalog reads (offline + instant repeat navs). */

const IDB_NAME = 'pokopia-pal-catalog';
const IDB_STORE = 'entries';
const DEFAULT_MAX_AGE_MS = 15 * 60 * 1000;

/** @type {Map<string, { data: unknown, fetchedAt: number, inflight: Promise<unknown> | null }>} */
const memory = new Map();

let idbReady = null;

function openIdb() {
  if (idbReady) return idbReady;
  if (typeof indexedDB === 'undefined') {
    idbReady = Promise.resolve(null);
    return idbReady;
  }
  idbReady = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return idbReady;
}

async function idbGet(key) {
  const db = await openIdb();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, entry) {
  const db = await openIdb();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).put(entry, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function getEntry(key) {
  return memory.get(key);
}

function setEntry(key, data) {
  const fetchedAt = Date.now();
  memory.set(key, { data, fetchedAt, inflight: null });
  idbSet(key, { data, fetchedAt }).catch(() => {});
  return data;
}

/** Sync read — undefined when nothing cached yet. */
export function cachePeek(key) {
  return getEntry(key)?.data;
}

export function cacheIsFresh(key, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  const entry = getEntry(key);
  if (!entry || entry.data === undefined) return false;
  return Date.now() - entry.fetchedAt < maxAgeMs;
}

/** Load persisted entries into memory (call once at startup). */
export async function hydrateCatalogCache() {
  const db = await openIdb();
  if (!db) return 0;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).openCursor();
    let count = 0;

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) {
        resolve(count);
        return;
      }
      const key = cursor.key;
      const value = cursor.value;
      if (key && value?.data !== undefined) {
        memory.set(String(key), {
          data: value.data,
          fetchedAt: value.fetchedAt ?? 0,
          inflight: null,
        });
        count += 1;
      }
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Fetch with deduplication, stale fallback on error, and IDB persistence.
 * @param {string} key
 * @param {() => Promise<T>} fetcher
 * @param {{ maxAgeMs?: number }} [options]
 * @returns {Promise<T>}
 */
export async function cacheFetch(key, fetcher, options = {}) {
  const maxAgeMs = options.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  const entry = getEntry(key);
  const now = Date.now();
  const fresh = entry?.data !== undefined && now - entry.fetchedAt < maxAgeMs;

  if (fresh) return entry.data;

  if (entry?.inflight) return entry.inflight;

  const inflight = (async () => {
    try {
      const data = await fetcher();
      setEntry(key, data);
      return data;
    } catch (err) {
      if (entry?.data !== undefined) {
        console.warn('Catalog fetch failed; using cached data for', key, err);
        return entry.data;
      }
      throw err;
    } finally {
      const current = getEntry(key);
      if (current) current.inflight = null;
    }
  })();

  memory.set(key, {
    data: entry?.data,
    fetchedAt: entry?.fetchedAt ?? 0,
    inflight,
  });

  return inflight;
}

/** Warm memory from IDB for a key if missing. */
export async function cacheEnsure(key) {
  if (getEntry(key)?.data !== undefined) return cachePeek(key);
  const stored = await idbGet(key);
  if (stored?.data !== undefined) {
    memory.set(key, { data: stored.data, fetchedAt: stored.fetchedAt ?? 0, inflight: null });
    return stored.data;
  }
  return undefined;
}

export function catalogKey(...parts) {
  return parts.filter((p) => p !== undefined && p !== null && p !== '').join(':');
}
