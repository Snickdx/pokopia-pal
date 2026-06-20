/** @typedef {{ search: string, environment: string, abilities: string[], favorite: string }} PokemonBrowseParams */

export function parsePokemonBrowseParams(searchParams) {
  const abilitiesRaw = searchParams.get('abilities') || '';
  return {
    search: searchParams.get('q') || '',
    environment: searchParams.get('env') || 'all',
    abilities: abilitiesRaw
      ? abilitiesRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    favorite: searchParams.get('fav') || 'all',
  };
}

/** @param {PokemonBrowseParams} params */
export function buildPokemonBrowseSearchParams({
  search,
  environment,
  abilities,
  favorite,
}) {
  const params = new URLSearchParams();
  const q = search.trim();
  if (q) params.set('q', q);
  if (environment && environment !== 'all') params.set('env', environment);
  if (abilities?.length) params.set('abilities', abilities.join(','));
  if (favorite && favorite !== 'all') params.set('fav', favorite);
  return params;
}

/** @param {PokemonBrowseParams} params */
export function pokemonBrowseQueryString(params) {
  const built = buildPokemonBrowseSearchParams(params);
  const qs = built.toString();
  return qs ? `?${qs}` : '';
}
