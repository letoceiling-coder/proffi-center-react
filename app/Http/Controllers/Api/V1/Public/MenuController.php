<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Services\PublicMenuBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends PublicApiController
{
    /**
     * GET /api/v1/menu/{key}?host=...
     * key = header | footer
     */
    public function show(Request $request, string $key): JsonResponse
    {
        if (!in_array($key, ['header', 'footer'], true)) {
            return response()->json(['message' => 'Invalid menu key'], 404);
        }
        $site = $this->resolveSite($request);
        $tree = app(PublicMenuBuilder::class)->buildTree($site, $key);
        return response()->json([
            'data' => $tree,
            'meta' => ['site' => $this->siteMeta($site)],
        ]);
    }
}
