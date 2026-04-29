import { useAuth } from '@clerk/react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Module-level token cache — one Clerk round-trip shared across all concurrent requests.
// Clerk JWTs carry an `exp` claim; we refresh 15 s before expiry.
// _inflightTokenPromise deduplicates simultaneous refresh attempts.
let _cachedToken          = null;
let _tokenExpiry          = 0;
let _inflightTokenPromise = null;

export const useApiClient = () => {
  const { getToken } = useAuth();

  const getCachedToken = async () => {
    if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;
    if (!_inflightTokenPromise) {
      _inflightTokenPromise = getToken()
        .then(tok => {
          _cachedToken = tok;
          try {
            const exp = JSON.parse(atob(tok.split('.')[1])).exp;
            _tokenExpiry = exp * 1000 - 15_000;
          } catch {
            _tokenExpiry = Date.now() + 50_000;
          }
          _inflightTokenPromise = null;
          return tok;
        })
        .catch(err => { _inflightTokenPromise = null; throw err; });
    }
    return _inflightTokenPromise;
  };

  const request = async (method, path, { body, headers = {}, raw = false } = {}) => {
    const token = await getCachedToken();

    const options = {
      method,
      headers: { Authorization: `Bearer ${token}`, ...headers },
    };

    if (body instanceof FormData) {
      options.body = body;
    } else if (body !== undefined) {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BASE_URL}${path}`, options);

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      // FastAPI returns either:
      //   - {detail: "string"}  → simple errors
      //   - {detail: {code, message, ...}}  → structured errors with a code
      //   - {detail: [{loc,msg,...}]}  → Pydantic validation
      let message;
      const d = payload.detail;
      if (typeof d === 'string') {
        message = d;
      } else if (d && typeof d === 'object' && !Array.isArray(d) && typeof d.message === 'string') {
        message = d.message;
      } else if (Array.isArray(d) && d[0]?.msg) {
        message = d.map(e => e.msg).join('; ');
      } else {
        message = payload.message || payload.error || `HTTP ${res.status}`;
      }
      const err = new Error(message);
      err.status = res.status;
      err.code = (d && typeof d === 'object' && !Array.isArray(d)) ? d.code : undefined;
      err.data = payload;
      throw err;
    }

    if (raw) return res;
    if (res.status === 204 || res.status === 205) return null;

    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) return res.json();

    return res;
  };

  return {
    get:    (path, opts) => request('GET',    path, opts ?? {}),
    post:   (path, opts) => request('POST',   path, opts ?? {}),
    patch:  (path, opts) => request('PATCH',  path, opts ?? {}),
    delete: (path, opts) => request('DELETE', path, opts ?? {}),
  };
};
