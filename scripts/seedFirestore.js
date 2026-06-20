/**
 * Seed Firestore from data/*.json (local export).
 * Requires GOOGLE_APPLICATION_CREDENTIALS or firebase login + project in .firebaserc.
 *
 * Usage: npm run seed
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import {
  habitatDedupSlug,
  habitatTitle,
  inferItemKind,
  isSpecialEncounterHabitat,
  parseDexSort,
  slugify,
  toPublicAssetPath,
  uniqueRouteSlug,
} from './lib/normalize.js';
import { resolveCraftCategory, resolveItemType } from './fetch-item-categories.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const CATEGORY_MAP_PATH = join(__dirname, '..', 'src', 'data', 'itemCraftCategories.json');
const ALL_CRAFT_ITEMS_PATH = join(DATA_DIR, 'allCraftItems.json');
const SEREBII_ITEM_BASE = 'https://www.serebii.net/pokemonpokopia/items';
const APP_ROOT = join(__dirname, '..');

function loadEnvFile() {
  const envPath = join(APP_ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function resolveServiceAccountPath() {
  const defaultSa = join(APP_ROOT, 'sa.json');
  const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!configured) return defaultSa;
  if (configured.startsWith('/') || /^[A-Za-z]:[\\/]/.test(configured)) {
    return configured;
  }
  return join(APP_ROOT, configured.replace(/^\.\//, ''));
}

function printCredentialHelp(saPath) {
  console.error('\nFirestore seed needs Admin SDK credentials.\n');
  console.error(`Expected service account file: ${saPath}`);
  console.error('That file is missing (and is gitignored).\n');
  console.error('Option A — service account key (recommended):');
  console.error('  1. Firebase Console → Project settings → Service accounts');
  console.error('  2. Generate new private key');
  console.error(`  3. Save as ${saPath}`);
  console.error('  4. Run: npm run seed\n');
  console.error('Option B — gcloud application default credentials:');
  console.error('  gcloud auth application-default login');
  console.error('  npm run seed\n');
  console.error(
    'Note: Buildings/Blocks already ship in the app bundle; npm run deploy updates the site without seeding.',
  );
}

loadEnvFile();

function loadCategoryMaps() {
  if (!existsSync(CATEGORY_MAP_PATH)) return { bySlug: {}, byName: {} };
  return JSON.parse(readFileSync(CATEGORY_MAP_PATH, 'utf8'));
}

function loadAllCraftItems() {
  if (!existsSync(ALL_CRAFT_ITEMS_PATH)) {
    console.warn(
      `Missing ${ALL_CRAFT_ITEMS_PATH} — run npm run fetch:categories to include Buildings/Blocks.`,
    );
    return [];
  }
  return JSON.parse(readFileSync(ALL_CRAFT_ITEMS_PATH, 'utf8')).items || [];
}

function loadJson(name) {
  const raw = readFileSync(join(DATA_DIR, name), 'utf8');
  return JSON.parse(raw).documents;
}

function initAdmin() {
  if (getApps().length) return getFirestore();

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    'pokopia-pal';

  const defaultSa = join(APP_ROOT, 'sa.json');
  const saPath = resolveServiceAccountPath();

  if (existsSync(saPath)) {
    const serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
    console.log(`Admin SDK: service account (${serviceAccount.client_email})`);
  } else {
    console.warn(`No service account at ${saPath}; using application default credentials.`);
    initializeApp({ projectId });
  }

  return getFirestore();
}

async function deleteOrphanDocs(db, collection, validIds) {
  const snap = await db.collection(collection).get();
  const toDelete = snap.docs.filter((d) => !validIds.has(d.id));
  if (!toDelete.length) return 0;

  const CHUNK = 400;
  for (let i = 0; i < toDelete.length; i += CHUNK) {
    const batch = db.batch();
    for (const d of toDelete.slice(i, i + CHUNK)) batch.delete(d.ref);
    await batch.commit();
  }
  return toDelete.length;
}

async function upsertBatch(db, collection, docs, stats) {
  const CHUNK = 400;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch();
    const slice = docs.slice(i, i + CHUNK);
    for (const { id, data } of slice) {
      const ref = db.collection(collection).doc(id);
      batch.set(ref, { ...data, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
    await batch.commit();
    stats[collection].written += slice.length;
  }
}

function pickCanonicalHabitat(rows) {
  const completed = rows.filter((r) => r.completed);
  if (completed.length) {
    return completed.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''))[0];
  }
  return rows.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''))[0];
}

/** Merge redundant JSON rows so unique fields from any copy are kept on one doc. */
function mergeHabitatRows(rows) {
  const canonical = pickCanonicalHabitat(rows);
  let details = canonical.details || '';
  let label = canonical.label;
  let title = canonical.title;
  let imagePath = canonical.imagePath;
  let completed = canonical.completed;

  for (const r of rows) {
    if (r.completed) completed = true;
    if (!imagePath && r.imagePath) imagePath = r.imagePath;
    if ((r.details || '').length > details.length) details = r.details;
    if (!label && r.label) label = r.label;
    if (!title && r.title) title = r.title;
  }

  return {
    ...canonical,
    label,
    title: title || habitatTitle(label, details),
    details,
    imagePath,
    completed,
    legacySlugs: [...new Set(rows.map((r) => r.slug).filter(Boolean))],
  };
}

function buildCatalog() {
  const categories = loadJson('favoriteCategories.json');
  const habitatsRaw = loadJson('habitats.json');
  const pokemonRaw = loadJson('pokemon.json');
  const craftCategoryMaps = loadCategoryMaps();

  const itemsMap = new Map();
  const preferences = [];
  const preferenceBySlug = new Map();

  for (const cat of categories) {
    const categoryId = cat.id;
    const categoryName = cat.name;
    for (const fav of cat.favorites || []) {
      const prefId = fav.slug;
      const itemIds = [];
      for (const it of fav.items || []) {
        const itemId = it.slug;
        itemIds.push(itemId);
        if (!itemsMap.has(itemId)) {
          itemsMap.set(itemId, {
            id: itemId,
            name: it.name,
            link: it.link || null,
            imagePath: toPublicAssetPath(it.imageLocalPath),
            imageUrl: it.imageUrl || null,
            kind: inferItemKind(it),
            gamertwCategory: it.gamertwCategory || null,
            craftCategory: resolveCraftCategory(
              { id: itemId, name: it.name },
              craftCategoryMaps,
            ),
            itemType: resolveItemType({ id: itemId, name: it.name }, craftCategoryMaps),
            preferenceIds: new Set([prefId]),
            habitatIds: new Set(),
          });
        } else {
          itemsMap.get(itemId).preferenceIds.add(prefId);
        }
      }
      const pref = {
        id: prefId,
        displayName: fav.displayName,
        category: categoryName,
        categoryId,
        itemIds: [...new Set(itemIds)],
        habitatIds: [],
        pokemonIds: [],
        sortKey: fav.displayName.toLowerCase(),
      };
      preferences.push(pref);
      preferenceBySlug.set(prefId, pref);
    }
  }

  let craftOnlyCount = 0;
  for (const craftItem of loadAllCraftItems()) {
    if (itemsMap.has(craftItem.id)) continue;
    const serebiiId = craftItem.serebiiId || craftItem.id;
    itemsMap.set(craftItem.id, {
      id: craftItem.id,
      name: craftItem.name,
      link: `${SEREBII_ITEM_BASE}/${serebiiId}.shtml`,
      imagePath: null,
      imageUrl: `${SEREBII_ITEM_BASE}/${serebiiId}.png`,
      kind: 'Item',
      gamertwCategory: null,
      craftCategory: craftItem.craftCategory,
      itemType: resolveItemType(
        { id: craftItem.id, name: craftItem.name },
        craftCategoryMaps,
      ),
      preferenceIds: new Set(),
      habitatIds: new Set(),
    });
    craftOnlyCount++;
  }
  if (craftOnlyCount) {
    console.log(`Merged ${craftOnlyCount} craft-only items (Buildings, Blocks, etc.)`);
  }

  const habitatsBySlug = new Map();
  for (const h of habitatsRaw) {
    if (!h.slug) continue;
    habitatsBySlug.set(h.slug, h);
  }

  const habitatDocs = new Map();
  const contentKeyToCanonical = new Map();

  for (const h of habitatsRaw) {
    if (!h.slug || isSpecialEncounterHabitat(h.label, h.details)) continue;
    const contentKey = habitatDedupSlug(h.label, h.details);
    const row = {
      slug: h.slug,
      label: h.label,
      title: habitatTitle(h.label, h.details),
      details: h.details || '',
      imagePath: toPublicAssetPath(h.habitatImagePath),
      completed: Boolean(h.completed),
      contentKey,
      preferenceIds: new Set(),
      pokemonIds: new Set(),
      itemIds: new Set(),
    };
    if (!contentKeyToCanonical.has(contentKey)) {
      contentKeyToCanonical.set(contentKey, []);
    }
    contentKeyToCanonical.get(contentKey).push(row);
  }

  const usedRouteSlugs = new Set();
  const contentKeyToRouteId = new Map();

  for (const [, rows] of contentKeyToCanonical) {
    const merged = mergeHabitatRows(rows);
    const slugBase =
      merged.title ||
      merged.label ||
      habitatTitle(merged.label, merged.details) ||
      `habitat-${merged.slug.slice(0, 8)}`;
    const routeSlug = uniqueRouteSlug(slugBase, usedRouteSlugs);

    habitatDocs.set(routeSlug, {
      id: routeSlug,
      routeSlug,
      legacyId: merged.slug,
      label: merged.label,
      title: merged.title,
      details: merged.details,
      imagePath: merged.imagePath,
      completed: merged.completed,
      contentKey: merged.contentKey,
      preferenceIds: [],
      pokemonIds: [],
      itemIds: [],
      alternateSlugs: merged.legacySlugs,
    });
    contentKeyToRouteId.set(merged.contentKey, routeSlug);
  }

  const pokemonDocs = [];
  for (const p of pokemonRaw) {
    const prefSlugs = (p.favorites || [])
      .map((f) => f.favorite?.slug)
      .filter(Boolean);
    const habitatSlugs = [];
    for (const slot of p.habitats || []) {
      const hs = slot.habitat?.slug;
      if (!hs) continue;
      const raw = habitatsBySlug.get(hs);
      if (!raw || isSpecialEncounterHabitat(raw.label, raw.details)) continue;
      const contentKey = habitatDedupSlug(raw.label, raw.details);
      const group = contentKeyToCanonical.get(contentKey);
      if (!group?.length) continue;
      const canonical = pickCanonicalHabitat(group);
      const routeId = contentKeyToRouteId.get(contentKey);
      if (!routeId) continue;
      if (!habitatSlugs.includes(routeId)) habitatSlugs.push(routeId);

      const doc = habitatDocs.get(routeId);
      if (doc) {
        doc.pokemonIds.push(p.id);
        for (const ps of prefSlugs) {
          if (doc.preferenceIds.indexOf(ps) < 0) doc.preferenceIds.push(ps);
        }
      }
    }

    for (const ps of prefSlugs) {
      const pref = preferenceBySlug.get(ps);
      if (pref && !pref.pokemonIds.includes(p.id)) pref.pokemonIds.push(p.id);
    }

    const pokemonRouteSlug = slugify(p.id) || slugify(p.name) || p.id;

    pokemonDocs.push({
      id: p.id,
      routeSlug: pokemonRouteSlug,
      dexDisplay: p.dexDisplay || '',
      dexSort: p.dexSort ?? parseDexSort(p.dexDisplay),
      name: p.name,
      spritePath: toPublicAssetPath(p.spriteImagePath),
      abilityPrimary: p.abilityPrimary || null,
      abilitySecondary: p.abilitySecondary || null,
      ambientLight: p.ambientLight || null,
      registered: Boolean(p.registered),
      preferenceIds: prefSlugs,
      habitatIds: habitatSlugs,
      preferenceLabels: (p.favorites || []).map((f) => ({
        slug: f.favorite?.slug,
        displayName: f.favorite?.displayName,
        category: f.favorite?.category,
      })),
    });
  }

  const categoryHabitatIds = new Map();
  for (const pref of preferences) {
    if (categoryHabitatIds.has(pref.categoryId)) continue;
    const categoryPrefs = preferences.filter((x) => x.categoryId === pref.categoryId);
    const categoryPrefSlugs = new Set(categoryPrefs.map((x) => x.id));
    const habitatSet = new Set();
    for (const mon of pokemonDocs) {
      const sharesCategory = mon.preferenceIds.some((s) => categoryPrefSlugs.has(s));
      if (!sharesCategory) continue;
      for (const hid of mon.habitatIds) habitatSet.add(hid);
    }
    categoryHabitatIds.set(pref.categoryId, [...habitatSet].sort());
  }

  for (const pref of preferences) {
    pref.habitatIds = categoryHabitatIds.get(pref.categoryId) || [];
    pref.counts = {
      habitats: pref.habitatIds.length,
      items: pref.itemIds.length,
      pokemon: pref.pokemonIds.length,
    };
  }

  for (const doc of habitatDocs.values()) {
    doc.pokemonIds = [...new Set(doc.pokemonIds)].sort();
    doc.preferenceIds = [...new Set(doc.preferenceIds)].sort();
  }

  const itemNameToSlug = new Map();
  for (const [id, it] of itemsMap) {
    itemNameToSlug.set(it.name.toLowerCase(), id);
  }

  const legacyToRoute = new Map();
  for (const doc of habitatDocs.values()) {
    legacyToRoute.set(doc.id, doc.id);
    if (doc.legacyId) legacyToRoute.set(doc.legacyId, doc.id);
    for (const s of doc.alternateSlugs || []) legacyToRoute.set(s, doc.id);
  }

  const normalizeHabitatIds = (ids) =>
    [...new Set(ids.map((id) => legacyToRoute.get(id) || id))].sort();

  for (const doc of habitatDocs.values()) {
    for (const prefId of doc.preferenceIds) {
      const pref = preferenceBySlug.get(prefId);
      if (pref && !pref.habitatIds.includes(doc.id)) pref.habitatIds.push(doc.id);
    }
  }

  for (const pref of preferences) {
    pref.habitatIds = normalizeHabitatIds(pref.habitatIds);
    pref.counts.habitats = pref.habitatIds.length;
  }
  for (const p of pokemonDocs) {
    p.habitatIds = normalizeHabitatIds(p.habitatIds);
  }
  for (const it of itemsMap.values()) {
    it.habitatIds = new Set(normalizeHabitatIds([...it.habitatIds]));
  }

  preferences.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return {
    preferences: preferences.map((p) => ({
      id: p.id,
      data: {
        routeSlug: p.id,
        displayName: p.displayName,
        category: p.category,
        categoryId: p.categoryId,
        itemIds: p.itemIds,
        habitatIds: p.habitatIds,
        pokemonIds: p.pokemonIds,
        counts: p.counts,
        sortKey: p.sortKey,
      },
    })),
    habitats: [...habitatDocs.values()].map((h) => ({
      id: h.id,
      data: {
        routeSlug: h.routeSlug,
        legacyId: h.legacyId,
        label: h.label,
        title: h.title,
        details: h.details,
        imagePath: h.imagePath,
        completed: h.completed,
        contentKey: h.contentKey,
        preferenceIds: h.preferenceIds,
        pokemonIds: h.pokemonIds,
        itemIds: h.itemIds,
        alternateSlugs: h.alternateSlugs || [],
      },
    })),
    items: [...itemsMap.values()].map((it) => ({
      id: it.id,
      data: {
        routeSlug: it.id,
        name: it.name,
        link: it.link,
        imagePath: it.imagePath,
        imageUrl: it.imageUrl,
        kind: it.kind,
        gamertwCategory: it.gamertwCategory,
        craftCategory: it.craftCategory,
        itemType: it.itemType,
        preferenceIds: [...it.preferenceIds],
        habitatIds: [...it.habitatIds],
      },
    })),
    pokemon: pokemonDocs.map((p) => ({
      id: p.id,
      data: {
        routeSlug: p.routeSlug,
        dexDisplay: p.dexDisplay,
        dexSort: p.dexSort,
        name: p.name,
        spritePath: p.spritePath,
        abilityPrimary: p.abilityPrimary,
        abilitySecondary: p.abilitySecondary,
        ambientLight: p.ambientLight,
        registered: p.registered,
        preferenceIds: p.preferenceIds,
        habitatIds: p.habitatIds,
        preferenceLabels: p.preferenceLabels,
      },
    })),
  };
}

async function main() {
  const db = initAdmin();
  const catalog = buildCatalog();
  const stats = {
    preferences: { written: 0 },
    habitats: { written: 0 },
    items: { written: 0 },
    pokemon: { written: 0 },
  };

  console.log('Seeding Firestore…');
  console.log(
    `  preferences: ${catalog.preferences.length}, habitats: ${catalog.habitats.length}, items: ${catalog.items.length}, pokemon: ${catalog.pokemon.length}`,
  );

  await upsertBatch(db, 'preferences', catalog.preferences, stats);
  await upsertBatch(db, 'habitats', catalog.habitats, stats);
  await upsertBatch(db, 'items', catalog.items, stats);
  await upsertBatch(db, 'pokemon', catalog.pokemon, stats);

  const habitatIds = new Set(catalog.habitats.map((h) => h.id));
  const deletedHabitats = await deleteOrphanDocs(db, 'habitats', habitatIds);

  console.log('Done.');
  for (const [col, s] of Object.entries(stats)) {
    console.log(`  ${col}: ${s.written} upserted`);
  }
  if (deletedHabitats) {
    console.log(`  habitats: ${deletedHabitats} stale documents removed`);
  }
}

main().catch((err) => {
  const msg = String(err?.message || err);
  if (/default credentials|Could not load/i.test(msg)) {
    printCredentialHelp(resolveServiceAccountPath());
  } else {
    console.error(err);
  }
  process.exit(1);
});
