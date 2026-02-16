# Публичный API для React (контент, меню, SEO, site/town)

Базовый префикс: `/api/v1` (или отдельный префикс для публичного контента, например `/api/v1/public`). Формат ответов: JSON. Авторизация не требуется для перечисленных эндпоинтов.

---

## 1. Определение сайта/города по запросу

Сайт определяется по заголовку Host (или query-параметру для тестов). Реакт при первом запросе может передавать `X-Site-Domain` или фронт получает `site` в ответе конфига.

- **GET /site** (или /site/config)  
  Ответ: текущий site (id, domain, city_id, is_default) + site_contacts (phone, email, address_*, work_time, company_name, logo_url, price_display_from, legal_link). Опционально: список cities для переключения (name, slug, href поддомена).

---

## 2. Меню

- **GET /menus**  
  Query: `site_id` (опционально) или сайт по Host.  
  Ответ: `{ "header": [ ... ], "footer": [ ... ] }` — массивы пунктов меню (вложенность через children). Каждый пункт: `title`, `url` (готовый URL), `open_new_tab`, `children` (если есть).

- Либо **GET /menus/{slug}** (slug=header|footer) — один массив пунктов.

---

## 3. Страницы

- **GET /pages**  
  Query: `site_id`, `status=published`, пагинация при необходимости.  
  Ответ: список страниц (id, slug, title, published_at, seo) для карты сайта или внутренних ссылок.

- **GET /pages/{slug}** (или по id)  
  Query: `site_id` (или по домену).  
  Ответ: одна страница: `id`, `slug`, `title`, `status`, `published_at`, `blocks` (массив content_blocks с type и data), `seo` (title, description, h1, canonical, robots, og_*, twitter_*), `schema` (массив JSON-LD объектов по schema_blocks).

---

## 4. Услуги (Services)

- **GET /services**  
  Аналогично pages: список опубликованных услуг (id, slug, title, published_at, seo).

- **GET /services/{slug}**  
  Одна услуга: поля как у page + blocks, seo, schema.

---

## 5. Категории и товары (Готовые потолки)

- **GET /product-categories**  
  Ответ: массив категорий (id, slug, title, image_url, image_active_url, sort_order).

- **GET /products**  
  Query: `category_slug`, `page`, `per_page`, `site_id`.  
  Ответ: пагинация в формате Laravel (data, current_page, last_page, per_page, total) + массив товаров (id, slug, name, short_description, size_display, price_old, price, image_url, category_id).

- **GET /products/{slug}**  
  Один товар: все поля + blocks, медиа (hero, gallery), seo, schema.

---

## 6. Отзывы

- **GET /reviews**  
  Query: `site_id`, `page`, `per_page`, только опубликованные (status=published, published_at ≤ now()).  
  Ответ: пагинация + массив отзывов (id, author_name, text, phone, published_at, media_urls[]).

---

## 7. SEO и общие данные для layout

- **GET /site** уже отдаёт контакты и настройки сайта. В ответ страницы/услуги/товара всегда вложен объект `seo` и при необходимости `schema` (массив JSON-LD).
- Отдельный эндпоинт **GET /seo-meta** не обязателен: SEO отдаётся в ресурсе сущности (page/service/product).

---

## 8. Sitemap и robots

- **GET /sitemap.xml** — генерируемый XML (или редирект на статику после сборки). Список URL по site.
- **GET /robots.txt** — текст из настроек seo_settings + строка Sitemap.

---

## 9. Формат ответов

- Успех: HTTP 200, тело — JSON (объект или массив по контракту выше).
- Ошибка: 404 — сущность не найдена или не опубликована; 4xx/5xx — стандартный JSON `{ "message": "..." }`.
- Даты: ISO 8601 (published_at, created_at).
- URL медиа: полный URL к файлу (например через Storage::url или поле url в MediaFile).

---

## 11. Резолв текущего сайта на бэкенде

В middleware или в контроллере: по `Host` определить site_id (таблица sites.domain). Если поддомен города — подставить city и контакты этого сайта. Реакт тогда получает единый ответ для layout (меню, контакты, футер) и по маршруту — контент страницы/услуги/товара.
