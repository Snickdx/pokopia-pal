import categories from '../../data/favoriteCategories.json';
import { slugify } from './normalize.js';

const COOKING_BASE = '/assets/pokemon-favorites/images/cooking';
const MATERIALS_BASE = '/assets/pokemon-favorites/images/materials';

/** Build name → image path from the full item/recipe export. */
function buildExportImageMap() {
  const map = new Map();
  for (const doc of categories.documents) {
    for (const fav of doc.favorites || []) {
      for (const it of fav.items || []) {
        const local = it.imageLocalPath?.replace(/^app\/assets\//, '/assets/');
        const src = local || (it.imageUrl?.startsWith('http') ? it.imageUrl : null);
        if (!src) continue;
        map.set(it.name, src);
        map.set(it.name.toLowerCase(), src);
      }
    }
  }
  return map;
}

const EXPORT_IMAGES = buildExportImageMap();

/** Guide display names that differ from export item names. */
const NAME_ALIASES = {
  'Simple salad': 'Simple Salad',
  'Simple soup': 'Simple Soup',
  'Simple bread': 'Simple Bread',
  'Simple hamburger steak': 'Simple Hamburger Steak',
  'Crushed-berry salad': 'Crushed-Berry Salad',
  'Shredded salad': 'Shredded Salad',
  'Mushroom hamburger steak': 'Mushroom Hamburger Steak',
  'Mushroom soup': 'Mushroom Soup',
  'Flavorful soup': 'Flavorful Soup',
  'Fluffy bread': 'Fluffy Bread',
  'Bitter hamburger steak': 'Bitter Hamburger Steak',
  'Electrifying soup': 'Electrifying Soup',
  'Carrot bread': 'Carrot Bread',
  'Crouton salad': 'Crouton Salad',
  'Healthy soup': 'Healthy Soup',
  'Bread bowl': 'Bread Bowl',
  'Seaweed salad': 'Seaweed Salad',
  'Seaweed soup': 'Seaweed Soup',
  'Recycled bread': 'Recycled Bread',
  'Potato hamburger steak': 'Potato Hamburger Steak',
  'Tomato hamburger steak': 'Tomato Hamburger Steak',
  'Vibrant hamburger steak': 'Vibrant Hamburger Steak',
  'Chili Sauce': 'Chili sauce',
  'Fresh carrot': 'Fresh carrot',
  'Cave mushrooms': 'Cave mushrooms',
  'Pikachu Doll': 'Pikachu doll',
  'Eevee Doll': 'Eevee doll',
  'Clefairy Doll': 'Clefairy doll',
  'Arcanine Doll': 'Arcanine doll',
  'Dragonite Doll': 'Dragonite doll',
  Ditto: 'Ditto doll',
  Substitute: 'Substitute doll',
  'Cave Mush': 'Cave mushrooms',
  Seaglass: 'Sea glass fragments',
  'Glow Mush': 'Glowing mushrooms',
  'Vine Rope': 'Vine rope',
  Crystal: 'Crystal fragment',
  Pokemetal: 'Pokemetal',
};

/** pokopiaguide cooking ingredient slug → PNG (local copy under public/assets). */
const INGREDIENT_SLUGS = {
  Leaf: 'leaf',
  'Fresh Water': 'fresh-water',
  Wheat: 'wheat',
  Bean: 'bean',
  Potato: 'potato',
  Tomato: 'tomato',
  Seaweed: 'seaweed',
  'Big Mushroom': 'big-mushroom',
  'Cave mushrooms': 'big-mushroom',
  'Leppa Berry': 'leppa-berry',
  Leppa: 'leppa-berry',
  'Pecha Berry': 'pecha-berry',
  'Chesto Berry': 'chesto-berry',
  'Rowap Berry': 'rowap-berry',
  'Rawst Berry': 'rawst-berry',
  'Lum Berry': 'lum-berry',
  'Aspear Berry': 'aspear-berry',
  'Ripe Carrot': 'ripe-carrot',
  'Fresh carrot': 'ripe-carrot',
};

/** Tier-1 / plain dishes use pokopiaguide plain-* recipe art. */
const DISH_IMAGES = {
  'Simple salad': `${COOKING_BASE}/recipes/plain-salad.png`,
  'Simple soup': `${COOKING_BASE}/recipes/plain-soup.png`,
  'Simple bread': `${COOKING_BASE}/recipes/plain-bread.png`,
  'Simple hamburger steak': `${COOKING_BASE}/recipes/plain-hamburger.png`,
  'Vibrant hamburger steak': `${COOKING_BASE}/recipes/colorful-hamburger.png`,
};

/** Dream Island / crafting materials (Serebii official item art, local copy). */
const MATERIAL_IMAGES = {
  Twine: `${MATERIALS_BASE}/twine.png`,
  Seaglass: `${MATERIALS_BASE}/seaglassfragments.png`,
  'Sea glass fragments': `${MATERIALS_BASE}/seaglassfragments.png`,
  Seashell: `${MATERIALS_BASE}/seashell.png`,
  'Vine Rope': `${MATERIALS_BASE}/vinerope.png`,
  'Vine rope': `${MATERIALS_BASE}/vinerope.png`,
  'Glow Mush': `${MATERIALS_BASE}/glowingmushrooms.png`,
  'Glowing mushrooms': `${MATERIALS_BASE}/glowingmushrooms.png`,
  Limestone: `${MATERIALS_BASE}/limestone.png`,
  'Copper Ore': `${MATERIALS_BASE}/copperore.png`,
  'Copper ore': `${MATERIALS_BASE}/copperore.png`,
  'Iron Ore': `${MATERIALS_BASE}/ironore.png`,
  'Iron ore': `${MATERIALS_BASE}/ironore.png`,
  Fluff: `${MATERIALS_BASE}/fluff.png`,
  Honey: `${MATERIALS_BASE}/honey.png`,
  Leaf: `${MATERIALS_BASE}/leaf.png`,
  Garbage: `${MATERIALS_BASE}/garbagebags.png`,
  'Small Log': `${MATERIALS_BASE}/smalllog.png`,
  Stone: `${MATERIALS_BASE}/stone.png`,
  'Sturdy Stick': `${MATERIALS_BASE}/sturdystick.png`,
  'Squishy Clay': `${MATERIALS_BASE}/squishyclay.png`,
  Vines: `${MATERIALS_BASE}/vine.png`,
  'Gold Ore': `${MATERIALS_BASE}/goldore.png`,
  'Gold ore': `${MATERIALS_BASE}/goldore.png`,
  'Glow Stone': `${MATERIALS_BASE}/glowingstone.png`,
  'Glowing stone': `${MATERIALS_BASE}/glowingstone.png`,
  Wastepaper: `${MATERIALS_BASE}/wastepaper.png`,
  Pokemetal: `${MATERIALS_BASE}/pokemetal.png`,
  Crystal: `${MATERIALS_BASE}/crystalfragment.png`,
  'Crystal fragment': `${MATERIALS_BASE}/crystalfragment.png`,
  'Cave Mush': `${MATERIALS_BASE}/cavemushrooms.png`,
  'Cave mushrooms': `${MATERIALS_BASE}/cavemushrooms.png`,
};

/** Item IDs for ingredients not in the cooking export folder. */
const ITEM_ID_FALLBACK = {
  'Fresh Water': '/assets/pokemon-favorites/images/items/item-682.png',
  'Lum Berry': '/assets/pokemon-favorites/images/items/item-600.png',
  'Moomoo Milk coffee': '/assets/pokemon-favorites/images/items/item-684.png',
  'Bruised berry': '/assets/pokemon-favorites/images/items/item-608.png',
  'Soda Pop': '/assets/pokemon-favorites/images/items/item-683.png',
  'Chili sauce': '/assets/pokemon-favorites/images/items/item-686.png',
  'Curry and rice': '/assets/pokemon-favorites/images/items/item-595.png',
};

function cookingIngredientPath(name) {
  const slug = INGREDIENT_SLUGS[name];
  if (!slug) return null;
  return `${COOKING_BASE}/ingredients/${slug}.png`;
}

export function isWildcardIngredient(name) {
  return /^any\b/i.test(name || '');
}

export function guideImageCandidates(name) {
  if (isWildcardIngredient(name)) return [];

  const resolved = NAME_ALIASES[name] || name;
  const candidates = [];

  if (MATERIAL_IMAGES[resolved] || MATERIAL_IMAGES[name]) {
    candidates.push(MATERIAL_IMAGES[resolved] || MATERIAL_IMAGES[name]);
  }

  const fromExport =
    EXPORT_IMAGES.get(resolved) || EXPORT_IMAGES.get(resolved.toLowerCase());
  if (fromExport) candidates.push(fromExport);

  const cookingIngredient = cookingIngredientPath(resolved) || cookingIngredientPath(name);
  if (cookingIngredient) candidates.push(cookingIngredient);

  if (DISH_IMAGES[resolved] || DISH_IMAGES[name]) {
    candidates.push(DISH_IMAGES[resolved] || DISH_IMAGES[name]);
  }

  if (ITEM_ID_FALLBACK[resolved] || ITEM_ID_FALLBACK[name]) {
    candidates.push(ITEM_ID_FALLBACK[resolved] || ITEM_ID_FALLBACK[name]);
  }

  const slug = slugify(resolved);
  candidates.push(`${COOKING_BASE}/recipes/${slug}.png`);

  return [...new Set(candidates)];
}

export function guideItemImage(name) {
  return guideImageCandidates(name)[0] ?? null;
}
