# Архитектурная ревизия схемы БД (DB_SCHEMA.md)

Проверка проведена перед началом реализации миграций. Миграции **не создаются** до внесения согласованных правок и повторного подтверждения.

---

## 1. Дублирование сущностей и избыточные таблицы

### 1.1 Конфликт с существующими таблицами `media` и `mediaables`

**Риск:** В проекте уже есть таблицы `media` и `mediaables` (миграции 2026_02_16_100006 и 2026_02_16_100008):

- Текущая **media**: одна запись = один файл (name, original_name, extension, **disk**, width, height, type, size, folder_id, user_id, metadata, …). Нет разделения «логическая сущность / физические варианты».
- Текущая **mediaables**: `media_id`, **mediable_type**, **mediable_id**, **collection**, position, meta (поле называется `mediable`, не `mediaable`).

В DB_SCHEMA.md предложены новые **media** (только логика: name, alt, caption) и **media_files** (физические файлы и варианты). Это дублирует/переопределяет существующую сущность и ломает текущую админ-медиатеку.

**Рекомендация:**

- **Вариант A (предпочтительный для изоляции CMS):** Ввести отдельные таблицы для контента: **cms_media**, **cms_media_files**, **cms_mediaables**. Сущности CMS (Page, Service, Product) ссылаются только на cms_media. Текущие `media` и `mediaables` остаются для админ-медиатеки без изменений. При необходимости «выбора из библиотеки» в CMS — отдельный контракт (копирование в cms_media или общий слой — решать позже).
- **Вариант B (единый слой):** Расширить существующую `media`: добавить таблицу **media_files** (media_id, disk, path, variant, …), перенести текущие данные в модель «один media = один media_file (original)», обновить код админки. Единая медиатека для админки и CMS, но потребует миграции данных и правок в существующих контроллерах/моделях.

В ARCH_REVIEW считаем принятым **Вариант A** (cms_media / cms_media_files / cms_mediaables), если иное не утверждено.

---

### 1.2 Прочие сущности

- **pages**, **services**, **product_categories**, **products** — дублирования нет, сущности разные.
- **reviews** — отдельная сущность, не дублирует другие.
- **seo_meta** vs **seo_settings**: разделение обосновано (per-entity vs site-level), избыточности нет.

---

## 2. Уникальные индексы и multi-site (site_id = null)

### 2.1 Уникальность (site_id, slug) при nullable site_id

**Риск:** В MySQL/MariaDB уникальный индекс `UNIQUE(site_id, slug)` допускает несколько строк с `(NULL, 'o-kompanii')`, потому что NULL в уникальном индексе не считается равным другому NULL. В результате можно создать дубли страниц/услуг/товаров с `site_id = NULL` и одинаковым slug.

**Рекомендация:**

- Явно задокументировать и обеспечить в приложении правило: **для сущностей с site_id = NULL в рамках одного типа (pages/services/products/menus) допускается только одна запись с данным slug** (уникальность на уровне приложения или частичный уникальный индекс, где это поддерживается).
- В БД: оставить `UNIQUE(site_id, slug)`; для PostgreSQL можно использовать `UNIQUE NULLS NOT DISTINCT(site_id, slug)` (одна запись с NULL на slug); для MySQL — либо триггер/проверка в коде, либо отдельная таблица/перечисление «глобальных» slug без site_id.
- **Предлагаемая правка в схеме:** добавить в описание полей для pages, services, product_categories, products, menus: «При site_id = NULL уникальность slug обеспечивается на уровне приложения (один глобальный экземпляр на slug).»

---

### 2.2 Root domain и обработка site_id = null

**Текущая логика в схеме:** `site_id = null` трактуется как «все сайты» / общий контент; `city_id = null` у sites — «основной сайт».

**Риски:**

- Неоднозначность: «все сайты» может означать «контент доступен на каждом поддомене» или «контент только на корневом домене». Нужно зафиксировать в документации.
- Резолв сайта по Host: для корневого домена (например proffi-center.ru) в таблице sites должна быть запись с domain = 'proffi-center.ru' и city_id = NULL. Тогда site_id в контенте NULL может означать «использовать на любом сайте как fallback», а не «привязан к корню».

**Рекомендация:**

- В DB_SCHEMA.md и API_CONTRACT.md явно описать: **корневой сайт** — запись в `sites` с `city_id = NULL` и `domain = <корневой домен>`. Контент с `site_id = NULL` считается **общим (fallback)** и отдаётся, если для текущего site нет своей записи (например, страница «О компании» одна на все города, если не переопределена).
- Обеспечить в коде резолва: сначала ищем контент по (site_id = current_site_id), затем при отсутствии — по (site_id IS NULL).

---

## 3. Связь media ↔ media_files ↔ mediaables (и cms_*)

### 3.1 Цепочка (в варианте с cms_*)

- **cms_media** — логическая запись (name, alt, caption).
- **cms_media_files** — FK на cms_media.id; один media — много files (original, thumbnail, medium, large). Связь корректна.
- **cms_mediaables** — полиморфная связь: cms_media_id + (mediaable_type, mediaable_id) + role + order. Один и тот же cms_media может быть привязан к разным сущностям с разными role (hero, gallery). Одна сущность может иметь несколько media с разными role — уникальность по (media_id, mediaable_type, mediaable_id, role) корректна.

**Уточнение:** В текущей схеме в mediaables указано unique(media_id, mediaable_type, mediaable_id, role). Это не даёт одному и тому же медиа дважды с одной ролью у одной сущности — верно. Но один media с role=hero и тот же media с role=gallery у одной сущности — не допускается только если role разный; при разных role ограничение не мешает.

**Рекомендация:** Оставить как есть. При переходе на cms_* — те же правила для cms_mediaables.

---

### 3.2 Каскадное удаление

- **cms_media_files:** при удалении cms_media логично удалять все cms_media_files (ON DELETE CASCADE).
- **cms_mediaables:** при удалении Page/Service/Product — обнулять или удалять связи (SET NULL по mediaable_id не подходит для polymorphic; лучше CASCADE удалять только строки mediaables, саму запись media не удалять, чтобы медиа оставалось в библиотеке). Рекомендация: **ON DELETE CASCADE** со стороны mediaable (при удалении страницы удалять только строки в cms_mediaables), на стороне cms_media — **ON DELETE CASCADE** для cms_mediaables (удаление медиа удаляет привязки). Для cms_media при удалении сущности (Page) — в приложении не удалять cms_media, только отвязывать (удалять строки в cms_mediaables). В схеме явно указать: FK от cms_mediaables к cms_media — CASCADE; FK к полиморфам — без CASCADE (удаление страницы обрабатывается в коде: удалить блоки и строки mediaables).
- **site_contacts:** при удалении site — CASCADE на site_contacts.
- **content_blocks:** при удалении Page/Service/Product — CASCADE удаление блоков (или в коде).
- **seo_meta:** при удалении сущности — CASCADE удаление записи seo_meta.
- **review_media:** при удалении review — CASCADE; при удалении media — CASCADE или SET NULL в зависимости от выбора слоя (cms_media vs media).

**Рекомендация:** В DB_SCHEMA.md добавить подраздел «Каскадное удаление» с матрицей: для каждой FK указать ON DELETE (CASCADE / SET NULL / RESTRICT) и где удаление обрабатывается в приложении.

---

## 4. SEO: приоритет резолва, canonical, схема

### 4.1 Приоритет резолва meta

В SEO_AND_SCHEMA.md приоритет задан: (1) seo_meta сущности, (2) поля сущности (title и т.д.), (3) seo_settings. Конфликтов нет. Рекомендация: зафиксировать в коде порядок (например, в сервисе SeoResolver) и покрыть тестами.

### 4.2 Конфликты canonical

**Риск:** Если у двух страниц (разных site_id) задать один и тот же canonical_url, поисковики могут воспринять дублирование. На уровне БД уникальность canonical_url не задана и не нужна (разные сайты могут указывать на один canonical в рамках мультисайта). Рекомендация: в админке при сохранении проверять, что canonical_url в рамках одного site не дублируется для разных сущностей (опционально, бизнес-правило).

### 4.3 schema_blocks и дублирование JSON-LD

**Риск:** На одной странице несколько schema_blocks с type=Organization или несколько BreadcrumbList с одинаковым data приведут к выводу нескольких одинаковых или противоречащих блоков в разметке.

**Рекомендация:**

- В схеме оставить как есть (несколько блоков одного type допустимы для разных целей).
- В документации и админке указать: на одной сущности для типа Organization/LocalBusiness рекомендуется **не более одного** включённого блока каждого типа; при выводе в API/HTML при необходимости брать первый по order или мержить по правилам (зафиксировать в SEO_AND_SCHEMA.md).
- Валидация в админке: при сохранении schema_block предупреждать или запрещать второй включённый блок того же type для той же сущности (опционально).

---

## 5. content_blocks

### 5.1 Достаточность blockable_type / blockable_id

Полиморфная связь blockable_type + blockable_id достаточна для привязки к Page, Service, Product. Добавление blockable в будущем (например, ProductCategory) — только новый тип в enum/списке. Дополнительные таблицы не требуются.

### 5.2 JSON data и невалидная структура

**Риск:** Поле `data` (JSON) не гарантирует структуру по типу блока (banner, simple_text, gallery и т.д.). Невалидные или устаревшие ключи могут сломать фронт или привести к пустому блоку.

**Рекомендация:**

- В приложении: белый список типов блоков и JSON-схема (или валидация в PHP) для каждого type при сохранении. В DB_SCHEMA.md указать: «Структура data валидируется в приложении по type (см. ADMIN_MODULES).»
- В БД оставить JSON без жёсткой схемы; при необходимости можно добавить CHECK (JSON_VALID(data)) для MySQL 5.7+.

### 5.3 Version / revision

Текущая схема не хранит версии или ревизии content_blocks. Для истории изменений и отката потребовались бы таблица content_block_revisions (block_id, data, order, created_at) или аналоги. Это не входит в текущее ТЗ.

**Рекомендация:** Версионирование не вводить на этапе первой реализации. Зафиксировать в ARCH_REVIEW: «Версии content_blocks не предусмотрены; при необходимости — отдельная итерация (revisions).»

---

## 6. Меню: link_type и polymorphic ref

### 6.1 Корректность link_type

Типы url | page | service | category | product покрывают требования. Для страницы «Калькулятор» можно использовать page (slug страницы) или service (slug услуги) в зависимости от того, как мы моделируем калькулятор. Отдельный тип «category» для product_categories корректен (например, «Готовые потолки» → category с slug).

**Уточнение:** link_value при link_type=page — slug страницы; при link_type=product — slug товара; при link_type=url — произвольный URL. В API при сборке меню резолвить link_type + link_value в итоговый URL. Схема достаточна.

### 6.2 Полиморфная ref (link_target_type + link_target_id) вместо link_type + link_value

**Альтернатива:** Хранить link_target_type (Page, Service, Product, ProductCategory) и link_target_id (bigint), а для внешних ссылок — link_target_type = null и link_url (string). Плюсы: строгая FK через полиморфную связь, нет «сломанных» ссылок при удалении сущности. Минусы: усложнение миграций и админки, внешние URL не укладываются в полиморфизм.

**Рекомендация:** Оставить текущий вариант (link_type + link_value). При удалении Page/Service/Product в приложении при необходимости помечать пункты меню как «битая ссылка» или скрывать. При желании усилить целостность — в следующей итерации можно ввести опциональные link_target_type + link_target_id для внутренних ссылок и резолвить URL из них.

---

## 7. Редиректы и redirects

- **from_url:** при нескольких сайтах возможны коллизии (один и тот же путь на разных доменах). В схеме redirects нет site_id. Если редиректы глобальные — достаточно. Если редиректы per-site — нужно добавить **site_id nullable** в redirects и уникальность (site_id, from_url) или (site_id, from_url) с учётом null (глобальный редирект при site_id = null).

**Рекомендация:** Добавить в таблицу **redirects** поле **site_id** (nullable, FK → sites). Резолв: сначала ищем редирект по (site_id = current_site, from_url), затем по (site_id IS NULL, from_url). Уникальность: UNIQUE(site_id, from_url) с учётом правила приложения для null (один глобальный редирект на from_url).

---

## 8. Индексы: составные и fulltext

### 8.1 Составные индексы

- **content_blocks:** index(blockable_type, blockable_id, order) — уже указан; достаточен для выборки блоков сущности с сортировкой.
- **menu_items:** index(menu_id, parent_id, order) — уже указан.
- **Выборка опубликованного контента:** для pages, services, products полезен составной index(status, published_at) для запросов вида WHERE status = 'published' AND (published_at IS NULL OR published_at <= NOW()). В схеме упомянуто «index(status, published_at)» — зафиксировать в миграциях.
- **redirects:** при введении site_id — index(site_id, from_url) и при необходимости index(is_active, site_id) для быстрого отбора активных редиректов по сайту.

### 8.2 Fulltext

- **reviews:** поиск по author_name или text — при необходимости добавить FULLTEXT(text, author_name). Для первой версии можно обойтись без fulltext и использовать LIKE/поиск в приложении.
- **pages/services/products:** поиск по title/slug обычно по точному совпадению или prefix; fulltext не обязателен на первом этапе.

**Рекомендация:** Fulltext не вводить в начальной схеме; зафиксировать в ARCH_REVIEW как возможное расширение (reviews, контент).

---

## 9. Итоговые правки в DB_SCHEMA.md (предлагаемые)

| № | Правка |
|---|--------|
| 1 | Переименовать в схеме (для CMS) таблицы: **media** → **cms_media**, **media_files** → **cms_media_files**, **mediaables** (для контента) → **cms_mediaables**; все FK и упоминания в других таблицах (site_contacts.logo_media_id, product_categories.image_media_id, seo_meta.og_image_media_id, review_media.media_id) ведут на **cms_media**. Либо явно зафиксировать Вариант B (расширение существующей media) и не создавать новые имена. |
| 2 | Добавить правило: при **site_id = NULL** уникальность slug в рамках типа сущности обеспечивается на уровне приложения (один глобальный экземпляр на slug). |
| 3 | Описать резолв корневого сайта и контента: корневой сайт = запись в sites с city_id = NULL; контент с site_id = NULL = fallback для всех сайтов. |
| 4 | В таблицу **redirects** добавить **site_id** (nullable, FK → sites), уникальность (site_id, from_url) с учётом правила для null. |
| 5 | Добавить подраздел **«Каскадное удаление»** с матрицей FK → ON DELETE. |
| 6 | В **schema_blocks** и SEO_AND_SCHEMA: рекомендация «не более одного включённого блока данного type на сущность» и при необходимости мерж/выбор по order. |
| 7 | Зафиксировать, что структура **content_blocks.data** валидируется в приложении по type; версии/revisions не предусмотрены. |
| 8 | Составные индексы: явно указать index(status, published_at) для pages, services, products; при введении site_id в redirects — index(site_id, from_url). |

---

## 10. Подтверждение готовности к миграциям

- **С учётом внесённых правок** (переименование в cms_media / cms_media_files / cms_mediaables, правило для site_id = NULL, redirects.site_id, каскады, уточнения по SEO и content_blocks) схема **готова к реализации миграций** после обновления DB_SCHEMA.md и MIGRATION_PLAN.md.
- **Без правок** остаются риски: конфликт с существующими media/mediaables, дубли slug при site_id = NULL, неоднозначность редиректов в multi-site, отсутствие явных правил каскада.

**Итог:** Провести правки по п. 9 выше, обновить DB_SCHEMA.md и MIGRATION_PLAN.md, после чего считать схему утверждённой для Шага 3 (миграции). Миграции по текущему ревью **не создаются**.
