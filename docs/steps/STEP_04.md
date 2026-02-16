# Шаг 4 — Eloquent модели и связи (без админки и без API)

Модели, фабрики и тесты созданы строго по миграциям. Админка и API не затрагивались.

---

## Что сделано

### 1. Документация (DB_SCHEMA.md)

- В секции **seo_settings**: поле **site_id = NOT NULL**; убрана формулировка «null = глобально». Указано: **глобальные настройки = запись root site (sites.is_primary=1)**.

### 2. Модели Laravel и связи (по миграциям)

| Модель | Таблица | Основные связи |
|--------|---------|----------------|
| Region | regions | cities() HasMany |
| City | cities | region() BelongsTo, sites() HasMany |
| Site | sites | city(), contacts() HasMany, contact() HasOne, pages(), services(), productCategories(), products(), menus(), redirects(), reviews(), seoSetting() HasOne; scopePrimary() |
| SiteContact | site_contacts | site() BelongsTo, logoMedia() BelongsTo CmsMedia |
| CmsMedia | cms_media | files() HasMany CmsMediaFile; pages(), services(), products() MorphToMany через cms_mediables |
| CmsMediaFile | cms_media_files | media() BelongsTo CmsMedia |
| CmsMediable | cms_mediables | media() BelongsTo, mediable() MorphTo |
| Page | pages | site() BelongsTo; scopePublished(); seoMeta() MorphOne, blocks() MorphMany orderBy('order'), schemaBlocks() MorphMany, cmsMedia() MorphToMany |
| Service | services | Аналогично Page (scopePublished, seoMeta, blocks, schemaBlocks, cmsMedia) |
| ProductCategory | product_categories | site(), imageMedia(), imageActiveMedia() BelongsTo; products() HasMany |
| Product | products | site(), productCategory() BelongsTo; scopePublished(); seoMeta(), blocks(), schemaBlocks(), cmsMedia() |
| ContentBlock | content_blocks | blockable() MorphTo |
| SeoMeta | seo_meta | seoMetaable() MorphTo, ogImageMedia() BelongsTo CmsMedia |
| SeoSetting | seo_settings | site() BelongsTo |
| Redirect | redirects | site() BelongsTo |
| Menu | menus | site() BelongsTo, items() HasMany, rootItems() HasMany (parent_id=null) |
| MenuItem | menu_items | menu() BelongsTo, parent() BelongsTo, children() HasMany |
| SchemaBlock | schema_blocks | schemaable() MorphTo |
| Review | reviews | site() BelongsTo; scopePublished(); media() BelongsToMany CmsMedia через review_media |
| ReviewMedia | review_media | review() BelongsTo, media() BelongsTo CmsMedia |

### 3. Контентные сущности (Page, Service, Product, Review)

- **casts:** `data` → array (ContentBlock, SchemaBlock и т.д.), `published_at` → datetime, при необходимости `status`, числовые поля.
- **scopePublished():** `status = 'published'` и `published_at <= now()` (или published_at null) — где применимо (Page, Service, Product, Review).
- **seoMeta():** morphOne(SeoMeta::class, 'seo_metaable').
- **blocks():** morphMany(ContentBlock::class, 'blockable')->orderBy('order').

### 4. Медиа

- **CmsMedia** hasMany **CmsMediaFile** (каскад удаления в БД: при удалении cms_media удаляются cms_media_files).
- Связь контента с медиа через **cms_mediables** (MorphToMany с pivot role, order). При удалении Page/Service/Product выполняется только **detach()** — записи cms_media не удаляются.

### 5. Фабрики (минимально)

- RegionFactory, CityFactory, SiteFactory, PageFactory  
- CmsMediaFactory, CmsMediaFileFactory  
- ContentBlockFactory, SeoMetaFactory, RedirectFactory, SiteContactFactory  

В моделях, используемых в тестах, подключён трейт **HasFactory**.

### 6. Тесты (11 feature-тестов)

- **site → contacts:** site has many contacts, связь возвращает контакты сайта.
- **page slug unique:** создание двух страниц с одним site_id и одним slug — ожидается QueryException.
- **site domain unique:** два сайта с одним domain — ожидается QueryException.
- **seo_meta morphOne:** у Page один SeoMeta, создание через relation.
- **content_blocks morphMany и сортировка:** блоки по order (orderBy('order')).
- **cms_media_files cascade:** при удалении cms_media удаляются связанные cms_media_files.
- **redirects unique(site_id, from_path):** дубликат (site_id, from_path) — QueryException; один и тот же from_path для разных site_id — разрешён.

Файл тестов: `tests/Feature/ModelsRelationsTest.php`.

---

## Команды проверки

```bash
# Запуск тестов моделей и связей
php artisan test tests/Feature/ModelsRelationsTest.php

# Запуск всех тестов проекта
php artisan test

# При необходимости — пересборка БД (для ручной проверки миграций)
php artisan migrate:fresh
```

После выполнения **php artisan test tests/Feature/ModelsRelationsTest.php** все 11 тестов должны проходить (Tests: 11 passed).
