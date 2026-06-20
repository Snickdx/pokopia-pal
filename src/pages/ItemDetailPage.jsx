import { Link, useParams } from 'react-router-dom';
import {
  getItem,
  getHabitatsByIds,
  getPokemonForItemHabitats,
} from '../lib/catalog.js';
import { catalogKey } from '../lib/catalogCache.js';
import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';
import { ItemImage } from '../components/ItemImage.jsx';
import { itemHasImage } from '../lib/assets.js';
import { LoadingState } from '../components/states/LoadingState.jsx';
import { ErrorState } from '../components/states/ErrorState.jsx';
import { TagPill } from '../components/TagPill.jsx';
import { ItemMetaPills } from '../components/ItemCategoryPill.jsx';
import { ShareButton } from '../components/ShareButton.jsx';
import { DetailBackLink } from '../components/DetailBackLink.jsx';
import { HabitatCard } from '../components/cards/HabitatCard.jsx';
import {
  absoluteUrl,
  itemPath,
  preferencePath,
  shareTitleForItem,
} from '../lib/routes.js';
import { PokemonCard } from '../components/cards/PokemonCard.jsx';
import { CardGrid } from '../components/CardGrid.jsx';

export function ItemDetailPage() {
  const { itemId } = useParams();
  const { data: item, loading, error } = useFirestoreQuery(
    () => getItem(itemId),
    [itemId],
    { cacheKey: catalogKey('item', itemId) },
  );

  const habitatsQuery = useFirestoreQuery(
    () => getHabitatsByIds(item?.habitatIds ?? []),
    [itemId, item?.habitatIds?.join(',')],
    {
      cacheKey: catalogKey(
        'item',
        itemId,
        'habitats',
        (item?.habitatIds ?? []).slice().sort().join(','),
      ),
    },
  );

  const pokemonQuery = useFirestoreQuery(
    () => getPokemonForItemHabitats(item),
    [itemId, item?.habitatIds?.join(',')],
    { cacheKey: catalogKey('item', itemId, 'pokemon') },
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!item) {
    return (
      <section className="detail-page glass-panel">
        <p>Item not found. <Link to="/items">Back</Link></p>
      </section>
    );
  }

  return (
    <section className="detail-page glass-panel">
      <div className="detail-page__scroll scroll-y">
      <div className="detail-page__toolbar">
        <DetailBackLink fallbackTo="/items" fallbackLabel="← All items" />
        <ShareButton
          title={shareTitleForItem(item)}
          text={item.name}
          url={absoluteUrl(itemPath(item))}
        />
      </div>
      <div className="detail-page__hero detail-page__hero--row">
        <div className="detail-page__thumb">
          {itemHasImage(item) ? (
            <ItemImage item={item} />
          ) : (
            <span>◆</span>
          )}
        </div>
        <div>
          <ItemMetaPills item={item} />
          <h1 className="detail-page__title">{item.name}</h1>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="detail-page__link">
              View on Pokopia guide ↗
            </a>
          )}
          <div className="detail-page__tags">
            {(item.preferenceIds || []).map((pid) => (
              <Link key={pid} to={preferencePath({ id: pid }, 'items')}>
                <TagPill>{pid.replace(/-/g, ' ')}</TagPill>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {habitatsQuery.data?.length > 0 && (
        <>
          <h2 className="detail-page__section">Habitats using this item</h2>
          <CardGrid variant="habitats">
            {habitatsQuery.data.map((h, i) => (
              <HabitatCard key={h.id} habitat={h} index={i} />
            ))}
          </CardGrid>
        </>
      )}

      {pokemonQuery.data?.length > 0 && (
        <>
          <h2 className="detail-page__section">Related Pokémon</h2>
          <CardGrid variant="pokemon">
            {pokemonQuery.data.map((p, i) => (
              <PokemonCard key={p.id} pokemon={p} index={i} />
            ))}
          </CardGrid>
        </>
      )}
      </div>
    </section>
  );
}
