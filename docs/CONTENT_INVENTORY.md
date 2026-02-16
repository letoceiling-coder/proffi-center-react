# Шаг 1: Инвентаризация контента

Референс: https://proffi-center.ru/  
Фронт: React (репозиторий proffi-center-react).  
Старый дамп: не копируем структуру, используем только для понимания типов контента.

---

## 1. Маршруты и типы страниц (по текущему React)

| Маршрут | Тип страницы | Источник данных (сейчас) | Контент |
|--------|---------------|---------------------------|---------|
| `/` | Главная | mockPageData.js | siteConfig, баннер, блоки текста, ссылки, формы, замер, таблица цен, отзывы, галерея, футер |
| `/gotovye-potolki` | Каталог «Готовые потолки» | gotovyePotolkiData.js | Табы категорий, карточки товаров, пагинация |
| `/gotovye-potolki/:categorySlug` | Фильтр по категории | тот же | Подмножество карточек по categorySlug |
| `/gotovye-potolki/list/:page` | Пагинация каталога | тот же | Та же страница с page |
| `/natjazhnye-potolki-kalkuljator` | Калькулятор | kalkuljatorData.js | Калькулятор, текст, таблица |
| `/skidki-na-potolki` | Скидки | skidkiData.js | Блоки акций |
| `/aktsiya` | Акция | aktsiyaData.js | Акционные блоки |
| `/o-kompanii` | О компании | oKompaniiData.js | О компании, «Заказало», блоки |
| `/natyazhnyye-potolki-otzyvy` | Отзывы | otzyvyPageData.js | Список отзывов, форма отзыва |
| `/gde-zakazat-potolki` | Где заказать | gdeZakazatData.js | Контакты, карта, текст |
| `/dogovor` | Договор | dogovorData.js | Текст договора |
| `/potolki-v-rassrochku` | Рассрочка | potolkiVRassrochkuData.js | Условия, форма, блоки |
| `/vozvrat` | Возврат | vozvratData.js | Текст, блоки |
| `/product/:productSlug` | Карточка товара | productDetailData.js | Герой, калькулятор, материалы, формы, галерея, отзывы |
| `/:ceilingCategorySlug` | Категория потолка (Матовые, Глянцевые и т.д.) | ceilingCategoriesData.js | slug, title, meta, секции (p_vid, minicalc, gallery и т.д.) |

---

## 2. Повторяющиеся блоки (секции) на фронте

Используются на главной и на страницах категорий/товара. Имеет смысл вынести в единый «page builder» с типами блоков и JSON-данными.

| Тип блока | Компонент | Данные (пример) |
|-----------|-----------|------------------|
| banner | SectionBanner | заголовок, цена, изображение |
| simple_text | SectionSimpleText | заголовок, абзацы, вариант (intro/blocks/quality) |
| link_block | SectionLinks / LinkBlock | массив ссылок с title, href |
| form_low_price | SectionFormLowPrice | заголовок, кнопка, поля (площадь и т.д.) |
| zamer | SectionZamer | блоки «замер» (текст, иконка) |
| pr_table | SectionPrTable | таблица сравнения цен |
| potolki2 | SectionPotolki2 | блоки «типы потолков» |
| form_5min | SectionForm5min | форма «за 5 минут» |
| s25 | SectionS25 | блоки S25 |
| s30 | SectionS30 | блоки S30 |
| gallery | SectionGallery | массив изображений/подписей |
| reviews | SectionReviews | отзывы (или ссылка на сущность Review) |
| minicalc | SectionMinicalc | площадь, цена за м² |
| p_vid | SectionPVid (категория) | заголовок, интро, изображения |
| gallery_carousel | SectionGalleryCarousel | карусель изображений |
| catalog_05 | SectionCatalog05 | каталог карточек |
| product_hero | SectionProductHero | герой карточки товара |
| materials | SectionMaterials | блок материалов |

Итог: контент страниц — упорядоченный набор блоков с `type` и `data` (JSON).

---

## 3. Меню

- **Header:** многоуровневое (menuItems с children) — «Матовые потолки», «Готовые потолки» и т.д., ссылки на URL.
- **Footer:** footerMenuData, footerData — ссылки, контакты, юр. информация.
- Нужно: хранение в БД, вложенность, ссылка на URL или на сущность (page, service, category, product).

---

## 4. Multi-site (города/поддомены)

- В mockPageData: `siteConfig` (phone, email, city, region, address, workTime, companyName, цены и т.д.), массив `cities` с name, slug, href (поддомен).
- Старый дамп: city, region, country, settingcompany (name, adress, phone, logo по id_user).
- Требование: корневой домен + поддомены городов, у каждого сайта свои контакты (телефон, адрес, регион, город) из БД.

---

## 5. Сущности из старого дампа (только тип, не структура)

- **Контент/страницы:** url (name, title, description, h1, блоки текста, галереи, шаблон).
- **Регионы/города:** country, region, city.
- **Компания по сайту:** settingcompany (name, adress, phone, logo).
- **Отзывы:** reviews (name, data, txt, phone, files).
- **Каталог/товары:** gotovye-potolki (категории), product_card, base (материалы/цены — к новой БД не привязываем без необходимости).
- **Редиректы/SEO:** в старом дампе в url — old_name/name; отдельной таблицы редиректов нет.

---

## 6. Медиа

- Сейчас: изображения по путям (/images/..., /images/market/..., cat_menu/...).
- Требование: слой Media (логическая сущность) + MediaFile (физический файл/варианты), polymorphic связь с контентом.

---

## 7. SEO и микроразметка

- Сейчас: в данных страниц — metaDescription, title; в старом url — title, description, keywords, h1.
- Требование: управляемые из админки SEO meta (title, description, h1, canonical, robots, og/tw), site-wide настройки, редиректы 301/302, sitemap/robots, JSON-LD (Organization, LocalBusiness, Service, BreadcrumbList, FAQPage).

---

## Чек-лист шага 1

- [x] Зафиксированы все маршруты и типы страниц.
- [x] Выписаны повторяющиеся блоки (типы секций) для page builder.
- [x] Зафиксированы меню (header/footer, вложенность).
- [x] Зафиксированы multi-site и контакты по сайту/городу.
- [x] Учтены сущности из старого дампа без копирования структуры.
- [x] Учтены требования по медиа и SEO/микроразметке.

Далее: **Шаг 2 — финальная модель сущностей и связей (без кода)** → затем миграции и реализация.
