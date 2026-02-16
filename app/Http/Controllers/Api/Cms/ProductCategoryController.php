<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProductCategory::query()->with('site:id,domain');
        $query->whereNotNull('site_id');

        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('title', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }

        $sort = $request->get('sort', 'sort_order');
        $order = $request->get('order', 'asc');
        if (in_array($sort, ['id', 'title', 'slug', 'sort_order', 'created_at'])) {
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
            'slug' => ['required', 'string', 'max:100', Rule::unique('product_categories')->where('site_id', $request->input('site_id'))],
            'title' => 'required|string|max:255',
            'image_media_id' => 'nullable|exists:cms_media,id',
            'image_active_media_id' => 'nullable|exists:cms_media,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);

        $category = ProductCategory::create($validated);
        $category->load('site:id,domain');
        return response()->json(['data' => $category], 201);
    }

    public function show(ProductCategory $product_category): JsonResponse
    {
        $product_category->load(['site', 'imageMedia', 'imageActiveMedia']);
        return response()->json(['data' => $product_category]);
    }

    public function update(Request $request, ProductCategory $product_category): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'slug' => ['required', 'string', 'max:100', Rule::unique('product_categories')->where('site_id', $request->input('site_id'))->ignore($product_category->id)],
            'title' => 'required|string|max:255',
            'image_media_id' => 'nullable|exists:cms_media,id',
            'image_active_media_id' => 'nullable|exists:cms_media,id',
            'sort_order' => 'nullable|integer|min:0',
        ]);
        if (array_key_exists('sort_order', $validated)) {
            $validated['sort_order'] = (int) $validated['sort_order'];
        }

        $product_category->update($validated);
        $product_category->load(['site', 'imageMedia', 'imageActiveMedia']);
        return response()->json(['data' => $product_category->fresh()]);
    }

    public function destroy(ProductCategory $product_category): JsonResponse
    {
        $product_category->delete();
        return response()->json(['message' => 'Категория удалена']);
    }
}
