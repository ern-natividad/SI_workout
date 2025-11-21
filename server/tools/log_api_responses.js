const SAMPLE_NAMES = [
  'dumbbell curl',
  'bench press',
  'push up',
  'squat',
  'deadlift',
  'burpee'
];

const BASE = 'http://localhost:5000/api/exercises';

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    const txt = await res.text();
    let data;
    try { data = JSON.parse(txt); } catch (e) { data = txt; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: err.message };
  }
}

async function main() {
  console.log('Logging API responses from', BASE);
  for (const name of SAMPLE_NAMES) {
    const enc = encodeURIComponent(name);
    const url = `${BASE}/name/${enc}`;
    process.stdout.write(`\n=== ${name} -> ${url} ===\n`);
    const r = await safeFetch(url);
    console.log('status:', r.status, 'ok:', r.ok);
    if (typeof r.data === 'object') {
      // Print top-level keys and gifUrl if present
      if (Array.isArray(r.data)) {
        console.log('returned array length:', r.data.length);
        if (r.data.length > 0) {
          console.log('sample keys:', Object.keys(r.data[0]));
          console.log('sample gifUrl:', r.data[0].gifUrl || r.data[0].image || '(none)');
        }
      } else {
        console.log('returned object keys:', Object.keys(r.data));
        console.log('gifUrl:', r.data.gifUrl || r.data.image || '(none)');
      }
      // print full small object for inspection (trim large arrays)
      const out = Array.isArray(r.data) ? r.data.slice(0,3) : r.data;
      console.log('preview:', JSON.stringify(out, null, 2));
    } else {
      console.log('raw response:', r.data);
    }
    // gentle pause
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log('\nDone.');
}

main().catch((e) => { console.error('Error', e); process.exit(1); });
