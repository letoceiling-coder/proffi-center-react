<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SeoMeta;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeoMetaController extends Controller
{
    private const ENTITY_MAP = [
        'pages' => Page::class,
        'services' => Service::class,
        'product-categories' => ProductCategory::class,
        'products' => Product::class,
    ];

    /**
     * GET /api/v1/cms/{entity}/{id}/seo-meta
     */
    public function show(Request $request, string $entity, string $id): JsonResponse
    {
        $modelClass = self::ENTITY_MAP[$entity] ?? null;
        if (!$modelClass) {
            return response()->json(['message' => 'Unknown entity'], 404);
        }
        $model = $modelClass::find($id);
        if (!$model) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $seoMeta = $model->seoMeta;
        return response()->json(['data' => $seoMeta]);
    }

    /**
     * PUT /api/v1/cms/{entity}/{id}/seo-meta — upsert
     */
    public function update(Request $request, string $entity, string $id): JsonResponse
    {
        $modelClass = self::ENTITY_MAP[$entity] ?? null;
        if (!$modelClass) {
            return response()->json(['message' => 'Unknown entity'], 404);
        }
        $model = $modelClass::find($id);
        if (!$model) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:5000',
            'h1' => 'nullable|string|max:255',
            'canonical_url' => 'nullable|string|max:500|url',
            'robots' => 'nullable|string|max:100',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:5000',
            'og_image_media_id' => 'nullable|exists:cms_media,id',
            'twitter_card' => 'nullable|string|max:50',
            'twitter_title' => 'nullable|string|max:255',
        ]);

        $seoMeta = $model->seoMeta;
        if (!$seoMeta) {
            $seoMeta = $model->seoMeta()->create(array_merge($validated, [
                'seo_metaable_type' => $modelClass,
                'seo_metaable_id' => $model->getKey(),
            ]));
        } else {
            $seoMeta->update($validated);
        }
        $seoMeta->load('ogImageMedia');
        return response()->json(['data' => $seoMeta->fresh()]);
    }
}
