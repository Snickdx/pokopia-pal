import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { buildBackLinkState } from '../lib/navigation.js';

/** Router state to attach when linking from the current page into a detail view. */
export function useNavigationBackState() {
  const location = useLocation();
  return useMemo(() => buildBackLinkState(location), [location]);
}
