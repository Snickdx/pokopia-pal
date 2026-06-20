/**
 * Generate PWA icons, favicons, and nav logos from branding artwork.
 * Strips near-black corner pixels from the source and composites on brand backgrounds.
 * Usage: node scripts/generatePwaIcons.js
 */
import sharp from 'sharp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const brandingDir = join(publicDir, 'assets', 'branding');
const SOURCE = join(brandingDir, 'logo-source.png');

const BRAND = {
  cream: { r: 255, g: 249, b: 235, alpha: 1 },
  creamHex: '#fff9eb',
  mint: { r: 198, g: 231, b: 225, alpha: 1 },
  mintHex: '#c6e7e1',
  forest: '#2d5f54',
  sage: '#8bb88e',
  peach: '#f6b297',
};

/** Pixels at or below this level in all channels are treated as corner fill (black). */
const BLACK_THRESHOLD = 28;

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="${BRAND.mintHex}"/>
  <rect x="2" y="2" width="28" height="28" rx="6" fill="${BRAND.creamHex}"/>
  <path fill="${BRAND.forest}" d="M10 8.5c0-1.2 1-2 2.2-2h3.6c3.8 0 6.2 2.4 6.2 5.8 0 2.6-1.2 4.4-3.2 5.2v.1c2.8.6 4.6 2.8 4.6 5.9 0 3.8-2.6 6.5-6.8 6.5h-4.6c-1.2 0-2.2-1-2.2-2.2V8.5zm4.4 3.6v4.1h1.8c1.5 0 2.4-.9 2.4-2.2 0-1.3-.9-1.9-2.4-1.9h-1.8zm0 7.3v4.5h2.2c1.8 0 2.9-1 2.9-2.5 0-1.5-1.1-2-2.9-2h-2.2z"/>
  <ellipse cx="9.5" cy="9" rx="1.4" ry="2.2" fill="${BRAND.sage}" transform="rotate(-35 9.5 9)"/>
  <ellipse cx="7.5" cy="11.5" rx="1.1" ry="1.8" fill="${BRAND.sage}" transform="rotate(-35 7.5 11.5)"/>
  <path fill="${BRAND.peach}" d="M22.5 21.5l1.1 1.1-1.1 1.1-1.1-1.1 1.1-1.1zm0-2.2l3.3 3.3-1.1 1.1-3.3-3.3 1.1-1.1z"/>
</svg>`;

let cleanLogoBuffer = null;

/** Remove opaque black/matte corners, flatten onto cream. */
async function getCleanLogoBuffer() {
  if (cleanLogoBuffer) return cleanLogoBuffer;

  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  cleanLogoBuffer = await sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 },
  })
    .flatten({ background: BRAND.cream })
    .png()
    .toBuffer();

  return cleanLogoBuffer;
}

async function renderIcon(size, { maskable = false, background = BRAND.cream } = {}) {
  const inner = maskable ? Math.round(size * 0.78) : size;
  const pad = maskable ? Math.round((size - inner) / 2) : 0;

  let img = sharp(await getCleanLogoBuffer()).resize(inner, inner, {
    fit: 'contain',
    background,
  });

  if (pad > 0) {
    img = img.extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background,
    });
  }

  return img;
}

async function writeIcon(name, size, opts = {}) {
  const img = await renderIcon(size, opts);
  await img.png().toFile(join(publicDir, name));
}

async function run() {
  if (!existsSync(SOURCE)) {
    console.error('Missing logo source:', SOURCE);
    console.error('Place logo-source.png in public/assets/branding/');
    process.exit(1);
  }

  const outputs = [
    ['pwa-192x192.png', 192, { background: BRAND.cream }],
    ['pwa-512x512.png', 512, { background: BRAND.cream }],
    ['pwa-512x512-maskable.png', 512, { maskable: true, background: BRAND.mint }],
    ['apple-touch-icon.png', 180, { background: BRAND.cream }],
    ['favicon.ico', 48, { background: BRAND.cream }],
    ['favicon-32.png', 32, { background: BRAND.cream }],
    ['favicon-16.png', 16, { background: BRAND.cream }],
  ];

  for (const [name, size, opts = {}] of outputs) {
    await writeIcon(name, size, opts);
  }

  await writeIcon(join('assets', 'branding', 'logo-nav.png'), 128, { background: BRAND.cream });
  await writeIcon(join('assets', 'branding', 'logo.png'), 512, { background: BRAND.cream });

  // Rewrite source master without dark corners for future edits.
  await sharp(await getCleanLogoBuffer()).png().toFile(SOURCE);

  writeFileSync(join(publicDir, 'favicon.svg'), FAVICON_SVG, 'utf8');

  console.log('Branding assets generated from', SOURCE);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
