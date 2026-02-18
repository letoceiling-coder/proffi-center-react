#!/usr/bin/env node
/**
 * SEO audit: fetch sitemap, check each URL for title/description/canonical/og/twitter/JSON-LD.
 * Usage: node run.mjs --base=https://DOMAIN [--sitemap=/sitemap.xml] [--limit=N]
 * Output: report.json, report.md; exit 1 if any errors.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = __dirname;

const DEFAULT_SITEMAP = '/sitemap.xml';

/** Критические страницы, если sitemap пустой или для доп. проверки */
const CRITICAL_PATHS = [
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

function parseArgs() {
  const args = process.argv.slice(2);
  let base = '';
  let sitemap = DEFAULT_SITEMAP;
  let limit = null;
  for (const arg of args) {
    if (arg.startsWith('--base=')) base = arg.slice(7).replace(/\/$/, '');
    else if (arg.startsWith('--sitemap=')) sitemap = arg.slice(10);
    else if (arg.startsWith('--limit=')) limit = parseInt(arg.slice(8), 10);
  }
  if (!base) {
    console.error('Required: --base=https://DOMAIN');
    process.exit(2);
  }
  return { base, sitemap, limit };
}

function extractUrlsFromSitemap(xml, base) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const loc = m[1].trim();
    if (loc.startsWith('http')) urls.push(loc);
    else urls.push(base.replace(/\/$/, '') + (loc.startsWith('/') ? loc : '/' + loc));
  }
  return [...new Set(urls)];
}

function buildFallbackUrls(base) {
  const b = base.replace(/\/$/, '');
  return CRITICAL_PATHS.map((p) => (p === '/' ? b + '/' : b + p));
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return { ok: false, status: res.status, text: null };
  const text = await res.text();
  return { ok: true, status: res.status, text };
}

function checkHtml(url, html) {
  const errors = [];
  const origin = new URL(url).origin;

  if (!html || html.length < 10) {
    errors.push('empty_or_invalid_html');
    return errors;
  }

  const hasTag = (regex) => regex.test(html);
  const getContent = (regex) => {
    const m = html.match(regex);
    return m ? (m[1] || m[2] || '').trim() : '';
  };

  const title = getContent(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) errors.push('missing_title');

  const desc = getContent(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (!desc) errors.push('missing_meta_description');

  const canonical = getContent(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i) || getContent(/<link\s+href=["']([^"']*)["']\s+rel=["']canonical["']/i);
  if (!canonical) errors.push('missing_canonical');
  else {
    if (!canonical.startsWith('http')) errors.push('canonical_not_absolute');
    if (canonical.includes('?')) errors.push('canonical_has_query');
  }

  const ogTitle = getContent(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+property=["']og:title["']/i);
  if (!ogTitle) errors.push('missing_og_title');
  const ogDesc = getContent(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+property=["']og:description["']/i);
  if (!ogDesc) errors.push('missing_og_description');
  const ogUrl = getContent(/<meta\s+property=["']og:url["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+property=["']og:url["']/i);
  if (!ogUrl) errors.push('missing_og_url');
  const ogImage = getContent(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+property=["']og:image["']/i);
  if (!ogImage) errors.push('missing_og_image');

  const twCard = getContent(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+name=["']twitter:card["']/i);
  if (!twCard) errors.push('missing_twitter_card');
  const twTitle = getContent(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+name=["']twitter:title["']/i);
  if (!twTitle) errors.push('missing_twitter_title');
  const twDesc = getContent(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']*)["']/i) || getContent(/<meta\s+content=["']([^"']*)["']\s+name=["']twitter:description["']/i);
  if (!twDesc) errors.push('missing_twitter_description');

  const hasJsonLd = /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html);
  if (!hasJsonLd) errors.push('missing_json_ld');

  return errors;
}

async function main() {
  const { base, sitemap, limit } = parseArgs();
  const sitemapUrl = base.replace(/\/$/, '') + (sitemap.startsWith('/') ? sitemap : '/' + sitemap);

  let urls = [];
  const sm = await fetchText(sitemapUrl);
  if (sm.ok && sm.text) {
    urls = extractUrlsFromSitemap(sm.text, base);
  }
  if (urls.length === 0) {
    urls = buildFallbackUrls(base);
  }
  if (limit && limit > 0) {
    urls = urls.slice(0, limit);
  }

  const report = { base, sitemapUrl, total: urls.length, results: [], hasErrors: false };

  for (const url of urls) {
    const { ok, status, text } = await fetchText(url);
    if (!ok) {
      report.results.push({ url, errors: [`http_${status}`] });
      report.hasErrors = true;
      continue;
    }
    const errors = checkHtml(url, text);
    report.results.push({ url, errors });
    if (errors.length) report.hasErrors = true;
  }

  const reportPath = join(OUT_DIR, 'report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const mdLines = ['# SEO Audit Report', '', `Base: ${base} | URLs checked: ${report.total}`, ''];
  mdLines.push('| URL | Errors |');
  mdLines.push('|-----|--------|');
  for (const r of report.results) {
    const errStr = r.errors.length ? r.errors.join(', ') : '—';
    mdLines.push(`| ${r.url} | ${errStr} |`);
  }
  const reportMdPath = join(OUT_DIR, 'report.md');
  writeFileSync(reportMdPath, mdLines.join('\n'), 'utf8');

  console.log('Report written to', reportPath, 'and', reportMdPath);
  if (report.hasErrors) {
    console.error('Some checks failed. See report.md for details.');
    process.exit(1);
  }
  console.log('All SEO checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
