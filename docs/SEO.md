# SEO и микроразметка (Proffi Center React SPA)

## Что сделано

### React (frontend)

- **Единый SEO-слой**: модуль `frontend/src/seo/`:
  - **Seo.jsx** — компонент для всех страниц: `<title>`, meta description, canonical, robots, OpenGraph (og:title, og:description, og:image, og:url, og:site_name), Twitter Card (twitter:card, title, description, image).
  - **JsonLd.jsx** — вставка одного или нескольких `<script type="application/ld+json">`.
  - **jsonld.js** — хелперы схем: Organization, LocalBusiness, WebSite, BreadcrumbList, Service, Article, FAQPage.
  - **routes.js** — карта статических маршрутов: дефолтные title/description для страниц без slug из API (`STATIC_ROUTE_META`, `getStaticMeta(pathname)`).

- **На каждой странице** используются `<Seo />` и при необходимости `<JsonLd />`:
  - Главная: Seo + Organization + WebSite.
  - Страницы из API (страница по slug, услуга, категория, товар): мета из ответа API (`meta.seo`), JSON-LD из `meta.schema` + BreadcrumbList.
  - Статические (калькулятор, скидки, о компании, отзывы, контакты, договор, рассрочка, возврат, комнаты, категории потолков, товар из мока): мета из `routes.js` или явные props, BreadcrumbList на внутренних.

- **Канонический URL**: строится как `window.location.origin + pathname` (без query и UTM), если бэкенд не отдаёт `meta.seo.canonical`.

- **Динамические мета**: приоритет — `seo_title` → `title`, `seo_description` → excerpt/short → дефолт из статической карты или компонента.

### Laravel (инфраструктура)

- **GET /robots.txt** — отдаётся в корне сайта (маршрут в `routes/web.php`). Содержит:
  - `User-agent: *`
  - `Allow: /`
  - `Sitemap: https://{текущий домен}/sitemap.xml`
  - опционально дополнение из `seo_settings.robots_txt_append`.

- **GET /sitemap.xml** — в корне сайта. Включает:
  - статические URL SPA (главная, готовые потолки, калькулятор, скидки, акция, о компании, отзывы, контакты, договор, рассрочка, возврат, каталог, страницы по комнатам);
  - URL из БД: страницы (Page), услуги (Service), категории товаров, товары (Product) для текущего сайта (разрешение по host запроса).

- Сайт для robots/sitemap определяется по host запроса (как и для Public API): `X-Forwarded-Host` или Host.

- **Микроразметка в исходном HTML (для валидаторов и ботов без JS):** в `resources/views/spa.blade.php` для каждого ответа сервера выводятся мета и JSON-LD (title, description, canonical, robots, OpenGraph, Twitter Card, схемы Organization, WebSite, BreadcrumbList). Это нужно, чтобы валидатор микроразметки Яндекса и подобные инструменты видели разметку уже в исходном HTML, без выполнения JavaScript. После загрузки SPA React (Helmet) при необходимости обновляет мета для текущей страницы.

### Канонический домен (www / non-www, http → https)

- **Не реализовано в коде приложения.** Рекомендуется настроить на уровне веб-сервера (nginx/apache) или reverse proxy:
  - редирект с `http://` на `https://`;
  - выбор одной формы домена (например только `https://proffi-center.ru` или только `https://www.proffi-center.ru`) и 301-редирект второй формы на выбранную.
- После настройки канонический URL в мета и в sitemap будет совпадать с выбранным доменом, если фронт открыт по этому домену (и Laravel отдаёт тот же host в sitemap/robots).

### SSR / пререндер (B3)

- Не реализовано. Для гарантированного отображения сниппетов в Яндексе при необходимости можно:
  - использовать Vite SSR для публичных роутов, или
  - пререндер статических страниц на билде и отдавать готовый HTML.
- Текущая схема (SPA + мета/JSON-LD через react-helmet-async) достаточна для индексации при корректной отдаче HTML (и при желании — пререндере или SSR позже).

---

## Как проверять

1. **View-source** любой страницы:
   - в `<head>`: `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`;
   - OpenGraph: `og:title`, `og:description`, `og:image`, `og:url`;
   - Twitter: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`;
   - один или несколько `<script type="application/ld+json">` без синтаксических ошибок.

2. **Валидаторы**:
   - [Google Rich Results Test](https://search.google.com/test/rich-results) — проверка JSON-LD;
   - [Яндекс Валидатор микроразметки](https://webmaster.yandex.ru/tools/microtest/).

3. **robots.txt**: открыть `https://{ваш-домен}/robots.txt` — должна быть строка `Sitemap: https://{ваш-домен}/sitemap.xml`.

4. **sitemap.xml**: открыть `https://{ваш-домен}/sitemap.xml` — список URL с тем же доменом, включая статику и страницы/услуги/каталог из БД.

---

## Где менять мета

| Где | Что менять |
|-----|------------|
| **Статические страницы (без API)** | `frontend/src/seo/routes.js` — объект `STATIC_ROUTE_META`: ключ — pathname (например `'/o-kompanii'`), значение — `{ title, description }`. |
| **Страницы из CMS (страница/услуга/товар/категория)** | В админке: SEO-поля сущности (seo_title, seo_description, og:image и т.п.). На бэкенде формирует `SeoResolver` и при необходимости `SchemaResolver`. |
| **Имя сайта в мета** | По умолчанию «Proffi Center»; для главной передаётся из `SiteContext` / `seoSettings.site_name` в `<Seo siteName={...} />`. |
| **Дополнение robots.txt** | Админка: настройки SEO сайта, поле `robots_txt_append`. |
| **Список URL в sitemap** | Статические пути — в `App\Http\Controllers\Api\V1\Public\SitemapController` (массив `$staticPaths`). Динамические — из моделей Page, Service, ProductCategory, Product. |

---

## Файлы

- **Frontend**: `frontend/src/seo/` (Seo.jsx, JsonLd.jsx, jsonld.js, routes.js, index.js); использование в страницах — `frontend/src/pages/*.jsx`.
- **Laravel**: `app/Http/Controllers/Api/V1/Public/RobotsController.php`, `SitemapController.php`; маршруты — `routes/web.php` (robots.txt, sitemap.xml), `routes/api.php` (API v1 при необходимости).
- **Резолверы мета/схем**: `app/Services/SeoResolver.php`, `app/Services/SchemaResolver.php`.
