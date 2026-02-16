<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewsController extends PublicApiController
{
    /**
     * GET /api/v1/reviews?host=...&page=...&per_page=...
     * Только published отзывы текущего сайта (без fallback на root).
     */
    public function index(Request $request): JsonResponse
    {
        $site = $this->resolveSite($request);
        $perPage = min((int) $request->query('per_page', 15), 50);
        $reviews = Review::published()
            ->where('site_id', $site->id)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($perPage);
        $items = $reviews->map(fn (Review $r) => [
            'id' => $r->id,
            'author_name' => $r->author_name,
            'text' => $r->text,
            'published_at' => $r->published_at?->toIso8601String(),
        ]);
        return response()->json([
            'data' => $items->values()->all(),
            'meta' => [
                'site' => $this->siteMeta($site),
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                    'last_page' => $reviews->lastPage(),
                ],
            ],
        ]);
    }
}
