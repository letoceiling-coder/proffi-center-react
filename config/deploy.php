<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SSH-подключение к серверу
    |--------------------------------------------------------------------------
    */
    'ssh_host' => env('DEPLOY_SSH_HOST', ''),
    'ssh_user' => env('DEPLOY_SSH_USER', 'root'),
    'server_path' => env('DEPLOY_SERVER_PATH', '/var/www/proffi-center'),

    /*
    |--------------------------------------------------------------------------
    | Ветка для push и pull
    |--------------------------------------------------------------------------
    */
    'branch' => env('DEPLOY_BRANCH', 'main'),

    /*
    |--------------------------------------------------------------------------
    | Команды на сервере (выполняются по порядку)
    |--------------------------------------------------------------------------
    */
    'server_commands' => [
        'cd {path}',
        'git fetch origin',
        'git reset --hard origin/{branch}',
        'composer install --no-dev --optimize-autoloader',
        'php artisan migrate --force',
        'npm install --legacy-peer-deps',
        'npm run build',
        'cd frontend && npm install --legacy-peer-deps && npm run build && cd ..',
        'if [ -d calc ] && [ -f calc/package.json ]; then cd calc && npm install --legacy-peer-deps && npm run build && cd .. && rm -rf public/calc && mkdir -p public/calc && cp -r calc/dist/* public/calc/ && cp -r calc/public/* public/calc/; fi',
        'php artisan config:clear',
        'php artisan config:cache',
        'php artisan route:clear',
        'php artisan route:cache',
        'php artisan view:clear',
        'php artisan view:cache',
        'php artisan optimize',
        // Сброс opcache: без перезагрузки PHP-FPM сервер может отдавать старый код middleware
        'systemctl reload php8.3-fpm 2>/dev/null || systemctl reload php-fpm 2>/dev/null || true',
    ],
];
