import { GuidePage } from '../../components/GuidePage.jsx';
import { LitterbugsGrid } from '../../components/guides/LitterbugsGrid.jsx';
import { litterbugs } from '../../data/guides.js';

export function LitterbugsGuidePage() {
  return (
    <GuidePage
      title="Litterbugs"
      subtitle="Pokémon with the Litter ability and the materials they leave around town. Tap a Pokémon to open its catalog entry."
    >
      <LitterbugsGrid categories={litterbugs} />
    </GuidePage>
  );
}
