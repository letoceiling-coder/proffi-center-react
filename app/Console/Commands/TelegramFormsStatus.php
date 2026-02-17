<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Показать статус настройки Telegram для заявок с форм и команду для исправления.
 */
class TelegramFormsStatus extends Command
{
    protected $signature = 'telegram:forms-status';

    protected $description = 'Show Telegram forms config status and fix instructions';

    public function handle(TelegramService $telegram): int
    {
        $token = config('telegram.bot_token');
        $tokenOk = $token !== null && trim((string) $token) !== '';
        $chatIdFromEnv = config('telegram.forms_chat_id');
        $chatIdEnvOk = $chatIdFromEnv !== null && trim((string) $chatIdFromEnv) !== '';
        $filePath = storage_path('app/' . TelegramService::FORMS_CHAT_ID_FILE);
        $fileExists = Storage::disk('local')->exists(TelegramService::FORMS_CHAT_ID_FILE);
        $chatIdFromFile = null;
        if ($fileExists) {
            $chatIdFromFile = trim(Storage::disk('local')->get(TelegramService::FORMS_CHAT_ID_FILE) ?: '');
        }
        $effectiveChatId = $telegram->getFormsChatId();

        $this->line('--- Telegram: заявки с форм ---');
        $this->line('TELEGRAM_BOT_TOKEN: ' . ($tokenOk ? 'задан' : 'НЕ ЗАДАН'));
        $this->line('TELEGRAM_CHAT_ID ( .env ): ' . ($chatIdEnvOk ? 'задан' : 'не задан / пустой'));
        $this->line('Файл ' . TelegramService::FORMS_CHAT_ID_FILE . ': ' . ($fileExists ? 'есть' : 'отсутствует'));
        if ($effectiveChatId !== null) {
            $this->line('Используемый chat_id: ' . $effectiveChatId);
            $this->info('Настройка в порядке, заявки должны уходить в бот.');
            return self::SUCCESS;
        }

        $this->newLine();
        $this->warn('Chat ID не задан — заявки с форм не отправляются в Telegram (API возвращает 503).');
        $this->newLine();
        $this->line('Как исправить:');
        $this->line('1) Напишите вашему боту в Telegram команду /start.');
        $this->line('2) Узнайте chat_id: откройте в браузере (подставьте токен из .env):');
        $this->line('   https://api.telegram.org/bot<ТОКЕН>/getUpdates');
        $this->line('   В ответе найдите "chat":{"id":123456789} — это ваш chat_id.');
        $this->newLine();
        $this->line('3) На сервере выполните (подставьте свой chat_id):');
        $this->info('   php artisan telegram:set-forms-chat-id 123456789');
        $this->newLine();
        $this->line('   Либо задайте в .env: TELEGRAM_CHAT_ID=123456789');
        $this->line('   Затем: php artisan config:clear && php artisan config:cache');
        $this->newLine();
        return self::FAILURE;
    }
}
