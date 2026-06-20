const STORAGE_KEY = 'pokopia-roommate-ids';

/** @returns {string[]} */
export function loadRoommateIds() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

/** @param {string[]} ids */
export function saveRoommateIds(ids) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore quota / privacy mode errors.
  }
}
