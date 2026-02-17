import { Helmet } from 'react-helmet-async';

/**
 * Sets document title, meta description, canonical, robots, OG, and JSON-LD from API meta.
 * meta: { seo: { title, description, h1, canonical, robots, og_title, og_description, og_image_url }, schema: [...] }
 */
export default function ContentMeta({ meta }) {
  const seo = meta?.seo;
  const schema = meta?.schema;
  if (!seo) return null;

  const title = seo.title || '';
  const description = seo.description || '';
  const canonical = seo.canonical || '';
  const robots = seo.robots || 'index,follow';
  const ogTitle = seo.og_title || title;
  const ogDescription = seo.og_description || description;
  const ogImage = seo.og_image_url || '';

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {Array.isArray(schema) && schema.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
