import { createHash } from 'crypto';

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

/** Unique URL-safe slug for Firestore document IDs / routes. */
export function uniqueRouteSlug(base, used) {
  let slug = slugify(base) || 'untitled';
  let candidate = slug;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${slug}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

export function parseDexSort(dexDisplay) {
  const m = /^#\s*(\d+)/.exec((dexDisplay || '').trim());
  return m ? parseInt(m[1], 10) : 0;
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
      const rest = parts.slice(2).join(' - ') || parts[1];
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

export function habitatDedupSlug(label, details) {
  const items = habitatRecipeItems(label, details);
  let raw;
  if (items.length) {
    raw = items.join('\u241e');
  } else {
    raw = [habitatPart(label), habitatPart(details)].join('\u241e');
  }
  return createHash('sha256').update(raw, 'utf8').digest('hex').slice(0, 28);
}

const FOUND_VIA_ITEM_GATE = /found\s+via\s+.*?(doll|slate\s+puzzle|mysterious\s+slate)/is;
const FOUND_VIA_MISSION = /found\s+via\s+.*?mission\b/is;

export function isSpecialEncounterHabitat(label, details) {
  const blob = `${label || ''}\n${details || ''}`;
  const low = blob.toLowerCase();
  if (low.includes('use clear bell') || low.includes('use tidal bell')) return true;
  if (low.includes('must build')) return true;
  if (FOUND_VIA_MISSION.test(blob)) return true;
  if (FOUND_VIA_ITEM_GATE.test(blob)) return true;
  return false;
}

export function toPublicAssetPath(localPath) {
  if (!localPath) return null;
  const normalized = localPath.replace(/\\/g, '/');
  const idx = normalized.indexOf('app/assets/');
  if (idx >= 0) return `/${normalized.slice(idx + 'app/'.length)}`;
  if (normalized.startsWith('assets/')) return `/${normalized}`;
  return null;
}

export function inferItemKind(item) {
  const path = (item.imageLocalPath || '').toLowerCase();
  const link = (item.link || '').toLowerCase();
  if (path.includes('/images/cooking/') || link.includes('/cooking')) return 'Cooking';
  if (path.includes('/images/items/') || link.includes('items?q=')) return 'Item';
  if (path || link) return 'Other';
  return '—';
}
