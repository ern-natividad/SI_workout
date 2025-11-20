// Lightweight fetch middleware wrapper
// - injects auth token from sessionStorage as Bearer Authorization header
// - ensures JSON parsing when possible
// - handles 401 by clearing session storage (caller can handle redirect)

export async function fetchWithMiddleware(url, options = {}) {
  const token = sessionStorage.getItem('authToken');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const opts = { ...options, headers: defaultHeaders };

  const response = await fetch(url, opts);

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
