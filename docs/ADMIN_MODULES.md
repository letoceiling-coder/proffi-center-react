# Модули админки (разделы /admin)

Соответствие разделам админ-панели Vue и правилам валидации. CRUD строго по модулям после утверждения схемы БД.

---

## 1. Multi-site: Регионы и города

- **Раздел:** Регионы (regions), Города (cities).
- **Поля:** Region: name, country_code. City: region_id, name, name_prepositional, slug.
- **Валидация:** slug уникален в рамках region; только буквы/цифры/дефис.

---

## 2. Сайты и контакты

- **Раздел:** Сайты (sites), Контакты сайта (site_contacts).
- **Поля сайта:** domain, city_id (nullable), is_default.
- **Поля контактов:** site_id, phone, email, address_*, work_time, company_name, logo_media_id, price_display_from, legal_link.
- **Валидация:** domain уникален; один is_default на проект.

---

## 3. Медиа

- **Раздел:** Медиатека (расширение текущего /admin/media). Media + MediaFile.
- **Поля Media:** name, alt, caption. MediaFile: disk, path, variant, mime_type, size, width, height.
- **Валидация:** по config/media (лимиты, MIME). Связь mediaables при привязке к сущности.

---

## 4. Страницы (Pages)

- **Поля:** site_id, slug, title, status (draft/published/archived), published_at.
- **Блоки:** content_blocks (type + data JSON), порядок.
- **Валидация:** slug уникален в рамках site_id; published_at обязателен при status=published.

---

## 5. Услуги (Services)

- **Поля:** site_id, slug, title, status, published_at. Блоки — content_blocks.
- **Валидация:** как у pages.

---

## 6. Категории товаров

- **Поля:** site_id, slug, title, image_media_id, image_active_media_id, sort_order.
- **Валидация:** slug уникален в рамках site_id.

---

## 7. Товары (Products)

- **Поля:** site_id, product_category_id, slug, name, short_description, size_display, price_old, price, status, published_at, sort_order. Медиа через mediaables.
- **Валидация:** slug уникален; price >= 0.

---

## 8. Контент-блоки

- Редактирование в контексте страницы/услуги/товара.
- **Поля:** type (banner, simple_text, gallery, form_low_price, …), data (JSON), order.
- **Валидация:** type из белого списка; data — валидный JSON.

---

## 9. SEO

- **Подразделы:** SEO сущностей (seo_meta) — вкладки в формах редактирования Page/Service/Product; глобальные настройки — страница «SEO Настройки» (seo_settings); Редиректы — страница «Редиректы» (redirects).
- **seo_meta:** управление в админке: в форме редактирования страницы/услуги/товара — вкладка «SEO». Поля: title, description, h1, canonical_url, robots, og_title, og_description, og_image_media_id (выбор из медиатеки CMS), twitter_card, twitter_title. Кнопка «Сохранить SEO» — upsert через API.
- **seo_settings:** страница /admin → «SEO Настройки». Выбор сайта; форма: default_title_suffix, default_description, verification_google, verification_yandex, robots_txt_append. Одна запись на сайт (site_id unique); глобальные настройки = запись для корневого сайта (is_primary=1).
- **redirects:** страница /admin → «Редиректы». Список по site_id, поиск по from_path/to_url; создание и редактирование: site_id, from_path (путь с «/»), to_url (абсолютный URL или путь), code (301/302), is_active. Подсказки: from_path только путь без домена; code 301 или 302.
- **Валидация:** code только 301 или 302; from_path обязателен и начинается с /; уникальность (site_id, from_path); to_url обязателен.

---

## 10. Меню

- **Меню:** страница /admin → «Меню». Обязательный фильтр по сайту; список меню (slug, title); создание/редактирование/удаление. Кнопка «Редактировать пункты» открывает редактор пунктов (дерево).
- **Пункты меню:** редактор пунктов (MenuEditor): дерево с вложенностью; добавление корневого и вложенного пункта; редактирование/удаление; перемещение вверх/вниз в рамках одного уровня. Поля пункта: title, link_type (url|page|service|category|product), link_value (для url — произвольный URL или путь; для page/service/category/product — выбор slug сущности того же site_id), open_new_tab, order.
- **Валидация:** title обязателен; parent_id должен принадлежать тому же меню; link_type только из списка; для link_type page/service/category/product — link_value (slug) должен существовать в соответствующей таблице и принадлежать site_id меню; order >= 0. Удаление пункта каскадно удаляет дочерние пункты.

---

## 11. JSON-LD (Schema blocks)

- **Раздел:** /admin → «Микроразметка (Schema)». Фильтр по сайту, типу схемы и поиск в data. Создание/редактирование: привязка к сайту (site-level) или к сущности (страница/услуга) с выбором сайта и конкретной записи; type (Organization, LocalBusiness, Service, BreadcrumbList, FAQPage); data — JSON (textarea с подсказкой по обязательным ключам); is_enabled, order.
- **Поля:** schemaable_type (App\Models\Site | Page | Service), schemaable_id, type, data (JSON), is_enabled, order.
- **Валидация:** type из списка; data — валидный JSON и минимальная проверка ключей по type (Organization: @type, name; BreadcrumbList: @type, itemListElement; FAQPage: @type, mainEntity и т.д.). Ограничение: не более одного включённого (is_enabled=true) блока данного type в рамках одной сущности (schemaable_type + schemaable_id); при включении одного остальные того же type и scope отключаются.

---

## 12. Отзывы (Reviews)

- **Раздел:** /admin → «Отзывы». Список по сайту, фильтр по статусу (draft/published/hidden), поиск. Создание/редактирование: site_id, author_name, text, phone, status, published_at; блок «Медиа» — список прикреплённых медиа из cms_media (через review_media) с изменением порядка (↑/↓) и удалением, добавление через выбор из медиатеки CMS.
- **Поля:** site_id, author_name, text, phone, published_at, status. Медиа: review_media (review_id, media_id → cms_media, order).
- **Валидация:** author_name и text обязательны; status — draft|published|hidden; media_id при привязке — exists:cms_media,id. При удалении отзыва каскадно удаляются записи review_media.

---

## Порядок внедрения

Sites/Contacts → Pages/Services → Product categories/Products → Content blocks в контексте → SEO → Menu → Schema blocks → Reviews. Медиа — расширение текущего раздела.
