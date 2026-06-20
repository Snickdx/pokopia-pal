import { usePreferenceDetail } from './PreferenceDetailLayout.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { HabitatCard } from '../components/cards/HabitatCard.jsx';
import { CardGridSkeleton } from '../components/skeletons/CardGridSkeleton.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

export function PreferenceHabitatsTab() {
  const { preference, habitats, habitatsLoading } = usePreferenceDetail();

  if (habitatsLoading) return <CardGridSkeleton variant="habitats" label="Loading habitats…" />;

  return (
    <>
      <p className="tab-hint">
        Habitats in <strong>{preference.category}</strong> · special unlocks (items, missions,
        must-build) hidden.
      </p>
      {!habitats.length ? (
        <EmptyState
          title="No habitats"
          message="No habitat previews for this scope (or only special unlock areas)."
        />
      ) : (
        <CardGrid variant="habitats">
          {habitats.map((h, i) => (
            <HabitatCard key={h.id} habitat={h} index={i} />
          ))}
        </CardGrid>
      )}
    </>
  );
}
