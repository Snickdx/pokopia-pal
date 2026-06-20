/** Icons & images for guide pages (items from export + poketracker sprites). */
export {
  guideImageCandidates,
  guideItemImage,
  isWildcardIngredient,
} from './guideImageMap.js';

const EMOJI_FALLBACK = {
  Twine: '🧵',
  Seaglass: '💎',
  Seashell: '🐚',
  'Leppa Berry': '🍎',
  Leppa: '🍎',
  'Vine Rope': '🪢',
  'Glow Mush': '🍄',
  Limestone: '🪨',
  'Copper Ore': '🟤',
  'Cave Mush': '🍄',
  'Iron Ore': '⛏️',
  'Gold Ore': '✨',
  'Glow Stone': '💡',
  Wastepaper: '📄',
  Pokemetal: '⚙️',
  Crystal: '🔮',
  'Lum Berry': '🫐',
  'Bruised berry': '🫐',
  'Curry and rice': '🍛',
  'Fresh Water': '💧',
  Honey: '🍯',
  Fluff: '☁️',
  Garbage: '🗑️',
  'Small Log': '🪵',
  Stone: '🪨',
  'Sturdy Stick': '🌵',
  'Squishy Clay': '🟤',
  Vines: '🌿',
  Leaf: '🍃',
  'Moomoo Milk': '🥛',
  'Simple salad': '🥗',
  'Simple soup': '🍲',
  'Simple bread': '🍞',
  'Simple hamburger steak': '🥩',
  'Vibrant hamburger steak': '🥩',
};

export const CRUSH_POKEMON = [
  { name: 'Geodude', sprite: '/assets/poketracker/sprites/159_geodude.png' },
  { name: 'Graveler', sprite: '/assets/poketracker/sprites/160_graveler.png' },
  { name: 'Golem', sprite: '/assets/poketracker/sprites/161_golem.png' },
];

export const PAINT_PALETTE_18 = [
  '#ef4444', '#fca5a5', '#fb923c', '#fdba74', '#facc15', '#fef08a',
  '#4ade80', '#86efac', '#22d3ee', '#a5f3fc', '#60a5fa', '#93c5fd',
  '#a78bfa', '#c4b5fd', '#f472b6', '#fbcfe8', '#1e293b', '#f8fafc',
];

export const BERRY_SWATCH = {
  red: '#ef4444',
  white: '#f8fafc',
  blue: '#3b82f6',
  green: '#22c55e',
  pink: '#ec4899',
  black: '#1e293b',
  cyan: '#22d3ee',
  yellow: '#eab308',
};

export function guideItemEmoji(name) {
  return EMOJI_FALLBACK[name] || EMOJI_FALLBACK[name?.toLowerCase()] || '✦';
}

export function swatchHex(colorName) {
  return BERRY_SWATCH[colorName?.toLowerCase()] || '#cbd5e1';
}
