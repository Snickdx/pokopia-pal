/** Reference data from The Ultimate Pokopia Guide (@PKMNCAST). */

export const dreamIslands = [
  {
    id: 'pikachu-doll',
    doll: 'Pikachu Doll',
    panel: '#fef08a',
    border: '#eab308',
    items: ['Twine', 'Seaglass', 'Seashell'],
  },
  {
    id: 'eevee-doll',
    doll: 'Eevee Doll',
    panel: '#bbf7d0',
    border: '#22c55e',
    items: ['Leppa Berry', 'Vine Rope', 'Glow Mush'],
  },
  {
    id: 'clefairy-doll',
    doll: 'Clefairy Doll',
    panel: '#e9d5ff',
    border: '#a855f7',
    items: ['Limestone', 'Copper Ore', 'Cave Mush'],
  },
  {
    id: 'arcanine-doll',
    doll: 'Arcanine Doll',
    panel: '#fed7aa',
    border: '#f97316',
    items: ['Iron Ore', 'Gold Ore', 'Glow Stone'],
  },
  {
    id: 'dragonite-doll',
    doll: 'Dragonite Doll',
    panel: '#bfdbfe',
    border: '#3b82f6',
    items: ['Wastepaper', 'Pokemetal', 'Crystal'],
  },
  {
    id: 'random',
    doll: 'Random Island',
    panel: '#fbcfe8',
    border: '#ec4899',
    items: ['Ditto', 'Substitute'],
    note: 'Special dolls — outcomes vary',
  },
];

export const berryPaint = [
  { berry: 'Leppa', common: 'Red', bonus: 'White' },
  { berry: 'Pecha', common: 'Pink', bonus: 'Black' },
  { berry: 'Chesto', common: 'Blue', bonus: 'White' },
  { berry: 'Rawst', common: 'Cyan', bonus: 'Black' },
  { berry: 'Lum', common: 'Green', bonus: 'White' },
  { berry: 'Aspear', common: 'Yellow', bonus: 'Black' },
];

export const paintCrushMeta = {
  intro:
    'Crush berries to make paint for Smearguru. Early party Pokémon with Crush can break berries into pigment.',
  totalColors: 18,
};

export const flavorBoosts = [
  {
    id: 'neutral',
    name: 'Neutral',
    accent: '#9ca3af',
    panel: 'rgba(156, 163, 175, 0.22)',
    border: '#9ca3af',
    summary: 'Friendship gain',
    tiers: [
      {
        tier: 1,
        kind: 'Ingredients',
        items: ['Leppa Berry', 'Lum Berry', 'Bruised berry', 'Curry and rice', 'Fresh Water'],
        effect: 'Slightly more friendship gain',
      },
      {
        tier: 2,
        kind: 'Dishes',
        items: ['Simple salad', 'Simple soup', 'Simple bread', 'Simple hamburger steak'],
        effect: 'More friendship gain',
      },
      {
        tier: 3,
        kind: 'Dish',
        items: ['Vibrant hamburger steak'],
        effect: 'A lot more friendship gain',
      },
    ],
  },
  {
    id: 'sour',
    name: 'Sour',
    accent: '#eab308',
    panel: 'rgba(250, 204, 21, 0.28)',
    border: '#eab308',
    summary: 'Daily shop discounts',
    tiers: [
      {
        tier: 1,
        kind: 'Ingredients',
        items: ['Aspear Berry', 'Tomato', 'Soda Pop'],
        effect: '+1 daily shop discount',
      },
      {
        tier: 2,
        kind: 'Dishes',
        items: ['Shredded salad', 'Leppa Bread', 'Tomato hamburger steak'],
        effect: '+2 daily shop discounts',
      },
      {
        tier: 3,
        kind: 'Dish',
        items: ['Flavorful soup'],
        effect: '+3 daily shop discounts',
      },
    ],
  },
  {
    id: 'dry',
    name: 'Dry',
    accent: '#3b82f6',
    panel: 'rgba(96, 165, 250, 0.28)',
    border: '#3b82f6',
    summary: 'Lugia & Ho-oh spawns',
    tiers: [
      {
        tier: 1,
        kind: 'Ingredients',
        items: ['Chesto Berry', 'Wheat', 'Cave mushrooms', 'Roserade Tea'],
        effect: 'Slightly more Lugia & Ho-oh spawns',
      },
      {
        tier: 2,
        kind: 'Dishes',
        items: ['Mushroom soup', 'Mushroom hamburger steak'],
        effect: 'More Lugia & Ho-oh spawns',
      },
      {
        tier: 3,
        kind: 'Dish',
        items: ['Crushed-berry salad'],
        effect: 'A lot more Lugia & Ho-oh spawns',
      },
    ],
  },
  {
    id: 'sweet',
    name: 'Sweet',
    accent: '#ec4899',
    panel: 'rgba(244, 114, 182, 0.28)',
    border: '#ec4899',
    summary: 'Treasures per area',
    tiers: [
      {
        tier: 1,
        kind: 'Ingredients',
        items: ['Pecha Berry', 'Bean', 'Common Candy', 'Rare Candy', 'Moomoo Milk coffee'],
        effect: '+3 treasures per area',
      },
      {
        tier: 2,
        kind: 'Dishes',
        items: ['Leppa Salad', 'Potato hamburger steak'],
        effect: '+6 treasures per area',
      },
      {
        tier: 3,
        kind: 'Dish',
        items: ['Fluffy bread'],
        effect: '+9 treasures per area (resets treasures in the area)',
      },
    ],
  },
  {
    id: 'bitter',
    name: 'Bitter',
    accent: '#22c55e',
    panel: 'rgba(74, 222, 128, 0.22)',
    border: '#22c55e',
    summary: 'Ripples & Stardust',
    tiers: [
      {
        tier: 1,
        kind: 'Ingredients',
        items: ['Rawst Berry', 'Potato', 'Seaweed'],
        effect: '+1 ripple per area · slightly more Stardust',
      },
      {
        tier: 2,
        kind: 'Dishes',
        items: ['Seaweed salad', 'Seaweed soup', 'Recycled bread'],
        effect: '+2 ripples per area · more Stardust',
      },
      {
        tier: 3,
        kind: 'Dish',
        items: ['Bitter hamburger steak'],
        effect: '+3 ripples per area · a lot more Stardust',
      },
    ],
  },
  {
    id: 'spicy',
    name: 'Spicy',
    accent: '#f97316',
    panel: 'rgba(251, 146, 60, 0.28)',
    border: '#f97316',
    summary: 'Habitat spawns',
    tiers: [
      {
        tier: 1,
        kind: 'Ingredients',
        items: ['Fresh carrot', 'Chili Sauce'],
        effect: 'Slightly more habitat spawns',
      },
      {
        tier: 2,
        kind: 'Dishes',
        items: ['Electrifying soup', 'Carrot bread'],
        effect: 'More habitat spawns',
      },
      {
        tier: 3,
        kind: 'Dishes',
        items: ['Crouton salad', 'Healthy soup', 'Bread bowl'],
        effect: 'A lot more habitat spawns',
      },
    ],
  },
];

export const guideSections = [
  {
    id: 'dream-islands',
    path: '/guides/dream-islands',
    title: 'Dream Island Guide',
    description: 'Doll islands & items for Legendary Pokémon chances',
    icon: '🏝️',
  },
  {
    id: 'paint-crush',
    path: '/guides/paint-crush',
    title: 'Paint & Crush',
    description: 'Berry colors for Smearguru paint mixing',
    icon: '🎨',
  },
  {
    id: 'flavor-boosts',
    path: '/guides/flavor-boosts',
    title: 'Mosslax Boosts',
    description: 'Recipe matrix — ingredients, stations & Mosslax area boosts',
    icon: '🍲',
  },
  {
    id: 'litterbugs',
    path: '/guides/litterbugs',
    title: 'Litterbugs',
    description: 'Which materials each Litter Pokémon drops around town',
    icon: '🗑️',
  },
];

/** Pokémon with the Litter ability grouped by drop material (Laura Loft chart). */
export const litterbugs = [
  {
    id: 'fluff',
    item: 'Fluff',
    pokemonIds: ['swablu', 'altaria', 'flaaffy', 'mareep', 'jumpluff'],
  },
  {
    id: 'honey',
    item: 'Honey',
    pokemonIds: ['combee'],
  },
  {
    id: 'iron-ore',
    item: 'Iron Ore',
    pokemonIds: ['glimmet', 'glimmora'],
  },
  {
    id: 'leaf',
    item: 'Leaf',
    pokemonIds: ['vileplume', 'venusaur'],
  },
  {
    id: 'garbage',
    item: 'Garbage',
    pokemonIds: ['garbodor', 'grimer', 'muk'],
  },
  {
    id: 'small-log',
    item: 'Small Log',
    pokemonIds: ['haxorus'],
  },
  {
    id: 'stone',
    item: 'Stone',
    pokemonIds: ['amaura', 'bastiodon', 'cranidos', 'tyrunt', 'aurorus'],
  },
  {
    id: 'sturdy-stick',
    item: 'Sturdy Stick',
    pokemonIds: ['cacturne'],
  },
  {
    id: 'squishy-clay',
    item: 'Squishy Clay',
    pokemonIds: ['paldean-wooper', 'trapinch'],
  },
  {
    id: 'twine',
    item: 'Twine',
    pokemonIds: ['spinarak', 'ariados', 'volcarona'],
  },
  {
    id: 'vines',
    item: 'Vines',
    pokemonIds: [
      'tangrowth',
      'bellsprout',
      'weepinbell',
      'snivy',
      'servine',
      'serperior',
    ],
  },
];
