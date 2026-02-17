/**
 * Public API methods (site resolve, menu, content, reviews, redirects, forms).
 * All use host from window.location.host via http.buildURL.
 */

import { getJSON, postJSON, postFormData, getHost } from './http.js';

const prefix = 'api/v1';

export function siteResolve() {
  return getJSON(`${prefix}/site/resolve`);
}

export function getMenu(key) {
  return getJSON(`${prefix}/menu/${key}`);
}

export function getPage(slug) {
  return getJSON(`${prefix}/page/${encodeURIComponent(slug)}`);
}

export function getService(slug) {
  return getJSON(`${prefix}/service/${encodeURIComponent(slug)}`);
}

export function getProductCategory(slug) {
  return getJSON(`${prefix}/product-category/${encodeURIComponent(slug)}`);
}

export function getProduct(slug) {
  return getJSON(`${prefix}/product/${encodeURIComponent(slug)}`);
}

export function getReviews(params = {}) {
  const query = { ...params };
  return getJSON(`${prefix}/reviews`, query);
}

export function checkRedirect(path) {
  return getJSON(`${prefix}/redirects/check`, { path: path || '/' });
}

/** Список городов (поддоменов) для выпадающего меню в шапке — из API, динамически. */
export function getCitySites() {
  return getJSON(`${prefix}/city-sites`);
}

/**
 * Данные сайта по slug города (для основного домена без редиректа).
 */
export function getSiteByCity(slug) {
  return getJSON(`${prefix}/site/by-city/${encodeURIComponent(slug)}`);
}

/**
 * Отправка заявки с формы в Telegram.
 * @param {Object} payload - { type, phone, name?, message?, city_slug? }
 * @param {string} payload.type - callback | low_price | form_5min | rassrochka | pozdravlenie
 */
export function submitLead(payload) {
  return postJSON(`${prefix}/forms/lead`, payload);
}

/**
 * Отправка отзыва (создаётся со статусом pending, в Telegram приходит с кнопками и фото).
 * @param {Object} payload - { author_name, text, phone, city_slug?, photos?: File[] }
 */
export function submitReview(payload) {
  const { author_name, text, phone, city_slug, photos } = payload;
  const hasFiles = Array.isArray(photos) && photos.length > 0;
  if (hasFiles) {
    const form = new FormData();
    form.append('author_name', author_name);
    form.append('text', text);
    form.append('phone', phone ?? '');
    if (city_slug != null && city_slug !== '') form.append('city_slug', city_slug);
    photos.forEach((file) => form.append('photos[]', file));
    return postFormData(`${prefix}/reviews/submit`, form);
  }
  return postJSON(`${prefix}/reviews/submit`, { author_name, text, phone: phone ?? '', city_slug });
}

export { getHost };
