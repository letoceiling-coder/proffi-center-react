<?php

return [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    /** ID чата/группы, куда бот отправляет заявки с форм (только из .env, не в git). */
    'forms_chat_id' => env('TELEGRAM_CHAT_ID'),
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL', env('APP_URL') . '/api/telegram/webhook'),
    'webhook' => [
        'allowed_updates' => ['message', 'callback_query'],
        'secret_token' => env('TELEGRAM_WEBHOOK_SECRET'),
        'max_connections' => 40,
    ],
];
