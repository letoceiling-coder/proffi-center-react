# SEO-архитектура (Яндекс / Google)

Серверная выдача meta, canonical, Open Graph, JSON-LD и минимальный контент в HTML для индексации посадочных страниц без зависимости от JavaScript.

## Как проверить локально

### robots.txt

```bash
curl -s http://localhost/robots.txt
```

Ожидается: `200`, тело содержит `User-agent: *`, `Allow: /`, `Sitemap: .../sitemap.xml`.

### sitemap.xml

```bash
curl -s http://localhost/sitemap.xml
```

Ожидается: `200`, `Content-Type: application/xml`, валидный XML с `<urlset>`, список `<url><loc>...</loc></url>` (главная, услуги, страницы и т.д.).

### SEO-лендинг услуги

Подставьте реальный `slug` услуги из БД (published):

```bash
curl -s http://localhost/uslugi/natyazhnye-potolki
```

Проверьте в выводе:

- `<title>...</title>`
- `<meta name="description" content="...">`
- `<link rel="canonical" href="...">`
- `<meta property="og:title" ...>`, `og:description`, `og:url`, при наличии `og:image`
- хотя бы один `<script type="application/ld+json">` (Organization, Service, BreadcrumbList)

### Главная и статические страницы

```bash
curl -s http://localhost/
curl -s http://localhost/o-kompanii
curl -s http://localhost/uslugi
```

В каждом ответе должны быть title, description, canonical и JSON-LD.

---

## Как добавить новую страницу в sitemap

1. **Страница из CMS (Page)**  
   Публикуемые страницы подтягиваются в sitemap автоматически из `Page::published()` по `site_id`. Ничего править не нужно.

2. **Услуга (Service)**  
   Аналогично: `Service::published()` по `site_id` — URL вида `/uslugi/{slug}`.

3. **Статический путь SPA**  
   В `App\Http\Controllers\Api\V1\Public\SitemapController::index()` в массив `$staticPaths` добавьте путь, например:

   ```php
   $staticPaths = [
       '/',
       '/uslugi',
       '/o-kompanii',
       // ...
       '/novaya-stranitsa',
   ];
   ```

   Если для этого пути нужны свои SEO-мета на лендинге, добавьте запись в `ServerSeoService::STATIC_META` и в `ServerSeoService::getStaticPathKeys()` (ключ пути без ведущего слеша), а также зарегистрируйте маршрут в `routes/web.php` через SEO landing (статический путь уже покрыт маршрутом `{pathKey}` для ключей из `getStaticPathKeys()`).

---

## Как задать SEO-поля

- **Главная:** мета и JSON-LD собираются в `ServerSeoService::buildForHome(Site)` (город/контакты из `Site` / `SiteContact` / `City`).
- **Услуга:** данные из модели `Service` и привязанных `SeoMeta` (CMS), сборка в `SeoResolver::resolveFor($service, $site)` и `ServerSeoService::buildForService($service, $site)`.
- **Страница CMS:** то же через `Page` и `SeoResolver::resolveFor($page, $site)`, сборка в `ServerSeoService::buildForPage($page, $site)`.
- **Статические пути:** заголовки и описание задаются в `App\Services\ServerSeoService::STATIC_META` (ключ — путь без слеша).

Общий шаблон разметки (title, description, canonical, robots, og:*, json-ld) — в `resources/views/layouts/seo-spa.blade.php`; данные передаются через DTO `App\DataTransferObjects\SeoMeta`.

---

## Проверка на сервере

После деплоя выполните:

```bash
# robots
curl -sI https://proffi-center.ru/robots.txt
curl -s https://proffi-center.ru/robots.txt | grep -i sitemap

# sitemap
curl -sI https://proffi-center.ru/sitemap.xml
curl -s https://proffi-center.ru/sitemap.xml | head -50

# лендинг услуги (подставьте актуальный slug)
curl -s https://proffi-center.ru/uslugi/natyazhnye-potolki | grep -E '<title>|<meta name="description"|canonical|application/ld\+json'
```

Убедитесь, что в HTML ответах присутствуют нужные теги и что `robots.txt` ссылается на `https://proffi-center.ru/sitemap.xml`.

## Нормализация URL

В production для веб-маршрутов включён middleware `NormalizeSeoUrl`: редирект на схему и хост из `APP_URL` (например `https://proffi-center.ru`). То есть:
- запросы по HTTP редиректятся на HTTPS;
- запросы с другого хоста (например с www) редиректятся на канонический хост из `APP_URL`.

На сервере задайте `APP_URL=https://proffi-center.ru`. Редиректы выполняются только при `APP_ENV=production`. Единый стиль слеша (с/без завершающего) при необходимости настраивается на уровне nginx.
