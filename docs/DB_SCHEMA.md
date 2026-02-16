# Схема БД и модель сущностей (Шаг 2)

После инвентаризации контента (CONTENT_INVENTORY.md) и правок по ARCH_REVIEW — финальная модель сущностей и связей. Таблицы, типы, индексы, FK, правила каскадов.

**Важно:** CMS-медиаслой изолирован от существующих таблиц админки `media` и `mediaables` — не трогаем их. Контент, SEO, блоки и отзывы ссылаются только на `cms_media`.

---

## Multi-site: резолв текущего сайта

- **Корневой сайт (root):** запись в `sites` с `city_id = NULL` и `is_primary = 1`. Один такой сайт на проект.
- **Городские сайты:** записи в `sites` с `city_id` и своим `domain` (поддомен).
- **Алгоритм резолва:** по заголовку Host определяем текущий сайт (запись в `sites` по `domain`). Если записи нет — используем **fallback на корневой сайт** (где `is_primary = 1`). Контент всегда привязан к конкретному `site_id` (NOT NULL); «общего контента» по `site_id = NULL` нет.
- Для редиректов и меню: сначала ищем по текущему `site_id`, при отсутствии — по корневому сайту (если это заложено в логике приложения).

---

## ERD (описание связей)

- **Sites / multi-site:** `regions` → `cities`; `sites` (domain, city_id nullable для корня, is_primary). У каждого сайта свой набор контактов: `site_contacts`. Контент (pages, services, products, menus, reviews, redirects) имеет **site_id NOT NULL**.
- **CMS-медиа:** `cms_media` (логическая запись) ↔ `cms_media_files` (физический файл/варианты). Связь контента с медиа через `cms_mediables` (полиморфная). Все ссылки на изображения (site_contacts, product_categories, seo_meta, review_media) — на `cms_media`. Существующие таблицы `media` и `mediaables` админки не используются для CMS.
- **Контент с блоками:** `pages`, `services`, `product_categories`, `products` — у каждого `site_id` NOT NULL, UNIQUE(site_id, slug). Связь с `content_blocks` (type + data JSON).
- **SEO:** `seo_meta` (per-entity), `seo_settings` (per site; глобальные = запись root site, sites.is_primary=1), `redirects` с **site_id NOT NULL**, UNIQUE(site_id, from_path).
- **Меню:** `menus` (site_id NOT NULL), `menu_items` (link_type + link_value).
- **JSON-LD:** `schema_blocks`. **Отзывы:** `reviews` (site_id NOT NULL), `review_media` → `cms_media`.

---

## Таблицы и поля

### sites

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| domain | string(255) | unique | Корневой домен или поддомен (например proffi-center.ru, anapa.proffi-center.ru) |
| city_id | bigint nullable FK → cities.id | index | NULL = корневой сайт |
| is_primary | boolean default false | index | Единственный корневой сайт: is_primary=1, city_id=NULL |
| created_at, updated_at | timestamps | | |

### regions

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| name | string(255) | | |
| country_code | string(2) nullable | | |
| created_at, updated_at | timestamps | | |

### cities

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| region_id | bigint FK → regions.id | index | |
| name | string(255) | | |
| name_prepositional | string(255) nullable | | «В Анапе» |
| slug | string(100) | index, unique(region_id, slug) | для поддомена/URL |
| created_at, updated_at | timestamps | | |

### site_contacts

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint FK → sites.id | index | |
| phone | string(50) nullable | | |
| email | string(255) nullable | | |
| address_street | string(255) nullable | | |
| address_locality | string(255) nullable | | |
| address_postal_code | string(20) nullable | | |
| work_time | text nullable | | |
| company_name | string(255) nullable | | |
| logo_media_id | bigint nullable FK → **cms_media**.id | index | |
| price_display_from | string(50) nullable | | «от 99 руб.» |
| legal_link | string(500) nullable | | |
| created_at, updated_at | timestamps | | |

### cms_media

Логическая сущность медиа для CMS. Существующая таблица `media` админки не трогается.

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| name | string(255) nullable | | Человекочитаемое имя |
| alt | string(255) nullable | | |
| caption | string(500) nullable | | |
| created_at, updated_at | timestamps | | |

### cms_media_files

Физические файлы и варианты (original, thumbnail, medium, large).

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| media_id | bigint FK → cms_media.id **ON DELETE CASCADE** | index | |
| disk | string(100) | | Путь/диск хранения |
| path | string(500) | | Относительный путь к файлу |
| variant | string(50) nullable | | original, thumbnail, medium, large |
| mime_type | string(100) nullable | | |
| size | unsigned bigint nullable | | |
| width, height | unsigned integer nullable | | |
| created_at, updated_at | timestamps | | |

### cms_mediables

Полиморфная связь cms_media ↔ контент (Page, Service, Product, ContentBlock и т.д.). Существующая таблица `mediaables` админки не трогается.

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| media_id | bigint FK → cms_media.id **ON DELETE CASCADE** | index | |
| mediable_type | string(255) | index | Page, Service, Product, ContentBlock, … |
| mediable_id | bigint | index | |
| role | string(50) nullable | | hero, gallery, attachment |
| order | smallint default 0 | | |
| created_at, updated_at | timestamps | | |
| unique(media_id, mediable_type, mediable_id, role) | | | |

### pages

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| slug | string(255) | index, **UNIQUE(site_id, slug)** | |
| title | string(255) | | |
| status | enum(draft,published,archived) default draft | index | |
| published_at | timestamp nullable | index | |
| created_at, updated_at | timestamps | | |

### services

Услуга/тип потолка (матовые, глянцевые, калькулятор и т.д.).

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| slug | string(255) | index, **UNIQUE(site_id, slug)** | |
| title | string(255) | | |
| status | enum(draft,published,archived) default draft | index | |
| published_at | timestamp nullable | index | |
| created_at, updated_at | timestamps | | |

### product_categories

Категории каталога «Готовые потолки».

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| slug | string(100) | index, **UNIQUE(site_id, slug)** | |
| title | string(255) | | |
| image_media_id | bigint nullable FK → **cms_media**.id | index | |
| image_active_media_id | bigint nullable FK → **cms_media**.id | index | |
| sort_order | smallint default 0 | index | |
| created_at, updated_at | timestamps | | |

### products

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| product_category_id | bigint nullable FK → product_categories.id | index | |
| slug | string(255) | index, **UNIQUE(site_id, slug)** | |
| name | string(255) | | |
| short_description | text nullable | | |
| size_display | string(50) nullable | | |
| price_old | decimal(10,2) nullable | | |
| price | decimal(10,2) nullable | | |
| status | enum(draft,published,archived) default draft | index | |
| published_at | timestamp nullable | index | |
| sort_order | smallint default 0 | | |
| created_at, updated_at | timestamps | | |

### content_blocks

Универсальные блоки page builder (type + data JSON), привязка к page/service/product.

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| blockable_type | string(255) | index | Page, Service, Product |
| blockable_id | bigint | index | |
| type | string(100) | index | banner, simple_text, gallery, form_low_price, … |
| data | json nullable | | Полезная нагрузка блока |
| order | smallint default 0 | index | |
| created_at, updated_at | timestamps | | |
| index(blockable_type, blockable_id, order) | | | |

### seo_meta

SEO-поля для сущностей.

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| seo_metaable_type | string(255) | index | Page, Service, Product, Site |
| seo_metaable_id | bigint | index | |
| title | string(255) nullable | | |
| description | text nullable | | |
| h1 | string(255) nullable | | |
| canonical_url | string(500) nullable | | |
| robots | string(100) nullable | | index |
| og_title | string(255) nullable | | |
| og_description | text nullable | | |
| og_image_media_id | bigint nullable FK → **cms_media**.id **ON DELETE SET NULL** | index | |
| twitter_card | string(50) nullable | | |
| twitter_title | string(255) nullable | | |
| created_at, updated_at | timestamps | | |
| unique(seo_metaable_type, seo_metaable_id) | | | |

### seo_settings

Настройки SEO по сайту (дефолты, верификации). Одна запись на сайт. **Глобальные** настройки хранятся в записи для корневого сайта (sites.is_primary=1).

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | unique | Один ряд на сайт; глобальные = запись root site (sites.is_primary=1) |
| default_title_suffix | string(255) nullable | | |
| default_description | text nullable | | |
| verification_google | string(500) nullable | | |
| verification_yandex | string(500) nullable | | |
| robots_txt_append | text nullable | | |
| created_at, updated_at | timestamps | | |

### redirects

Редиректы привязаны к сайту. Резолв: сначала текущий site_id, затем корневой сайт (is_primary=1).

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| from_path | string(500) | | Путь (нормализованный) |
| to_url | string(500) | | Куда редирект |
| code | smallint default 301 | | 301 или 302 |
| is_active | boolean default true | index | |
| created_at, updated_at | timestamps | | |
| **UNIQUE(site_id, from_path)** | | | |

### menus

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| slug | string(50) | index, **UNIQUE(site_id, slug)** | header, footer |
| title | string(255) nullable | | |
| created_at, updated_at | timestamps | | |

### menu_items

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| menu_id | bigint FK → menus.id | index | |
| parent_id | bigint nullable FK → menu_items.id | index | |
| title | string(255) | | |
| link_type | enum(url,page,service,category,product) | index | |
| link_value | string(500) | | URL или slug сущности |
| open_new_tab | boolean default false | | |
| order | smallint default 0 | index | |
| index(menu_id, parent_id, order) | | | |

### schema_blocks

JSON-LD блоки (Organization, LocalBusiness, Service, BreadcrumbList, FAQPage).

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| schemaable_type | string(255) | index | Page, Service, Site |
| schemaable_id | bigint | index | |
| type | string(50) | index | Organization, LocalBusiness, Service, BreadcrumbList, FAQPage |
| data | json | | Структура по схеме |
| is_enabled | boolean default true | index | |
| order | smallint default 0 | | |
| created_at, updated_at | timestamps | | |

### reviews

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| site_id | bigint **NOT NULL** FK → sites.id | index | |
| author_name | string(255) | | |
| text | text | | |
| phone | string(50) nullable | | |
| published_at | timestamp nullable | index | |
| status | enum(draft,published,hidden) default draft | index | |
| created_at, updated_at | timestamps | | |

### review_media

Связь отзыв ↔ cms_media.

| Поле | Тип | Индексы | Описание |
|------|-----|---------|----------|
| id | bigint PK | | |
| review_id | bigint FK → reviews.id | index | |
| media_id | bigint FK → **cms_media**.id | index | |
| order | smallint default 0 | | |
| created_at, updated_at | timestamps | | |

---

## Cascade rules (ON DELETE)

Для всех FK явно заданы правила каскадного удаления.

| Таблица / FK | Ссылается на | ON DELETE |
|--------------|--------------|-----------|
| cities.region_id | regions.id | RESTRICT (или CASCADE по решению) |
| sites.city_id | cities.id | SET NULL |
| site_contacts.site_id | sites.id | CASCADE |
| site_contacts.logo_media_id | cms_media.id | SET NULL |
| cms_media_files.media_id | cms_media.id | **CASCADE** |
| cms_mediables.media_id | cms_media.id | **CASCADE** |
| pages.site_id | sites.id | CASCADE |
| services.site_id | sites.id | CASCADE |
| product_categories.site_id | sites.id | CASCADE |
| product_categories.image_media_id, image_active_media_id | cms_media.id | SET NULL |
| products.site_id | sites.id | CASCADE |
| products.product_category_id | product_categories.id | SET NULL |
| content_blocks (blockable) | pages/services/products | в приложении: удалять блоки при удалении сущности (полиморф не поддерживает FK) |
| seo_meta.og_image_media_id | cms_media.id | **SET NULL** |
| seo_settings.site_id | sites.id | CASCADE (site_id NOT NULL; глобальные = root site) |
| redirects.site_id | sites.id | CASCADE |
| menus.site_id | sites.id | CASCADE |
| menu_items.menu_id | menus.id | CASCADE |
| menu_items.parent_id | menu_items.id | SET NULL или CASCADE по решению |
| schema_blocks (schemaable) | в приложении при удалении сущности | удалять записи schema_blocks |
| reviews.site_id | sites.id | CASCADE |
| review_media.review_id | reviews.id | CASCADE |
| review_media.media_id | cms_media.id | CASCADE или SET NULL по решению |

---

## Индексы (сводка)

- Все FK с index.
- Уникальности: **UNIQUE(site_id, slug)** для pages, services, product_categories, products, menus; **UNIQUE(site_id, from_path)** для redirects; unique(seo_metaable_type, seo_metaable_id); unique(media_id, mediable_type, mediable_id, role) в cms_mediables.
- Выборка опубликованного контента: **index(status, published_at)** для pages, services, products.
- Полиморфные поля: index(blockable_type, blockable_id, order), index(mediable_type, mediable_id), index(seo_metaable_type, seo_metaable_id), index(schemaable_type, schemaable_id).

---

## Зависимости порядка создания таблиц

См. docs/MIGRATION_PLAN.md. Кратко: regions → cities → **sites** → **cms_media**, **cms_media_files** → site_contacts → pages, services → product_categories → products → content_blocks → seo_meta, seo_settings → redirects → menus, menu_items → schema_blocks → reviews, review_media → **cms_mediables**. Существующие таблицы `media` и `mediaables` админки не изменяются.
