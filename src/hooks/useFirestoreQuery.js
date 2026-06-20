import { useEffect, useState } from 'react';
import { cacheEnsure, cachePeek } from '../lib/catalogCache.js';

/**
 * @param {() => Promise<T>} fetcher
 * @param {unknown[]} deps
 * @param {{ cacheKey?: string }} [options]
 */
export function useFirestoreQuery(fetcher, deps = [], options = {}) {
  const { cacheKey } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cacheKey) {
        await cacheEnsure(cacheKey);
        if (cancelled) return;

        const cached = cachePeek(cacheKey);
        if (cached !== undefined) {
          setData(cached);
          setLoading(false);
          setIsRefreshing(true);
        } else {
          setData(null);
          setLoading(true);
          setIsRefreshing(false);
        }
      } else {
        setData(null);
        setLoading(true);
        setIsRefreshing(false);
      }

      setError(null);

      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setLoading(false);
          setIsRefreshing(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...deps]);

  return { data, loading, error, isRefreshing };
}
