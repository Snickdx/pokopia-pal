import { APP_FULL_NAME } from './appConfig.js';
import { entityRouteSlug } from './normalize.js';

export function absoluteUrl(path) {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).href;
}

export const PREFERENCE_TABS = ['habitats', 'items', 'pokemon'];

/** Active tab segment from a preferences URL, or `habitats` if none. */
export function preferenceTabFromPathname(pathname = '') {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'preferences' || parts.length < 3) return 'habitats';
  const tab = parts[2];
  return PREFERENCE_TABS.includes(tab) ? tab : 'habitats';
}

export function preferencePath(preference, tab = 'habitats') {
  const slug = entityRouteSlug(preference);
  const safeTab = PREFERENCE_TABS.includes(tab) ? tab : 'habitats';
  return `/preferences/${slug}/${safeTab}`;
}

export function habitatPath(habitat) {
  return `/habitats/${entityRouteSlug(habitat)}`;
}

export function pokemonPath(pokemon) {
  return `/pokemon/${entityRouteSlug(pokemon)}`;
}

export function itemPath(item) {
  return `/items/${entityRouteSlug(item)}`;
}

export function shareTitleForPreference(preference) {
  return `${preference?.displayName || 'Preference'} · ${APP_FULL_NAME}`;
}

export function shareTitleForHabitat(habitat, title) {
  return `${title || habitat?.title || 'Habitat'} · ${APP_FULL_NAME}`;
}

export function shareTitleForPokemon(pokemon) {
  return `${pokemon?.name || 'Pokémon'} · ${APP_FULL_NAME}`;
}

export function shareTitleForItem(item) {
  return `${item?.name || 'Item'} · ${APP_FULL_NAME}`;
}
