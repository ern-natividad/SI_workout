// Lightweight fetch middleware wrapper
// - injects auth token from sessionStorage as Bearer Authorization header
// - ensures JSON parsing when possible
// - handles 401 by clearing session storage (caller can handle redirect)

export async function fetchWithMiddleware(url, options = {}) {
  // Prefer explicit VITE_API_BASE when provided. When missing in dev, default
  // to the backend port used by the Express server so calls go directly
  // to the API instead of relying on a dev proxy configuration.
  let API_BASE = import.meta.env.VITE_API_BASE || '';
  try {
    if (!API_BASE && typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      API_BASE = 'http://localhost:5000';
    }
  } catch (e) {
    // ignore in non-browser environments
  }
  const token = sessionStorage.getItem('authToken');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const opts = { ...options, headers: defaultHeaders };

  const fullUrl = url && url.startsWith('/') ? API_BASE + url : url;
  const response = await fetch(fullUrl, opts);

  if (response.status === 401) {
    // Clear client-side auth state so the app can re-authenticate.
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');

    // Dispatch a global event so AuthContext can logout/redirect
    try {
      window.dispatchEvent(new Event('auth-logout'));
    } catch (e) {
      // ignore if window isn't available
    }

    // Let caller decide what to do next (redirect/login)
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  // Try to parse JSON, fallback to text
  const text = await response.text();
  
  // Log non-2xx responses for debugging
  if (!response.ok) {
    console.warn(`fetchMiddleware: ${response.status} ${response.statusText}`, { url, text });
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export default fetchWithMiddleware;
