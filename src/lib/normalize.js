const HABITAT_ITEM = /([a-z0-9][a-z0-9\s\-'/()]+?)\s+x\s*(\d+)/gi;

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Preferred slug for routing (explicit routeSlug or id). */
export function entityRouteSlug(entity) {
  if (!entity) return '';
  return entity.routeSlug || entity.slug || entity.id || '';
}

/** True when a loaded preference document matches the URL :preferenceId segment. */
export function preferenceMatchesRoute(preference, routeParam) {
  if (!preference || !routeParam) return false;
  const slug = entityRouteSlug(preference);
  return slug === routeParam || preference.id === routeParam;
}

function habitatPart(text) {
  return (text || '').split(/\s+/).filter(Boolean).join(' ').toLowerCase();
}

function normalizeIngredientName(name) {
  return name.replace(/\s*\(any\)\s*/gi, ' ').split(/\s+/).filter(Boolean).join(' ').toLowerCase();
}

export function habitatTitle(label, details) {
  if (label?.trim()) return label.trim();
  for (const line of (details || '').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (t.includes(' - ')) {
      const [left] = t.split(' - ');
      return left.trim() || null;
    }
    if (t.endsWith('-')) return t.replace(/-+\s*$/, '').trim() || null;
    return t.replace(/,$/, '');
  }
  return null;
}

function habitatIngredientChunks(label, details) {
  const lines = (details || '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length && label?.trim()) return [label.trim()];

  const chunks = [];
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (idx === 0 && line.includes(' - ')) {
      const parts = line.split(' - ');
      const rest = parts.length > 2 ? parts.slice(2).join(' - ') : parts[1];
      if (rest?.trim()) chunks.push(rest.trim().replace(/,$/, ''));
      else if (line.endsWith('-') && habitatTitle(label, details)) continue;
      else chunks.push(line);
    } else if (idx === 0 && line.endsWith('-') && habitatTitle(label, details)) continue;
    else chunks.push(line.replace(/,$/, ''));
  }
  return chunks;
}

export function habitatRecipeItems(label, details) {
  const items = [];
  const seen = new Set();
  for (const chunk of habitatIngredientChunks(label, details)) {
    HABITAT_ITEM.lastIndex = 0;
    const found = [...chunk.matchAll(HABITAT_ITEM)];
    if (found.length) {
      for (const match of found) {
        const name = normalizeIngredientName(match[1]);
        const key = `${name} x${match[2]}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push(key);
        }
      }
      continue;
    }
    const plain = normalizeIngredientName(chunk);
    if (plain && !seen.has(plain)) {
      seen.add(plain);
      items.push(plain);
    }
  }
  return items.sort();
}

export async function habitatDedupSlug(label, details) {
  const items = habitatRecipeItems(label, details);
  let raw;
  if (items.length) {
    raw = items.join('\u241e');
  } else {
    raw = [habitatPart(label), habitatPart(details)].join('\u241e');
  }
  const buf = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 28);
}

const FOUND_VIA_ITEM_GATE = /found\s+via\s+.*?(doll|slate\s+puzzle|mysterious\s+slate)/is;
const FOUND_VIA_MISSION = /found\s+via\s+.*?mission\b/is;

/** Display lines for habitat cards (recipe ingredients). */
export function habitatCardItemLines(label, details) {
  const recipe = habitatRecipeItems(label, details);
  if (recipe.length) {
    return recipe.map((line) => {
      const m = /^(.+?)\s+x\s*(\d+)$/i.exec(line);
      if (!m) return line;
      const name = m[1]
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return `${name} x${m[2]}`;
    });
  }
  const raw = (details || '').trim();
  if (!raw) return [];
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = habitatTitle(label, details);
  const body = lines.filter((ln) => {
    if (!title) return true;
    if (ln === title) return false;
    if (ln.startsWith(`${title} -`)) return false;
    return true;
  });
  return body.length ? body : lines.slice(0, 4);
}

export function isSpecialEncounterHabitat(label, details) {
  const blob = `${label || ''}\n${details || ''}`;
  const low = blob.toLowerCase();
  if (low.includes('use clear bell') || low.includes('use tidal bell')) return true;
  if (low.includes('must build')) return true;
  if (FOUND_VIA_MISSION.test(blob)) return true;
  if (FOUND_VIA_ITEM_GATE.test(blob)) return true;
  return false;
}
