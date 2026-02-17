<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

/**
 * Получить chat_id из последних обновлений бота и сохранить для заявок с форм.
 * Шаги: 1) Напишите боту в Telegram /start. 2) Выполните: php artisan telegram:fetch-and-save-chat-id
 */
class FetchAndSaveFormsChatId extends Command
{
    protected $signature = 'telegram:fetch-and-save-chat-id';

    protected $description = 'Get chat_id from getUpdates (after /start to bot) and save for form leads';

    public function handle(TelegramService $telegram): int
    {
        $token = config('telegram.bot_token');
        if ($token === null || $token === '') {
            $this->error('TELEGRAM_BOT_TOKEN не задан в .env');
            return self::FAILURE;
        }

        $result = $telegram->getUpdates($token);
        if (!($result['success'] ?? false)) {
            $this->error($result['message'] ?? 'Не удалось получить обновления');
            return self::FAILURE;
        }

        $updates = $result['result'] ?? [];
        $chatId = null;
        foreach (array_reverse($updates) as $update) {
            if (isset($update['message']['chat']['id'])) {
                $chatId = (string) $update['message']['chat']['id'];
                break;
            }
        }

        if ($chatId === null) {
            $this->warn('В обновлениях нет сообщений с chat.id. Напишите боту в Telegram команду /start и повторите команду.');
            return self::FAILURE;
        }

        $telegram->setFormsChatIdFromStart($chatId);
        $this->info("Chat ID сохранён: {$chatId}");
        $this->info('Заявки с форм теперь будут отправляться в этот чат.');
        return self::SUCCESS;
    }
}
