import { EmptyState } from '../components/states/EmptyState.jsx';

export function PreferencesWelcome() {
  return (
    <div className="glass-panel welcome-panel">
      <EmptyState
        title="Choose a preference from the list"
        message="Each like connects to Pokémon from your tracker, their habitat setups, and guide items that match that vibe."
        icon="✿"
      />
    </div>
  );
}
