import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:5000/api/exercises';

async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; } catch (e) { return { ok: res.ok, status: res.status, data: text }; }
  } catch (e) {
    return { ok: false, status: 0, data: e.message };
  }
}

function pickGif(obj) {
  if (!obj) return '';
  if (obj.gifUrl && typeof obj.gifUrl === 'string' && obj.gifUrl.trim()) return obj.gifUrl.trim();
  if (obj.image && typeof obj.image === 'string' && obj.image.trim()) return obj.image.trim();
  return '';
}

async function main() {
  console.log('check_gif_urls: contacting', BASE);

  const partsResp = await safeFetchJson(`${BASE}/bodyPartList`);
  if (!partsResp.ok) {
    console.error('Failed to fetch bodyPartList', partsResp.status, partsResp.data);
    process.exit(2);
  }
  const parts = Array.isArray(partsResp.data) ? partsResp.data : [];
  console.log('Found body parts:', parts.length);

  let checked = 0;
  let found = 0;
  const samples = [];

  for (const part of parts) {
    console.log('\nScanning body part:', part);
    const partResp = await safeFetchJson(`${BASE}/bodyPart/${encodeURIComponent(part)}`);
    if (!partResp.ok) {
      console.warn('  Could not fetch exercises for', part, partResp.status);
      continue;
    }
    const exercises = Array.isArray(partResp.data) ? partResp.data : [];
    console.log('  exercises in part:', exercises.length);

    // check up to 8 exercises per part to keep the run short
    const toCheck = exercises.slice(0, 8);
    for (const ex of toCheck) {
      checked++;
      const name = ex && ex.name ? ex.name : null;
      if (!name) continue;
      const nameResp = await safeFetchJson(`${BASE}/name/${encodeURIComponent(name)}`);
      if (!nameResp.ok) {
        // log but continue
        //console.warn('    name fetch failed for', name, nameResp.status);
        continue;
      }
      const data = nameResp.data;
      let gif = '';
      if (Array.isArray(data) && data.length > 0) gif = pickGif(data[0]);
      else if (data && typeof data === 'object') gif = pickGif(data);

      if (gif) {
        found++;
        if (samples.length < 20) samples.push({ name, gif });
        console.log('    +', name, '=>', gif);
      } else {
        //console.log('    -', name, 'no gif');
      }
      // small delay
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  console.log('\nSummary: checked', checked, 'exercises, found', found, 'with gifUrl/image.');
  if (samples.length > 0) {
    console.log('\nSamples:');
    for (const s of samples) console.log(' -', s.name, '->', s.gif);
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error('Unhandled error:', e); process.exit(99); });
