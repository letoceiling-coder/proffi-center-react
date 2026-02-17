<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::query()->with('site:id,domain');
        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('author_name', 'like', "%{$q}%")->orWhere('text', 'like', "%{$q}%");
            });
        }
        $query->orderBy('created_at', 'desc');
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'author_name' => 'required|string|max:255',
            'text' => 'required|string|max:10000',
            'phone' => 'nullable|string|max:50',
            'published_at' => 'nullable|date',
            'status' => 'nullable|in:draft,pending,published,hidden',
        ]);
        $validated['status'] = $validated['status'] ?? 'draft';
        $review = Review::create($validated);
        $review->load('site:id,domain');
        return response()->json(['data' => $review], 201);
    }

    public function show(Review $review): JsonResponse
    {
        $review->load(['site', 'media']);
        return response()->json(['data' => $review]);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'author_name' => 'required|string|max:255',
            'text' => 'required|string|max:10000',
            'phone' => 'nullable|string|max:50',
            'published_at' => 'nullable|date',
            'status' => 'nullable|in:draft,pending,published,hidden',
        ]);
        $review->update($validated);
        $review->load('site');
        return response()->json(['data' => $review->fresh()]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();
        return response()->json(['message' => 'Отзыв удалён']);
    }

    /**
     * POST /reviews/{id}/media — sync: body media_ids[] (order = index).
     */
    public function syncMedia(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'exists:cms_media,id',
        ]);
        $sync = [];
        foreach ($validated['media_ids'] as $order => $mediaId) {
            $sync[$mediaId] = ['order' => $order];
        }
        $review->media()->sync($sync);
        $review->load('media');
        return response()->json(['data' => $review->media]);
    }

    /**
     * DELETE /reviews/{id}/media/{media_id}
     */
    public function detachMedia(Review $review, int $media_id): JsonResponse
    {
        $review->media()->detach($media_id);
        $review->load('media');
        return response()->json(['data' => $review->media]);
    }
}
