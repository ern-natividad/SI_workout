#!/usr/bin/env node
/*
 * Prefetch exercise gifUrls from RapidAPI ExerciseDB and persist to data/exercise_snapshot.json
 * Usage: node scripts/prefetch_images.js
 * Requires RAPIDAPI_KEY in environment or in server/.env
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
if (!RAPIDAPI_KEY) {
  console.error('RAPIDAPI_KEY is not set in environment. Aborting.');
  process.exit(1);
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SNAPSHOT = path.join(DATA_DIR, 'exercise_snapshot.json');

const names = [
  'push up','squat','deadlift','bench press','pull up','lunge','plank','overhead press',
  'bicep curl','tricep dip','burpee','mountain climber','sit up','leg press','shoulder fly',
  'row','lat pulldown','leg extension','calf raise','glute bridge'
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function readSnapshot() {
  try {
    if (!fs.existsSync(SNAPSHOT)) return {};
    const txt = fs.readFileSync(SNAPSHOT, 'utf8');
    return JSON.parse(txt || '{}');
  } catch (e) {
    console.warn('readSnapshot failed', e);
    return {};
  }
}

function writeSnapshot(obj) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SNAPSHOT, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('writeSnapshot failed', e);
  }
}

async function fetchName(name) {
  const url = `https://${RAPIDAPI_HOST}/exercises/name/${encodeURIComponent(name)}`;
  const headers = { 'X-RapidAPI-Host': RAPIDAPI_HOST, 'X-RapidAPI-Key': RAPIDAPI_KEY };
  try {
    const res = await fetch(url, { method: 'GET', headers });
    if (!res.ok) {
      console.warn(`fetchName ${name} -> ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // prefer gifUrl on first item
      const gif = data[0].gifUrl || data[0].gif_url || null;
      return gif || null;
    }
    return null;
  } catch (e) {
    console.error('fetchName error', name, e.message || e);
    return null;
  }
}

async function main() {
  console.log('Prefetching exercise images...');
  const snap = readSnapshot();
  const images = snap.imagesByName && typeof snap.imagesByName === 'object' ? snap.imagesByName : {};

  for (const name of names) {
    if (images[name]) {
      console.log('Already cached:', name);
      continue;
    }
    console.log('Fetching:', name);
    const gif = await fetchName(name);
    if (gif) {
      images[name] = gif;
      console.log('Fetched gifUrl for', name);
    } else {
      console.warn('No gifUrl for', name);
    }
    // Respectful delay to avoid rapid rate-limits
    await sleep(800);
  }

  snap.imagesByName = { ...(snap.imagesByName || {}), ...images };
  writeSnapshot(snap);
  console.log('Prefetch complete. Persisted imagesByName keys:', Object.keys(snap.imagesByName || {}).length);
}

main().catch(err => { console.error('prefetch failed', err); process.exit(1); });
