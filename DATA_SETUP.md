# Data & asset setup

This repository ships **code and game data**. Artwork is excluded via `.gitignore` so clones do not redistribute Nintendo-related content or third-party scraped data.

## Environment variables

Copy the template and fill in your Firebase web config (or use the CLI):

```powershell
Copy-Item .env.example .env
npx firebase apps:sdkconfig WEB --project pokopia-pal
```

Paste the values into `.env` as `VITE_FIREBASE_*` (see `.env.example`). `.env` is gitignored and lives at the **repo root** — not in a subfolder.

For seeding only, also add `sa.json` at the repo root (service account key) or set `GOOGLE_APPLICATION_CREDENTIALS`.

## Quick start

```powershell
npm install
npm run setup:data
npm run dev
```

`npm run setup:data` copies sample JSON into `data/` **only when those files are missing**. It does not overwrite data you already have.

## Required JSON files

All paths are relative to the repo root:

| Path | Used by |
|------|---------|
| `data/favoriteCategories.json` | Firestore seed, local preference fallback, guide image map |
| `data/habitats.json` | Firestore seed |
| `data/pokemon.json` | Firestore seed |
| `data/allCraftItems.json` | Firestore seed, UI item catalog + image fallbacks |

Sample templates were previously in `data/examples/`. If you need fresh copies, run `npm run setup:data`.

### Obtaining full data

The app was built around JSON exports from a local Pokopia tracker database. This repo does **not** publish those exports. Options:

1. **Your own tracker / spreadsheet** — export JSON matching the schema of the files in `data/`.
2. **Community resources** — habitat and preference lists on Reddit and fan wikis; respect their terms.
3. **Serebii craft list** — rebuild `allCraftItems.json` via `npm run fetch:categories` (requires existing `favoriteCategories.json` for category matching).

## Image assets

Place web-served files under `public/assets/`:

```
public/assets/poketracker/habitats/   — habitat preview art
public/assets/poketracker/sprites/    — Pokémon sprites
public/assets/pokemon-favorites/images/items/  — craft item icons (item-*.png)
```

JSON exports may reference `app/assets/...` paths from a tracker export; the seed script and UI map those to `/assets/...` under `public/`.

The UI falls back to Serebii item URLs when local images are missing (`src/lib/assets.js`).

### Branding / PWA icons

1. Add `public/assets/branding/logo-source.png` (your own artwork).
2. Run `npm run icons`.

Generated `pwa-*.png` and `logo.png` files are gitignored.

## Firestore seeding (optional)

The hosted site reads Pokémon, habitats, and preferences from Firestore. Static guides ship in the app bundle.

```powershell
# Place Firebase service account key at sa.json (gitignored), or use gcloud ADC
npm run seed
```

See `scripts/seedFirestore.js` for collection mapping.

## What stays in git

- `src/` — React application
- `scripts/` — seed and utility scripts
- `src/data/guides.js`, `snorlaxRecipes.js`, `itemCraftCategories.json`, `blockGridColors.json` — curated guide content
- `public/backgrounds/`, `favicon.svg`, `manifest.json` — UI chrome

Do **not** commit game artwork.
