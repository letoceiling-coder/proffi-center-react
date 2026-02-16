/**
 * Скачивает все изображения из ceilingCategoriesFetched.json в public/images.
 * Заменяет в данных все URL на локальные пути /images/...
 * Запуск: node scripts/download-ceiling-images.js (после fetch-ceiling)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FETCHED_PATH = join(ROOT, 'frontend', 'src', 'data', 'ceilingCategoriesFetched.json');
const PUBLIC_IMAGES = join(ROOT, 'public', 'images');
const IMAGES_PREFIX = 'https://proffi-center.ru/template/globalTemplate/images/';

function collectImageUrls(obj, out) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    obj.forEach((item) => collectImageUrls(item, out));
    return;
  }
  if (typeof obj === 'object') {
    if (typeof obj.src === 'string' && obj.src.startsWith('http')) out.add(obj.src);
    for (const v of Object.values(obj)) collectImageUrls(v, out);
  }
}

function urlToLocalPath(url) {
  if (url.startsWith(IMAGES_PREFIX)) {
    const rel = url.slice(IMAGES_PREFIX.length).replace(/\?.*$/, '');
    return rel;
  }
  try {
    const u = new URL(url);
    const pathname = u.pathname.replace(/^\/+/, '');
    const idx = pathname.indexOf('images/');
    if (idx !== -1) return pathname.slice(idx + 7);
    return pathname.split('/').pop() || 'image.jpg';
  } catch (_) {
    return url.split('/').pop() || 'image.jpg';
  }
}

function replaceUrlsInObject(obj, urlToLocal) {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map((item) => replaceUrlsInObject(item, urlToLocal));
  if (typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'src' && typeof v === 'string' && v.startsWith('http')) {
        res[k] = urlToLocal.get(v) || v;
      } else {
        res[k] = replaceUrlsInObject(v, urlToLocal);
      }
    }
    return res;
  }
  return obj;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (ProffiFetch/1.0)' } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!existsSync(FETCHED_PATH)) {
    process.stderr.write('Сначала выполните: npm run fetch-ceiling\n');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(FETCHED_PATH, 'utf8'));
  const urls = new Set();
  Object.values(data).forEach((page) => collectImageUrls(page, urls));

  const urlToLocal = new Map();
  let done = 0;
  for (const url of urls) {
    const rel = urlToLocalPath(url);
    const localPath = '/images/' + rel.replace(/\\/g, '/');
    urlToLocal.set(url, localPath);
    const filePath = join(PUBLIC_IMAGES, rel);
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (existsSync(filePath)) {
      done++;
      continue;
    }
    try {
      process.stderr.write(`Download ${rel}...\n`);
      const buf = await download(url);
      writeFileSync(filePath, buf);
      done++;
    } catch (e) {
      process.stderr.write(`Error ${url}: ${e.message}\n`);
    }
  }
  process.stderr.write(`Downloaded/checked ${done} images.\n`);

  const dataLocal = replaceUrlsInObject(JSON.parse(JSON.stringify(data)), urlToLocal);
  const outPath = join(ROOT, 'frontend', 'src', 'data', 'ceilingCategoriesFetchedLocal.json');
  writeFileSync(outPath, JSON.stringify(dataLocal, null, 2), 'utf8');
  process.stderr.write(`Written ${outPath} with local image paths.\n`);
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
