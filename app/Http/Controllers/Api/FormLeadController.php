<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Public\PublicApiController;
use App\Models\TelegramFormSubscriber;
use App\Services\SiteResolverService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Публичная отправка заявок с форм в Telegram.
 * Сообщение уходит всем, кто написал боту /start (таблица telegram_form_subscribers).
 */
class FormLeadController extends PublicApiController
{
    public function __construct(
        protected TelegramService $telegram,
        protected SiteResolverService $siteResolver
    ) {}

    /**
     * POST /api/v1/forms/lead
     * body: type, phone, name?, message?, city_slug? (для основного домена)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:callback,low_price,form_5min,rassrochka,pozdravlenie',
            'phone' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'message' => 'nullable|string|max:5000',
        ], [
            'name.required' => 'Укажите имя.',
            'phone.required' => 'Укажите телефон.',
        ]);

        $host = $request->query('host') ?: $request->header('X-Forwarded-Host') ?: $request->getHost() ?: '';
        $citySlug = $request->input('city_slug');
        $site = $this->siteResolver->resolve($host, $citySlug);
        $site->load(['city.region']);
        $cityName = $site->city?->name ?? 'Не указан';
        $regionName = $site->city?->region?->name ?? '';

        Log::info('[Forms] Заявка получена', [
            'type' => $validated['type'],
            'host' => $host,
            'city' => $cityName,
        ]);

        $lines = [
            '📋 Заявка: ' . $this->typeLabel($validated['type']),
            '🌐 Город/регион: ' . $cityName . ($regionName ? ' (' . $regionName . ')' : ''),
            '📞 Телефон: ' . $validated['phone'],
        ];
        if (!empty($validated['name'])) {
            $lines[] = '👤 Имя: ' . $validated['name'];
        }
        if (!empty($validated['message'])) {
            $lines[] = '💬 Сообщение: ' . $validated['message'];
        }
        $text = implode("\n", $lines);

        $token = config('telegram.bot_token');
        $chatIds = TelegramFormSubscriber::allChatIds();
        $source = 'subscribers';
        if ($chatIds === []) {
            $fallbackChatId = $this->telegram->getFormsChatId();
            if ($fallbackChatId !== null && $fallbackChatId !== '') {
                $chatIds = [$fallbackChatId];
                $source = 'TELEGRAM_CHAT_ID / file';
            }
        }

        if ($token === null || $token === '') {
            Log::error('[Forms] 503: TELEGRAM_BOT_TOKEN не задан в .env. Добавьте TELEGRAM_BOT_TOKEN.');
            return response()->json([
                'message' => 'Сервис заявок временно недоступен. Попробуйте позже или позвоните нам.',
            ], 503);
        }

        if ($chatIds === []) {
            Log::error('[Forms] 503: Нет получателей. Напишите боту в Telegram /start ИЛИ укажите TELEGRAM_CHAT_ID в .env. Таблица telegram_form_subscribers пуста.');
            return response()->json([
                'message' => 'Сервис заявок временно недоступен. Попробуйте позже или позвоните нам.',
            ], 503);
        }

        Log::info('[Forms] Отправка в Telegram', ['recipients' => count($chatIds), 'source' => $source]);

        $total = count($chatIds);
        $sent = 0;
        $lastError = null;
        foreach ($chatIds as $chatId) {
            $result = $this->telegram->sendMessage($token, $chatId, $text);
            if ($result['success'] ?? false) {
                $sent++;
            } else {
                $lastError = $result['message'] ?? 'unknown';
                Log::warning('[Forms] Не удалось отправить в Telegram', [
                    'chat_id' => $chatId,
                    'telegram_error' => $lastError,
                ]);
            }
        }

        // Успех только если сообщение доставлено всем подписчикам (бот подтвердил отправку).
        if ($sent === 0) {
            Log::error('[Forms] 503: Ни одному получателю не доставлено. Последняя ошибка Telegram: ' . ($lastError ?? '—'));
            return response()->json([
                'message' => 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.',
            ], 503);
        }
        if ($sent < $total) {
            Log::error('[Forms] 503: Доставлено не всем', ['sent' => $sent, 'total' => $total, 'last_error' => $lastError]);
            return response()->json([
                'message' => 'Заявка не доставлена всем получателям. Попробуйте позже или позвоните нам.',
            ], 503);
        }

        Log::info('[Forms] Заявка доставлена в Telegram всем получателям', ['sent_to' => $sent]);
        return response()->json(['message' => 'Заявка принята'], 201);
    }

    private function typeLabel(string $type): string
    {
        return match ($type) {
            'callback' => 'Перезвонить',
            'low_price' => 'Низкая цена',
            'form_5min' => 'Расчёт за 5 минут',
            'rassrochka' => 'Рассрочка',
            'pozdravlenie' => 'Поздравление',
            default => $type,
        };
    }
}
