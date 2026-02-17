#!/bin/bash
# Запускать на сервере 89.169.39.244 после git pull.
# Использование: cd /var/www/proffi-center && bash deploy/update-on-server.sh

set -e
cd /var/www/proffi-center

echo "=== Backend: cache ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

echo "=== Frontend: build ==="
cd frontend
npm ci --legacy-peer-deps
npm run build
cd ..

echo "=== Права (если нужно) ==="
chown -R www-data:www-data storage bootstrap/cache public/build 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "=== Готово. Проверьте: https://moscow.proffi-center.ru/ ==="
