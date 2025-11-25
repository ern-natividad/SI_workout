import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Snapshot file for persistent fallback
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'exercise_snapshot.json');

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) { console.warn('Could not create data dir', e); }
}

function readSnapshot() {
  try {
    if (!fs.existsSync(SNAPSHOT_FILE)) return null;
    const txt = fs.readFileSync(SNAPSHOT_FILE, 'utf8');
    return JSON.parse(txt || '{}');
  } catch (e) {
    console.warn('readSnapshot failed', e);
    return null;
  }
}

function writeSnapshotField(key, data) {
  try {
    ensureDataDir();
    const snap = readSnapshot() || {};
    snap[key] = data;
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snap, null, 2), 'utf8');
  } catch (e) {
    console.warn('writeSnapshotField failed', e);
  }
}

// Simple in-memory cache
const cache = new Map();
const DEFAULT_TTL = parseInt(process.env.EXERCISE_CACHE_TTL_SECONDS || '86400', 10);

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data, ttl = DEFAULT_TTL) {
  cache.set(key, { data, expiresAt: Date.now() + ttl * 1000 });
}

const RAPIDAPI_HOST = 'exercisedb.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const HAS_RAPIDAPI_KEY = Boolean(RAPIDAPI_KEY);

if (!HAS_RAPIDAPI_KEY) {
  console.warn('server/routes/exercises.js: RAPIDAPI_KEY is not set. Exercise proxy endpoints will use mock fallbacks until configured.');
}

async function proxyFetch(path) {
  const url = `https://${RAPIDAPI_HOST}${path}`;
  const headers = {
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };
  if (RAPIDAPI_KEY) headers['X-RapidAPI-Key'] = RAPIDAPI_KEY;

  try {
    const res = await fetch(url, { method: 'GET', headers });
    // Log upstream status for diagnostics
    try {
      console.log(`[exercise-proxy] FETCH ${url} -> ${res.status}`);
    } catch (e) { /* ignore logging errors */ }

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    // If the response was JSON, log a small sample of the keys to help detect gifUrl presence
    try {
      if (data && typeof data === 'object') {
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
          console.log(`[exercise-proxy] SAMPLE KEYS: ${Object.keys(data[0]).slice(0,20).join(',')}`);
        } else if (!Array.isArray(data)) {
          console.log(`[exercise-proxy] RESPONSE KEYS: ${Object.keys(data).slice(0,20).join(',')}`);
        }
      }
    } catch (e) {
      /* swallow logging errors */
    }

    return { status: res.status, data };
  } catch (err) {
    console.error('proxyFetch network error for', url, err);
    return { status: 502, data: { message: 'Proxy network error', error: err.message } };
  }
}

// Small builtin mock data used as a graceful fallback when RapidAPI is unavailable
const MOCK_EQUIPMENT = [
  'body weight',
  'dumbbell',
  'barbell',
  'kettlebell',
  'machine'
];
const MOCK_BODYPARTS = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core'
];

// GET /api/exercises/equipmentList
router.get('/equipmentList', async (req, res) => {
  try {
    const key = 'equipmentList';
    const cached = getCache(key);
    if (cached) return res.json(cached);

      const r = await proxyFetch('/exercises/equipmentList');
      if (r.status === 200) {
        setCache(key, r.data);
        // persist snapshot for fallback
        try { writeSnapshotField('equipmentList', r.data); } catch (e) { console.warn('snapshot write failed', e); }
        return res.json(r.data);
      }
      console.warn('equipmentList: RapidAPI returned', r.status, '; checking snapshot fallback.');
      // On rate limit or other remote error, try serving snapshot if available
      const snapshot = readSnapshot();
      if (snapshot && Array.isArray(snapshot.equipmentList) && snapshot.equipmentList.length > 0) {
        res.setHeader('X-Exercise-Proxy-Source', 'snapshot');
        return res.json(snapshot.equipmentList);
      }
      return res.status(r.status || 502).json({ message: r.data });
  } catch (error) {
    console.error('Error proxying equipmentList:', error);
    res.status(500).json({ message: 'Proxy error' });
  }
});

// GET /api/exercises/bodyPartList
router.get('/bodyPartList', async (req, res) => {
  try {
    const key = 'bodyPartList';
    const cached = getCache(key);
    if (cached) return res.json(cached);

    const r = await proxyFetch('/exercises/bodyPartList');
    if (r.status === 200) {
      setCache(key, r.data);
      try { writeSnapshotField('bodyPartList', r.data); } catch (e) { console.warn('snapshot write failed', e); }
      return res.json(r.data);
    }
    console.warn('bodyPartList: RapidAPI returned', r.status, '; checking snapshot fallback.');
    const snapshot = readSnapshot();
    if (snapshot && Array.isArray(snapshot.bodyPartList) && snapshot.bodyPartList.length > 0) {
      res.setHeader('X-Exercise-Proxy-Source', 'snapshot');
      return res.json(snapshot.bodyPartList);
    }
    return res.status(r.status || 502).json({ message: r.data });
  } catch (error) {
    console.error('Error proxying bodyPartList:', error);
    res.status(500).json({ message: 'Proxy error' });
  }
});

// Generic equipment route: /api/exercises/equipment/:equipment
router.get('/equipment/:equipment', async (req, res) => {
  try {
    const equipment = req.params.equipment;
    const key = `equipment:${equipment}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);

    const r = await proxyFetch(`/exercises/equipment/${encodeURIComponent(equipment)}`);
    if (r.status === 200) {
      setCache(key, r.data);
      return res.json(r.data);
    }
    console.warn('equipment/:equipment: RapidAPI returned', r.status, '; propagating error to client.');
    return res.status(r.status || 502).json({ message: r.data });
  } catch (error) {
    console.error('Error proxying equipment:', error);
    res.status(500).json({ message: 'Proxy error' });
  }
});

// Generic bodyPart route: /api/exercises/bodyPart/:part
router.get('/bodyPart/:part', async (req, res) => {
  try {
    const part = req.params.part;
    const key = `bodyPart:${part}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);

    const r = await proxyFetch(`/exercises/bodyPart/${encodeURIComponent(part)}`);
    if (r.status === 200) {
      setCache(key, r.data);
      return res.json(r.data);
    }
    console.warn('bodyPart/:part: RapidAPI returned', r.status, '; propagating error to client.');
    return res.status(r.status || 502).json({ message: r.data });
  } catch (error) {
    console.error('Error proxying bodyPart:', error);
    res.status(500).json({ message: 'Proxy error' });
  }
});

// Get by name (for gifUrl) - /api/exercises/name/:name
router.get('/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const key = `name:${name}`;
    const cached = getCache(key);
    if (cached) return res.json(cached);

    const r = await proxyFetch(`/exercises/name/${encodeURIComponent(name)}`);
    if (r.status === 200) {
      setCache(key, r.data);

      // If the response contains a direct gifUrl, persist it in the snapshot (store only gifUrl)
      try {
        const resp = r.data;
        let gifUrl = '';
        const pickGif = (o) => o && (o.gifUrl || '');
        if (Array.isArray(resp) && resp.length > 0) {
          gifUrl = pickGif(resp[0]);
        } else if (resp && typeof resp === 'object') {
          gifUrl = pickGif(resp);
        }

        if (gifUrl) {
          // read existing images map, update and persist
          const snap = readSnapshot() || {};
          const imagesMap = snap.imagesByName && typeof snap.imagesByName === 'object' ? snap.imagesByName : {};
          imagesMap[name] = gifUrl;
          try { writeSnapshotField('imagesByName', imagesMap); } catch (e) { console.warn('could not write images snapshot', e); }
        }
      } catch (e) {
        console.warn('persist gifUrl failed', e);
      }

      return res.json(r.data);
    }

    // If RapidAPI returned non-200 (rate limit, etc), try snapshot fallback for image URL by name
    console.warn(`/api/exercises/name: RapidAPI returned ${r.status} for name=${name} - trying snapshot fallback`);
    try {
      const snap = readSnapshot() || {};
      const imagesMap = snap.imagesByName && typeof snap.imagesByName === 'object' ? snap.imagesByName : {};
      if (imagesMap[name]) {
        // return a minimal shape similar to RapidAPI response so client can pick gifUrl
        return res.json([{ gifUrl: imagesMap[name], name }]);
      }
    } catch (e) {
      console.warn('imagesByName fallback failed', e);
    }

    return res.status(r.status).json({ message: r.data });
  } catch (error) {
    console.error('Error proxying name:', error);
    res.status(500).json({ message: 'Proxy error' });
  }
});

// Image proxy: GET /api/exercises/image?url=<encodedUrl>
// Fetches an image URL server-side (adds RapidAPI key/header) and streams bytes to client
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query || {};
    if (!url) return res.status(400).json({ message: 'Missing url parameter' });
    let parsed;
    try { parsed = new URL(url); } catch (e) { return res.status(400).json({ message: 'Invalid url' }); }

    // Only allow the exercisedb host for safety
    if (parsed.hostname !== RAPIDAPI_HOST) return res.status(400).json({ message: 'Invalid host' });

    const headers = {
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    };
    if (RAPIDAPI_KEY) headers['X-RapidAPI-Key'] = RAPIDAPI_KEY;

    const r = await fetch(url, { method: 'GET', headers });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(r.status).json({ message: 'Failed to fetch image', detail: txt });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    const contentType = r.headers.get('content-type') || 'application/octet-stream';
    // Allow browsers on your frontend origin to load this proxied image even when
    // helmet sets stricter cross-origin headers globally. Set a permissive
    // Cross-Origin-Resource-Policy for image responses so they can be embedded.
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    // Mirror configured FRONTEND_URL or allow any origin if not set (safe for images only)
    const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VITE_API_BASE || '*';
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.send(buf);
  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(500).json({ message: 'Image proxy error' });
  }
});


// Proxy a protected image from RapidAPI so the browser doesn't need the RapidAPI key.
// GET /api/exercises/image/:id
router.get('/image/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Missing image id' });

    const url = `https://${RAPIDAPI_HOST}/image/${encodeURIComponent(id)}`;
    const headers = { 'X-RapidAPI-Host': RAPIDAPI_HOST };
    if (RAPIDAPI_KEY) headers['X-RapidAPI-Key'] = RAPIDAPI_KEY;

    const upstream = await fetch(url, { method: 'GET', headers });
    if (!upstream.ok) {
      const txt = await upstream.text();
      return res.status(upstream.status).send(txt);
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await upstream.arrayBuffer());
    // See note above: ensure image responses can be embedded by browsers on the
    // configured frontend by adjusting the resource policy for these routes.
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const FRONTEND_URL2 = process.env.FRONTEND_URL || process.env.VITE_API_BASE || '*';
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL2);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.send(buffer);
  } catch (err) {
    console.error('Error proxying image:', err);
    return res.status(500).json({ message: 'Image proxy error' });
  }
});

// New: GET /api/exercises/imageById?exerciseId=<id>&resolution=<180|360|720|1080>
// Proxies the ExerciseDB image endpoint which expects query params.
router.get('/imageById', async (req, res) => {
  try {
    const { exerciseId, resolution } = req.query || {};
    if (!exerciseId) return res.status(400).json({ message: 'Missing exerciseId parameter' });
    const allowed = ['180', '360', '720', '1080'];
    const resStr = resolution && allowed.includes(String(resolution)) ? String(resolution) : '360';

    // ExerciseDB expects a 4-character exerciseId (zero-padded). Accept numeric short ids
    // from clients and left-pad to 4 digits to be tolerant.
    let exId = String(exerciseId || '');
    if (/^\d+$/.test(exId) && exId.length < 4) {
      exId = exId.padStart(4, '0');
      console.log(`[exercise-proxy] Padded exerciseId to ${exId}`);
    }

    const url = `https://${RAPIDAPI_HOST}/image?exerciseId=${encodeURIComponent(exId)}&resolution=${encodeURIComponent(resStr)}`;
    const headers = { 'X-RapidAPI-Host': RAPIDAPI_HOST };
    if (RAPIDAPI_KEY) headers['X-RapidAPI-Key'] = RAPIDAPI_KEY;

    const upstream = await fetch(url, { method: 'GET', headers });
    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => '');
      return res.status(upstream.status).json({ message: 'Failed to fetch image', detail: txt });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    const contentType = upstream.headers.get('content-type') || 'image/gif';
    // Adjust response headers so the frontend can embed the proxied image.
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const FRONTEND_URL3 = process.env.FRONTEND_URL || process.env.VITE_API_BASE || '*';
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL3);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.send(buffer);
  } catch (err) {
    console.error('Error proxying imageById:', err);
    return res.status(500).json({ message: 'Image proxy error' });
  }
});


    // GET /api/exercises/imagesByName
    // Returns the persisted imagesByName map from the snapshot file (if any)
    router.get('/imagesByName', (req, res) => {
      try {
        const snap = readSnapshot() || {};
        const images = snap.imagesByName && typeof snap.imagesByName === 'object' ? snap.imagesByName : {};
        return res.json(images);
      } catch (err) {
        console.error('Error reading imagesByName snapshot:', err);
        return res.status(500).json({ message: 'Failed to read images snapshot' });
      }
    });

// POST /api/exercises/proxy
// Body: { path: '/exercises/bodyPartList' }  OR { url: 'https://exercisedb.p.rapidapi.com/exercises/bodyPartList' }
// This endpoint validates the target and calls RapidAPI server-side using the configured RAPIDAPI_KEY.
router.post('/proxy', async (req, res) => {
  try {
    const { path, url } = req.body || {};
    if (!HAS_RAPIDAPI_KEY) return res.status(502).json({ message: 'Missing RAPIDAPI_KEY on server.' });

    let targetPath = path;
    if (!targetPath && url) {
      try {
        const parsed = new URL(url);
        if (parsed.hostname !== RAPIDAPI_HOST) return res.status(400).json({ message: 'Invalid host' });
        targetPath = parsed.pathname + (parsed.search || '');
      } catch (e) {
        return res.status(400).json({ message: 'Invalid url' });
      }
    }

    if (!targetPath || !targetPath.startsWith('/exercises')) return res.status(400).json({ message: 'Invalid path' });

    const cached = getCache(targetPath);
    if (cached) return res.json(cached);

    const r = await proxyFetch(targetPath);
    if (r.status === 200) {
      setCache(targetPath, r.data);
      return res.json(r.data);
    }
    return res.status(r.status).json({ message: r.data });
  } catch (err) {
    console.error('Error in /proxy:', err);
    res.status(500).json({ message: 'Proxy error' });
  }
});

export default router;



