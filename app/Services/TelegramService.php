<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TelegramService
{
    protected string $apiBaseUrl = 'https://api.telegram.org/bot';

    /** Имя файла, куда сохраняется chat_id при команде /start (если TELEGRAM_CHAT_ID не задан в .env). */
    public const FORMS_CHAT_ID_FILE = 'telegram_forms_chat_id.txt';

    /**
     * Chat ID для отправки заявок с форм: из .env TELEGRAM_CHAT_ID или сохранённый при /start.
     */
    public function getFormsChatId(): ?string
    {
        $chatId = config('telegram.forms_chat_id');
        if ($chatId !== null && $chatId !== '') {
            return is_string($chatId) ? trim($chatId) : (string) $chatId;
        }
        try {
            if (Storage::disk('local')->exists(self::FORMS_CHAT_ID_FILE)) {
                $stored = trim(Storage::disk('local')->get(self::FORMS_CHAT_ID_FILE) ?: '');
                return $stored !== '' ? $stored : null;
            }
        } catch (\Throwable $e) {
            Log::warning('Telegram getFormsChatId: ' . $e->getMessage());
        }
        return null;
    }

    /**
     * Сохранить chat_id как получателя заявок (вызывается при /start в боте).
     */
    public function setFormsChatIdFromStart(int|string $chatId): void
    {
        try {
            Storage::disk('local')->put(self::FORMS_CHAT_ID_FILE, (string) $chatId);
        } catch (\Throwable $e) {
            Log::warning('Telegram setFormsChatIdFromStart: ' . $e->getMessage());
        }
    }

    public function getBotInfo(string $token): array
    {
        try {
            $response = Http::timeout(10)->get($this->apiBaseUrl . $token . '/getMe');
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'data' => $data['result'] ?? []];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Неизвестная ошибка'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram getBotInfo error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Ошибка: ' . $e->getMessage()];
        }
    }

    public function setWebhook(string $token, string $url, array $options = []): array
    {
        try {
            $params = array_merge(['url' => $url], $options);
            $response = Http::timeout(10)->post($this->apiBaseUrl . $token . '/setWebhook', $params);
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'message' => 'Webhook успешно установлен', 'data' => $data['result'] ?? []];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Не удалось установить webhook'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram setWebhook error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Ошибка: ' . $e->getMessage()];
        }
    }

    public function getWebhookInfo(string $token): array
    {
        try {
            $response = Http::timeout(10)->get($this->apiBaseUrl . $token . '/getWebhookInfo');
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    $webhookInfo = $data['result'] ?? [];
                    return [
                        'success' => true,
                        'data' => [
                            'url' => $webhookInfo['url'] ?? null,
                            'has_custom_certificate' => $webhookInfo['has_custom_certificate'] ?? false,
                            'pending_update_count' => $webhookInfo['pending_update_count'] ?? 0,
                            'last_error_date' => $webhookInfo['last_error_date'] ?? null,
                            'last_error_message' => $webhookInfo['last_error_message'] ?? null,
                            'max_connections' => $webhookInfo['max_connections'] ?? null,
                            'allowed_updates' => $webhookInfo['allowed_updates'] ?? [],
                        ],
                    ];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Не удалось получить информацию о webhook'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram getWebhookInfo error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Ошибка: ' . $e->getMessage()];
        }
    }

    /**
     * Получить последние обновления (для извлечения chat_id после /start).
     */
    public function getUpdates(string $token, array $options = []): array
    {
        try {
            $response = Http::timeout(10)->get($this->apiBaseUrl . $token . '/getUpdates', $options);
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'result' => $data['result'] ?? []];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Не удалось получить обновления'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram getUpdates error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function deleteWebhook(string $token, bool $dropPendingUpdates = false): array
    {
        try {
            $params = $dropPendingUpdates ? ['drop_pending_updates' => true] : [];
            $response = Http::timeout(10)->post($this->apiBaseUrl . $token . '/deleteWebhook', $params);
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'message' => 'Webhook успешно удален'];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Не удалось удалить webhook'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram deleteWebhook error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Ошибка: ' . $e->getMessage()];
        }
    }

    public function sendMessage(string $token, int|string $chatId, string $text, array $options = []): array
    {
        try {
            $params = array_merge(['chat_id' => $chatId, 'text' => $text], $options);
            if (isset($params['reply_markup']) && is_array($params['reply_markup'])) {
                $params['reply_markup'] = json_encode($params['reply_markup']);
            }
            $response = Http::timeout(10)->post($this->apiBaseUrl . $token . '/sendMessage', $params);
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'data' => $data['result'] ?? []];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Не удалось отправить сообщение'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram sendMessage error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Ошибка: ' . $e->getMessage()];
        }
    }

    /**
     * Отправить фото в чат (URL или file_id).
     */
    public function sendPhoto(string $token, int|string $chatId, string $photoUrlOrFileId, ?string $caption = null): array
    {
        try {
            $params = ['chat_id' => $chatId, 'photo' => $photoUrlOrFileId];
            if ($caption !== null && $caption !== '') {
                $params['caption'] = mb_substr($caption, 0, 1024);
            }
            $response = Http::timeout(15)->post($this->apiBaseUrl . $token . '/sendPhoto', $params);
            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok'] ?? false) {
                    return ['success' => true, 'data' => $data['result'] ?? []];
                }
                return ['success' => false, 'message' => $data['description'] ?? 'Не удалось отправить фото'];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram sendPhoto error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function answerCallbackQuery(string $token, string $callbackQueryId, array $options = []): array
    {
        try {
            $params = array_merge(['callback_query_id' => $callbackQueryId], $options);
            $response = Http::timeout(10)->post($this->apiBaseUrl . $token . '/answerCallbackQuery', $params);
            if ($response->successful()) {
                $data = $response->json();
                return ['success' => (bool) ($data['ok'] ?? false), 'message' => $data['description'] ?? null];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram answerCallbackQuery error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function editMessageReplyMarkup(string $token, int|string $chatId, int $messageId, array $replyMarkup = []): array
    {
        try {
            $params = [
                'chat_id' => $chatId,
                'message_id' => $messageId,
                'reply_markup' => json_encode($replyMarkup),
            ];
            $response = Http::timeout(10)->post($this->apiBaseUrl . $token . '/editMessageReplyMarkup', $params);
            if ($response->successful()) {
                $data = $response->json();
                return ['success' => (bool) ($data['ok'] ?? false), 'data' => $data['result'] ?? null];
            }
            return ['success' => false, 'message' => 'Ошибка подключения к Telegram API'];
        } catch (\Exception $e) {
            Log::error('Telegram editMessageReplyMarkup error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
