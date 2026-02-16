# SEO и микроразметка JSON-LD

Правила резолва SEO meta, OG, canonical, robots; какие JSON-LD схемы и где включаются; генерация sitemap/robots.

---

## 1. Резолв SEO meta для страницы

Реализация: единый сервис **SeoResolver** (`App\Services\SeoResolver`), метод `resolveFor(entity, site)`. Источники (приоритет от высокого к низкому):

1. **seo_meta на сущности:** если есть запись в `seo_meta` для этой сущности — берём оттуда title, description, h1, canonical_url, robots, og_*, twitter_*.
2. **Поля сущности:** если в seo_meta поле пустое — подставляем из полей сущности (Page/Service/ProductCategory: title; Product: name для title, short_description для description). Для title к entity title при необходимости добавляется default_title_suffix из seo_settings.
3. **seo_settings текущего сайта:** default_title_suffix, default_description для site_id сущности.
4. **seo_settings корневого сайта (fallback):** сайт с is_primary=1; используется, если у текущего сайта нет своих настроек или поля пусты. **Никаких site_id = NULL** — глобальные настройки = запись для root site.

**Итог:** title = seo_meta.title ?? (entity.title + default_title_suffix из settings). description, h1 — по тому же приоритету. **Canonical:** если задан seo_meta.canonical_url — используем его; иначе формируем абсолютный URL из домена сайта и пути сущности (Page: /{slug}, Service: /uslugi/{slug}, ProductCategory: /catalog/{slug}, Product: /catalog/{category_slug}/{slug}). **Robots:** seo_meta.robots или по умолчанию `index,follow`.

---

## 2. Open Graph и Twitter Card

- **og:title, og:description:** из seo_meta (og_title, og_description) или fallback на обычные title/description.
- **og:image:** из seo_meta.og_image_media_id → URL первого варианта MediaFile (например original или large). Если не задано — дефолтное изображение из seo_settings или логотип сайта.
- **og:url:** canonical URL страницы.
- **twitter:card:** из seo_meta.twitter_card (summary_large_image и т.д.); twitter:title, twitter:description — из seo_meta или общих полей.

Все значения выводятся в публичном API для React (см. API_CONTRACT.md), React подставляет их в `<head>`.

---

## 3. Sitemap и robots.txt

- **Sitemap:** генерируемый. Эндпоинт (например GET /sitemap.xml или /api/v1/sitemap.xml) отдаёт XML со списком URL: все опубликованные pages, services, products с published_at ≤ now(), с учётом site (корень + поддомены). Частота и приоритет — по правилам (конфиг или константы).
- **robots.txt:** статическая часть + append из seo_settings.robots_txt_append (по site). В теле указываем Sitemap: <url_sitemap>. Редиректы не попадают в sitemap.

---

## 4. Редиректы (301/302)

- Редиректы привязаны к сайту: **site_id NOT NULL**, UNIQUE(site_id, from_path). Универсальных редиректов без сайта нет; fallback на корневой сайт (is_primary=1) при резолве по Host.
- При запросе к URL проверяем таблицу `redirects` для текущего site_id (затем при необходимости для root site): from_path совпадает с путём запроса, is_active=true. Совпадение: отдаём редирект с code (301 или 302) на to_url. to_url допускает абсолютный URL или путь.
- from_path храним как путь с ведущим `/`, без домена. Один и тот же from_path допустим для разных сайтов.

---

## 5. JSON-LD схемы и где включаются

Управление через `schema_blocks`: привязка к Site, Page, Service; type схемы; data (JSON); is_enabled.

| Схема | Где включать | Назначение |
|-------|----------------|------------|
| **Organization** | Сайт (глобально или по site_id) | Название, лого, контакты организации. |
| **LocalBusiness** | Сайт/город (site с привязкой к city) | Адрес, телефон, регион, часы работы для города. |
| **Service** | Страница услуги (Service) | Услуга (натяжные потолки и т.д.) с описанием и областью. |
| **BreadcrumbList** | Страница (Page/Service/Product) | Цепочка навигации; генерируется из меню/иерархии или задаётся в data. |
| **FAQPage** | Страница (Page) | Блок вопрос-ответ; data — массив { question, answer }. |

Правила вывода (как schema_blocks выбираются для страницы/сайта):

- **По сайту (site-level):** запрос к schema_blocks где schemaable_type = Site и schemaable_id = текущий site_id (или id корневого сайта при fallback), is_enabled = true. Сортировка по order. Используется для layout (Organization, LocalBusiness и т.д.).
- **По сущности (страница/услуга):** для данной публичной страницы или услуги запрашиваем schema_blocks где (schemaable_type, schemaable_id) = (Page, page.id) или (Service, service.id), is_enabled = true. Сортировка по order. На одной сущности для каждого type допускается не более одного включённого блока (правило enforced в админке при сохранении).
- **Итог:** для рендера страницы собираем блоки: 1) site-level для текущего site_id; 2) entity-level для текущей страницы/услуги. Данные (data) храним в JSON; при отдаче в API подставляем в структуру @type и остальные поля схемы. Валидация структуры — в админке при сохранении (см. ADMIN_MODULES.md).

---

## 6. Верификации (Google, Yandex)

Поля seo_settings: verification_google, verification_yandex (содержимое meta name="google-site-verification" и аналог для Яндекса). Вывод в <head> только на публичном сайте, не в админке.
