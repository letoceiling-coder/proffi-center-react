<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Services\PublicContentResolver;
use App\Services\PublicMediaFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductCategoryController extends PublicApiController
{
    /**
     * GET /api/v1/product-category/{slug}?host=...
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $site = $this->resolveSite($request);
        $category = app(PublicContentResolver::class)->resolveProductCategory($slug, $site);
        if (!$category) {
            return response()->json(['message' => 'Product category not found'], 404);
        }
        $category->load(['seoMeta', 'imageMedia.files', 'imageActiveMedia.files']);
        $media = [
            'cover' => $category->imageMedia ? ['url' => app(PublicMediaFormatter::class)->mediaUrl($category->imageMedia), 'alt' => $category->imageMedia->alt] : null,
            'gallery' => [],
        ];
        $data = [
            'id' => $category->id,
            'slug' => $category->slug,
            'title' => $category->title,
            'sort_order' => $category->sort_order,
            'media' => $media,
        ];
        return response()->json([
            'data' => $data,
            'meta' => $this->meta($site, $category),
        ]);
    }
}
