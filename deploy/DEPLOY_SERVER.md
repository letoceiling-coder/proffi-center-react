# Развёртывание Proffi Center на сервере 89.169.39.244

- **Домен:** https://proffi-center.ru/ (DNS A → 89.169.39.244)
- **Поддомены:** anapa.proffi-center.ru, stavropol.proffi-center.ru, moscow.proffi-center.ru
- **Сертификаты:** только добавляем новые; существующие на сервере не трогаем.

## Обновление после изменений (город/контакты, правки фронта)

1. **Локально:** закоммитьте и запушьте изменения в репозиторий.
2. **На сервере:**

```bash
ssh root@89.169.39.244
cd /var/www/proffi-center
git pull
bash deploy/update-on-server.sh
```

Скрипт обновит кэш Laravel, соберёт фронт (Vite пишет сразу в `public/build/`) и поправит права. После этого обновите страницу (лучше с Ctrl+F5): https://moscow.proffi-center.ru/ — должны отображаться Москва и правильные контакты.

---

## Текущее состояние (уже сделано на сервере)

- Каталог `/var/www/proffi-center`, проект склонирован из GitHub.
- MySQL: база `proffi_center`, пользователь `proffi` (пароль в `.env` на сервере).
- Миграции выполнены, запущен `ProductionSitesSeeder` (4 сайта: основной + Анапа, Ставрополь, Москва с адресами и телефонами).
- Nginx: конфиг только HTTP (порт 80). **SSL:** после настройки DNS выполнить шаг 7 (certbot).
- Frontend собран, статика в `public/build/assets/`.
- По заголовку `Host: proffi-center.ru` сервер отдаёт 200.

## 1. Подключение и каталог

```bash
ssh root@89.169.39.244
mkdir -p /var/www/proffi-center
cd /var/www/proffi-center
```

## 2. Клонирование и настройка приложения

```bash
git clone https://github.com/letoceiling-coder/proffi-center-react.git .
# или если уже есть папка: git pull
```

## 3. Backend (Laravel)

```bash
cd /var/www/proffi-center
cp .env.example .env
# Отредактировать .env: APP_ENV=production, APP_DEBUG=false, APP_URL=https://proffi-center.ru
# БД: DB_CONNECTION=mysql, DB_DATABASE=proffi_center, DB_USERNAME=proffi, DB_PASSWORD=<ваш_пароль>
# (на сервере уже созданы БД proffi_center и пользователь proffi — при первом деплое пароль см. в .env на сервере или смените его)
php artisan key:generate
export COMPOSER_ALLOW_SUPERUSER=1
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
php artisan storage:link
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

## 4. Миграции и сидеры (БД должна быть создана и прописана в .env)

```bash
php artisan migrate --force
php artisan db:seed --class=BootstrapCmsSeeder --force
php artisan db:seed --class=ProductionSitesSeeder --force
# при необходимости: php artisan db:seed --class=BootstrapContentSeeder --force
```

## 5. Frontend

Vite настроен на вывод в `public/build/` (см. `frontend/vite.config.js`), копирование не нужно.

```bash
cd /var/www/proffi-center/frontend
npm ci --legacy-peer-deps
npm run build
```

## 6. Nginx (сначала только HTTP)

```bash
# На сервере
cp /var/www/proffi-center/deploy/nginx-proffi-center-http-only.conf /etc/nginx/sites-available/proffi-center.ru
ln -sf /etc/nginx/sites-available/proffi-center.ru /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 7. SSL (Certbot — только добавить сертификат)

Перед запуском: в DNS должны быть A-записи для proffi-center.ru и поддоменов на **89.169.39.244**.

**Важно:** только добавляем новый сертификат; существующие на сервере не удаляем и не меняем.

```bash
certbot certonly --nginx -d proffi-center.ru -d www.proffi-center.ru -d anapa.proffi-center.ru -d stavropol.proffi-center.ru -d moscow.proffi-center.ru --non-interactive --agree-tos -m admin@proffi-center.ru
```

Certbot сам добавит в конфиг Nginx блок `listen 443` и пути к сертификатам. Если certbot выдал ошибку (temp_checkpoint и т.п.), повторить команду или выполнить `certbot certonly --nginx` в интерактивном режиме и указать домены.

Проверка после certbot:

```bash
nginx -t && systemctl reload nginx
```

## 8. Проверки

- https://proffi-center.ru/ — главная
- https://anapa.proffi-center.ru/ — сайт Анапы (адрес ул. Омелькова 20 к1, тел. 89996371182)
- https://stavropol.proffi-center.ru/ — Ставрополь (Аграрник 252, 89897625658)
- https://moscow.proffi-center.ru/ — Москва (Боброво ул. Рымская 11/1, 89263383279)
- https://proffi-center.ru/admin — админка
- https://proffi-center.ru/api/v1/site/resolve?host=proffi-center.ru — 200, JSON

## Контакты по городам (из ProductionSitesSeeder)

| Город     | Поддомен                    | Адрес              | Телефон    |
|-----------|-----------------------------|--------------------|------------|
| Анапа     | anapa.proffi-center.ru      | ул. Омелькова 20 к1| 89996371182 |
| Ставрополь| stavropol.proffi-center.ru  | Аграрник 252       | 89897625658 |
| Москва    | moscow.proffi-center.ru     | ул. Рымская 11/1, Боброво | 89263383279 |
