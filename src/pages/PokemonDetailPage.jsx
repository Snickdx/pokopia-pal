import { Link, useParams } from 'react-router-dom';

import {

  getPokemon,

  getHabitatsByIds,

  getPreferredItemsForPokemon,

} from '../lib/catalog.js';

import { catalogKey } from '../lib/catalogCache.js';

import { useFirestoreQuery } from '../hooks/useFirestoreQuery.js';

import { pokemonSpriteSrc } from '../lib/assets.js';
import { formatAbilityLabel } from '../lib/litterbugs.js';

import { LoadingState } from '../components/states/LoadingState.jsx';

import { ErrorState } from '../components/states/ErrorState.jsx';

import { TagPill } from '../components/TagPill.jsx';

import { ShareButton } from '../components/ShareButton.jsx';
import { DetailBackLink } from '../components/DetailBackLink.jsx';

import { HabitatCard } from '../components/cards/HabitatCard.jsx';

import {

  absoluteUrl,

  pokemonPath,

  preferencePath,

  shareTitleForPokemon,

} from '../lib/routes.js';

import { ItemCard } from '../components/cards/ItemCard.jsx';

import { CardGrid } from '../components/CardGrid.jsx';



export function PokemonDetailPage() {

  const { pokemonId } = useParams();

  const { data: pokemon, loading, error } = useFirestoreQuery(

    () => getPokemon(pokemonId),

    [pokemonId],

    { cacheKey: catalogKey('pokemon', pokemonId) },

  );



  const habitatsQuery = useFirestoreQuery(

    () => getHabitatsByIds(pokemon?.habitatIds ?? []),

    [pokemonId, pokemon?.habitatIds?.join(',')],

    {

      cacheKey: catalogKey(

        'pokemon',

        pokemonId,

        'habitats',

        (pokemon?.habitatIds ?? []).slice().sort().join(','),

      ),

    },

  );



  const preferredItemsQuery = useFirestoreQuery(

    () => getPreferredItemsForPokemon(pokemon),

    [pokemonId, pokemon?.preferenceIds?.join(',')],

    {

      cacheKey: catalogKey(

        'pokemon',

        pokemonId,

        'preferred-items',

        (pokemon?.preferenceIds ?? []).slice().sort().join(','),

      ),

    },

  );



  if (loading) return <LoadingState variant="pokemon" />;

  if (error) return <ErrorState message={error.message} />;

  if (!pokemon) {

    return (

      <section className="detail-page glass-panel">

        <p>Pokémon not found. <Link to="/pokemon">Back</Link></p>

      </section>

    );

  }



  const src = pokemonSpriteSrc(pokemon);

  const hasAbilities = pokemon.abilityPrimary || pokemon.abilitySecondary;



  return (

    <section className="detail-page glass-panel">

      <div className="detail-page__scroll scroll-y">

        <div className="detail-page__toolbar">

          <DetailBackLink fallbackTo="/pokemon" fallbackLabel="← All Pokémon" />

          <ShareButton

            title={shareTitleForPokemon(pokemon)}

            text={`${pokemon.dexDisplay} ${pokemon.name}`}

            url={absoluteUrl(pokemonPath(pokemon))}

          />

        </div>

        <div className="detail-page__hero detail-page__hero--row">

          <div className="detail-page__sprite">

            {src ? <img src={src} alt="" /> : <span>?</span>}

          </div>

          <div className="detail-page__summary">

            <p className="detail-page__eyebrow">{pokemon.dexDisplay}</p>

            <h1 className="detail-page__title">{pokemon.name}</h1>



            {pokemon.ambientLight && (

              <div className="detail-page__block">

                <p className="detail-page__block-label">Preferred environment</p>

                <p className="detail-page__trait">{pokemon.ambientLight}</p>

              </div>

            )}



            {hasAbilities && (

              <div className="detail-page__block">

                <p className="detail-page__block-label">Abilities</p>

                <ul className="detail-page__traits">

                  {pokemon.abilityPrimary && (

                    <li>

                      <span className="detail-page__trait-key">Primary</span>

                      <span>{formatAbilityLabel(pokemon.abilityPrimary, pokemon)}</span>

                    </li>

                  )}

                  {pokemon.abilitySecondary && (

                    <li>

                      <span className="detail-page__trait-key">Secondary</span>

                      <span>{formatAbilityLabel(pokemon.abilitySecondary, pokemon)}</span>

                    </li>

                  )}

                </ul>

              </div>

            )}



            {(pokemon.preferenceLabels || []).length > 0 && (

              <div className="detail-page__block">

                <p className="detail-page__block-label">Preferences</p>

                <div className="detail-page__tags">

                  {(pokemon.preferenceLabels || []).map((p) => (

                    <Link key={p.slug} to={preferencePath({ id: p.slug })}>

                      <TagPill variant="pref" title={p.category || undefined}>

                        {p.displayName}

                        {p.category ? (

                          <span className="detail-page__tag-cat"> · {p.category}</span>

                        ) : null}

                      </TagPill>

                    </Link>

                  ))}

                </div>

              </div>

            )}

          </div>

        </div>



        {habitatsQuery.data?.length > 0 && (

          <>

            <h2 className="detail-page__section">Habitats</h2>

            <CardGrid variant="habitats">

              {habitatsQuery.data.map((h, i) => (

                <HabitatCard key={h.id} habitat={h} index={i} showBookmark />

              ))}

            </CardGrid>

          </>

        )}



        {preferredItemsQuery.data?.length > 0 && (

          <>

            <h2 className="detail-page__section">Preferred items</h2>

            <p className="detail-page__section-hint">

              These guide items match this Pokémon&apos;s preferences. Use them when building

              habitats to create a preferred environment they are more likely to enjoy.

            </p>

            <CardGrid variant="items">

              {preferredItemsQuery.data.map(({ item, preferences }, i) => (

                <ItemCard key={item.id} item={item} index={i} preferences={preferences} />

              ))}

            </CardGrid>

          </>

        )}

      </div>

    </section>

  );

}

