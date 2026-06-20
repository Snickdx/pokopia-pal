import { useMemo, useState } from 'react';
import { guideItemEmoji } from '../../lib/guideAssets.js';
import { guideImageCandidates, isWildcardIngredient } from '../../lib/guideImageMap.js';

export function GuideIcon({ name, size = 'md', className = '' }) {
  const wildcard = isWildcardIngredient(name);
  const candidates = useMemo(
    () => (wildcard ? [] : guideImageCandidates(name)),
    [name, wildcard],
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index];
  const sizeClass = size === 'sm' ? 'guide-icon--sm' : size === 'lg' ? 'guide-icon--lg' : '';

  if (wildcard) {
    return (
      <span
        className={`guide-icon guide-icon--wildcard ${sizeClass} ${className}`.trim()}
        title={name}
        aria-label={name}
      >
        ?
      </span>
    );
  }

  if (src && index < candidates.length) {
    return (
      <span className={`guide-icon ${sizeClass} ${className}`.trim()} title={name}>
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setIndex((i) => i + 1)}
        />
      </span>
    );
  }

  return (
    <span
      className={`guide-icon guide-icon--emoji ${sizeClass} ${className}`.trim()}
      title={name}
      aria-hidden
    >
      {guideItemEmoji(name)}
    </span>
  );
}

export function GuideIconRow({ items, size = 'md' }) {
  return (
    <div className="guide-icon-row">
      {items.map((item) => (
        <GuideIcon key={item} name={item} size={size} />
      ))}
    </div>
  );
}
