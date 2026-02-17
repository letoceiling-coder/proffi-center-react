# Изображения с proffi-center.ru (1:1)

Все изображения для главной страницы, страниц комнат, галереи и отзывов скачиваются с https://proffi-center.ru/template/globalTemplate/images/

## Как скачать все фото заново

Из **корня проекта** выполнить:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/download-images.ps1
```

Скрипт создаёт при необходимости каталоги и сохраняет файлы в `public/images/` (и подкаталоги `otz/`, `potolki/`, `cat_menu/`, `market/`).

## Что скачивается

- **Корень** `public/images/`: logo.png, m_gerb.png, mmenu.png, m_close.png, trubka.png, index_banner.jpg, l1.jpg–l6.jpg, cont.jpg, par.jpg, pk-5.jpg, dv.jpg, sp8.jpg, potolok2_1.jpg–potolok2_6.jpg, meter2.jpg, opr.jpg, f_star.png, t_star.png, 1.jpg–13.jpg (галерея), to(1).jpg, rub4.png, rub5.png, кнопки и декор (yellow_btn, blue_btn, red_lenta и т.д.), buy_b1.png–buy_b5.png и др.
- **otz/** — otz.png (аватар отзывов).
- **potolki/** — potolok2_1.jpg–potolok2_6.jpg (фото для блоков «Потолки в прихожую/гостиную/…» и страниц комнат).
- **cat_menu/**, **market/** — доп. изображения шаблона.

На оригинальном сайте один файл может возвращать 404 (btn_blue.png) — его в скрипте можно закомментировать или заменить заглушкой.

## Использование в приложении

- Главная: `mockPageData.js` — linkBlocks, bannerData, potolki2Data, galleryData, reviewsData, zamerBlocks, prTableData (звёзды).
- Страницы комнат: `roomPagesData.js` — heroImage и gallery (пути `/images/potolki/...` и `/images/1.jpg` и т.д.).
- Header/Menu: logo, m_gerb, mmenu, m_close, trubka из `/images/`.

Все пути в коде — от корня сайта, например `/images/index_banner.jpg`, `/images/potolki/potolok2_1.jpg`.
