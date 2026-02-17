# CMS Parity Map — соответствие публичных страниц и админки

Документ фиксирует инвентаризацию маршрутов, страниц и секций фронта; для каждой страницы указан желаемый источник данных (Page/Service/ProductCategory/Product), список секций, данные в них и GAP (каких блоков/полей не хватает в CMS).

**Ограничения:** Backend и публичный API не менялись. Изменения только в рамках этапов 2–5 после утверждения карты.

---

## 1. Маршруты (из App.jsx)

| Route | Компонент страницы | Тип сущности (целевой) |
|-------|--------------------|-------------------------|
| `/` | MainPage | **Page** (slug home/glavnaya) или спец. landing |
| `/gotovye-potolki` | GotovyePotolkiPage | **ProductCategory** (каталог готовых) + список Products |
| `/gotovye-potolki/list/:page` | GotovyePotolkiPage | то же + пагинация |
| `/gotovye-potolki/:categorySlug` | GotovyePotolkiPage | то же + фильтр по категории |
| `/natjazhnye-potolki-kalkuljator` | KalkuljatorPage | **Page** (slug калькулятора) + интерактивный виджет |
| `/skidki-na-potolki` | SkidkiPage | **Page** (slug skidki) |
| `/aktsiya` | AktsiyaPage | **Page** (slug aktsiya) |
| `/natyazhnyye-potolki-otzyvy` | OtzyvyPage | **Page** (slug otzyvy) + блок отзывов из API reviews |
| `/gde-zakazat-potolki` | GdeZakazatPage | **Page** (slug gde-zakazat) |
| `/dogovor` | DogovorPage | **Page** (slug dogovor) |
| `/potolki-v-rassrochku` | PotolkiVRassrochkuPage | **Page** (slug potolki-v-rassrochku) |
| `/vozvrat` | VozvratPage | **Page** (slug vozvrat) |
| `/uslugi/:slug` | ApiServicePage | **Service** (уже API) |
| `/catalog` | ApiProductCategoryPage | **ProductCategory** (уже API) |
| `/catalog/:productSlug` | ApiProductPage | **Product** (уже API) |
| `/catalog/:catSlug/:productSlug` | ApiProductPage | **Product** (уже API) |
| `/product/:productSlug` | ProductDetailPage | **Product** (статичный мок → перевести на API) |
| `/:slug` | ApiPageBySlugPage | **Page** (уже API) |
| `/:ceilingCategorySlug` | CeilingCategoryPage | **ProductCategory** (категории потолков: matovye, glyancevye, …) |

---

## 2. Детали по страницам

### 2.1 Главная `/` (MainPage)

- **Источник данных:** Page (slug `home` / `glavnaya`) или отдельная сущность «Landing»; пока можно оставить статичную, затем перевести на Page + блоки.
- **Секции (сверху вниз):**
  1. **SectionBanner** — баннер: bgImage, title, titleSuffix, price, priceUnit, saleLabel, ctaSubtext, кнопка «бесплатный замер».
  2. **SectionSimpleText** — h1, content (HTML/текст с подстановкой города).
  3. **SectionLinks** — список карточек-ссылок: title, href, image, price, rating, reviewCount (повторяемый блок).
  4. **SectionSimpleText** (×N) — h3, paragraphs.
  5. **SectionFormLowPrice** — title, countdownLabel, countdownEnd, legalLink.
  6. **SectionSimpleText** — h3, paragraphs, list, h2, paragraphs2, list2 (качество).
  7. **SectionZamer** — массив items: image, title, text.
  8. **SectionPrTable** — title, subtitle, ourPriceLabel, ourPriceFrom, otherPriceLabel, otherPriceFrom, rows (characteristic, us, other, isHeader, filledStarsUs, filledStarsOther), starFull, starEmpty.
  9. **SectionPotolki2** — массив items: title, description, image, href, align (left/right).
  10. **SectionForm5min** — title, legalLink, buttonText.
  11. **SectionS25** — title, columns (value, class, highlight), subtitle, phoneLabel, phone.
  12. **SectionS30** — title, list (массив строк), btnText, btnHref.
  13. **SectionGallery** — массив items: image, title, price (слайдер/сетка).
  14. **SectionReviews** — массив отзывов: name, profession, text, avatar.

- **Блоки CMS уже есть:** hero, simple_text, pr_table (частично), form_low_price, zamer, gallery.
- **GAP:** banner (отдельный тип с bg image, ценой, CTA); link_cards (сетка карточек с картинкой/ценой/рейтингом); form_5min (форма «за 5 минут» с title, legalLink, buttonText); s25 (блок «держим цены» — колонки с числами + телефон); s30 (блок «без предоплаты» — список + кнопка); potolki2 (чередующиеся карточки image+text+link); reviews_carousel (блок «отзывы» — источник: последние N из API или выбранные).

---

### 2.2 Готовые потолки `/gotovye-potolki`, `/gotovye-potolki/:categorySlug`, `/gotovye-potolki/list/:page` (GotovyePotolkiPage)

- **Источник данных:** ProductCategory (корневая «Готовые потолки») + дочерние категории + Products; пагинация на фронте или API.
- **Секции:**
  1. Заголовок h1 «Готовые натяжные потолки», описание.
  2. **CategoryTabs** — список категорий (slug, title, basePath).
  3. Сетка **ProductCard** — карточки товара: id, title, image, price, categorySlug, href и т.д.
  4. **Pagination**.

- **Блоки CMS:** по сути это одна страница-каталог: hero + список категорий + список товаров. В CMS: Page с slug `gotovye-potolki` или отдельный экран «каталог готовых» = ProductCategory + products.
- **GAP:** продуктовая сетка и пагинация уже поддерживаются API product-category/products; не хватает привязки страницы маршрута к одной «главной» категории готовых потолков и, при необходимости, блока «hero + описание» для этой страницы.

---

### 2.3 Калькулятор `/natjazhnye-potolki-kalkuljator` (KalkuljatorPage)

- **Источник данных:** Page (slug `natjazhnye-potolki-kalkuljator`) для текстовых/маркетинговых блоков; интерактив (калькулятор) остаётся на фронте.
- **Секции:**
  1. **SectionCalc** — интерактивный калькулятор (логика на фронте).
  2. **SectionCalcIntro** — title, description, promoPrice, promoButtonHref, promoButtonText, дата акции.
  3. **SectionCalcTable** — таблица расчётов (данные из мока/API).
  4. **SectionFormLowPrice** — форма.

- **Блоки CMS:** hero, simple_text, form_low_price. Остальное — виджет + специфичные блоки.
- **GAP:** calc_intro (заголовок, описание, акционная цена, кнопка); calc_table (таблица с колонками/строками) или оставить simple_text; форма уже есть.

---

### 2.4 Скидки `/skidki-na-potolki` (SkidkiPage)

- **Источник данных:** Page (slug `skidki-na-potolki`).
- **Секции:**
  1. Заголовок h1, intro (из skidkiPageData).
  2. **AkciiBlock** (×N) — акция: image, title, text, layout (left/right).
  3. **SectionForm5min**.

- **Блоки CMS:** simple_text, form_5min.
- **GAP:** block_akcii / promo_block — повторяемый блок (image, title, text, layout); нужен тип блока с media_id и полями title, text, layout.

---

### 2.5 Акция `/aktsiya` (AktsiyaPage)

- **Источник данных:** Page (slug `aktsiya`).
- **Секции:**
  1. Заголовок h1, intro.
  2. **AktsiyaMarketBlock** (×N) — карточка подарка: title, description, image, oldPrice, кнопка «Получить».
  3. **SectionForm5min** (id="aktsiya").

- **GAP:** gift_card / market_block — карточка подарка (title, description, image, oldPrice, cta); form_5min.

---

### 2.6 Отзывы `/natyazhnyye-potolki-otzyvy` (OtzyvyPage)

- **Источник данных:** Page (slug `natyazhnyye-potolki-otzyvy`) + данные отзывов из API `/api/v1/reviews`.
- **Секции:**
  1. **SectionOtzyvyPage** — слева список отзывов (reviews), справа форма «Оставьте отзыв» (SectionOtzyvyForm).
  2. **SectionZamer**.
  3. **SectionForm5min**.
  4. **SectionGallery**.

- **Блоки CMS:** zamer, form_5min, gallery; отзывы — из API reviews.
- **GAP:** reviews_block — блок «отзывы на странице» (источник: последние N или выбранные review_ids); форма отзыва может остаться отдельным компонентом с legalLink из site.

---

### 2.7 Где заказать `/gde-zakazat-potolki` (GdeZakazatPage)

- **Источник данных:** Page (slug `gde-zakazat-potolki`) + site_contacts + опционально переопределение для карты.
- **Секции:**
  1. **SectionContacts** — contacts (h1, workTime), mapAddress, mapPhone, mapMarker, address (locality, street, postalCode).
  2. **SectionForm5min**.
  3. **SectionZamer**.

- **GAP:** contacts_map — блок с картой и контактами (или подтягивать из site_contacts + поля карты: map_address, map_center, marker_title); form_5min, zamer есть.

---

### 2.8 Договор `/dogovor` (DogovorPage)

- **Источник данных:** Page (slug `dogovor`).
- **Секции:**
  1. **SectionDogovor** — title, introParagraphs, blockTitle, blockParagraphs, contractBlock: image, imageAlt, docLink, docTitle, descriptionBefore, linkText.

- **GAP:** contract_block — блок «договор»: image (media), doc_link (URL файла), doc_title, description, link_text; остальное — simple_text или отдельные блоки.

---

### 2.9 Потолки в рассрочку `/potolki-v-rassrochku` (PotolkiVRassrochkuPage)

- **Источник данных:** Page (slug `potolki-v-rassrochku`).
- **Секции:**
  1. **SectionRassr** — title, intro, uslParts[] (max, med, small, extraStyle, smallStyle).
  2. **SectionBuyNow** — данные блока «оформить сейчас».
  3. **SectionFormRassr** — форма рассрочки.

- **GAP:** rassr_block — заголовок, intro, массив uslParts (три колонки с числами/текстом); buy_now_block; form_rassr (форма с полями и legalLink).

---

### 2.10 Возврат `/vozvrat` (VozvratPage)

- **Источник данных:** Page (slug `vozvrat`).
- **Секции:**
  1. **SectionVozvrat** — title, blocks[] (type: h3 | p | ul | hr | br; text/html, className, items для ul).

- **Блоки CMS:** по сути структурированный текст; можно покрыть simple_text (html) или ввести блок «structured_content» (список блоков h3/p/ul/hr).
- **GAP:** structured_content или расширенный simple_text с возможностью нескольких параграфов и списков под одним блоком.

---

### 2.11 Услуга `/uslugi/:slug` (ApiServicePage)

- **Уже API.** Рендер: заголовок, cover, BlockRenderer(blocks). Блоки: hero, simple_text, zamer и т.д.
- **GAP:** нет; при необходимости добавить типы блоков из GAP (form_5min, reviews_block и т.д.).

---

### 2.12 Каталог `/catalog`, товар `/catalog/:productSlug`, `/catalog/:catSlug/:productSlug` (ApiProductCategoryPage, ApiProductPage)

- **Уже API.** Категория: title, media; товар: name, short_description, price, product_category, blocks, media (cover, gallery).
- **GAP:** на категории нет списка товаров в ответе API (нужно достраивать на бэкенде или фронте запросом products by category); у продукта блоки и галерея есть.

---

### 2.13 Товар (старый роут) `/product/:productSlug` (ProductDetailPage)

- **Источник данных:** перевести на API Product (как ApiProductPage); роут можно редиректить на `/catalog/:productSlug` или оставить и подтягивать продукт по slug.
- **Секции:** SectionProductHero, SectionMinicalc, SectionFormLowPrice, SectionZamer, SectionMaterials, SectionForm5min, SectionS25, SectionS30, SectionGallery, SectionReviews.
- **GAP:** product_hero (title, subtitle); minicalc (title, label, min, max, pricePerM2, phone, phoneLabel); materials (title, images[], text, linksIntro, links[]); s25, s30; отзывы — из API или блок reviews; галерея и формы уже покрыты/частично.

---

### 2.14 Страница по slug `/:slug` (ApiPageBySlugPage)

- **Уже API.** Page + blocks + media. Блоки: hero, simple_text, pr_table, form_low_price, zamer, gallery.
- **GAP:** только отсутствующие типы блоков (см. общий GAP).

---

### 2.15 Категория потолков `/:ceilingCategorySlug` (CeilingCategoryPage)

- **Источник данных:** ProductCategory (slug = ceilingCategorySlug: matovye-potolki, glyancevye-potolki, …) с вложенной структурой секций или Page с тем же slug.
- **Секции (динамические по category.sections):**
  - **p_vid** — SectionPVid: title, intro, images[] (src, alt, name, description, caption), rell.
  - **minicalc** — SectionMinicalc: label, min, max, value, pricePerM2, cenaByType, phone, phoneLabel.
  - **gallery** — SectionGalleryCarousel: items (image, title и т.д.).
  - **catalog05** — SectionCatalog05: title, rows (таблица).
  - Далее общие: SectionFormLowPrice, SectionZamer, SectionSimpleText, SectionForm5min, SectionS25, SectionS30, SectionGallery, SectionReviews.

- **GAP:** section_p_vid (заголовок, intro, массив изображений с подписями); minicalc; gallery_carousel; catalog05 (таблица); остальные блоки — см. общий список.

---

## 3. Сводка по блокам

### 3.1 Блоки, которые уже есть в CMS (ContentBlockDataValidator)

| Тип | Назначение | Поля data (backend) |
|-----|------------|---------------------|
| hero | Заголовок + подзаголовок + CTA | title, subtitle, cta_text, cta_url |
| simple_text | Текст/HTML | html \| text |
| gallery | Галерея по media_ids | media_ids[] |
| pr_table | Таблица сравнения | rows[] (characteristic, us, other, isHeader) |
| form_low_price | Форма «заказать по низкой цене» | enabled |
| zamer | Блок «бесплатный замер» | enabled |

### 3.2 GAP — недостающие типы блоков / полей

1. **banner** — баннер главной: bg_image (media_id), title, title_suffix, price, price_unit, sale_label, cta_subtext. Либо расширить hero (bg_image, price, sale_label).
2. **link_cards** — сетка карточек-ссылок: items[] (title, href, image media_id, price, rating, review_count).
3. **form_5min** — форма «рассчитаем за 5 минут»: title, button_text, legal_link (optional, из site).
4. **s25** — блок «держим цены»: title, columns[] (value, class, highlight), subtitle, phone_label, phone (или из site).
5. **s30** — блок «без предоплаты»: title, list[], btn_text, btn_href.
6. **potolki2** — чередующиеся карточки: items[] (title, description, image media_id, href, align).
7. **reviews_carousel** — отзывы: source = "last_n" | "selected", count или review_ids[]; данные из API reviews.
8. **promo_block** / **akcii** — блок акции (скидки): image (media), title, text, layout (left|right); повторяемый.
9. **gift_card** — карточка подарка (акция): title, description, image, old_price, cta_text.
10. **contacts_map** — контакты + карта: подтягивать из site_contacts или override (map_address, map_center, marker_title, work_time, h1).
11. **contract_block** — блок договора: image (media), doc_link, doc_title, description, link_text.
12. **rassr_block** — рассрочка: title, intro, usl_parts[] (max, med, small, styles).
13. **buy_now_block** — блок «оформить сейчас» (поля уточнить по SectionBuyNow).
14. **form_rassr** — форма рассрочки (поля + legal_link).
15. **structured_content** — последовательность элементов (h3, p, ul, hr) для страниц типа «Возврат».
16. **product_hero** — hero для товара (title, subtitle).
17. **minicalc** — калькулятор-виджет: title, label, min, max, price_per_m2, phone_label; phone из site.
18. **materials** — блок «материалы»: title, images[] (media), text, links_intro, links[] (text, href).
19. **section_p_vid** — блок «вид потолков»: title, intro, images[] (media + caption), rell.
20. **catalog05** — таблица каталога: title, rows[].
21. **pr_table** — расширение: title, subtitle в data; опционально star images (media_ids) для рейтингов в ячейках.

---

## 4. Каталог (ProductCategory / Product)

- **ProductCategory:** уже есть slug, title, image_media_id, image_active_media_id, sort_order; в Public API нет списка products в ответе category — нужен либо список product_id в ответе, либо отдельный запрос списка товаров по category.
- **Product:** есть slug, name, short_description, price, price_old, size_display, галерея (cms_mediables role=gallery), blocks. Для полного соответствия карточкам «готовых потолков» и ProductDetailPage: галерея, характеристики (в блоках или отдельная структура), преимущества (блоки), комплектации — при необходимости ввести блок specs или attributes.

---

## 5. Итоговый список GAP (для этапов 2–5)

- Новые типы блоков: **banner** (или расширенный hero), **link_cards**, **form_5min**, **s25**, **s30**, **potolki2**, **reviews_carousel**, **promo_block**, **gift_card**, **contacts_map**, **contract_block**, **rassr_block**, **buy_now_block**, **form_rassr**, **structured_content**, **product_hero**, **minicalc**, **materials**, **section_p_vid**, **catalog05**; расширение **pr_table** (title, subtitle, звёзды).
- В блоках с изображениями — привязка к **cms_media** (media_ids или одно поле image_media_id), без «голого» JSON URL.
- Админка: **нормальные формы** под каждый тип блока (не один textarea JSON).
- Страницы: все статические маршруты (skidki, aktsiya, dogovor, vozvrat, gde-zakazat, potolki-v-rassrochku, natjazhnye-potolki-kalkuljator, gotovye-potolki, главная) должны иметь соответствие в CMS (Page с нужным slug или ProductCategory) и отображаться через API (ApiPageBySlugPage / категории и товары).
- Каталог: API product-category при необходимости возвращать список products; в админке — удобное управление галереей товара и характеристиками (блок specs или атрибуты).

---

## 6. Предложенный план реализации этапов 2–5

### Этап 2 — Модель блоков (минимальные расширения)

- **Файлы:** `app/Services/ContentBlockDataValidator.php`, при необходимости миграции для новых полей в `content_blocks.data` (не требуются, если всё в JSON `data`).
- Добавить в `ContentBlockDataValidator::ALLOWED_TYPES` и `rulesForType()` новые типы из GAP (banner, link_cards, form_5min, s25, s30, potolki2, reviews_carousel, promo_block, gift_card, contacts_map, contract_block, rassr_block, buy_now_block, form_rassr, structured_content, product_hero, minicalc, materials, section_p_vid, catalog05); расширить правила для pr_table (title, subtitle).
- Для блоков с картинками: в data хранить `image_media_id` или `media_ids[]`, валидация `exists:cms_media,id`.

### Этап 3 — Админ-редактор блоков (Vue)

- **Файлы:** `resources/js/` (Vue-компоненты админки): редакторы блоков по типам (например `BlockEditorHero.vue`, `BlockEditorGallery.vue`, `BlockEditorPrTable.vue`, …), общий `ContentBlocksEditor.vue` (список блоков, drag-drop или ↑↓, toggle enabled, выбор типа, открытие формы по типу).
- Перестать редактировать `data` как один JSON textarea для ключевых блоков; сделать UI-формы: Hero (title, subtitle, cta_text, cta_url, bg_media_id), Gallery (CmsMediaPicker, порядок, подписи), FAQ (если появится тип faq), Table (строки/колонки), и т.д. по списку из CMS_PARITY_MAP.
- Предпросмотр блока (минимально): вывод заголовка/превью по типу.

### Этап 4 — Привязка публичных страниц к CMS (React)

- **Файлы:** `frontend/src/App.jsx`, `frontend/src/pages/*.jsx`, `frontend/src/components/blocks/BlockRenderer.jsx`.
- Маршруты: все статические пути (skidki, aktsiya, dogovor, vozvrat, gde-zakazat, potolki-v-rassrochku, kalkuljator, gotovye-potolki) вести на ApiPageBySlugPage с соответствующим slug (или на ApiProductCategoryPage для gotovye-potolki); главная `/` — либо Page с slug home/glavnaya, либо оставить MainPage с подгрузкой блоков из API.
- В BlockRenderer добавить маппинг новых типов блоков на React-компоненты (BannerBlock, LinkCardsBlock, Form5minBlock, S25Block, S30Block, Potolki2Block, ReviewsCarouselBlock, …).
- Калькулятор и спец-страницы: layout = блоки из API сверху/снизу + интерактивный виджет по центру.

### Этап 5 — Каталог (админка + отображение)

- **Backend:** при необходимости расширить ответ `GET /api/v1/product-category/{slug}` списком products (или отдельный endpoint списка товаров по category_id); не менять контракт без согласования.
- **Админка:** управление галереей товара (media picker + сортировка уже есть в ProductController syncGallery); при необходимости экран характеристик (блок specs или атрибуты в Product).
- **Frontend:** ApiProductCategoryPage — при отсутствии products в ответе запрашивать список товаров категории отдельно; ProductDetailPage перевести на API (как ApiProductPage), единый рендер блоков и галереи.

### Этап 6 — Definition of Done

- Все публичные страницы из `frontend/src/pages` имеют источник в CMS (Page/Service/ProductCategory/Product) и редактируются из `/admin`.
- В админке для каждой страницы: изменение набора блоков, порядка, вкл/выкл, редактирование текста и медиа через формы (не JSON).
- Каталог управляется из админки и отображается на публичке из API.
- После этого — доработки SEO и микроразметки.

---

*Документ подготовлен в рамках Этапа 1 (инвентаризация). Изменения кода и БД — только после утверждения карты и по плану этапов 2–5.*
