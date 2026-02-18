/**
 * Хелперы генерации JSON-LD схем (Schema.org) для микроразметки.
 * Все объекты возвращают готовый объект для вставки в <script type="application/ld+json">.
 */

const SCHEMA_CONTEXT = 'https://schema.org';

/**
 * @param {string} baseUrl - например https://proffi-center.ru
 * @param {{ name?: string, phone?: string, email?: string, address?: string, logo?: string }} overrides
 */
export function organization(baseUrl, overrides = {}) {
  const name = overrides.name || 'Proffi Center';
  const o = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name,
    url: baseUrl,
  };
  if (overrides.phone) o.telephone = overrides.phone;
  if (overrides.email) o.email = overrides.email;
  if (overrides.address) o.address = { '@type': 'PostalAddress', streetAddress: overrides.address };
  if (overrides.logo) o.logo = overrides.logo;
  return o;
}

/**
 * @param {string} baseUrl
 * @param {string} [name]
 */
export function webSite(baseUrl, name = 'Proffi Center') {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${baseUrl}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * @param {string} baseUrl - origin сайта
 * @param {Array<{ name: string, url?: string }>} items - от корня к текущей (последний = текущая страница)
 */
export function breadcrumbList(baseUrl, items) {
  const list = items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url ? (item.url.startsWith('http') ? item.url : baseUrl + item.url) : undefined,
  })).filter((x) => x.name);
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: list,
  };
}

/**
 * @param {string} baseUrl
 * @param {{ name: string, description?: string, url: string }}
 */
export function service(baseUrl, { name, description, url }) {
  const s = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Service',
    name,
    url: url.startsWith('http') ? url : baseUrl + url,
  };
  if (description) s.description = description;
  return s;
}

/**
 * @param {string} baseUrl
 * @param {{ name: string, description?: string, image?: string, datePublished?: string }}
 */
export function article(baseUrl, { name, description, image, datePublished }) {
  const a = {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: name,
    url: baseUrl,
  };
  if (description) a.description = description;
  if (image) a.image = image.startsWith('http') ? image : baseUrl + image;
  if (datePublished) a.datePublished = datePublished;
  return a;
}

/**
 * @param {Array<{ question: string, answer: string }>} pairs
 */
export function faqPage(pairs) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: pairs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

/**
 * LocalBusiness (расширение Organization для главной/контактов)
 */
export function localBusiness(baseUrl, overrides = {}) {
  const o = organization(baseUrl, overrides);
  o['@type'] = 'LocalBusiness';
  return o;
}
