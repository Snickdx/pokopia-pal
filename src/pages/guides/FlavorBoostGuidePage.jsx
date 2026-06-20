import { GuidePage } from '../../components/GuidePage.jsx';
import { SnorlaxRecipeMatrix } from '../../components/guides/SnorlaxRecipeMatrix.jsx';

export function FlavorBoostGuidePage() {
  return (
    <GuidePage
      title="Mosslax Boosts"
      subtitle="Recipe chart — ingredients, stations, and flavored dishes for Mosslax area bonuses."
    >
      <SnorlaxRecipeMatrix />
    </GuidePage>
  );
}
