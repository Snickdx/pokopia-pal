/** @typedef {{ to: string, label: string }} BackNavigation */

/** Human-readable back label for the current page path. */
export function backLabelForLocation(pathname = '') {
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'pokemon' && parts.length >= 2) return '← Pokémon';
  if (parts[0] === 'items' && parts.length >= 2) return '← Item';
  if (parts[0] === 'habitats' && parts.length >= 2) return '← Habitat';

  if (parts[0] === 'preferences' && parts.length >= 2) {
    const tab = parts[2] || 'habitats';
    if (tab === 'pokemon') return '← Preference Pokémon';
    if (tab === 'items') return '← Preference items';
    return '← Preference habitats';
  }

  if (pathname === '/pokemon') return '← All Pokémon';
  if (pathname === '/items') return '← All items';
  if (pathname === '/habitats') return '← Habitats';
  if (pathname === '/roommates') return '← Roommates';
  if (pathname === '/preferences') return '← Preferences';
  if (pathname.startsWith('/guides')) return '← Guides';

  return '← Back';
}

/**
 * Build router location state so detail pages can return to the current page.
 * @param {Pick<Location, 'pathname' | 'search' | 'hash'>} location
 * @returns {{ back: BackNavigation } | undefined}
 */
export function buildBackLinkState(location) {
  if (!location?.pathname) return undefined;

  const to = `${location.pathname}${location.search || ''}${location.hash || ''}`;
  return {
    back: {
      to,
      label: backLabelForLocation(location.pathname),
    },
  };
}

/** @param {import('react-router-dom').Location} location */
export function readBackNavigation(location) {
  const back = location?.state?.back;
  if (!back?.to) return null;
  return {
    to: back.to,
    label: back.label || '← Back',
  };
}
