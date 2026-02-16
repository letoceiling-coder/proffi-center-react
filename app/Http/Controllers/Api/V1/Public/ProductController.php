<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Services\PublicContentResolver;
use App\Services\PublicMediaFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends PublicApiController
{
    /**
     * GET /api/v1/product/{slug}?host=...
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $site = $this->resolveSite($request);
        $product = app(PublicContentResolver::class)->resolveProduct($slug, $site);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        $product->load(['blocks', 'productCategory', 'cmsMedia.files']);
        $blocks = $product->blocks->map(fn ($b) => ['type' => $b->type, 'data' => $b->data, 'order' => $b->order]);
        $media = app(PublicMediaFormatter::class)->formatForEntity($product);
        $data = [
            'id' => $product->id,
            'slug' => $product->slug,
            'name' => $product->name,
            'short_description' => $product->short_description,
            'size_display' => $product->size_display,
            'price' => $product->price,
            'price_old' => $product->price_old,
            'product_category' => $product->productCategory ? [
                'id' => $product->productCategory->id,
                'slug' => $product->productCategory->slug,
                'title' => $product->productCategory->title,
            ] : null,
            'blocks' => $blocks->values()->all(),
            'media' => $media,
        ];
        return response()->json([
            'data' => $data,
            'meta' => $this->meta($site, $product),
        ]);
    }
}
