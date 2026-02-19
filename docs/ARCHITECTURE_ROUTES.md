# Архитектура маршрутов и приложений (proffi-center-react)

Репозиторий: **https://github.com/letoceiling-coder/proffi-center-react** — единственный источник. Калькулятор `/calc` входит в этот репозиторий как папка `calc/` (не отдельный репозиторий cieling-calc).

---

## 1. Маршруты (порядок важен)

Запрос обрабатывается **первым совпавшим** маршрутом. Специфичные маршруты должны быть объявлены **до** общих (например, до `/{slug}`).

### 1.1. Служебные и статика
| Метод | Путь | Обработчик | Описание |
|-------|------|------------|----------|
| GET | `/robots.txt` | RobotsController | Для поисковиков |
| GET | `/sitemap.xml` | SitemapController | Карта сайта |

### 1.2. API (Laravel)
- Префикс **`/api`**: маршруты из `routes/api.php` (API v1 под `/api/v1`, telegram webhook, forms, и т.д.).
- Маршруты **`/api/calc/*`** (auth для калькулятора) объявлены в **web.php** (сессия), не в api.php.

### 1.3. Калькулятор (Vue SPA)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/calc` | Редирект или index калькулятора |
| GET | `/calc/` | `public/calc/index.html` |
| GET | `/calc/{path}` | Статика из `public/calc/` или index.html (SPA fallback) |

- **Контент:** собранное приложение из `calc/` (Vite) → `calc/dist/` → копируется в `public/calc/`.
- **Лейаут:** свой (один `index.html` в `public/calc/`), без общего Laravel layout.

### 1.4. Админ-панель (Vue SPA)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/admin` | Blade `admin` → один HTML, Vue монтируется в `#admin-app` |
| GET | `/admin/login` | То же view |
| GET | `/admin/{any}` | То же view (клиентский роутинг Vue) |

- **Лейаут:** `resources/views/admin.blade.php` (подключает Vite/build админки из `public/build/`).

### 1.5. Публичный сайт (React SPA + SEO)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Главная: SEO-контент + layout для React |
| GET | `/uslugi/{slug}` | Услуга: SEO + layout |
| GET | `/{pathKey}` | Статические пути (o-kompanii, gde-zakazat-potolki и т.д.) из ServerSeoService |
| GET | `/{slug}` | Страница по slug из CMS или fallback для SPA |
| GET | `/{any}` | Fallback: layout `seo-spa` для React SPA (клиентский роутинг) |

- **Лейаут:** `resources/views/layouts/seo-spa.blade.php` (SEO meta + скрипты/стили из `public/build/` для React).

### 1.6. Auth для калькулятора (сессия)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/auth/telegram-callback` | Callback Telegram Login → сессия → редирект на `/calc/` |
| GET | `/api/calc/config` | Публичный конфиг (bot username) |
| GET | `/api/calc/me` | Текущий пользователь из сессии |
| POST | `/api/calc/logout` | Выход |

---

## 2. Почему порядок маршрутов ломал сайт

Если в `web.php` маршрут **`/{slug}`** (showPage) идёт **раньше** маршрутов `/admin` и `/calc`:

- Запрос `GET /admin` совпадает с `/{slug}` (slug = `admin`) → Laravel вызывает `showPage('admin')` → 404 или страница из CMS.
- Аналогично `GET /calc` совпадает с `/{slug}` (slug = `calc`).

**Исправление:** объявлять маршруты `/auth/*`, `/api/calc/*`, `/calc`, `/calc/`, `/calc/*`, `/admin`, `/admin/*` **до** маршрута `/{slug}` и до fallback `/{any}`.

---

## 3. Сводка по лейаутам (без конфликтов)

| Приложение | URL | Layout / точка входа | Сборка |
|------------|-----|------------------------|--------|
| Публичный сайт (React) | `/`, `/uslugi/*`, `/{slug}`, fallback | `layouts.seo-spa` → `public/build/` (index-*.js) | `frontend/`: npm run build |
| Админ-панель (Vue) | `/admin`, `/admin/*` | `admin.blade.php` → `@vite` → `public/build/` (admin.js, manifest.json) | Корень: npm run build (Laravel Vite) |
| Калькулятор (Vue) | `/calc`, `/calc/`, `/calc/*` | `public/calc/index.html` (свой лейаут) | `calc/`: npm run build → копировать в `public/calc/` |

- **API** — префикс `/api`, не конфликтует с маршрутами выше. Калькулятор дергает только тот же origin (например `/api/calc/me`, `/api/calc/rooms`), без Mixed Content.
- Порядок деплоя: сначала корень `npm run build` (админка), затем `frontend` (React), затем `calc` и копирование в `public/calc/`. Если frontend перезаписывает `public/build/`, нужно либо выносить React-билд в отдельную папку, либо собирать админку после frontend.

---

## 4. API Laravel

- **Файл:** `routes/api.php`. Префикс URL по умолчанию: **`/api`**.
- Публичные эндпоинты: `/api/v1/ping`, `/api/v1/site/resolve`, меню, страницы, формы и т.д.
- С авторизацией (Sanctum): `/api/v1/user`, `/api/v1/logout`, CMS, медиа, уведомления и т.д.
- Вне v1: `/api/telegram/webhook/{id}`, `/api/telegram/forms-webhook`.
- Эндпоинты `/api/calc/*` для калькулятора (сессия) объявлены в **web.php**, чтобы использовать middleware `web` (cookie, session).

---

## 5. Деплой (calc как часть proffi-center-react)

1. Клонировать только **proffi-center-react**.
2. На сервере: `git pull`, затем в корне проекта:
   - `composer install`, `npm install`, `npm run build` (Laravel + админка),
   - `cd frontend && npm run build` (React SPA при необходимости),
   - для калькулятора: `cd calc && npm install --legacy-peer-deps && npm run build`, затем копирование `calc/dist/*` и `calc/public/*` в `public/calc/`.
3. `php artisan config:clear`, `php artisan config:cache`, `php artisan route:cache`.

Калькулятор **не** подключается как отдельный репозиторий (cieling-calc); он встроен в proffi-center-react.

---

## 6. Что сделать на сервере после правок (если всё «сломалось»)

1. **Обновить код:**  
   `cd /var/www/proffi-center && git fetch origin && git reset --hard origin/main`

2. **Зависимости и сборки:**  
   `composer install --no-dev --optimize-autoloader`  
   `npm install --legacy-peer-deps && npm run build`  
   `cd frontend && npm install --legacy-peer-deps && npm run build && cd ..`  
   Для калькулятора:  
   `cd calc && npm install --legacy-peer-deps && npm run build && cd ..`  
   `rm -rf public/calc && mkdir -p public/calc && cp -r calc/dist/* public/calc/ && cp -r calc/public/* public/calc/`

3. **Кэш Laravel:**  
   `php artisan config:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache`

4. **Права (при необходимости):**  
   `chown -R www-data:www-data storage bootstrap/cache public/calc public/build`  
   `chmod -R a+rX public/calc`

5. **Перезапуск PHP-FPM (при необходимости):**  
   `systemctl reload php8.3-fpm` или `systemctl reload php-fpm`

После этого должны корректно открываться: `/`, `/admin`, `/calc/`, а API — по префиксу `/api`.
