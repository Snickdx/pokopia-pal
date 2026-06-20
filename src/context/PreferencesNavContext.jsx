import { createContext, useContext } from 'react';

export const PreferencesNavContext = createContext(null);

export function usePreferencesNav() {
  return useContext(PreferencesNavContext);
}
