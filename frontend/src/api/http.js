/**
 * HTTP client for public API.
 * Base URL from VITE_API_BASE_URL (or VITE_API_URL fallback). Host from window.location.host.
 */

const DEFAULT_TIMEOUT_MS = 15000;
const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

function getHost() {
  if (typeof window === 'undefined') return '';
  return window.location.host || '';
}

function buildURL(path, params = {}) {
  const host = getHost();
  const search = new URLSearchParams({ host, ...params });
  const sep = path.includes('?') ? '&' : '?';
  const full = path.startsWith('http') ? path : `${baseURL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  return `${full}${sep}${search.toString()}`;
}

/**
 * @param {string} path - e.g. 'api/v1/site/resolve'
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function request(path, options = {}) {
  const url = path.includes('?') ? path : buildURL(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? DEFAULT_TIMEOUT_MS);
  const response = await fetch(url, {
    ...options,
    signal: options.signal ?? controller.signal,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });
  clearTimeout(timeoutId);
  return response;
}

/**
 * GET JSON. Throws on non-2xx or parse error.
 * @param {string} path
 * @param {Record<string, string>} [params] - merged with host
 * @returns {Promise<any>}
 */
export async function getJSON(path, params = {}) {
  const url = buildURL(path, params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const err = new Error(data?.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

/**
 * POST JSON. Adds host to URL query. Body as object (sent as JSON).
 */
export async function postJSON(path, body = {}, params = {}) {
  const url = buildURL(path, params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const response = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const err = new Error(data?.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export { getHost, buildURL };
