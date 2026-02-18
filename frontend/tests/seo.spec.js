/**
 * E2E: проверка SEO и микроразметки после загрузки JS (SPA).
 * Требуется запущенный сервер (Laravel + SPA или vite preview с прокси).
 * BASE_URL=http://127.0.0.1:8000 npx playwright test tests/seo.spec.js
 */
import { test, expect } from '@playwright/test';

const KEY_URLS = [
  '/',
  '/gotovye-potolki',
  '/natjazhnye-potolki-kalkuljator',
  '/skidki-na-potolki',
  '/aktsiya',
  '/o-kompanii',
  '/natyazhnyye-potolki-otzyvy',
  '/gde-zakazat-potolki',
  '/dogovor',
  '/potolki-v-rassrochku',
  '/vozvrat',
  '/catalog',
  '/potolki-v-prihozhuju',
  '/potolki-v-gostinuju',
  '/potolki-v-spalnju',
  '/potolki-na-kuhnju',
  '/potolki-v-detskuju',
  '/potolki-v-vannuju',
];

function seoChecks(page, pathname) {
  return page.evaluate((path) => {
    const origin = window.location.origin;
    const errors = [];

    const title = document.title;
    if (!title || title.trim() === '') errors.push('missing_title');

    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (!desc || desc.trim() === '') errors.push('missing_meta_description');

    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if (!canonical) errors.push('missing_canonical');
    else {
      if (!canonical.startsWith('http')) errors.push('canonical_not_absolute');
      if (canonical.includes('?')) errors.push('canonical_has_query');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (!ogTitle) errors.push('missing_og_title');
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    if (!ogDesc) errors.push('missing_og_description');
    const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
    if (!ogUrl) errors.push('missing_og_url');
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (!ogImage) errors.push('missing_og_image');

    const twCard = document.querySelector('meta[name="twitter:card"]')?.getAttribute('content');
    if (!twCard) errors.push('missing_twitter_card');
    const twTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    if (!twTitle) errors.push('missing_twitter_title');
    const twDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    if (!twDesc) errors.push('missing_twitter_description');

    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (!jsonLd.length) errors.push('missing_json_ld');

    return errors;
  }, pathname);
}

for (const path of KEY_URLS) {
  test(`SEO: ${path || '/'}`, async ({ page }) => {
    await page.goto(path || '/', { waitUntil: 'networkidle' });
    const errors = await seoChecks(page, path || '/');
    expect(errors, `SEO errors on ${path || '/'}: ${errors.join(', ')}`).toEqual([]);
  });
}
