/**
 * Cooking matrix: dish type × flavor → ingredients & station.
 * Synced with pokopiaguide.com/cooking (24 recipes).
 */

import { flavorBoosts } from './guides.js';

export const snorlaxRecipeCategories = [
  {
    id: 'salad',
    label: 'Salad',
    icon: '🥬',
    station: 'Cutting Board',
    setup: 'Place a Cutting Board on a table, then add ingredients and cook.',
  },
  {
    id: 'bread',
    label: 'Bread',
    icon: '🥐',
    station: 'Bread Oven',
    setup: 'Use a Bread Oven with Wheat. Some loaves need a party specialty (Water, Recycle, or Burn).',
  },
  {
    id: 'hamburger',
    label: 'Hamburger steak',
    icon: '🥩',
    station: 'Frying Pan + Stove',
    setup: 'Put a Frying Pan on a lit Cooking Stove, add Bean plus flavor ingredients.',
  },
  {
    id: 'soup',
    label: 'Soup',
    icon: '🍲',
    station: 'Cooking Pot + Stove',
    setup: 'Put a Cooking Pot on a lit Cooking Stove with Fresh Water plus flavor ingredients.',
  },
];

export const snorlaxRecipeFlavors = [
  {
    id: 'neutral',
    chartLabel: 'Plain',
    name: 'Neutral',
    boost: 'Friendship',
    accent: '#9ca3af',
    panel: 'rgba(156, 163, 175, 0.22)',
    border: '#9ca3af',
  },
  {
    id: 'sweet',
    chartLabel: 'Sweet',
    name: 'Sweet',
    boost: 'Treasures / artifacts',
    accent: '#ec4899',
    panel: 'rgba(244, 114, 182, 0.28)',
    border: '#ec4899',
  },
  {
    id: 'bitter',
    chartLabel: 'Bitter',
    name: 'Bitter',
    boost: 'Ripples & Stardust',
    accent: '#22c55e',
    panel: 'rgba(74, 222, 128, 0.22)',
    border: '#22c55e',
  },
  {
    id: 'dry',
    chartLabel: 'Dry',
    name: 'Dry',
    boost: 'Lugia & Ho-oh spawns',
    accent: '#3b82f6',
    panel: 'rgba(96, 165, 250, 0.28)',
    border: '#3b82f6',
  },
  {
    id: 'sour',
    chartLabel: 'Sour',
    name: 'Sour',
    boost: 'Shop discounts',
    accent: '#eab308',
    panel: 'rgba(250, 204, 21, 0.28)',
    border: '#eab308',
  },
  {
    id: 'spicy',
    chartLabel: 'Spicy',
    name: 'Spicy',
    boost: 'Habitat spawns',
    accent: '#f97316',
    panel: 'rgba(251, 146, 60, 0.28)',
    border: '#f97316',
  },
];

/** @typedef {{ dish: string, ingredients: string[], ability?: string | null, note?: string }} Recipe */

/** @type {Record<string, Record<string, Recipe[]>>} */
export const snorlaxRecipeMatrix = {
  salad: {
    neutral: [
      {
        dish: 'Simple salad',
        ingredients: ['Leaf', 'Any ingredient'],
      },
    ],
    sweet: [
      {
        dish: 'Leppa Salad',
        ingredients: ['Leaf', 'Leppa Berry'],
      },
    ],
    bitter: [
      {
        dish: 'Seaweed Salad',
        ingredients: ['Leaf', 'Seaweed'],
      },
    ],
    dry: [
      {
        dish: 'Crushed-Berry Salad',
        ingredients: ['Leaf', 'Rowap Berry'],
        ability: 'Crush',
      },
    ],
    sour: [
      {
        dish: 'Shredded Salad',
        ingredients: ['Leaf', 'Any ingredient'],
        ability: 'Chop',
      },
    ],
    spicy: [
      {
        dish: 'Crouton Salad',
        ingredients: ['Leaf', 'Any bread'],
      },
    ],
  },
  bread: {
    neutral: [
      {
        dish: 'Simple bread',
        ingredients: ['Wheat', 'Any ingredient'],
      },
    ],
    sweet: [
      {
        dish: 'Fluffy Bread',
        ingredients: ['Wheat', 'Pecha Berry'],
        ability: 'Water',
      },
    ],
    bitter: [
      {
        dish: 'Recycled Bread',
        ingredients: ['Wheat', 'Any bread'],
        ability: 'Recycle',
      },
    ],
    dry: [],
    sour: [
      {
        dish: 'Leppa Bread',
        ingredients: ['Wheat', 'Leppa Berry'],
      },
    ],
    spicy: [
      {
        dish: 'Carrot Bread',
        ingredients: ['Wheat', 'Ripe Carrot'],
      },
      {
        dish: 'Bread Bowl',
        ingredients: ['Wheat', 'Any soup'],
        ability: 'Burn',
      },
    ],
  },
  hamburger: {
    neutral: [
      {
        dish: 'Simple hamburger steak',
        ingredients: ['Bean', 'Any ingredient'],
      },
      {
        dish: 'Vibrant hamburger steak',
        ingredients: ['Bean', 'Potato', 'Any salad'],
      },
    ],
    sweet: [
      {
        dish: 'Potato hamburger steak',
        ingredients: ['Bean', 'Potato'],
      },
    ],
    bitter: [
      {
        dish: 'Bitter Hamburger Steak',
        ingredients: ['Bean', 'Rawst Berry', 'Lum Berry'],
      },
    ],
    dry: [
      {
        dish: 'Mushroom Hamburger Steak',
        ingredients: ['Bean', 'Big Mushroom'],
      },
    ],
    sour: [
      {
        dish: 'Tomato Hamburger Steak',
        ingredients: ['Bean', 'Tomato'],
      },
    ],
    spicy: [],
  },
  soup: {
    neutral: [
      {
        dish: 'Simple soup',
        ingredients: ['Fresh Water', 'Any ingredient'],
      },
    ],
    sweet: [],
    bitter: [
      {
        dish: 'Seaweed Soup',
        ingredients: ['Fresh Water', 'Seaweed'],
      },
    ],
    dry: [
      {
        dish: 'Mushroom Soup',
        ingredients: ['Fresh Water', 'Big Mushroom'],
      },
    ],
    sour: [
      {
        dish: 'Flavorful Soup',
        ingredients: ['Fresh Water', 'Aspear Berry', 'Any hamburger steak'],
      },
    ],
    spicy: [
      {
        dish: 'Electrifying Soup',
        ingredients: ['Fresh Water', 'Any ingredient'],
        ability: 'Generate',
      },
      {
        dish: 'Healthy Soup',
        ingredients: ['Fresh Water', 'Bean', 'Leaf'],
      },
    ],
  },
};

export const snorlaxCookingTips = [
  'Unlock cooking by rescuing Chef Dente at Rocky Ridges.',
  'Salads always need at least one Leaf on the Cutting Board.',
  'Soups always start with Fresh Water in a pot on a stove.',
  'Hamburger steaks always start with Bean in a frying pan on a stove.',
  'Bread recipes start with Wheat in a Bread Oven.',
  '? on the recipe chart means any matching ingredient of your choice.',
  'Tier 2 dishes give a medium boost; Tier 3 dishes give the strongest boost for that flavor.',
];

function normalizeDishName(name) {
  return (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** @returns {{ tier: number, effect: string, shortLabel: string } | null} */
export function getRecipeEffectiveness(flavorId, dishName) {
  const flavor = flavorBoosts.find((f) => f.id === flavorId);
  if (!flavor) return null;

  const key = normalizeDishName(dishName);
  for (const tier of flavor.tiers) {
    if (tier.tier < 2) continue;
    const matched = tier.items.some((item) => normalizeDishName(item) === key);
    if (matched) {
      return {
        tier: tier.tier,
        effect: tier.effect,
        shortLabel: effectivenessShortLabel(tier),
      };
    }
  }
  return null;
}

function effectivenessShortLabel(tier) {
  const plus = tier.effect.match(/^(\+\d+)/);
  if (plus) return plus[1];

  if (tier.tier === 2) return 'More';
  if (tier.tier === 3) return 'Max';
  return `Tier ${tier.tier}`;
}
