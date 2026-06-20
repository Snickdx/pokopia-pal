import { litterbugs } from '../data/guides.js';

/** @type {Map<string, string> | null} */
let litterByPokemonId = null;

function litterMaterialMap() {
  if (litterByPokemonId) return litterByPokemonId;
  litterByPokemonId = new Map();
  for (const { item, pokemonIds } of litterbugs) {
    for (const pokemonId of pokemonIds) {
      litterByPokemonId.set(pokemonId, item);
    }
  }
  return litterByPokemonId;
}

/** @param {{ id?: string, routeSlug?: string } | string | null | undefined} pokemon */
export function getLitterMaterialForPokemon(pokemon) {
  if (!pokemon) return null;
  const map = litterMaterialMap();
  if (typeof pokemon === 'string') return map.get(pokemon) ?? null;
  return map.get(pokemon.id) ?? map.get(pokemon.routeSlug) ?? null;
}

/** @param {string | null | undefined} abilityName */
export function formatAbilityLabel(abilityName, pokemon) {
  if (!abilityName) return '';
  if (abilityName !== 'Litter') return abilityName;
  const material = getLitterMaterialForPokemon(pokemon);
  return material ? `Litter (${material})` : abilityName;
}

/** @param {{ abilityPrimary?: string, abilitySecondary?: string } | null | undefined} pokemon */
export function pokemonAbilityTags(pokemon) {
  return [pokemon?.abilityPrimary, pokemon?.abilitySecondary]
    .filter(Boolean)
    .map((ability) => formatAbilityLabel(ability, pokemon));
}
