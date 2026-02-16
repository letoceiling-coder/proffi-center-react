<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Services\PublicContentResolver;
use App\Services\PublicMediaFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends PublicApiController
{
    /**
     * GET /api/v1/page/{slug}?host=...
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $site = $this->resolveSite($request);
        $page = app(PublicContentResolver::class)->resolvePage($slug, $site);
        if (!$page) {
            return response()->json(['message' => 'Page not found'], 404);
        }
        $page->load(['blocks', 'cmsMedia.files']);
        $blocks = $page->blocks->map(fn ($b) => ['type' => $b->type, 'data' => $b->data, 'order' => $b->order]);
        $media = app(PublicMediaFormatter::class)->formatForEntity($page);
        $data = [
            'id' => $page->id,
            'slug' => $page->slug,
            'title' => $page->title,
            'blocks' => $blocks->values()->all(),
            'media' => $media,
        ];
        return response()->json([
            'data' => $data,
            'meta' => $this->meta($site, $page),
        ]);
    }
}
