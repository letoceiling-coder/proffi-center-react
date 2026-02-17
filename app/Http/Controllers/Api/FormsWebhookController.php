<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook для бота заявок (токен из .env TELEGRAM_BOT_TOKEN).
 * Обрабатывает /start и callback_query для модерации отзывов.
 */
class FormsWebhookController extends Controller
{
    public function __construct(
        protected TelegramService $telegram
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $token = config('telegram.bot_token');
        if (empty($token)) {
            Log::warning('Forms webhook: TELEGRAM_BOT_TOKEN not set');
            return response()->json(['ok' => true], 200);
        }

        $secret = config('telegram.webhook.secret_token');
        if ($secret && $request->header('X-Telegram-Bot-Api-Secret-Token') !== $secret) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $update = $request->all();

        if (isset($update['message'])) {
            $this->handleMessage($token, $update['message']);
        }
        if (isset($update['callback_query'])) {
            $this->handleCallbackQuery($token, $update['callback_query']);
        }

        return response()->json(['ok' => true], 200);
    }

    private function handleMessage(string $token, array $message): void
    {
        $chatId = $message['chat']['id'] ?? null;
        $text = trim($message['text'] ?? '');
        if ($chatId === null || $text === '') {
            return;
        }

        if ($text === '/start' || str_starts_with($text, '/start')) {
            $this->telegram->setFormsChatIdFromStart($chatId);
            $username = $message['from']['username'] ?? $message['from']['first_name'] ?? 'гость';
            $firstName = $message['from']['first_name'] ?? '';
            $display = $firstName ?: ($username !== 'гость' ? '@' . $username : 'гость');
            $welcome = "👋 Привет, " . $display . "!\n\nЯ бот для получения заявок с сайта proffi-center.ru.\nЭтот чат зарегистрирован: сюда будут приходить все заявки с форм и отзывы на модерацию.";
            $this->telegram->sendMessage($token, $chatId, $welcome);
        }
    }

    private function handleCallbackQuery(string $token, array $callback): void
    {
        $id = $callback['id'] ?? null;
        $data = $callback['data'] ?? '';
        $chatId = $callback['message']['chat']['id'] ?? null;
        $messageId = $callback['message']['message_id'] ?? null;

        if ($id === null) {
            return;
        }

        if (str_starts_with($data, 'review_')) {
            $parts = explode('_', $data);
            if (count($parts) >= 3) {
                $action = $parts[1]; // approve | reject
                $reviewId = (int) $parts[2];
                $review = Review::find($reviewId);
                if ($review) {
                    if ($action === 'approve') {
                        $review->update(['status' => 'published', 'published_at' => $review->published_at ?? now()]);
                        $this->telegram->answerCallbackQuery($token, $id, ['text' => 'Отзыв опубликован']);
                    } else {
                        $review->delete();
                        $this->telegram->answerCallbackQuery($token, $id, ['text' => 'Отзыв отклонён']);
                    }
                    if ($chatId !== null && $messageId !== null) {
                        $this->telegram->editMessageReplyMarkup($token, $chatId, $messageId, ['inline_keyboard' => []]);
                    }
                } else {
                    $this->telegram->answerCallbackQuery($token, $id, ['text' => 'Отзыв не найден']);
                }
            }
        } else {
            $this->telegram->answerCallbackQuery($token, $id);
        }
    }
}
