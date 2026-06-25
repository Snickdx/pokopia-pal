/**
 * One-off migration: associate all Flavor-category preferences with habitats
 * whose details mention "Plated Food".
 *
 * Usage: node scripts/migrateFlavorHabitats.js
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function resolveServiceAccountPath() {
  const defaultSa = join(APP_ROOT, 'sa.json');
  const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!configured) return defaultSa;
  if (configured.startsWith('/') || /^[A-Za-z]:[\\/]/.test(configured)) return configured;
  return join(APP_ROOT, configured.replace(/^\.\//, ''));
}

function initAdmin() {
  if (getApps().length) return getFirestore();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'pokopia-pal';
  const defaultSa = join(APP_ROOT, 'sa.json');
  const saPath = resolveServiceAccountPath();
  if (existsSync(saPath)) {
    const serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id || projectId });
  } else {
    initializeApp({ projectId });
  }
  return getFirestore();
}

const FLAVOR_SLUGS = ['bitter-flavors', 'dry-flavors', 'sour-flavors', 'spicy-flavors', 'sweet-flavors'];

async function main() {
  loadEnvFile();
  const db = initAdmin();

  // Fetch all habitat docs
  const habitatSnap = await db.collection('habitats').get();
  const platedHabitats = [];
  for (const d of habitatSnap.docs) {
    const data = d.data();
    if ((data.details || '').toLowerCase().includes('plated food')) {
      platedHabitats.push(d.id);
    }
  }
  console.log(`Found ${platedHabitats.length} habitats with Plated Food.`);

  // Fetch flavor preferences
  const batchSize = 400;
  let updated = 0;

  for (const slug of FLAVOR_SLUGS) {
    const ref = db.collection('preferences').doc(slug);
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`Preference ${slug} not found, skipping.`);
      continue;
    }

    const data = snap.data();
    const existing = new Set(data.habitatIds || []);
    let changed = false;

    for (const hid of platedHabitats) {
      if (!existing.has(hid)) {
        existing.add(hid);
        changed = true;
      }
    }

    if (!changed) {
      console.log(`${slug}: no new habitats to add.`);
      continue;
    }

    const updatedIds = [...existing].sort();
    await ref.update({
      habitatIds: updatedIds,
      'counts.habitats': updatedIds.length,
    });
    updated++;
    const added = updatedIds.length - (data.habitatIds || []).length;
    console.log(`${slug}: added ${added} habitats (total ${updatedIds.length})`);
  }

  console.log(`Done. Updated ${updated} flavor preferences.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
