<?php

return [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    /** Юзернейм бота для виджета Telegram Login (например proffi_center_bot). Можно узнать в BotFather или через getMe. */
    'bot_username' => env('TELEGRAM_BOT_USERNAME', 'proffi_center_bot'),
    /** Не используется: заявки уходят всем из telegram_form_subscribers (кто написал боту /start). */
    'forms_chat_id' => env('TELEGRAM_CHAT_ID'),
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL', env('APP_URL') . '/api/telegram/webhook'),
    'webhook' => [
        'allowed_updates' => ['message', 'callback_query'],
        'secret_token' => env('TELEGRAM_WEBHOOK_SECRET'),
        'max_connections' => 40,
    ],
];
