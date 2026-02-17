# Шаг 7 — Интеграция React с публичным API

Цель: подключить React-фронт к публичному API Laravel (Step 06): site-aware рендер по host, меню и контент по slug из API, SEO и JSON-LD из meta, проверка redirects, рендер content_blocks по типам.

---

## Ограничения (соблюдены)

- Backend и публичный API не менялись.
- Изменения только во фронте (frontend/), минимальные.
- Все URL API — относительные; base URL из env (VITE_API_BASE_URL или VITE_API_URL).
- Контакты/телефоны/город берутся из API (site/contacts), не захардкожены.
- SEO и JSON-LD выводятся из meta ответов API (react-helmet-async).

---

## Что сделано

### 7.1 API-клиент и резолв site

- **frontend/src/api/http.js** — клиент на fetch: baseURL из `VITE_API_BASE_URL` или `VITE_API_URL`, автоматическое добавление `host` (window.location.host), таймаут, обработка ошибок, `getJSON(path, params)`.
- **frontend/src/api/public.js** — методы: `siteResolve()`, `getMenu(key)`, `getPage(slug)`, `getService(slug)`, `getProductCategory(slug)`, `getProduct(slug)`, `getReviews(params)`, `checkRedirect(path)`.
- **frontend/src/context/SiteContext.jsx** — React Context: состояние `site`, `contacts`, `seoSettings`, `isLoading`, `error`; при старте вызывается `siteResolve()`, результат сохраняется в контексте.

### 7.2 Меню (header/footer)

- **frontend/src/context/MenuContext.jsx** — после резолва site загружаются меню `header` и `footer` через `getMenu('header')` / `getMenu('footer')`; состояние `headerMenu`, `footerMenu`, `loading`.
- **Header** — использует `useSite()` и `useMenu()`: телефон, город, адрес, лого из `contacts`/`site`; пункты меню из `headerMenu` (fallback на mock).
- **Footer** — данные из `useSite()`/`useMenu()`: контакты и пункты footer из API (fallback на mock).
- **FooterMenu** — пункты из `useMenu().footerMenu` при отсутствии переданного `items`.
- **Menu** — поддержка `open_new_tab` и внешних ссылок (href с http → `<a>`, иначе `<Link>`).

### 7.3 Роутинг и страницы контента (CMS-first)

- **Маршруты, подключённые к API** (контент только из API, без статики):
  - **Страницы по slug:** `/:slug` → ApiPageBySlugPage (в т.ч. `/o-kompanii`, `/kontakty`, `/privacy-policy`).
  - **Услуги:** `/uslugi/:slug` → ApiServicePage.
  - **Каталог:** `/catalog` → ApiProductCategoryPage (slug категории `catalog` через `slugOverride`).
  - **Товар (один сегмент):** `/catalog/:productSlug` → ApiProductPage (напр. `/catalog/product-1`).
  - **Товар (два сегмента):** `/catalog/:catSlug/:productSlug` → ApiProductPage (напр. `/catalog/catalog/product-1`).
- **Пути, которые больше не статичные:** `/o-kompanii` убран из явного роута и обрабатывается через `/:slug` → ApiPageBySlugPage (контент из API). Аналогично `/kontakty`, `/privacy-policy` и любой другой slug страницы из CMS.
- **Главная:** `/` остаётся статичной (MainPage); в сидере нет страницы home/glavnaya.
- **Страницы**: ApiPageBySlugPage, ApiServicePage, ApiProductCategoryPage, ApiProductPage — загрузка по slug из публичного API, рендер заголовка, блоков (BlockRenderer), медиа (cover/gallery). При 404 API показывается «Страница/Услуга/Категория/Товар не найдена»; RedirectCheck выполняется до рендера.

### 7.4 BlockRenderer и блоки

- **frontend/src/components/blocks/BlockRenderer.jsx** — принимает массив `blocks`, сортирует по `order`, маппит по `type` на компонент; при неизвестном типе — fallback «Block type not supported».
- Поддерживаемые типы (по validator backend): hero, simple_text, gallery, pr_table, form_low_price, zamer.
- Компоненты: HeroBlock, SimpleTextBlock, GalleryBlock, PriceTableBlock, LowPriceFormBlock, ZamerBlock (данные строго из `block.data`; для gallery при необходимости используется entity-level media).

### 7.5 SEO meta и JSON-LD

- **react-helmet-async** — установлен, в корне приложения подключён `HelmetProvider`.
- **frontend/src/components/ContentMeta.jsx** — на контентных страницах после загрузки API выставляет из `meta.seo`: `<title>`, `<meta name="description">`, canonical, robots, og:title, og:description, og:image, og:url; из `meta.schema` вставляет по одному `<script type="application/ld+json">` на каждый объект.

### 7.6 Redirects/check

- **frontend/src/components/RedirectCheck.jsx** — перед/параллельно рендеру вызывается `checkRedirect(currentPath)`; при `matched` выполняется `window.location.replace(to)` для внешнего URL или `navigate(to, { replace: true })` для внутреннего path.
- App обёрнут в `RedirectCheck`.

### 7.7 Ошибки и загрузка

- На контентных страницах: скелетон «Загрузка...» при loading, блок «Страница/Услуга/Категория/Товар не найдена» при 404.
- Если API вернул 200 — рендер только из API (BlockRenderer по блокам ответа). Mock/статичный контент на этих страницах не используется.
- Fallback на mock оставлен только для меню/контактов в Header/Footer при отсутствии данных API (например в dev).

---

## Переменные окружения

В корне фронта (frontend) в `.env`:

- **VITE_API_BASE_URL** (или **VITE_API_URL**) — базовый URL API, например пустая строка при разработке с proxy на `/api`, или `https://example.com` для продакшена. По умолчанию используется пустая строка; тогда запросы идут на относительные пути вида `/api/v1/...`.

---

## Как проверить

1. **Запуск фронта** (из каталога frontend):
   ```bash
   npm run dev
   ```
   Backend должен быть доступен (например через proxy Vite на `/api`).

2. **Разные host**  
   При открытии с разными host (или с query для теста) меню и контакты должны подтягиваться из API для текущего site (fallback на root).

3. **Контент по slug (API)**  
   После сидера BootstrapContentSeeder следующие URL должны отдавать контент из API (в Network — вызовы `/api/v1/page/...`, `/api/v1/service/...` и т.д.) и рендерить блоки через BlockRenderer (hero, simple_text, pr_table, form_low_price, zamer):
   - Страницы: `/o-kompanii`, `/kontakty`, `/privacy-policy`.
   - Услуги: `/uslugi/ustanovka`, `/uslugi/remont`, `/uslugi/demontazh`.
   - Категория: `/catalog` (slug категории `catalog`).
   - Товары: `/catalog/product-1`, `/catalog/product-2`, `/catalog/product-3` (или `/catalog/catalog/product-1`).
   Должны отображаться заголовок, блоки контента, медиа; в `<head>` — SEO-теги и JSON-LD из meta.

4. **Редирект**  
   В админке создать redirect (from_path, to_url). Открыть на фронте path из from_path — должен сработать переход на to_url.

5. **Контакты**  
   В шапке и подвале телефон, email, город должны браться из API (site/contacts), а не из статичных данных.

---

## Список URL для проверки (сидерные slug)

| URL | Ожидание |
|-----|----------|
| `/o-kompanii` | Страница из API, 5 блоков (hero, simple_text, pr_table, form_low_price, zamer) |
| `/kontakty` | Страница из API |
| `/privacy-policy` | Страница из API |
| `/uslugi/ustanovka` | Услуга из API, блоки hero, simple_text, zamer |
| `/uslugi/remont` | Услуга из API |
| `/uslugi/demontazh` | Услуга из API |
| `/catalog` | Категория «Каталог» из API |
| `/catalog/product-1` | Товар из API, блоки hero, simple_text |
| `/catalog/product-2`, `/catalog/product-3` | Товары из API |

В Network должны быть запросы к `/api/v1/page/...`, `/api/v1/service/...`, `/api/v1/product-category/catalog`, `/api/v1/product/...`.

---

## Список страниц и компонентов

| Файл | Назначение |
|------|------------|
| src/api/http.js | HTTP-клиент, baseURL, host, getJSON |
| src/api/public.js | siteResolve, getMenu, getPage, getService, getProductCategory, getProduct, getReviews, checkRedirect |
| src/context/SiteContext.jsx | SiteProvider, useSite |
| src/context/MenuContext.jsx | MenuProvider, useMenu |
| src/components/RedirectCheck.jsx | Проверка redirect по текущему path |
| src/components/ContentMeta.jsx | SEO meta + JSON-LD из meta |
| src/components/blocks/BlockRenderer.jsx | Рендер блоков по type |
| src/components/blocks/HeroBlock.jsx | hero |
| src/components/blocks/SimpleTextBlock.jsx | simple_text |
| src/components/blocks/GalleryBlock.jsx | gallery |
| src/components/blocks/PriceTableBlock.jsx | pr_table |
| src/components/blocks/LowPriceFormBlock.jsx | form_low_price |
| src/components/blocks/ZamerBlock.jsx | zamer |
| src/pages/ApiPageBySlugPage.jsx | Страница по slug (page) |
| src/pages/ApiServicePage.jsx | Услуга по slug |
| src/pages/ApiProductCategoryPage.jsx | Категория товаров по slug |
| src/pages/ApiProductPage.jsx | Товар по slug (route /catalog/:catSlug/:productSlug) |

Header, Footer, Menu, FooterMenu доработаны для использования SiteContext/MenuContext и API-данных.
