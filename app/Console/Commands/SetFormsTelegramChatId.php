<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

/**
 * Установить chat_id для заявок с форм (если в .env TELEGRAM_CHAT_ID пуст).
 * После запуска заявки начнут уходить в указанный чат.
 * Пример: php artisan telegram:set-forms-chat-id 123456789
 */
class SetFormsTelegramChatId extends Command
{
    protected $signature = 'telegram:set-forms-chat-id {chat_id : ID чата (число или -1001234567890 для группы)}';

    protected $description = 'Save Telegram chat ID for form leads (when TELEGRAM_CHAT_ID is not set in .env)';

    public function handle(TelegramService $telegram): int
    {
        $chatId = (string) $this->argument('chat_id');
        if ($chatId === '') {
            $this->error('chat_id не может быть пустым.');
            return self::FAILURE;
        }

        $telegram->setFormsChatIdFromStart($chatId);
        $path = storage_path('app/' . TelegramService::FORMS_CHAT_ID_FILE);
        $this->info("Chat ID сохранён в {$path}");
        $this->info('Новые заявки с форм будут отправляться в этот чат (если TELEGRAM_CHAT_ID в .env пуст).');
        return self::SUCCESS;
    }
}
