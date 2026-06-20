import { usePreferenceDetail } from './PreferenceDetailLayout.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { PokemonCard } from '../components/cards/PokemonCard.jsx';
import { CardGridSkeleton } from '../components/skeletons/CardGridSkeleton.jsx';
import { EmptyState } from '../components/states/EmptyState.jsx';

export function PreferencePokemonTab() {
  const { pokemon, pokemonLoading } = usePreferenceDetail();

  if (pokemonLoading) return <CardGridSkeleton variant="pokemon" count={6} label="Loading Pokémon…" />;

  if (!pokemon.length) {
    return (
      <EmptyState
        title="No Pokémon"
        message="No Pokémon rows list this preference in the tracker sheet."
      />
    );
  }

  return (
    <CardGrid variant="pokemon">
      {pokemon.map((p, i) => (
        <PokemonCard key={p.id} pokemon={p} index={i} />
      ))}
    </CardGrid>
  );
}
