import { GuidePage } from '../../components/GuidePage.jsx';
import { DreamIslandGrid } from '../../components/guides/DreamIslandGrid.jsx';
import { dreamIslands } from '../../data/guides.js';

export function DreamIslandsGuidePage() {
  return (
    <GuidePage
      title="Dream Island Guide"
      subtitle="Place these items on each doll island for a chance to find Legendary Pokémon."
    >
      <DreamIslandGrid islands={dreamIslands} />
    </GuidePage>
  );
}
