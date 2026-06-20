import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const SEREBII_CRAFTING_URL = 'https://www.serebii.net/pokemonpokopia/crafting.shtml';
const SEREBII_ITEMS_URL = 'https://www.serebii.net/pokemonpokopia/items.shtml';
const GUIDE_URL = 'https://pokopiaguide.com/items?q=';

export const CRAFT_CATEGORIES = [
  'Furniture',
  'Misc',
  'Outdoor',
  'Utilities',
  'Buildings',
  'Blocks',
  'Other',
];

export const ITEM_TYPES = ['Toy', 'Decoration', 'Relaxation', 'Road'];

const TYPE_KEY_TO_LABEL = {
  toy: 'Toy',
  decoration: 'Decoration',
  relaxation: 'Relaxation',
  road: 'Road',
};

const SEREBII_SECTIONS = [
  { re: /List of Furniture/i, category: 'Furniture' },
  { re: /List of Misc\.?/i, category: 'Misc' },
  { re: /List of Outdoor/i, category: 'Outdoor' },
  { re: /List of Utilities/i, category: 'Utilities' },
  { re: /List of Buildings/i, category: 'Buildings' },
  { re: /List of Blocks/i, category: 'Blocks' },
  { re: /List of Other/i, category: 'Other' },
];

const GUIDE_KEY_TO_CATEGORY = {
  furniture: 'Furniture',
  misc: 'Misc',
  outdoor: 'Outdoor',
  utilities: 'Utilities',
  buildings: 'Buildings',
  blocks: 'Blocks',
  other: 'Other',
};

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

export function parseSerebiiCraftingCategories(html) {
  const bySlug = {};
  const byName = {};
  const rowRe =
    /<tr><td class="cen">[\s\S]*?<\/td><td class="cen"><a href="items\/([a-z0-9]+)\.shtml">(?:<u>)?([^<]+)(?:<\/u>)?<\/a><\/td>/gi;

  for (let i = 0; i < SEREBII_SECTIONS.length; i++) {
    const { re, category } = SEREBII_SECTIONS[i];
    const start = html.search(re);
    if (start < 0) continue;
    const end =
      i + 1 < SEREBII_SECTIONS.length
        ? html.search(SEREBII_SECTIONS[i + 1].re)
        : html.length;
    const section = html.slice(start, end > start ? end : html.length);
    let match;
    while ((match = rowRe.exec(section))) {
      const name = decodeHtml(match[2]);
      const slug = slugify(name);
      bySlug[slug] = category;
      bySlug[match[1]] = category;
      byName[name] = category;
      byName[name.toLowerCase()] = category;
    }
  }

  return { bySlug, byName };
}

/** Full craft catalog rows from Serebii (Buildings, Blocks, etc.). */
export function parseSerebiiCraftingItems(html) {
  const byId = new Map();
  const rowRe =
    /<tr><td class="cen">[\s\S]*?<\/td><td class="cen"><a href="items\/([a-z0-9]+)\.shtml">(?:<u>)?([^<]+)(?:<\/u>)?<\/a><\/td>/gi;

  for (let i = 0; i < SEREBII_SECTIONS.length; i++) {
    const { re, category } = SEREBII_SECTIONS[i];
    const start = html.search(re);
    if (start < 0) continue;
    const end =
      i + 1 < SEREBII_SECTIONS.length
        ? html.search(SEREBII_SECTIONS[i + 1].re)
        : html.length;
    const section = html.slice(start, end > start ? end : html.length);
    let match;
    while ((match = rowRe.exec(section))) {
      const name = decodeHtml(match[2]);
      const id = slugify(name);
      if (byId.has(id)) continue;
      byId.set(id, {
        id,
        serebiiId: match[1],
        name,
        craftCategory: category,
      });
    }
  }

  return [...byId.values()];
}

export function parseGuideCraftCategories(html) {
  const bySlug = {};
  const byName = {};
  const re =
    /\\"name\\":\\"((?:\\\\.|[^\\"])*)\\",\\"nameJa\\":\\"[^\\]*\\",\\"categoryKey\\":\\"([^\\]+)\\"/g;
  let match;
  while ((match = re.exec(html))) {
    const name = match[1].replace(/\\"/g, '"');
    const category = GUIDE_KEY_TO_CATEGORY[match[2]];
    if (!category) continue;
    const slug = slugify(name);
    bySlug[slug] = category;
    byName[name] = category;
    byName[name.toLowerCase()] = category;
  }
  return { bySlug, byName };
}

export function parseSerebiiItemTypes(html) {
  const typeBySlug = {};
  const typeByName = {};
  const rowRe =
    /<tr><td class="cen">[\s\S]*?<\/td>\s*<td class="cen"><a href="items\/([a-z0-9]+)\.shtml"><u>([^<]+)<\/u><\/a><\/td>\s*<td class="fooinfo">[\s\S]*?<\/td>\s*<td class="fooinfo">(?:<a href="items\/(decoration|toy|relaxation|road)\.shtml">[\s\S]*?<\/a>|&nbsp;)\s*<\/td>/gi;

  let match;
  while ((match = rowRe.exec(html))) {
    const name = decodeHtml(match[2]);
    const slug = slugify(name);
    const type = TYPE_KEY_TO_LABEL[match[3]];
    if (!type) continue;
    typeBySlug[slug] = type;
    typeBySlug[match[1]] = type;
    typeByName[name] = type;
    typeByName[name.toLowerCase()] = type;
  }

  return { typeBySlug, typeByName };
}

export function resolveItemType(item, maps) {
  if (!item) return null;
  if (item.itemType && ITEM_TYPES.includes(item.itemType)) return item.itemType;
  if (item.itemType === null || item.itemType === 'None') return null;
  const { typeBySlug, typeByName } = maps;
  return (
    typeBySlug?.[item.id] ||
    typeBySlug?.[item.slug] ||
    typeByName?.[item.name] ||
    typeByName?.[item.name?.toLowerCase()] ||
    null
  );
}

export function mergeCategoryMaps(...sources) {
  const bySlug = {};
  const byName = {};
  for (const src of sources) {
    Object.assign(bySlug, src.bySlug);
    Object.assign(byName, src.byName);
  }
  return { bySlug, byName };
}

export function resolveCraftCategory(item, maps) {
  if (!item) return 'Other';
  if (item.craftCategory && CRAFT_CATEGORIES.includes(item.craftCategory)) {
    return item.craftCategory;
  }
  const { bySlug, byName } = maps;
  return (
    bySlug[item.id] ||
    bySlug[item.slug] ||
    byName[item.name] ||
    byName[item.name?.toLowerCase()] ||
    'Other'
  );
}

function loadOurItemSlugs() {
  const categories = JSON.parse(
    readFileSync(join(DATA_DIR, 'favoriteCategories.json'), 'utf8'),
  ).documents;
  const slugs = new Set();
  for (const cat of categories) {
    for (const fav of cat.favorites || []) {
      for (const it of fav.items || []) slugs.add(it.slug);
    }
  }
  return slugs;
}

async function main() {
  const [serebiiCraftingHtml, serebiiItemsHtml, guideHtml] = await Promise.all([
    fetch(SEREBII_CRAFTING_URL).then((r) => r.text()),
    fetch(SEREBII_ITEMS_URL).then((r) => r.text()),
    fetch(GUIDE_URL).then((r) => r.text()),
  ]);

  const maps = mergeCategoryMaps(
    parseGuideCraftCategories(guideHtml),
    parseSerebiiCraftingCategories(serebiiCraftingHtml),
  );
  const typeMaps = parseSerebiiItemTypes(serebiiItemsHtml);

  const ourSlugs = loadOurItemSlugs();
  let categoryMatched = 0;
  let typeMatched = 0;
  for (const slug of ourSlugs) {
    if (maps.bySlug[slug]) categoryMatched++;
    if (typeMaps.typeBySlug[slug]) typeMatched++;
  }

  const out = {
    sources: [GUIDE_URL, SEREBII_CRAFTING_URL, SEREBII_ITEMS_URL],
    fetchedAt: new Date().toISOString(),
    categories: CRAFT_CATEGORIES,
    itemTypes: ITEM_TYPES,
    bySlug: maps.bySlug,
    byName: maps.byName,
    typeBySlug: typeMaps.typeBySlug,
    typeByName: typeMaps.typeByName,
  };

  const craftItems = parseSerebiiCraftingItems(serebiiCraftingHtml);
  const craftItemsOut = {
    sources: [SEREBII_CRAFTING_URL],
    fetchedAt: new Date().toISOString(),
    items: craftItems,
  };

  const outPath = join(__dirname, '..', 'src', 'data', 'itemCraftCategories.json');
  const craftItemsPath = join(DATA_DIR, 'allCraftItems.json');
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  const craftItemsJson = JSON.stringify(craftItemsOut, null, 2);
  writeFileSync(craftItemsPath, craftItemsJson);
  console.log('Wrote', outPath);
  console.log('Wrote', craftItemsPath, `(${craftItems.length} items)`);
  console.log('Category slugs:', Object.keys(maps.bySlug).length);
  console.log('Type slugs:', Object.keys(typeMaps.typeBySlug).length);
  console.log('Our catalog — categories:', categoryMatched, '/', ourSlugs.size);
  console.log('Our catalog — types:', typeMatched, '/', ourSlugs.size);
}

const isMain = process.argv[1]?.endsWith('fetch-item-categories.mjs');
if (isMain) main();
