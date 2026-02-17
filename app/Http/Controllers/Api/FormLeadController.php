<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\V1\Public\PublicApiController;
use App\Services\SiteResolverService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Публичная отправка заявок с форм в Telegram.
 * В каждом сообщении указывается город (региональность).
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
            'name' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $host = $request->query('host') ?: $request->header('X-Forwarded-Host') ?: $request->getHost() ?: '';
        $citySlug = $request->input('city_slug');
        $site = $this->siteResolver->resolve($host, $citySlug);
        $site->load(['city.region']);
        $cityName = $site->city?->name ?? 'Не указан';
        $regionName = $site->city?->region?->name ?? '';

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
        $chatId = $this->telegram->getFormsChatId();
        if ($token === null || $token === '' || $chatId === null || $chatId === '') {
            \Illuminate\Support\Facades\Log::warning('Form lead: chat_id не задан. Заявки не уходят в бот. Исправление: задать TELEGRAM_CHAT_ID в .env или выполнить: php artisan telegram:set-forms-chat-id <CHAT_ID> (подробнее: php artisan telegram:forms-status)', [
                'has_token' => !empty($token),
                'has_chat_id' => !empty($chatId),
            ]);
            return response()->json([
                'message' => 'Сервис заявок временно недоступен. Попробуйте позже или позвоните нам.',
            ], 503);
        }

        $result = $this->telegram->sendMessage($token, $chatId, $text);
        if (!($result['success'] ?? false)) {
            \Illuminate\Support\Facades\Log::error('Form lead: Telegram send failed', [
                'message' => $result['message'] ?? 'unknown',
            ]);
            return response()->json([
                'message' => 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.',
            ], 503);
        }

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
