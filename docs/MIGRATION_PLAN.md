# План миграций CMS

Порядок создания таблиц и обоснование зависимостей. Выполнять **только после утверждения** модели сущностей (DB_SCHEMA.md).

**Важно:** Во всех контентных таблицах (pages, services, product_categories, products, menus, reviews, redirects) поле **site_id NOT NULL**. Корневой сайт хранится в `sites` (is_primary=1, city_id=NULL). Существующие таблицы админки `media` и `mediaables` **не трогаем**; CMS-медиа — отдельные таблицы **cms_media**, **cms_media_files**, **cms_mediables**.

---

## Порядок миграций

1. **regions**  
   Нет зависимостей. Справочник регионов.

2. **cities**  
   FK → regions. Города с slug для поддоменов.

3. **sites**  
   FK → cities (nullable). Поля: domain, city_id, **is_primary**. Сайты создаются **до** любого контента, SEO, редиректов и меню. Корневой сайт: одна запись с city_id=NULL, is_primary=1.

4. **cms_media**  
   Логическая сущность медиа для CMS (не путать с существующей таблицей `media` админки).

5. **cms_media_files**  
   FK → cms_media.id ON DELETE CASCADE. Физические файлы и варианты.

6. **site_contacts**  
   FK → sites, FK → cms_media (logo_media_id). Контакты по сайту.

7. **pages**  
   FK → sites (**site_id NOT NULL**). UNIQUE(site_id, slug). Статические страницы.

8. **services**  
   FK → sites (**site_id NOT NULL**). UNIQUE(site_id, slug). Услуги/типы потолков.

9. **product_categories**  
   FK → sites (**site_id NOT NULL**), FK → cms_media (image_media_id, image_active_media_id). UNIQUE(site_id, slug).

10. **products**  
    FK → sites (**site_id NOT NULL**), product_categories. UNIQUE(site_id, slug). Товары «Готовые потолки».

11. **content_blocks**  
    Polymorphic: blockable_type, blockable_id. Общий page builder. Создаётся после pages, services, products.

12. **seo_meta**  
    Polymorphic: seo_metaable_type, seo_metaable_id; FK → cms_media (og_image_media_id ON DELETE SET NULL). SEO по сущности.

13. **seo_settings**  
    FK → sites (**site_id NOT NULL**). Одна запись на сайт; глобальные настройки = запись для root site (is_primary=1).

14. **redirects**  
    FK → sites (**site_id NOT NULL**). UNIQUE(site_id, from_path). Таблица редиректов 301/302. Резолв: сначала текущий site, затем root.

15. **menus**  
    FK → sites (**site_id NOT NULL**). UNIQUE(site_id, slug). Меню header/footer.

16. **menu_items**  
    FK → menus, parent_id → menu_items. Вложенные пункты.

17. **schema_blocks**  
    Polymorphic: schemaable_type, schemaable_id. JSON-LD блоки.

18. **reviews**  
    FK → sites (**site_id NOT NULL**). Отзывы.

19. **review_media**  
    FK → reviews, FK → cms_media. Связь отзыв ↔ медиа.

20. **cms_mediables**  
    FK → cms_media (ON DELETE CASCADE); polymorphic mediable_type, mediable_id. Связь cms_media с контентом (Page, Service, Product и т.д.). Создаётся последней, т.к. ссылается на все контентные сущности.

---

## Почему такой порядок

- **regions → cities → sites:** база для multi-site. Сайты создаются **до** любого контента, SEO, редиректов и меню — все они ссылаются на sites с **site_id NOT NULL** (в т.ч. seo_settings: глобальные настройки хранятся в записи для root site).
- **cms_media → cms_media_files:** ядро CMS-медиатеки. Существующие `media` и `mediaables` админки не изменяются.
- **site_contacts** после sites и cms_media (logo).
- **pages, services** с обязательным site_id; затем **product_categories**, **products**; затем **content_blocks** (полиморф по этим сущностям).
- **seo_meta**, **seo_settings** после сущностей и cms_media (og_image).
- **redirects** с site_id NOT NULL после sites.
- **menus → menu_items** после sites (site_id NOT NULL у menus).
- **schema_blocks** после страниц/услуг/сайтов.
- **reviews**, **review_media** после sites и cms_media.
- **cms_mediables** последняя — связывает cms_media с pages, services, products, content_blocks после их создания.

---

## Существующие таблицы

В проекте уже есть: users, roles, notifications, bots, folders, **media**, **mediaables** (админ-медиатека) и др. Новые таблицы CMS (sites, cms_media, cms_media_files, cms_mediables, pages, services, content_blocks, seo_meta, redirects, menus и т.д.) добавляются отдельными миграциями. Таблицы **media** и **mediaables** админки **не трогаем** — контент и SEO ссылаются только на **cms_media**.

---

## Чек-лист после миграций

- [ ] Все FK созданы и ссылаются на существующие таблицы.
- [ ] Во всех контентных таблицах **site_id NOT NULL** (pages, services, product_categories, products, menus, reviews, redirects).
- [ ] Уникальности **UNIQUE(site_id, slug)** и **UNIQUE(site_id, from_path)** на месте.
- [ ] Индексы для status, published_at для выборки опубликованного контента.
- [ ] Полиморфные поля (*_type, *_id) проиндексированы.
- [ ] Каскады по DB_SCHEMA (cms_media_files.media_id, cms_mediables.media_id → CASCADE; seo_meta.og_image_media_id → SET NULL и т.д.).
- [ ] Сидеры: один регион, один город, один корневой сайт (sites: is_primary=1, city_id=NULL), при необходимости меню header/footer для корня.
