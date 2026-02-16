<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Services\PublicContentResolver;
use App\Services\PublicMediaFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends PublicApiController
{
    /**
     * GET /api/v1/service/{slug}?host=...
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        $site = $this->resolveSite($request);
        $service = app(PublicContentResolver::class)->resolveService($slug, $site);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        $service->load(['blocks', 'cmsMedia.files']);
        $blocks = $service->blocks->map(fn ($b) => ['type' => $b->type, 'data' => $b->data, 'order' => $b->order]);
        $media = app(PublicMediaFormatter::class)->formatForEntity($service);
        $data = [
            'id' => $service->id,
            'slug' => $service->slug,
            'title' => $service->title,
            'blocks' => $blocks->values()->all(),
            'media' => $media,
        ];
        return response()->json([
            'data' => $data,
            'meta' => $this->meta($site, $service),
        ]);
    }
}
