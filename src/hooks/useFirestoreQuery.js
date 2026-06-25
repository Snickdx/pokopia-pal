import { useEffect, useState } from 'react';
import { cachePeek } from '../lib/catalogCache.js';

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

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const cached = cacheKey ? cachePeek(cacheKey) : undefined;
      if (cached !== undefined) {
        setData(cached);
        setLoading(false);
      } else {
        setData(null);
        setLoading(true);
      }

      setError(null);

      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...deps]);

  return { data, loading, error };
}
