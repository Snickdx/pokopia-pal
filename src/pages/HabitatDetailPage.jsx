import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import {
  getHabitat,
  getPokemonByIds,
  getItemsByIds,
  getPreferences,
} from '../lib/catalog.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { habitatImageSrc } from '../lib/assets.js';
import { habitatTitle, habitatCardItemLines } from '../lib/normalize.js';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { TagPill } from '../components/TagPill.jsx';
import { ShareButton } from '../components/ShareButton.jsx';
import { PokemonCard } from '../components/cards/PokemonCard.jsx';
import {
  absoluteUrl,
  habitatPath,
  preferencePath,
  shareTitleForHabitat,
} from '../lib/routes.js';
import { ItemCard } from '../components/cards/ItemCard.jsx';
import { CardGrid } from '../components/CardGrid.jsx';
import { BookmarkButton } from '../components/BookmarkButton.jsx';
import { DetailBackLink } from '../components/DetailBackLink.jsx';
import { useHabitatBookmarks } from '../hooks/useHabitatBookmarks.js';

export function HabitatDetailPage() {
  const { habitatId } = useParams();
  const { isBookmarked, toggleBookmark } = useHabitatBookmarks();
  const { data: habitat, loading, error } = useFirestoreQuery(
    () => getHabitat(habitatId),
    [habitatId],
    { cacheKey: catalogKey('habitat', habitatId) },
  );

  const pokemonQuery = useFirestoreQuery(
    () => getPokemonByIds(habitat?.pokemonIds ?? []),
    [habitatId, habitat?.pokemonIds?.join(',')],
    {
      cacheKey: catalogKey(
        'habitat',
        habitatId,
        'pokemon',
        (habitat?.pokemonIds ?? []).slice().sort().join(','),
      ),
    },
  );

  const itemsQuery = useFirestoreQuery(
    () => getItemsByIds(habitat?.itemIds ?? []),
    [habitatId, habitat?.itemIds?.join(',')],
    {
      cacheKey: catalogKey(
        'habitat',
        habitatId,
        'items',
        (habitat?.itemIds ?? []).slice().sort().join(','),
      ),
    },
  );

  const prefsQuery = useFirestoreQuery(getPreferences, [], {
    cacheKey: catalogKey('preferences', 'all'),
  });

  const favoriteLinks = useMemo(() => {
    const byId = new Map((prefsQuery.data || []).map((p) => [p.id, p.displayName]));
    return (habitat?.preferenceIds ?? []).map((id) => ({
      id,
      label: byId.get(id) || id.replace(/-/g, ' '),
    }));
  }, [prefsQuery.data, habitat?.preferenceIds?.join(',')]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!habitat) {
    return (
      <section className="detail-page glass-panel">
        <p>Habitat not found. <Link to="/habitats">Back to habitats</Link></p>
      </section>
    );
  }

  const src = habitatImageSrc(habitat);
  const title = habitat.title || habitatTitle(habitat.label, habitat.details) || 'Habitat';
  const itemLines = habitatCardItemLines(habitat.label, habitat.details);

  return (
    <section className="detail-page glass-panel">
      <div className="detail-page__scroll scroll-y">
      <div className="detail-page__toolbar">
        <DetailBackLink fallbackTo="/habitats" fallbackLabel="← Habitats" />
        <div className="detail-page__toolbar-actions">
        <ShareButton
          title={shareTitleForHabitat(habitat, title)}
          text={title}
          url={absoluteUrl(habitatPath(habitat))}
        />
        <BookmarkButton
          bookmarked={isBookmarked(habitat)}
          title={title}
          onToggle={() => toggleBookmark(habitat)}
        />
        </div>
      </div>
      <div className="detail-page__hero detail-page__hero--habitat">
        <div className="detail-page__image">
          {src ? <img src={src} alt="" /> : <span aria-hidden>🏠</span>}
        </div>
        <div className="detail-page__summary">
          <h1 className="detail-page__title">{title}</h1>

          {itemLines.length > 0 && (
            <div className="detail-page__block">
              <p className="detail-page__block-label">Items</p>
              <ul className="detail-page__recipe">
                {itemLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {favoriteLinks.length > 0 && (
            <div className="detail-page__block">
              <p className="detail-page__block-label">Preferences</p>
              <div className="detail-page__tags">
                {favoriteLinks.map((fav) => (
                  <Link key={fav.id} to={preferencePath({ id: fav.id })}>
                    <TagPill variant="pref">{fav.label}</TagPill>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {pokemonQuery.data?.length > 0 && (
        <>
          <h2 className="detail-page__section">Pokémon</h2>
          <CardGrid variant="pokemon">
            {pokemonQuery.data.map((p, i) => (
              <PokemonCard key={p.id} pokemon={p} index={i} />
            ))}
          </CardGrid>
        </>
      )}

      {itemsQuery.data?.length > 0 && (
        <>
          <h2 className="detail-page__section">Items in habitat</h2>
          <CardGrid variant="items">
            {itemsQuery.data.map((it, i) => (
              <ItemCard key={it.id} item={it} index={i} />
            ))}
          </CardGrid>
        </>
      )}
      </div>
    </section>
  );
}
