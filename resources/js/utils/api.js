/**
 * API для админ-панели. Базовый путь: /api/v1
 */
const API_BASE = '/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const apiGet = async (url, params = {}) => {
    let fullUrl = `${API_BASE}${url}`;
    if (params && Object.keys(params).length > 0) {
        const qs = new URLSearchParams(params).toString();
        fullUrl += url.includes('?') ? `&${qs}` : `?${qs}`;
    }
    return fetch(fullUrl, { method: 'GET', headers: getAuthHeaders() });
};

export const apiPost = async (url, data = {}) => {
    const headers = data instanceof FormData ? { ...getAuthHeaders(), 'Content-Type': undefined } : getAuthHeaders();
    if (data instanceof FormData) delete headers['Content-Type'];
    return fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
    });
};

export const apiPut = async (url, data = {}) => {
    const headers = data instanceof FormData ? { ...getAuthHeaders(), 'Content-Type': undefined } : getAuthHeaders();
    if (data instanceof FormData) delete headers['Content-Type'];
    return fetch(`${API_BASE}${url}`, {
        method: 'PUT',
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
    });
};

export const apiDelete = async (url) => {
    return fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: getAuthHeaders() });
};
