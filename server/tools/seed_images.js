import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'exercise_snapshot.json');
const BASE = 'http://localhost:5000/api/exercises';

function pickImage(o) {
  if (!o) return '';
  if (o.gifUrl && typeof o.gifUrl === 'string' && o.gifUrl.trim()) return o.gifUrl.trim();
  if (o.image && typeof o.image === 'string' && o.image.trim()) return o.image.trim();
  return '';
}

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; } catch (e) { return { ok: res.ok, status: res.status, data: text }; }
  } catch (e) {
    return { ok: false, status: 0, data: e.message };
  }
}

async function main() {
  console.log('seed_images: starting diagnostic sweep against', BASE);

  const bpl = await safeFetch(`${BASE}/bodyPartList`);
  if (!bpl.ok) {
    console.error('Failed to fetch bodyPartList:', bpl.status, bpl.data);
    return process.exitCode = 2;
  }
  const parts = Array.isArray(bpl.data) ? bpl.data : [];
  console.log('Found', parts.length, 'body parts');

  const imagesMap = {};
  let checked = 0;
  let found = 0;

  for (const part of parts) {
    console.log('Scanning part:', part);
    const re = await safeFetch(`${BASE}/bodyPart/${encodeURIComponent(part)}`);
    if (!re.ok) {
      console.warn('  Could not fetch exercises for', part, re.status);
      continue;
    }
    const exercises = Array.isArray(re.data) ? re.data : [];
    for (const ex of exercises) {
      checked++;
      const name = ex && ex.name ? ex.name : null;
      if (!name) continue;

      // Ask the name endpoint which sometimes includes gifUrl/image
      const rn = await safeFetch(`${BASE}/name/${encodeURIComponent(name)}`);
      if (!rn.ok) {
        // continue, maybe no data
        continue;
      }
      const resp = rn.data;
      let imageUrl = '';
      if (Array.isArray(resp) && resp.length > 0) imageUrl = pickImage(resp[0]);
      else if (resp && typeof resp === 'object') imageUrl = pickImage(resp);

      if (!imageUrl) {
        // If not returned, try to build the exercisedb image path via the id
        const id = ex.id || (Array.isArray(resp) && resp[0] && resp[0].id) || (resp && resp.id);
        if (id) {
          const candidate = `https://exercisedb.p.rapidapi.com/image/${encodeURIComponent(id)}`;
          // We'll attempt a HEAD/fetch to see if the server proxy can retrieve it
          const test = await safeFetch(`${BASE}/image?url=${encodeURIComponent(candidate)}`);
          if (test.ok) {
            // server returned the bytes; use proxied URL for client usage
            imageUrl = `${candidate}`;
          }
        }
      }

      if (imageUrl) {
        imagesMap[name] = imageUrl;
        found++;
        if (found % 25 === 0) console.log(`  Found ${found} images so far...`);
      }

      // small delay to be gentle on upstream if needed
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  console.log(`Diagnostic complete: checked ${checked} exercises, found ${found} images.`);

  // Read existing snapshot and merge
  let snap = {};
  try {
    if (fs.existsSync(SNAPSHOT_FILE)) snap = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8') || '{}');
  } catch (e) { console.warn('Could not read existing snapshot', e); }

  if (!snap.imagesByName || typeof snap.imagesByName !== 'object') snap.imagesByName = {};

  let merged = 0;
  for (const [k, v] of Object.entries(imagesMap)) {
    if (!snap.imagesByName[k]) {
      snap.imagesByName[k] = v;
      merged++;
    }
  }

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snap, null, 2), 'utf8');
    console.log(`Wrote snapshot. Merged ${merged} new images into ${SNAPSHOT_FILE}`);
  } catch (e) {
    console.error('Failed to write snapshot file:', e);
    process.exitCode = 3;
  }

  // Print a short sample
  const sampleKeys = Object.keys(imagesMap).slice(0, 10);
  console.log('Sample seeded entries:');
  for (const k of sampleKeys) console.log(' -', k, '->', imagesMap[k]);

  console.log('Done.');
}

main().catch((e) => { console.error('Unhandled error:', e); process.exitCode = 99; });
