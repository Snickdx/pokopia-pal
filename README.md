# Pokopia Pal

Unofficial fan companion for Pokémon Pokopia — browse habitats, preferences, items, roommates, and guides.

**Live site:** [pokopia-pal.web.app](https://pokopia-pal.web.app)

## Repository layout

```
├── src/           React app
├── public/        Static assets (sprites, item art, PWA files)
├── data/          Game JSON exports
├── scripts/       Seed, icon generation, category fetch
├── firebase.json  Hosting + Firestore config
└── DATA_SETUP.md  How to supply your own data and artwork
```

Original code is [MIT licensed](./LICENSE). Game data and artwork are not included — see [DATA_SETUP.md](./DATA_SETUP.md).

Pokémon © Nintendo · Creatures Inc. · GAME FREAK inc. · The Pokémon Company. Unofficial fan project — not affiliated with or endorsed by Nintendo or The Pokémon Company.

## Data & source attribution

Game data and artwork in this project are compiled from community trackers and fan sites. **None of these sources are official Nintendo/The Pokémon Company publications.** Respect each site’s terms of use; artwork is gitignored and not redistributed in this repo.

### Game data

| What | Primary source |
|------|----------------|
| Pokémon species, abilities, habitat links, favorite tags | Community **Pokopia PokéTracker** spreadsheet → `data/pokemon.json` |
| Habitat recipes & labels | Same PokéTracker export → `data/habitats.json` |
| Preference categories & favorite→item mappings | [Pokopia Guide — Pokémon favorites](https://pokopiaguide.com/guides/pokemon-favorites-guide) → `data/favoriteCategories.json` |
| Craftable item IDs & names | [Serebii — Pokopia crafting list](https://www.serebii.net/pokemonpokopia/crafting.shtml) → `data/allCraftItems.json` |
| Item craft categories & furniture types | Merged from [Pokopia Guide items](https://pokopiaguide.com/items), [Serebii crafting](https://www.serebii.net/pokemonpokopia/crafting.shtml), and [Serebii items](https://www.serebii.net/pokemonpokopia/items.shtml) → `src/data/itemCraftCategories.json` (`npm run fetch:categories`) |
| Item wiki categories (`gamertwCategory` on preference items) | [Gamertw Pokopia wiki — item catalog](https://pokopia.gamertw.com/item) |
| Dream Islands, Mosslax flavor boosts, Paint & Crush berry colors | **The Ultimate Pokopia Guide** ([@PKMNCAST](https://x.com/PKMNCAST)) → `src/data/guides.js` |
| Snorlax cooking recipe matrix | [Pokopia Guide — Cooking](https://pokopiaguide.com/cooking) → `src/data/snorlaxRecipes.js` |
| Litterbug drop materials | Laura Loft community chart (credited in `src/data/guides.js`) |
| City planner block tile colors | Derived from [Serebii item artwork](https://www.serebii.net/pokemonpokopia/items) → `src/data/blockGridColors.json` |

The hosted app reads Pokémon, habitats, and preferences from Firestore when seeded (`npm run seed`); guide pages ship in the app bundle from `src/data/`.

### Artwork (local copies under `public/assets/`; not in git)

| Asset | Downloaded from |
|-------|-----------------|
| Pokémon sprites | [Serebii — Pokopia Pokémon sprites](https://www.serebii.net/pokemonpokopia/pokemon/small/) (PokéTracker `IMAGE()` URLs in the spreadsheet) |
| Habitat preview images | Embedded in the PokéTracker spreadsheet (`.xlsx` drawing/media) |
| Craft & favorite item icons | [Pokopia Guide item images](https://pokopiaguide.com/images/items/) (`item-*.png`), with fallback to [Serebii item PNGs](https://www.serebii.net/pokemonpokopia/items/) |
| Cooking recipe & ingredient art | Pokopia Guide (`/assets/pokemon-favorites/images/cooking/…`) |
| Dream Island / crafting materials | Serebii item art (`/assets/pokemon-favorites/images/materials/…`) |

See [DATA_SETUP.md](./DATA_SETUP.md) for how to supply assets locally.

## Development

```powershell
npm install
npm run setup:data   # copies example JSON from scripts/data-samples/ if real data is missing
npm run dev
```

| Command | Description |
|---------|-------------|
| `npm run build` | Production build |
| `npm run deploy` | Build + Firebase Hosting deploy |
| `npm run seed` | Seed Firestore from `data/*.json` |
| `npm run fetch:categories` | Refresh Serebii craft list + category maps |

