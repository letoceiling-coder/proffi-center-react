<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\Review;
use App\Services\SiteResolverService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Публичная отправка отзыва (без авторизации).
 * Создаётся со статусом pending, уведомление в Telegram с кнопками Подтвердить/Отказать.
 */
class PublicReviewSubmitController extends PublicApiController
{
    public function __construct(
        protected TelegramService $telegram,
        protected SiteResolverService $siteResolver
    ) {}

    /**
     * POST /api/v1/reviews/submit
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'text' => 'required|string|max:10000',
            'phone' => 'nullable|string|max:50',
            'city_slug' => 'nullable|string|max:50',
        ]);

        $host = $this->getHost($request);
        $site = $this->siteResolver->resolve($host, $request->input('city_slug'));
        $site->load('city.region');

        $review = Review::create([
            'site_id' => $site->id,
            'author_name' => $validated['author_name'],
            'text' => $validated['text'],
            'phone' => $validated['phone'] ?? null,
            'status' => 'pending',
            'published_at' => null,
        ]);

        $cityName = $site->city?->name ?? 'Не указан';
        $regionName = $site->city?->region?->name ?? '';
        $text = "📝 Новый отзыв (на модерации)\n";
        $text .= "🌐 Город: {$cityName}" . ($regionName ? " ({$regionName})" : '') . "\n";
        $text .= "👤 {$review->author_name}\n";
        if ($review->phone) {
            $text .= "📞 {$review->phone}\n";
        }
        $text .= "💬 " . mb_substr($review->text, 0, 500) . (mb_strlen($review->text) > 500 ? '…' : '');

        $token = config('telegram.bot_token');
        $chatId = $this->telegram->getFormsChatId();
        if (!empty($token) && $chatId !== null && $chatId !== '') {
            $this->telegram->sendMessage($token, $chatId, $text, [
                'reply_markup' => [
                    'inline_keyboard' => [
                        [
                            ['text' => '✅ Подтвердить', 'callback_data' => 'review_approve_' . $review->id],
                            ['text' => '❌ Отказать', 'callback_data' => 'review_reject_' . $review->id],
                        ],
                    ],
                ],
            ]);
        }

        return response()->json(['message' => 'Отзыв отправлен на модерацию', 'data' => ['id' => $review->id]], 201);
    }
}
