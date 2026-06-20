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

