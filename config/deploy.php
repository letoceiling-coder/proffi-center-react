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
        'php artisan db:seed --class=VidyPotolkovPagesSeeder --force',
        'npm install --legacy-peer-deps',
        'npm run build',
        'cd frontend && npm install --legacy-peer-deps && npm run build && cd ..',
        'php artisan config:clear',
        'php artisan config:cache',
        'php artisan route:cache',
        'php artisan view:cache',
        'php artisan optimize',
    ],
];
