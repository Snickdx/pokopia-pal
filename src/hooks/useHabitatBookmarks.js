import { useCallback, useSyncExternalStore } from 'react';
import {
  getHabitatBookmarkIds,
  habitatBookmarkKey,
  isHabitatBookmarked,
  subscribeHabitatBookmarks,
  toggleHabitatBookmark,
} from '../lib/habitatBookmarkStorage.js';

function useBookmarkIds() {
  return useSyncExternalStore(subscribeHabitatBookmarks, getHabitatBookmarkIds, () => []);
}

export function useHabitatBookmarks() {
  const bookmarkIds = useBookmarkIds();

  const toggleBookmark = useCallback((habitat) => {
    toggleHabitatBookmark(habitat);
  }, []);

  const isBookmarked = useCallback(
    (habitat) => isHabitatBookmarked(habitat),
    [bookmarkIds],
  );

  return {
    bookmarkIds,
    toggleBookmark,
    isBookmarked,
    bookmarkKey: habitatBookmarkKey,
  };
}
