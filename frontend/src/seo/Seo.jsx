import { Helmet } from 'react-helmet-async';
import { getStaticMeta } from './routes';

const DEFAULT_SITE_NAME = 'Proffi Center';

/**
 * Строит канонический URL без UTM и лишних query: origin + pathname.
 * @returns {string}
 */
export function getCanonicalUrl() {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname || '/';
  return origin + (pathname === '' ? '/' : pathname);
}

/**
 * Универсальный SEO-компонент: title, description, canonical, robots, OpenGraph, Twitter Card.
 * Источники данных:
 * 1) meta.seo с API (title, description, canonical, robots, og_*, og_image_url)
 * 2) явные пропсы (title, description, canonical, robots, noindex, pathname)
 * 3) для статических страниц — getStaticMeta(pathname) по pathname
 *
 * @param {{
 *   meta?: { seo?: { title, description, canonical, robots, og_title, og_description, og_image_url } },
 *   title?: string,
 *   description?: string,
 *   canonical?: string,
 *   robots?: string,
 *   noindex?: boolean,
 *   pathname?: string,
 *   ogImage?: string,
 *   siteName?: string
 * }} props
 */
export default function Seo({
  meta,
  title: titleProp,
  description: descriptionProp,
  canonical: canonicalProp,
  robots: robotsProp,
  noindex,
  pathname: pathnameProp,
  ogImage: ogImageProp,
  siteName = DEFAULT_SITE_NAME,
}) {
  const seo = meta?.seo;
  const pathname = pathnameProp ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  let title = titleProp ?? seo?.title ?? '';
  let description = descriptionProp ?? seo?.description ?? '';
  let canonical = canonicalProp ?? seo?.canonical ?? '';
  let robots = robotsProp ?? seo?.robots;
  if (noindex) robots = 'noindex,nofollow';
  if (!robots) robots = 'index,follow';

  if (!title || !description) {
    const staticMeta = getStaticMeta(pathname || '/');
    if (staticMeta) {
      if (!title) title = staticMeta.title;
      if (!description) description = staticMeta.description;
    }
  }

  if (!title) title = siteName;
  if (!canonical) canonical = getCanonicalUrl();

  const ogTitle = seo?.og_title ?? title;
  const ogDescription = seo?.og_description ?? description;
  const ogImage = ogImageProp ?? seo?.og_image_url ?? '';

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      {/* OpenGraph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={siteName} />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
