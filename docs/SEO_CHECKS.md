# Автоматические проверки SEO и микроразметки

Цель: гарантировать, что на всех публичных URL есть title, description, canonical, og, twitter, JSON-LD и что sitemap/robots корректны.

## Команды запуска

| Команда | Описание |
|--------|----------|
| `npm run seo:audit` | CLI-аудит по sitemap (по умолчанию `http://127.0.0.1:8000`). Пишет `tools/seo-audit/report.json` и `report.md`. Код выхода 1 при ошибках. |
| `npm run seo:audit:prod` | То же для продакшена (`https://proffi-center.ru`). |
| `npm run seo:audit -- --base=https://your-domain.com [--sitemap=/sitemap.xml] [--limit=10]` | Свой домен, опционально sitemap и лимит URL. |
| `npm run test` / `npm run test:unit` | Unit-тесты (Vitest), в т.ч. проверка SEO-карты `frontend/src/seo/routes.js`. |
| `npm run test:e2e:seo` | E2E (Playwright): проверка мета и JSON-LD после загрузки JS на ключевых страницах. Требуется запущенный сервер (см. ниже). |

Команды `seo:audit` и `seo:audit:prod` выполняются из **корня репозитория**. Unit и E2E — из папки **frontend** (или из корня через `npm run test --prefix frontend` при необходимости).

## Часть 1 — CLI «seo-audit»

**Важно:** скрипт запрашивает готовый HTML по каждому URL. В SPA без SSR/пререндера мета подставляются только после выполнения JS, поэтому при проверке «голого» HTML (например, только Laravel отдаёт index.html) проверки могут падать. В этом случае ориентируйтесь на E2E (Playwright) и unit-тесты; CLI-аудит имеет смысл после внедрения пререндера/SSR или при проверке прод-окружения с отдачей готового HTML.

- **Скрипт:** `tools/seo-audit/run.mjs`
- **Вход:** `--base=https://DOMAIN`, опционально `--sitemap=/sitemap.xml`, `--limit=N`
- **Шаги:** скачивает sitemap, парсит URL (при пустом sitemap подставляется список критических страниц), для каждого URL запрашивает HTML и проверяет:
  - наличие и непустоту `<title>`
  - наличие `meta name="description"` с непустым content
  - наличие `link rel="canonical"` с абсолютным href без query
  - наличие `og:title`, `og:description`, `og:url`, `og:image`
  - наличие `twitter:card`, `twitter:title`, `twitter:description`
  - наличие хотя бы одного `script type="application/ld+json"`
- **Выход:** `tools/seo-audit/report.json`, `tools/seo-audit/report.md` (таблица URL | ошибки). При наличии ошибок — exit code 1. Для локального HTTPS с самоподписанным сертификатом: `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run seo:audit` (только локально).

### Расшифровка ошибок CLI

| Код ошибки | Значение |
|------------|----------|
| `missing_title` | Нет тега `<title>` или он пустой |
| `missing_meta_description` | Нет или пустой `meta name="description"` |
| `missing_canonical` | Нет `link rel="canonical"` |
| `canonical_not_absolute` | href канонического URL не начинается с `http` |
| `canonical_has_query` | В canonical есть query-строка (ожидается без ? и utm) |
| `missing_og_title` | Нет `meta property="og:title"` |
| `missing_og_description` | Нет `meta property="og:description"` |
| `missing_og_url` | Нет `meta property="og:url"` |
| `missing_og_image` | Нет `meta property="og:image"` |
| `missing_twitter_card` | Нет `meta name="twitter:card"` |
| `missing_twitter_title` | Нет `meta name="twitter:title"` |
| `missing_twitter_description` | Нет `meta name="twitter:description"` |
| `missing_json_ld` | Нет ни одного `script type="application/ld+json"` |
| `http_404` / `http_5xx` | Страница вернула соответствующий HTTP-код |
| `empty_or_invalid_html` | Ответ пустой или слишком короткий |

## Часть 2 — Playwright E2E

- **Тест:** `frontend/tests/seo.spec.js`
- Проверяет 10–20 ключевых URL (главная, контакты, каталог, комнаты, отзывы и т.д.) после загрузки SPA (`waitUntil: 'networkidle'`).
- Для каждого URL проверяет в браузере: `document.title`, meta description, canonical (абсолютный, без query), og:title/description/url/image, twitter:card/title/description, наличие хотя бы одного JSON-LD скрипта.

**Запуск:** из папки `frontend`:

```bash
# Сервер должен быть уже запущен (Laravel + отдача SPA или vite dev с proxy)
npm run test:e2e:seo
```

Переменная окружения `BASE_URL` или `PLAYWRIGHT_BASE_URL` (по умолчанию `http://127.0.0.1:8000`):

```bash
BASE_URL=http://127.0.0.1:8000 npm run test:e2e:seo
```

В CI: поднять Laravel (`php artisan serve`) и при необходимости фронт (или отдавать собранный SPA из `public/`), затем запустить Playwright. Перед первым запуском: `npx playwright install` (установка браузеров).

## Часть 3 — Unit (SEO-карта)

- **Тест:** `frontend/src/seo/routes.test.js`
- Проверяет:
  - все записи `STATIC_ROUTE_META` имеют непустые `title` и `description`;
  - `getStaticMeta()` возвращает валидные данные для корня, известных путей и подпутей `/gotovye-potolki`;
  - если в карте задан `canonical`, он должен быть абсолютным (в текущей реализации canonical в карте не задаётся).

Запуск: из папки `frontend`: `npm run test` или `npm run test:unit`.

## CI

- Запускать `npm run seo:audit` после поднятия стенда (или на проде с `seo:audit:prod`).
- Запускать unit: `npm run test --prefix frontend`.
- Запускать E2E: поднять сервер, затем `npm run test:e2e:seo --prefix frontend` (или из frontend с правильным `BASE_URL`).

## Где что лежит

| Что | Где |
|-----|-----|
| CLI аудит | `tools/seo-audit/run.mjs` |
| Отчёты после аудита | `tools/seo-audit/report.json`, `tools/seo-audit/report.md` |
| E2E тесты SEO | `frontend/tests/seo.spec.js` |
| Конфиг Playwright | `frontend/playwright.config.js` |
| Unit тесты SEO-карты | `frontend/src/seo/routes.test.js` |
| Сама карта (не менять проверками) | `frontend/src/seo/routes.js` |
