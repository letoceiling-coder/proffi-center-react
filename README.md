# React Proffi

Веб-проект на **Laravel** (API, Sanctum) с публичным сайтом на **React SPA** и админ-панелью на **Vue 3** (Vuex, Vue Router). API версии **v1**: префикс `/api/v1`.

---

## Содержание

- [Требования](#требования)
- [Установка](#установка)
- [Запуск](#запуск)
- [Структура проекта](#структура-проекта)
- [API v1](#api-v1)
- [Админ-панель](#админ-панель)
- [Скрипты](#скрипты)
- [Конфигурация](#конфигурация)
- [Лицензия](#лицензия)

---

## Требования

- **PHP** 8.2+
- **Composer** 2.x
- **Node.js** 18+ и **npm**
- **MySQL** 5.7+ / 8.x (или MariaDB)
- Расширения PHP: `bcmath`, `ctype`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `curl`

---

## Установка

### 1. Клонирование и зависимости

```bash
git clone <url-репозитория> react-proffi
cd react-proffi
composer install
npm install --legacy-peer-deps
```

### 2. Окружение

```bash
cp .env.example .env
php artisan key:generate
```

В `.env` задайте:

- `APP_URL` — URL сайта (например `http://proffi-center.loc`)
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — доступ к MySQL

### 3. База данных

Создайте БД (например в phpMyAdmin или консоли):

```sql
CREATE DATABASE react_proffi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Выполните миграции:

```bash
php artisan migrate
```

### 4. Первый пользователь-админ

Создание пользователя с ролью `admin` (по умолчанию: email `dsc-23@yandex.ru`, пароль `123123123`, имя «Джон Уик»):

```bash
php artisan user:create
```

Интерактивно можно указать email, пароль, имя и роли.

### 5. Сборка фронтенда

**Публичный сайт (React):**

```bash
npm run build:spa
```

**Админка (Vue):**

```bash
npm run build
```

Либо для разработки см. [Запуск](#запуск).

---

## Запуск

### Режим разработки

**Backend (Laravel):**

```bash
php artisan serve
```

API: `http://127.0.0.1:8000`

**Публичный фронтенд (React):**

```bash
cd frontend
npm run dev
```

Сайт: `http://localhost:5173` (Vite проксирует `/api` на Laravel).

**Админка (Vue):** при использовании OSPanel/другого веб-сервера с корнем в `public/` — соберите один раз и открывайте по домену:

```bash
npm run build
```

Админка: `http://<ваш-домен>/admin` (например `http://proffi-center.loc/admin`).

При `php artisan serve` для админки нужен собранный билд (`npm run build`), затем: `http://127.0.0.1:8000/admin`.

### Продакшен

1. `composer install --no-dev`
2. `npm run build` и при необходимости `npm run build:spa`
3. Настройте веб-сервер (Nginx/Apache) на каталог `public/`
4. `php artisan config:cache` и `php artisan route:cache`

---

## Структура проекта

| Часть              | Технологии                    | Описание |
|--------------------|-------------------------------|----------|
| **Backend**        | Laravel 11, Sanctum           | API, БД, миграции, модели, сервисы |
| **Публичный сайт** | React (в `frontend/`)         | SPA на Vite, главная и страницы сайта |
| **Админка**        | Vue 3, Vuex, Vue Router       | Точка входа `resources/js/admin.js`, сборка через Vite |

Основные каталоги:

- `app/` — контроллеры, модели, сервисы, middleware
- `config/` — конфиги (в т.ч. `media.php`, `telegram.php`)
- `database/migrations/` — миграции (users, roles, notifications, bots, folders, media и др.)
- `frontend/` — React SPA
- `resources/js/` — Vue-админка: `admin.js`, `layouts/`, `pages/`, `components/admin/`, `utils/api.js`, `composables/`
- `resources/views/` — `spa.blade.php`, `admin.blade.php`
- `public/` — точка входа веб-сервера; `public/system/` — иконки для раздела «Медиа» (folder.png, basket.png и т.д.)
- `routes/api.php` — маршруты API v1; `routes/web.php` — SPA и админка

---

## API v1

Базовый URL: `/api/v1`. Авторизация: заголовок `Authorization: Bearer <token>` (кроме login/register).

### Общие

| Метод | URL           | Описание |
|-------|----------------|----------|
| GET   | `/ping`        | Проверка API |
| POST  | `/login`       | Вход: `email`, `password` |
| POST  | `/register`    | Регистрация: `name`, `email`, `password`, `password_confirmation` |

### С авторизацией (auth:sanctum)

| Метод | URL                    | Описание |
|-------|------------------------|----------|
| GET   | `/user`                | Текущий пользователь с ролями |
| POST  | `/logout`              | Выход |
| GET   | `/admin/menu`          | Меню админки по ролям |

### Уведомления

| Метод | URL                           | Описание |
|-------|--------------------------------|----------|
| GET   | `/notifications`               | Список для виджета (лимит) |
| GET   | `/notifications/all`           | Полный список с пагинацией и фильтрами |
| POST  | `/notifications/{id}/read`     | Отметить прочитанным |
| DELETE| `/notifications/{id}`          | Удалить |
| GET   | `/notifications/unread-count` | Количество непрочитанных |

### Папки (Медиа)

| Метод | URL                              | Описание |
|-------|-----------------------------------|----------|
| GET   | `/folders`                        | Список папок |
| GET   | `/folders/tree/all`               | Дерево папок |
| POST  | `/folders`                        | Создать папку |
| PUT   | `/folders/{id}`                   | Обновить |
| DELETE| `/folders/{id}`                   | Удалить (в корзину) |
| POST  | `/folders/{id}/restore`           | Восстановить |
| POST  | `/folders/update-positions`       | Обновить порядок |

### Медиафайлы

| Метод | URL                      | Описание |
|-------|---------------------------|----------|
| GET   | `/media`                  | Список с пагинацией, фильтр по папке |
| POST  | `/media`                  | Загрузка файла (multipart, `file`, `folder_id`) |
| GET   | `/media/{id}`             | Один файл |
| PUT   | `/media/{id}`             | Обновить (в т.ч. перенос в папку) |
| DELETE| `/media/{id}`              | В корзину |
| POST  | `/media/{id}/restore`     | Восстановить |
| DELETE| `/media/trash/empty`       | Очистить корзину |

### Только для роли admin (middleware admin)

| Метод | URL                                | Описание |
|-------|-------------------------------------|----------|
| GET/POST/PUT/DELETE | `/roles`              | Роли |
| GET/POST/PUT/DELETE | `/users`              | Пользователи |
| GET/POST/PUT/DELETE | `/bots`               | Боты |
| GET   | `/bots/{id}/check-webhook`           | Проверка webhook |
| POST  | `/bots/{id}/register-webhook`       | Регистрация webhook |

Вне префикса v1:

- `POST /api/telegram/webhook/{id}` — webhook для Telegram-бота (без Sanctum).

---

## Админ-панель

- **URL:** `/admin` (вход: `/admin`, после логина — маршруты Vue).
- **Стек:** Vue 3, Vuex, Vue Router, Vite, Tailwind CSS, Axios, SweetAlert2, vue-advanced-cropper, fslightbox-vue.

### Страницы (по меню)

| Пункт меню   | Маршрут        | Роли доступа      |
|--------------|----------------|-------------------|
| Панель управления | `/`        | все авторизованные |
| Медиа        | `/admin/media` | admin, manager    |
| Уведомления  | `/admin/notifications` | admin, manager, user |
| Пользователи | `/admin/users` | admin             |
| Роли         | `/admin/roles` | admin             |
| Боты         | `/admin/bots`  | admin             |

Меню отдаётся с бэкенда (`/api/v1/admin/menu`) в зависимости от ролей пользователя.

### Первый вход

1. Выполните `php artisan user:create` (см. [Установка](#установка)).
2. Откройте `/admin`, введите email и пароль созданного пользователя.

### Сборка админки

```bash
npm run build
```

Точка входа — `resources/js/admin.js`. Собранные файлы попадают в `public/build/`. Иконки для раздела «Медиа» лежат в `public/system/` (folder.png, basket.png, document.png, video.png, music.png, no-image.png, no-user.jpg).

---

## Скрипты

### npm (корень проекта)

| Команда              | Описание |
|----------------------|----------|
| `npm run build`      | Сборка Laravel Vite (CSS, app.js, admin.js) |
| `npm run dev`        | Vite dev-сервер для Laravel assets |
| `npm run build:spa`  | Сборка React SPA в `frontend/` и копирование в `public/` |

### Artisan

| Команда                | Описание |
|------------------------|----------|
| `php artisan migrate`  | Выполнить миграции |
| `php artisan user:create` | Создать пользователя (в т.ч. админа) |
| `php artisan storage:link` | Симлинк `public/storage` → `storage/app/public` (если нужен) |

---

## Конфигурация

- **Медиа:** `config/media.php` — лимиты размера, MIME-типы, пагинация.
- **Telegram:** `config/telegram.php` — настройки ботов (при использовании раздела «Боты» и webhook).

Переменные окружения (по необходимости): `MEDIA_MAX_SIZE_KB`, `MEDIA_ALLOW_ALL_TYPES`, а также стандартные Laravel и БД.

---

## Лицензия

Проект может содержать код Laravel и других компонентов под лицензией MIT. См. соответствующие файлы и пакеты.
