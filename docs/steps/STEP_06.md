# Шаг 6 — Публичный API для React-фронта

Цель: предоставить публичный API (без авторизации), отдельный от CMS, по контракту `docs/API_CONTRACT.md`: резолв сайта по Host, меню, контент по slug, SEO, JSON-LD schema, redirects, robots.txt и sitemap.xml.

---

## Ограничения (соблюдены)

- CMS-эндпоинты не изменялись; публичный API на отдельном префиксе `/api/v1` без auth.
- Схема БД и миграции не менялись.
- Все ответы site-aware: сначала текущий сайт по host, при необходимости fallback на root site (`is_primary=1`).
- Публичный API не требует авторизации.
- Выдаётся только опубликованный контент: `status=published` и `published_at <= now()` (где применимо).

---

## Эндпоинты (префикс `/api/v1`)

### A) Site resolve / config

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/site/resolve?host=example.com` | Резолв сайта по host. Ответ: site (id, domain, city/region, contacts), seo_settings, flags. |

**Резолв:** по `domain = host`; если не найден — root site (`is_primary=1`).

**Пример ответа:**
```json
{
  "data": {
    "site": {
      "id": 1,
      "domain": "example.com",
      "is_primary": false,
      "city": { "id": 1, "name": "Краснодар" },
      "region": { "id": 1, "name": "Краснодарский край" },
      "contacts": { "phone": "...", "email": "...", "address_street": "...", ... }
    },
    "seo_settings": { "default_title_suffix": "...", "default_description": "...", "robots_txt_append": "..." },
    "flags": []
  }
}
```

---

### B) Menus

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/menu/{key}?host=...` | Дерево пунктов меню. `key` = `header` \| `footer`. |

**Резолв:** меню текущего сайта по slug; если нет — меню root site.

**Формат пункта:** `title`, `href` (путь без домена), `open_new_tab`, `order`, `children[]`.  
**href:** при `link_type=url` — `link_value`; при `page` → `/{slug}`; `service` → `/uslugi/{slug}`; `category` → `/catalog/{slug}`; `product` → `/catalog/{category_slug}/{slug}`.

**Пример ответа:**
```json
{
  "data": [
    { "title": "Главная", "href": "/", "open_new_tab": false, "order": 0, "children": [] }
  ],
  "meta": { "site": { "id": 1, "domain": "example.com", ... } }
}
```

---

### C) Content by slug

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/page/{slug}?host=...` | Страница по slug. |
| GET | `/service/{slug}?host=...` | Услуга по slug. |
| GET | `/product-category/{slug}?host=...` | Категория товаров. |
| GET | `/product/{slug}?host=...` | Товар по slug. |

**Резолв сущности:** сначала по `site_id` текущего сайта, затем по `site_id` root site. Только published (где есть scope: Page, Service, Product).

**Формат ответа (единый):**
```json
{
  "data": {
    "id": 1,
    "slug": "about",
    "title": "О нас",
    "blocks": [ { "type": "text", "data": {...}, "order": 0 } ],
    "media": { "cover": { "url": "...", "alt": "..." }, "gallery": [] }
  },
  "meta": {
    "site": { "id": 1, "domain": "...", "city": {...}, "region": {...}, "contacts": {...} },
    "seo": { "title": "...", "description": "...", "h1": "...", "canonical": "...", "robots": "...", "og_title": "...", "og_description": "...", "og_image_url": "..." },
    "schema": [ { "@context": "https://schema.org", "@type": "WebPage", ... } ]
  }
}
```

SEO формируется через **SeoResolver**; schema — через **SchemaResolver** (site-level + entity-level, только enabled).

---

### D) Reviews

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/reviews?host=...&page=1&per_page=15` | Отзывы текущего сайта, только published. Без fallback на root. |

**Ответ:** `data` — массив отзывов (id, author_name, text, published_at); `meta` — site, pagination (current_page, per_page, total, last_page).

---

### E) Redirects

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/redirects/check?host=...&path=/old` | Проверка редиректа по from_path. Сначала redirects текущего site, затем root. |

**Ответ:**  
- при совпадении: `{ "matched": true, "to": "https://...", "code": 301 }`  
- при отсутствии: `{ "matched": false, "to": null, "code": null }`

Учитываются только активные редиректы (`is_active=true`).

---

### F) Robots и Sitemap

| Метод | URL | Content-Type | Описание |
|-------|-----|--------------|----------|
| GET | `/robots.txt?host=...` | `text/plain; charset=UTF-8` | Базовые правила + `seo_settings.robots_txt_append` сайта. |
| GET | `/sitemap.xml?host=...` | `application/xml; charset=UTF-8` | URL опубликованных pages, services, product_categories, products для текущего сайта. |

---

## Правила резолва site / fallback

1. **Host:** из query `host` или заголовка `X-Forwarded-Host`, иначе из `Request::getHost()`. Нормализация: нижний регистр, без схемы и пути.
2. **Сайт:** `Site::where('domain', $host)->first()`; если нет — `Site::where('is_primary', true)->first()`.
3. **Меню:** меню с `slug = header|footer` у текущего сайта; если нет — у root site.
4. **Контент (page/service/product-category/product):** сущность по slug и `site_id` текущего сайта; если не найдена — по `site_id` root site. Для Page, Service, Product применяется только published.
5. **Reviews:** только текущий сайт, без fallback.
6. **Redirects:** сначала запись по `from_path` и `site_id` текущего сайта, затем root.
7. **Schema (SchemaResolver):** site-level — enabled schema_blocks для Site (текущий, затем root без дублей по типу); entity-level — enabled schema_blocks для сущности.

---

## Сервисы

- **SiteResolverService:** `resolveByHost(string $host): Site`, `getRootSite(): ?Site`.
- **SchemaResolver:** `resolveFor(Site $site, Page|Service|Product|ProductCategory|Product|null $entity): array` — массив JSON-LD объектов.
- **SeoResolver:** используется существующий; публичный API отдаёт уже resolved SEO в `meta.seo`.
- **PublicMenuBuilder:** построение дерева меню с href по link_type/link_value.
- **PublicContentResolver:** резолв published page/service/product-category/product по slug и site (с fallback на root).
- **PublicMediaFormatter:** форматирование медиа сущности (cover, gallery) с URL для публичного API.

---

## Как проверить

### Запуск тестов

```bash
# Все тесты публичного API (18 тестов)
php artisan test tests/Feature/PublicApiTest.php

# Все тесты проекта
php artisan test
```

### Примеры curl (базовый URL — ваш хост)

```bash
# Резолв сайта
curl -s "http://localhost/api/v1/site/resolve?host=example.com" | jq .

# Меню header
curl -s "http://localhost/api/v1/menu/header?host=example.com" | jq .

# Страница по slug
curl -s "http://localhost/api/v1/page/about?host=example.com" | jq .

# Услуга
curl -s "http://localhost/api/v1/service/ustanovka?host=example.com" | jq .

# Товар
curl -s "http://localhost/api/v1/product/panel?host=example.com" | jq .

# Отзывы
curl -s "http://localhost/api/v1/reviews?host=example.com&per_page=5" | jq .

# Проверка редиректа
curl -s "http://localhost/api/v1/redirects/check?host=example.com&path=/old-page" | jq .

# robots.txt (Content-Type: text/plain)
curl -sI "http://localhost/api/v1/robots.txt?host=example.com"

# sitemap.xml (Content-Type: application/xml)
curl -sI "http://localhost/api/v1/sitemap.xml?host=example.com"
curl -s "http://localhost/api/v1/sitemap.xml?host=example.com"
```

---

## Definition of Done

- [x] React может по host получить: site config, меню (header/footer), page/service/product-category/product по slug с data, blocks, media, meta.seo (resolved), meta.schema (JSON-LD).
- [x] robots.txt и sitemap.xml отдаются с корректными Content-Type.
- [x] Все тесты в `tests/Feature/PublicApiTest.php` проходят (18 тестов).
- [x] CMS-эндпоинты и схема БД не изменялись; публичный API без auth.
