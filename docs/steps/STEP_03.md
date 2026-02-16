# Шаг 3 — Миграции CMS

Миграции созданы строго по MIGRATION_PLAN.md и DB_SCHEMA.md. Перед генерацией в документацию внесена правка: **seo_settings.site_id NOT NULL**, глобальные настройки хранятся в записи для root site (sites.is_primary=1).

---

## Что сделано

1. **Правка перед стартом:** В DB_SCHEMA.md и MIGRATION_PLAN.md поле **seo_settings.site_id** переведено в NOT NULL; глобальные настройки = запись для корневого сайта (is_primary=1). Единственная запись «глобальных» настроек — строка с site_id = id корневого сайта.

2. **Добавлены 20 миграций CMS** (порядок по MIGRATION_PLAN):
   - regions, cities, sites
   - cms_media, cms_media_files
   - site_contacts
   - pages, services, product_categories, products
   - content_blocks
   - seo_meta, seo_settings, redirects
   - menus, menu_items
   - schema_blocks
   - reviews, review_media
   - cms_mediables

3. В каждой миграции: поля, индексы, FK и ON DELETE по DB_SCHEMA (CASCADE/SET NULL где указано). Новых таблиц/полей вне плана нет.

4. Выполнена проверка: **php artisan migrate:fresh** — все миграции (включая существующие) отработали без ошибок.

---

## Список миграций CMS (порядок выполнения)

| № | Файл | Таблица |
|---|------|---------|
| 1 | 2026_02_16_200001_create_regions_table.php | regions |
| 2 | 2026_02_16_200002_create_cities_table.php | cities |
| 3 | 2026_02_16_200003_create_sites_table.php | sites |
| 4 | 2026_02_16_200004_create_cms_media_table.php | cms_media |
| 5 | 2026_02_16_200005_create_cms_media_files_table.php | cms_media_files |
| 6 | 2026_02_16_200006_create_site_contacts_table.php | site_contacts |
| 7 | 2026_02_16_200007_create_pages_table.php | pages |
| 8 | 2026_02_16_200008_create_services_table.php | services |
| 9 | 2026_02_16_200009_create_product_categories_table.php | product_categories |
| 10 | 2026_02_16_200010_create_products_table.php | products |
| 11 | 2026_02_16_200011_create_content_blocks_table.php | content_blocks |
| 12 | 2026_02_16_200012_create_seo_meta_table.php | seo_meta |
| 13 | 2026_02_16_200013_create_seo_settings_table.php | seo_settings |
| 14 | 2026_02_16_200014_create_redirects_table.php | redirects |
| 15 | 2026_02_16_200015_create_menus_table.php | menus |
| 16 | 2026_02_16_200016_create_menu_items_table.php | menu_items |
| 17 | 2026_02_16_200017_create_schema_blocks_table.php | schema_blocks |
| 18 | 2026_02_16_200018_create_reviews_table.php | reviews |
| 19 | 2026_02_16_200019_create_review_media_table.php | review_media |
| 20 | 2026_02_16_200020_create_cms_mediables_table.php | cms_mediables |

---

## Команды проверки

```bash
# Полный пересборка БД (все таблицы дропаются и создаются заново)
php artisan migrate:fresh

# Только статус миграций
php artisan migrate:status

# Откат последней миграции (если нужно)
php artisan migrate:rollback --step=1
```

После **migrate:fresh** выполняются все миграции проекта (в т.ч. users, roles, media, folders и т.д.), затем 20 миграций CMS в порядке имён файлов.

---

## Чек-лист из MIGRATION_PLAN.md

- [x] Все FK созданы и ссылаются на существующие таблицы.
- [x] Во всех контентных таблицах **site_id NOT NULL** (pages, services, product_categories, products, menus, reviews, redirects, seo_settings).
- [x] Уникальности **UNIQUE(site_id, slug)** и **UNIQUE(site_id, from_path)** на месте.
- [x] Индексы для status, published_at для выборки опубликованного контента (pages, services, products).
- [x] Полиморфные поля (*_type, *_id) проиндексированы (content_blocks, seo_meta, schema_blocks, cms_mediables).
- [x] Каскады по DB_SCHEMA (cms_media_files.media_id, cms_mediables.media_id → CASCADE; seo_meta.og_image_media_id → SET NULL; site_contacts.logo_media_id, product_categories image_media_id → nullOnDelete и т.д.).
- [ ] Сидеры: один регион, один город, один корневой сайт (sites: is_primary=1, city_id=NULL), при необходимости меню header/footer для корня — **не входило в Шаг 3**, выполняется отдельно при необходимости.
