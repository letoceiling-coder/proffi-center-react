/**
 * Полный парсинг страниц категорий потолков с proffi-center.ru.
 * Извлекает: title, metaDescription, все блоки s_p_vid, s_minicalc, s_gallery (gallerry_page), catalog-05, все URL картинок.
 * Запуск: node scripts/fetch-ceiling-pages.js
 * Требует: npm install cheerio
 * Результат: frontend/src/data/ceilingCategoriesFetched.json + список URL картинок для загрузки.
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://proffi-center.ru';
const SLUGS = [
  'matovye-potolki',
  'glyancevye-potolki',
  'tkanevye-potolki',
  'mnogourovnevye-potolki',
  'potolki-fotopechat',
  'potolki-zvezdnoe-nebo',
  'konturnyye-potolki',
  'paryashchiye-potolki',
  'osveshcheniye-dlya-natyazhnykh-potolkov',
  'gardiny-dlya-shtor-pod-natyazhnoj-potolok',
  'natyazhnye-potolki-double-vision',
  'svetoprozrachnyye-natyazhnyye-potolki',
];

const OUTPUT_JSON = join(__dirname, '..', 'frontend', 'src', 'data', 'ceilingCategoriesFetched.json');
const OUTPUT_IMAGES_LIST = join(__dirname, '..', 'frontend', 'src', 'data', 'ceilingCategoriesImageUrls.txt');

function toAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim();
  if (u.startsWith('//')) return 'https:' + u;
  if (u.startsWith('/')) return BASE_URL + u;
  if (!u.startsWith('http')) return BASE_URL + '/' + u;
  return u;
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProffiFetch/1.0)' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

function parsePage(html, slug) {
  const $ = cheerio.load(html, { decodeEntities: false });

  const pageTitle = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';

  const sections = [];
  const allImageUrls = new Set();

  // --- s_p_vid блоки (может быть несколько)
  $('.section.s_p_vid').each((_, el) => {
    const $sec = $(el);
    const h1 = $sec.find('h1').first().text().trim();
    const intro = $sec.find('p.light').first().text().replace(/\s+/g, ' ').trim();
    const rell = $sec.find('.p_img.rell').length > 0;
    const images = [];
    $sec.find('.p_img').each((__, pimg) => {
      const $pimg = $(pimg);
      const $img = $pimg.find('img').first();
      const src = $img.attr('src');
      if (src) {
        const fullSrc = toAbsoluteUrl(src);
        allImageUrls.add(fullSrc);
        const name = $pimg.find('meta[itemprop="name"]').attr('content') || '';
        const description = $pimg.find('meta[itemprop="description"]').attr('content') || '';
        const captionEl = $pimg.find('p[data-text]');
        const caption = captionEl.length ? captionEl.first().attr('data-text') || captionEl.text().trim() : undefined;
        images.push({
          src: fullSrc,
          alt: $img.attr('alt') || '',
          name: name || undefined,
          description: description || undefined,
          caption: caption || undefined,
        });
      }
    });
    sections.push({ type: 'p_vid', title: h1, intro, images, rell });
  });

  // --- s_minicalc
  $('.section.s_minicalc').each((_, el) => {
    const $sec = $(el);
    const label = $sec.find('.mc_label').first().text().trim() || 'Площадь (м²)';
    const t1 = $sec.find('.mc_slider_place .t1').first().text().trim();
    const t2 = $sec.find('.mc_slider_place .t2').first().text().trim();
    const min = parseInt(t1, 10) || 1;
    const max = parseInt(t2, 10) || 100;
    const inputVal = $sec.find('.mc_input_place input').first().attr('value');
    const value = inputVal != null ? parseInt(String(inputVal), 10) : min;
    const priceText = $sec.find('#mc_price, .mc_price').first().text().replace(/\D/g, '');
    const pricePerM2 = parseInt(priceText, 10) || 99;
    sections.push({
      type: 'minicalc',
      label,
      min,
      max,
      value,
      pricePerM2,
    });
  });

  // Скрипт с type и cena для мини-калькулятора (ищем в любом script на странице)
  let typeId = slug.replace(/-/g, '');
  let cenaByType = null;
  $('script').each((_, script) => {
    const code = $(script).html() || '';
    if (!code.includes('var type=') || !code.includes('cena')) return;
    const typeMatch = code.match(/var\s+type\s*=\s*["']([^"']+)["']/);
    const cenaMatch = code.match(/cena\s*=\s*\{([^}]+)\}/);
    if (typeMatch) typeId = typeMatch[1].trim();
    if (cenaMatch) {
      const numMatch = cenaMatch[1].match(/(\d+)/);
      if (numMatch) cenaByType = parseInt(numMatch[1], 10);
    }
  });
  const lastMinicalc = sections.filter((s) => s.type === 'minicalc').pop();
  if (lastMinicalc && (typeId !== slug.replace(/-/g, '') || cenaByType != null)) {
    lastMinicalc.typeId = typeId;
    lastMinicalc.cenaByType = cenaByType;
  }

  // --- s_gallery.gallerry_page (карусель страницы категории)
  $('.section.s_gallery.gallerry_page').each((_, el) => {
    const $sec = $(el);
    const items = [];
    $sec.find('.carousel-gallery2 .item img, .item img').each((__, im) => {
      const src = $(im).attr('src');
      if (src) {
        const fullSrc = toAbsoluteUrl(src);
        allImageUrls.add(fullSrc);
        items.push({ src: fullSrc, alt: $(im).attr('alt') || '' });
      }
    });
    if (items.length) sections.push({ type: 'gallery', items });
  });

  // --- catalog-05 (таблица цен)
  $('.catalog-05').each((_, el) => {
    const $cat = $(el);
    const title = $cat.find('h2').first().text().trim();
    const rows = [];
    $cat.find('table tbody tr').each((__, tr) => {
      const tds = $(tr).find('td');
      if (tds.length >= 3) {
        rows.push({
          name: $(tds[0]).text().trim(),
          unit: $(tds[1]).text().trim(),
          price: $(tds[2]).text().trim(),
        });
      }
    });
    if (title || rows.length) sections.push({ type: 'catalog05', title, rows });
  });

  return {
    slug,
    title: pageTitle,
    metaDescription: metaDesc,
    sections,
    allImageUrls: Array.from(allImageUrls),
  };
}

async function main() {
  const results = {};
  const allUrls = new Set();
  for (const slug of SLUGS) {
    try {
      const url = `${BASE_URL}/${slug}`;
      process.stderr.write(`Fetching ${url}...\n`);
      const html = await fetchHtml(url);
      const parsed = await parsePage(html, slug);
      parsed.allImageUrls.forEach((u) => allUrls.add(u));
      delete parsed.allImageUrls;
      results[slug] = parsed;
    } catch (e) {
      process.stderr.write(`Error ${slug}: ${e.message}\n`);
      results[slug] = { slug, title: slug, metaDescription: '', sections: [] };
    }
  }
  writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2), 'utf8');
  writeFileSync(OUTPUT_IMAGES_LIST, Array.from(allUrls).sort().join('\n'), 'utf8');
  process.stderr.write(`Written: ${OUTPUT_JSON}\n`);
  process.stderr.write(`Image URLs list: ${OUTPUT_IMAGES_LIST} (${allUrls.size} unique)\n`);
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
