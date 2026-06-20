/**
 * Copy minimal example JSON into place for first-time local dev.
 * Skips files that already exist. Does not overwrite your data.
 *
 * Usage: npm run setup:data
 */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXAMPLES = join(ROOT, 'data', 'examples');

const copies = [
  { from: join(EXAMPLES, 'favoriteCategories.json'), to: join(ROOT, 'data', 'favoriteCategories.json') },
  { from: join(EXAMPLES, 'habitats.json'), to: join(ROOT, 'data', 'habitats.json') },
  { from: join(EXAMPLES, 'pokemon.json'), to: join(ROOT, 'data', 'pokemon.json') },
  { from: join(EXAMPLES, 'allCraftItems.json'), to: join(ROOT, 'data', 'allCraftItems.json') },
];

let copied = 0;
let skipped = 0;

for (const { from, to } of copies) {
  if (existsSync(to)) {
    skipped += 1;
    continue;
  }
  if (!existsSync(from)) {
    console.warn(`Missing example file: ${from}`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log(`Created ${to.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`);
  copied += 1;
}

if (copied === 0 && skipped === copies.length) {
  console.log('All data files already present — nothing copied.');
} else {
  console.log(`Done. ${copied} created, ${skipped} skipped (already existed).`);
}
console.log('See DATA_SETUP.md for full data and asset instructions.');
