<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

class RegisterFormsTelegramWebhook extends Command
{
    protected $signature = 'telegram:register-forms-webhook';
    protected $description = 'Register webhook for forms bot (TELEGRAM_BOT_TOKEN).';

    public function handle(TelegramService $telegram): int
    {
        $token = config('telegram.bot_token');
        if (empty($token)) {
            $this->error('TELEGRAM_BOT_TOKEN is not set in .env');
            return 1;
        }

        $url = url('/api/telegram/forms-webhook');
        $options = [
            'allowed_updates' => ['message', 'callback_query'],
        ];
        if ($secret = config('telegram.webhook.secret_token')) {
            $options['secret_token'] = $secret;
        }

        $result = $telegram->setWebhook($token, $url, $options);
        if ($result['success'] ?? false) {
            $this->info('Webhook registered: ' . $url);
            return 0;
        }
        $this->error($result['message'] ?? 'Failed to set webhook');
        return 1;
    }
}
