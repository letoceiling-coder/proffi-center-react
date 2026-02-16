# STEP_02_FIXES — правки схемы БД по ARCH_REVIEW

Краткий changelog внесённых в документацию изменений. Код и миграции не создавались.

---

## 1. Media: изоляция CMS-слоя

- Таблицы переименованы в **cms_media**, **cms_media_files**, **cms_mediables**.
- Все ссылки контента, SEO, блоков и отзывов ведут только на **cms_media** (site_contacts.logo_media_id, product_categories.image_media_id / image_active_media_id, seo_meta.og_image_media_id, review_media.media_id).
- Существующие таблицы админки **media** и **mediaables** не трогаются и в DB_SCHEMA не упоминаются как целевые для CMS.

---

## 2. Уникальность slug и site_id

- Во всех контентных таблицах **site_id** объявлен **NOT NULL**: pages, services, product_categories, products, menus, reviews, redirects.
- Корневой сайт: в таблице **sites** хранится запись с **is_primary=1** и **city_id=NULL** (вместо is_default введено is_primary).
- Уникальность: **UNIQUE(site_id, slug)** для pages, services, product_categories, products, menus.
- Трактовка «site_id=NULL = общий контент» исключена; контент всегда привязан к конкретному site_id.

---

## 3. Multi-site: резолв

- В DB_SCHEMA.md добавлен раздел **«Multi-site: резолв текущего сайта»**.
- Алгоритм: по Host определяем текущий сайт (sites.domain); если записи нет — **fallback на корневой сайт** (is_primary=1). Контент всегда по site_id (NOT NULL).

---

## 4. Redirects

- В таблицу **redirects** добавлено поле **site_id NOT NULL** (FK → sites).
- Поле **from_url** заменено на **from_path** (нормализованный путь).
- Уникальность: **UNIQUE(site_id, from_path)**.
- Резолв: сначала текущий site, затем корневой сайт (описано в DB_SCHEMA и MIGRATION_PLAN).

---

## 5. Каскадное удаление (Cascade rules)

- В DB_SCHEMA.md добавлен раздел **«Cascade rules (ON DELETE)»** с таблицей для всех FK.
- Зафиксировано минимум:
  - **cms_media_files.media_id** → CASCADE
  - **cms_mediables.media_id** → CASCADE
  - **seo_meta.og_image_media_id** → SET NULL
- Остальные FK (site_contacts, pages, products, redirects, menus, reviews, review_media и т.д.) перечислены с рекомендуемым ON DELETE.

---

## 6. MIGRATION_PLAN.md

- Порядок миграций приведён в соответствие с таблицами **cms_media**, **cms_media_files**, **cms_mediables** (шаги 4, 5, 20).
- Подчёркнуто, что **sites** создаются **до** контента, SEO, redirects, menus.
- Во всём плане явно указано: **site_id в контенте NOT NULL** (pages, services, product_categories, products, menus, reviews, redirects).
- В разделе «Существующие таблицы» зафиксировано: таблицы **media** и **mediaables** админки не трогаем.
- Чек-лист дополнен пунктами про site_id NOT NULL и каскады.

---

## Затронутые файлы

- **docs/DB_SCHEMA.md** — переработка под cms_*, site_id NOT NULL, is_primary, redirects.site_id и from_path, раздел Cascade rules, раздел Multi-site резолв.
- **docs/MIGRATION_PLAN.md** — порядок с cms_*, акцент на site_id NOT NULL и создании sites до контента.
- **docs/steps/STEP_02_FIXES.md** — данный changelog.

Миграции не создавались.
