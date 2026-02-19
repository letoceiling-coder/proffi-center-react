# Production Deploy: Laravel + React

Один домен: Laravel отдаёт и API (`/api`), и SPA (HTML из `public/`, статика из `public/build`, `public/css`, `public/images`). Отдельного проксирования «/ на фронт» не требуется — всё обслуживает один entry point (`public/index.php`).

---

## 0) Команда `php artisan deploy`

Полный деплой одной командой (локально):

1. **Коммит и push** — все изменения коммитятся и отправляются в git.
2. **По SSH на сервер** — обновление из git, `composer install`, миграции, `npm install` и сборка админки (root) и фронта (`frontend/`), сброс кэша Laravel.

**Настройка в .env:**

- `DEPLOY_SSH_HOST` — хост сервера (например `89.169.39.244`).
- `DEPLOY_SSH_USER` — пользователь SSH (по умолчанию `root`).
- `DEPLOY_SERVER_PATH` — путь к проекту на сервере (по умолчанию `/var/www/proffi-center`).
- `DEPLOY_BRANCH` — ветка (по умолчанию `main`).

**Запуск:**

```bash
php artisan deploy                    # коммит, push, обновление на сервере
php artisan deploy --message="fix"    # свой текст коммита
php artisan deploy --server-only     # только команды на сервере (без git)
php artisan deploy --no-commit        # не пушить (только коммит локально + сервер)
php artisan deploy --dry-run          # показать команды, не выполнять
```

Требуется доступ по SSH без пароля (ключ). На сервере должны быть установлены git, PHP, Composer, Node.js, npm.

### Калькулятор по маршруту /calc

Приложение из репозитория [cieling-calc](https://github.com/letoceiling-coder/cieling-calc) лежит в папке `calc/` и отдаётся по адресу **/calc**. При выполнении `php artisan deploy` на сервере автоматически запускаются: сборка в `calc/` (`npm install --legacy-peer-deps`, `npm run build`) и копирование `calc/dist/` и `calc/public/` в `public/calc/`. Ручная пересборка не требуется.

---

## 1) Backend

### .env (production)

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://your-domain.com` (без слэша в конце)
- `APP_KEY=` — должен быть задан (`php artisan key:generate`)
- БД: `DB_CONNECTION`, `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- При использовании Sanctum для админки: `SANCTUM_STATEFUL_DOMAINS=your-domain.com` (при необходимости)
- **Telegram (заявки с форм):**
  - `TELEGRAM_BOT_TOKEN` — токен бота от @BotFather (обязателен).
  - **TELEGRAM_CHAT_ID не нужен.** Получатели заявок — все, кто написал боту в Telegram команду **/start** (сохраняются в таблицу `telegram_form_subscribers`). Каждому подписчику приходят заявки с форм и отзывы на модерацию.
  - Зарегистрируйте webhook: `php artisan telegram:register-forms-webhook`. После этого при /start пользователь добавляется в подписчики.
  - Проверка: `php artisan telegram:forms-status` — покажет число подписчиков.
  - Сервер должен иметь доступ к `api.telegram.org` (443).
  - **Если заявки не приходят в бот** — смотрите логи: `storage/logs/laravel.log`. Сообщения с префиксом `[Forms]`: «Заявка получена» (запрос дошёл), «503: TELEGRAM_BOT_TOKEN не задан», «503: Нет получателей» (никто не писал боту /start или не задан TELEGRAM_CHAT_ID), «Не удалось отправить в Telegram» (ошибка API Telegram: chat not found, bot blocked и т.д.). На сервере выполните: `php artisan telegram:forms-status` — если подписчиков 0, напишите боту в Telegram **/start** и повторите команду.

### Команды (по порядку)

```bash
# Из корня проекта (Laravel)
cd /path/to/react-proffi

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

php artisan storage:link
```

### Права на каталоги

- `storage/` и все вложенные — запись для веб-сервера (например `775`, владелец — пользователь PHP-FPM).
- `bootstrap/cache/` — запись для веб-сервера (например `775`).

Пример (Linux, пользователь веб-сервера `www-data`):

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

---

## 2) Frontend

### Сборка

- **VITE_API_BASE_URL** в production:
  - Если фронт и API на одном домене (типичный случай) — оставить **пустым** в `frontend/.env.production` или не задавать (запросы идут на тот же origin).
  - Если API на другом домене — задать полный URL, например: `VITE_API_BASE_URL=https://api.your-domain.com`

Сборка и копирование в `public`:

```bash
cd frontend

# При конфликте peer-зависимостей
npm install --legacy-peer-deps

# Сборка (в frontend/dist)
npm run build
```

После сборки нужно, чтобы в `public/build/assets/` лежали файлы **index-*.js** и **index-*.css** (их подключает `resources/views/spa.blade.php`). Если Vite кладёт сборку в `frontend/dist/`, скопируйте их вручную:

```bash
cp frontend/dist/assets/index-*.js frontend/dist/assets/index-*.css public/build/assets/
```

Либо настройте в `frontend/vite.config.js` вывод сразу в `public/build` (например `build.outDir: '../public/build'` и при необходимости `base: '/build/'`), тогда копирование не нужно.

---

## 3) Nginx

- **root** — каталог `public` Laravel-приложения.
- Все запросы, которые не являются существующими файлами/каталогами, передаются в `index.php` (стандартная схема Laravel).
- **/api** обрабатывается тем же приложением (отдельный location не обязателен).

Подставьте свой домен и путь к проекту.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    root /path/to/react-proffi/public;

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;   # или 127.0.0.1:9000
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 60;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

Для HTTPS добавьте свой `listen 443 ssl` и параметры сертификатов.

---

## 4) 500 Server Error — просмотр логов

Если главная или другие страницы отдают 500:

1. **Логи Laravel** (на сервере):
   ```bash
   tail -100 /var/www/proffi-center/storage/logs/laravel.log
   ```
   В конце файла будет стек последней ошибки (например, из шаблона `spa.blade.php` или конфига).

2. **Сброс кэша представлений** (часто помогает после правок в blade):
   ```bash
   cd /var/www/proffi-center
   php artisan view:clear
   php artisan config:clear
   ```

3. **Проверка .env:** убедитесь, что заданы `APP_URL=https://proffi-center.ru` (без слэша в конце), `APP_KEY`, параметры БД.

---

## 5) Проверки после деплоя

| Проверка | URL / Действие |
|----------|----------------|
| Главная (нет 500) | Открыть `https://your-domain.com/` |
| Админка | Открыть `https://your-domain.com/admin` — форма входа |
| API site resolve | `GET https://your-domain.com/api/v1/site/resolve?host=your-domain.com` → 200, JSON с `site` |
| Фронт (SPA) | Открыть `https://your-domain.com/` — главная, меню, без белого экрана |
| robots.txt | `GET https://your-domain.com/api/v1/robots.txt?host=your-domain.com` → 200, text/plain |
| sitemap.xml | `GET https://your-domain.com/api/v1/sitemap.xml?host=your-domain.com` → 200, application/xml |

Команды для быстрой проверки (подставьте домен):

```bash
curl -s -o /dev/null -w "%{http_code}" "https://your-domain.com/admin"
curl -s -o /dev/null -w "%{http_code}" "https://your-domain.com/api/v1/site/resolve?host=your-domain.com"
curl -s -o /dev/null -w "%{http_code}" "https://your-domain.com/api/v1/robots.txt?host=your-domain.com"
curl -s -o /dev/null -w "%{http_code}" "https://your-domain.com/api/v1/sitemap.xml?host=your-domain.com"
```

Ожидаемый код ответа — **200**.

---

## Краткий чеклист

- [ ] `.env`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, БД
- [ ] `php artisan config:cache` … `optimize` и `storage:link`
- [ ] Права на `storage/` и `bootstrap/cache/`
- [ ] `frontend`: `npm install` (при необходимости `--legacy-peer-deps`), `npm run build`
- [ ] Файлы `index-*.js` и `index-*.css` в `public/build/assets/`
- [ ] Nginx: root = `.../public`, `try_files` в `index.php`
- [ ] Проверки: /admin, /api/v1/site/resolve, главная, robots.txt, sitemap.xml
