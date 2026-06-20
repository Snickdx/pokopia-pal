export const POKEMON_ENVIRONMENT_OPTIONS = [
  { id: 'all', label: 'All environments' },
  { id: 'Bright', label: 'Bright' },
  { id: 'Cool', label: 'Cool' },
  { id: 'Dark', label: 'Dark' },
  { id: 'Dry', label: 'Dry' },
  { id: 'Humid', label: 'Humid' },
  { id: 'Warm', label: 'Warm' },
];

function pokemonAbilities(pokemon) {
  return [pokemon?.abilityPrimary, pokemon?.abilitySecondary].filter(Boolean);
}

function pokemonMatchesSearch(pokemon, term) {
  const t = term.trim().toLowerCase();
  if (!t) return true;

  const fields = [
    pokemon.name,
    pokemon.dexDisplay,
    pokemon.ambientLight,
    ...pokemonAbilities(pokemon),
    ...(pokemon.preferenceLabels || []).map((p) => p.displayName),
    ...(pokemon.preferenceLabels || []).map((p) => p.category),
  ];

  return fields.some((value) => String(value ?? '').toLowerCase().includes(t));
}

export function searchPokemonList(pokemonList, term) {
  const t = term.trim();
  if (!t) return pokemonList;
  return pokemonList.filter((pokemon) => pokemonMatchesSearch(pokemon, t));
}

export function pokemonMatchesFilters(
  pokemon,
  { environment = 'all', abilities = [], favorite = 'all' } = {},
) {
  if (environment !== 'all' && pokemon.ambientLight !== environment) return false;
  if (abilities.length > 0) {
    const names = pokemonAbilities(pokemon);
    if (!abilities.some((ability) => names.includes(ability))) return false;
  }
  if (favorite !== 'all' && !(pokemon.preferenceIds || []).includes(favorite)) return false;
  return true;
}

export function filterPokemonList(pokemonList, filters) {
  return pokemonList.filter((pokemon) => pokemonMatchesFilters(pokemon, filters));
}

export function buildPokemonFilterCounts(pokemonList) {
  const environment = { all: pokemonList.length };
  const ability = { all: pokemonList.length };
  const favorite = { all: pokemonList.length };

  for (const env of POKEMON_ENVIRONMENT_OPTIONS) {
    if (env.id !== 'all') environment[env.id] = 0;
  }

  for (const pokemon of pokemonList) {
    if (pokemon.ambientLight) {
      environment[pokemon.ambientLight] = (environment[pokemon.ambientLight] || 0) + 1;
    }
    for (const name of pokemonAbilities(pokemon)) {
      ability[name] = (ability[name] || 0) + 1;
    }
    for (const prefId of pokemon.preferenceIds || []) {
      favorite[prefId] = (favorite[prefId] || 0) + 1;
    }
  }

  return { environment, ability, favorite };
}

export function buildPokemonAbilityOptions(pokemonList) {
  const counts = buildPokemonFilterCounts(pokemonList).ability;
  return Object.entries(counts)
    .filter(([id, count]) => id !== 'all' && count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => ({ id, label: id, count }));
}

export function buildPokemonFavoriteOptions(preferences, pokemonList) {
  const counts = buildPokemonFilterCounts(pokemonList).favorite;
  const byId = new Map((preferences || []).map((p) => [p.id, p]));

  const options = [{ id: 'all', label: 'All preferences' }];
  for (const [id, count] of Object.entries(counts)) {
    if (id === 'all' || count <= 0) continue;
    const pref = byId.get(id);
    options.push({
      id,
      label: pref?.displayName || id.replace(/-/g, ' '),
      count,
    });
  }

  return options.sort((a, b) => {
    if (a.id === 'all') return -1;
    if (b.id === 'all') return 1;
    return a.label.localeCompare(b.label);
  });
}
