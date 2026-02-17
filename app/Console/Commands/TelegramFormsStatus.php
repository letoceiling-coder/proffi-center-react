<?php

namespace App\Console\Commands;

use App\Models\TelegramFormSubscriber;
use Illuminate\Console\Command;

/**
 * Показать статус настройки Telegram для заявок с форм.
 * Подписчики — все, кто написал боту /start (таблица telegram_form_subscribers).
 */
class TelegramFormsStatus extends Command
{
    protected $signature = 'telegram:forms-status';

    protected $description = 'Show Telegram forms config status (subscribers = who sent /start to bot)';

    public function handle(): int
    {
        $token = config('telegram.bot_token');
        $tokenOk = $token !== null && trim((string) $token) !== '';
        $chatIds = TelegramFormSubscriber::allChatIds();
        $count = count($chatIds);

        $this->line('--- Telegram: заявки с форм ---');
        $this->line('TELEGRAM_BOT_TOKEN: ' . ($tokenOk ? 'задан' : 'НЕ ЗАДАН'));
        $this->line('Подписчиков (написали боту /start): ' . $count);

        if (!$tokenOk) {
            $this->warn('Задайте TELEGRAM_BOT_TOKEN в .env');
            return self::FAILURE;
        }

        if ($count === 0) {
            $this->warn('Нет подписчиков — заявки не уйдут в бот (API вернёт 503).');
            $this->line('Чтобы получать заявки: напишите боту в Telegram команду /start.');
            return self::FAILURE;
        }

        $this->info('Всё настроено. Заявки отправляются всем ' . $count . ' подписчикам.');
        return self::SUCCESS;
    }
}
