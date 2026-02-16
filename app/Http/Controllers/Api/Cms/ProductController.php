<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsMediable;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->with(['site:id,domain', 'productCategory:id,title,slug']);
        $query->whereNotNull('site_id');

        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('product_category_id')) {
            $query->where('product_category_id', $request->get('product_category_id'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $sort = $request->get('sort', 'sort_order');
        $order = $request->get('order', 'asc');
        if (in_array($sort, ['id', 'name', 'slug', 'status', 'published_at', 'sort_order', 'price', 'created_at'])) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'product_category_id' => 'nullable|exists:product_categories,id',
            'slug' => ['required', 'string', 'max:255', Rule::unique('products')->where('site_id', $request->input('site_id'))],
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string',
            'size_display' => 'nullable|string|max:50',
            'price_old' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
        ]);
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);
        if (($validated['status'] ?? '') === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $product = Product::create($validated);
        $product->load(['site:id,domain', 'productCategory:id,title,slug']);
        return response()->json(['data' => $product], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['site', 'productCategory', 'cmsMedia' => fn ($q) => $q->orderBy('cms_mediables.order')]);
        return response()->json(['data' => $product]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'product_category_id' => 'nullable|exists:product_categories,id',
            'slug' => ['required', 'string', 'max:255', Rule::unique('products')->where('site_id', $request->input('site_id'))->ignore($product->id)],
            'name' => 'required|string|max:255',
            'short_description' => 'nullable|string',
            'size_display' => 'nullable|string|max:50',
            'price_old' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
        ]);
        if (array_key_exists('sort_order', $validated)) {
            $validated['sort_order'] = (int) $validated['sort_order'];
        }

        $product->update($validated);
        $product->load(['site', 'productCategory', 'cmsMedia']);
        return response()->json(['data' => $product->fresh()]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Товар удалён']);
    }

    public function publish(Product $product): JsonResponse
    {
        $product->update(['status' => 'published', 'published_at' => $product->published_at ?? now()]);
        return response()->json(['data' => $product->fresh(), 'message' => 'Опубликовано']);
    }

    public function unpublish(Product $product): JsonResponse
    {
        $product->update(['status' => 'draft']);
        return response()->json(['data' => $product->fresh(), 'message' => 'Снято с публикации']);
    }

    /** Синхронизация галереи: media_ids в порядке (role=gallery, order по индексу). */
    public function syncGallery(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'required|integer|exists:cms_media,id',
        ]);
        CmsMediable::where('mediable_type', Product::class)
            ->where('mediable_id', $product->id)
            ->where('role', 'gallery')
            ->delete();
        foreach ($validated['media_ids'] as $order => $mediaId) {
            $product->cmsMedia()->attach($mediaId, ['role' => 'gallery', 'order' => $order]);
        }
        $product->load(['cmsMedia' => fn ($q) => $q->wherePivot('role', 'gallery')->orderByPivot('order')]);
        return response()->json(['data' => $product->fresh(), 'message' => 'Галерея обновлена']);
    }
}
