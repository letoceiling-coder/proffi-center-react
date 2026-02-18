export { default as Seo } from './Seo';
export { default as JsonLd } from './JsonLd.jsx';
export { getCanonicalUrl } from './Seo';
export { getStaticMeta, STATIC_ROUTE_META } from './routes';
export * from './jsonld';

/** Базовый URL сайта (origin) для JSON-LD */
export function getBaseUrl() {
  return typeof window !== 'undefined' ? window.location.origin : '';
}
