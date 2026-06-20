import { useEffect, useMemo, useState } from 'react';
import { itemImageCandidates } from '../lib/assets.js';

export function ItemImage({ item, alt = '', className, loading, decoding }) {
  const candidates = useMemo(() => itemImageCandidates(item), [item]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [item?.id, candidates.join('|')]);

  const src = candidates[index];
  if (!src || index >= candidates.length) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
