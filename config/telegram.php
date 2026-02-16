<?php

return [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL', env('APP_URL') . '/api/telegram/webhook'),
    'webhook' => [
        'allowed_updates' => ['message', 'callback_query'],
        'secret_token' => env('TELEGRAM_WEBHOOK_SECRET'),
        'max_connections' => 40,
    ],
];
