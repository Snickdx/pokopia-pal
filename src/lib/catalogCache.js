/** Light in-memory request dedup + stale-fallback layer.
 *  Offline persistence is handled by Firestore SDK's persistentLocalCache. */

/** @type {Map<string, { data: unknown, inflight: Promise<unknown> | null }>} */
const memory = new Map();

function getEntry(key) {
  return memory.get(key);
}

function setEntry(key, data) {
  memory.set(key, { data, inflight: null });
  return data;
}

/** Manually seed an in-memory entry (e.g. from a list-query result). */
export function cacheSet(key, data) {
  return setEntry(key, data);
}

/** Sync read — undefined when nothing cached in memory yet. */
export function cachePeek(key) {
  return getEntry(key)?.data;
}

/**
 * Fetch with dedup and stale-fallback on error (no TTL — always goes to Firestore,
 * which serves its own persistent cache when offline).
 * @param {string} key
 * @param {() => Promise<T>} fetcher
 * @returns {Promise<T>}
 */
export async function cacheFetch(key, fetcher) {
  const entry = getEntry(key);

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

  memory.set(key, { data: entry?.data, inflight });

  return inflight;
}

export function catalogKey(...parts) {
  return parts.filter((p) => p !== undefined && p !== null && p !== '').join(':');
}
