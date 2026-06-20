import { useMemo, useState } from 'react';
import { guideItemEmoji } from '../../lib/guideAssets.js';
import { guideImageCandidates } from '../../lib/guideImageMap.js';

export function GuideDishImage({ name, size = 'dish', className = '' }) {
  const candidates = useMemo(() => guideImageCandidates(name), [name]);
  const [index, setIndex] = useState(0);

  const src = candidates[index];
  const sizeClass =
    size === 'hero' ? 'guide-dish-img--hero' : size === 'sm' ? 'guide-dish-img--sm' : 'guide-dish-img--dish';

  if (!src || index >= candidates.length) {
    return (
      <span
        className={`guide-dish-img guide-dish-img--fallback ${sizeClass} ${className}`.trim()}
        title={name}
      >
        {guideItemEmoji(name)}
      </span>
    );
  }

  return (
    <span className={`guide-dish-img ${sizeClass} ${className}`.trim()} title={name}>
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => setIndex((i) => i + 1)}
      />
    </span>
  );
}
