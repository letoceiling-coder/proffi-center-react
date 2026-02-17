<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\CmsMedia;
use App\Models\CmsMediaFile;
use App\Models\Review;
use App\Models\TelegramFormSubscriber;
use App\Services\SiteResolverService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Публичная отправка отзыва (без авторизации).
 * Создаётся со статусом pending, уведомление в Telegram с кнопками и фото (если загружены).
 */
class PublicReviewSubmitController extends PublicApiController
{
    public function __construct(
        protected TelegramService $telegram,
        protected SiteResolverService $siteResolver
    ) {}

    /**
     * POST /api/v1/reviews/submit
     * Body: multipart — author_name, text, phone, city_slug?, photos[] (файлы) или JSON — author_name, text, phone, city_slug?
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'author_name' => 'required|string|max:255',
            'text' => 'required|string|min:100|max:10000',
            'phone' => 'required|string|max:50',
            'city_slug' => 'nullable|string|max:50',
            'photos' => 'nullable|array',
            'photos.*' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:10240',
        ], [
            'text.min' => 'Текст отзыва должен быть не менее 100 символов.',
            'phone.required' => 'Укажите телефон.',
        ]);

        $host = $this->getHost($request);
        $site = $this->siteResolver->resolve($host, $request->input('city_slug'));
        $site->load('city.region');

        $review = Review::create([
            'site_id' => $site->id,
            'author_name' => $validated['author_name'],
            'text' => $validated['text'],
            'phone' => $validated['phone'],
            'status' => 'pending',
            'published_at' => null,
        ]);

        $photoPaths = [];
        $photoFiles = $request->file('photos');
        if (is_array($photoFiles)) {
            $order = 0;
            foreach ($photoFiles as $file) {
                if (! $file || ! $file->isValid()) {
                    continue;
                }
                $path = $file->store('review_uploads/' . $review->id, 'public');
                if ($path) {
                    $media = CmsMedia::create(['name' => $file->getClientOriginalName(), 'alt' => null, 'caption' => null]);
                    CmsMediaFile::create([
                        'media_id' => $media->id,
                        'disk' => 'public',
                        'path' => $path,
                        'variant' => null,
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                    ]);
                    $review->media()->attach($media->id, ['order' => $order++]);
                    $photoPaths[] = Storage::disk('public')->path($path);
                }
            }
        }

        $cityName = $site->city?->name ?? 'Не указан';
        $regionName = $site->city?->region?->name ?? '';
        $text = "📝 Новый отзыв (на модерации)\n";
        $text .= "🌐 Город: {$cityName}" . ($regionName ? " ({$regionName})" : '') . "\n";
        $text .= "👤 {$review->author_name}\n";
        if ($review->phone) {
            $text .= "📞 {$review->phone}\n";
        }
        $text .= "💬 " . mb_substr($review->text, 0, 500) . (mb_strlen($review->text) > 500 ? '…' : '');
        if (count($photoPaths) > 0) {
            $text .= "\n📷 Фото: " . count($photoPaths);
        }

        $token = config('telegram.bot_token');
        $chatIds = TelegramFormSubscriber::allChatIds();
        if ($chatIds === []) {
            $fallbackChatId = $this->telegram->getFormsChatId();
            if ($fallbackChatId !== null && $fallbackChatId !== '') {
                $chatIds = [$fallbackChatId];
            }
        }

        if (empty($token)) {
            Log::error('[Reviews] Уведомление в Telegram не отправлено: TELEGRAM_BOT_TOKEN не задан в .env. Отзыв id=' . $review->id . ' сохранён.');
        } elseif ($chatIds === []) {
            Log::error('[Reviews] Уведомление в Telegram не отправлено: нет получателей. Напишите боту /start или укажите TELEGRAM_CHAT_ID в .env. Отзыв id=' . $review->id . ' сохранён.');
        } else {
            $replyMarkup = [
                'inline_keyboard' => [
                    [
                        ['text' => '✅ Подтвердить', 'callback_data' => 'review_approve_' . $review->id],
                        ['text' => '❌ Отказать', 'callback_data' => 'review_reject_' . $review->id],
                    ],
                ],
            ];
            foreach ($chatIds as $chatId) {
                $msgResult = $this->telegram->sendMessage($token, $chatId, $text, ['reply_markup' => $replyMarkup]);
                if (! ($msgResult['success'] ?? false)) {
                    Log::warning('[Reviews] sendMessage в chat_id ' . $chatId . ' не удался', ['message' => $msgResult['message'] ?? 'unknown']);
                }
                foreach ($photoPaths as $localPath) {
                    $photoResult = $this->telegram->sendPhotoByPath($token, $chatId, $localPath);
                    if (! ($photoResult['success'] ?? false)) {
                        Log::warning('[Reviews] sendPhotoByPath в chat_id ' . $chatId . ' не удался', ['path' => $localPath, 'message' => $photoResult['message'] ?? 'unknown']);
                    }
                }
            }
        }

        return response()->json(['message' => 'Отзыв отправлен на модерацию', 'data' => ['id' => $review->id]], 201);
    }
}
