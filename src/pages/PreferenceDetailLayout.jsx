import { createContext, useContext } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { entityRouteSlug, preferenceMatchesRoute } from '../lib/normalize.js';
import { absoluteUrl, shareTitleForPreference } from '../lib/routes.js';
import {
  getPreference,
  getHabitatsForPreference,
  getItemsForPreference,
  getPokemonForPreference,
} from '../lib/catalog.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { DetailPanel } from '../components/DetailPanel.jsx';
import { PillTabs } from '../components/PillTabs.jsx';
import { CountBadgeGroup } from '../components/CountBadge.jsx';
import { PreferenceDetailSkeleton } from '../components/skeletons/PreferenceDetailSkeleton.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { usePreferencesNav } from '../context/PreferencesNavContext.jsx';
import { catalogKey } from '../lib/catalogCache.js';

const TABS = [
  { to: 'habitats', label: 'Habitats', icon: '🏠' },
  { to: 'items', label: 'Items', icon: '✦' },
  { to: 'pokemon', label: 'Pokémon', icon: '◎' },
];

export function PreferenceDetailLayout() {
  const { preferenceId } = useParams();
  const location = useLocation();
  const { data: preference, loading, error } = useFirestoreQuery(
    () => getPreference(preferenceId),
    [preferenceId],
    { cacheKey: catalogKey('preference', preferenceId) },
  );

  const nav = usePreferencesNav();

  const preferenceReady =
    preference && preferenceMatchesRoute(preference, preferenceId);

  if (loading || !preferenceReady) {
    return <PreferenceDetailSkeleton showMenuButton={nav?.isMobile} />;
  }
  if (error) {
    return (
      <section className="detail-panel glass-panel page-frame page-frame--center">
        <ErrorState message={error.message} />
      </section>
    );
  }
  if (!preference) return <Navigate to="/preferences" replace />;

  const prefSlug = entityRouteSlug(preference);

  return (
    <PreferenceDetailProvider key={preferenceId} preference={preference}>
      <DetailPanel
        eyebrow={preference.category}
        title={preference.displayName}
        badges={<CountBadgeGroup counts={preference.counts} />}
        share={{
          title: shareTitleForPreference(preference),
          text: `${preference.displayName} — ${preference.category}`,
          url: absoluteUrl(location.pathname),
        }}
        tabs={<PillTabs tabs={TABS} basePath={`/preferences/${prefSlug}`} />}
      >
        <Outlet />
      </DetailPanel>
    </PreferenceDetailProvider>
  );
}

const PreferenceContext = createContext(null);

function PreferenceDetailProvider({ preference, children }) {
  const { preferenceId } = useParams();
  const habitatIdsKey = (preference?.habitatIds ?? []).slice().sort().join(',');
  const itemIdsKey = (preference?.itemIds ?? []).slice().sort().join(',');
  const pokemonIdsKey = (preference?.pokemonIds ?? []).slice().sort().join(',');

  const habitatsQuery = useFirestoreQuery(
    () => getHabitatsForPreference(preference),
    [preferenceId, habitatIdsKey],
    { cacheKey: catalogKey('preference', preferenceId, 'habitats', habitatIdsKey) },
  );
  const itemsQuery = useFirestoreQuery(
    () => getItemsForPreference(preference),
    [preferenceId, itemIdsKey],
    { cacheKey: catalogKey('preference', preferenceId, 'items', itemIdsKey) },
  );
  const pokemonQuery = useFirestoreQuery(
    () => getPokemonForPreference(preference),
    [preferenceId, pokemonIdsKey],
    { cacheKey: catalogKey('preference', preferenceId, 'pokemon', pokemonIdsKey) },
  );

  const value = {
    preference,
    habitats: habitatsQuery.data ?? [],
    habitatsLoading: habitatsQuery.loading,
    items: itemsQuery.data ?? [],
    itemsLoading: itemsQuery.loading,
    pokemon: pokemonQuery.data ?? [],
    pokemonLoading: pokemonQuery.loading,
  };

  return (
    <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>
  );
}

export function usePreferenceDetail() {
  const ctx = useContext(PreferenceContext);
  if (!ctx) throw new Error('usePreferenceDetail outside provider');
  return ctx;
}
