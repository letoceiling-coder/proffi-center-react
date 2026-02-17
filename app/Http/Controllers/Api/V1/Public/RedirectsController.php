<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\Redirect;
use App\Services\SiteResolverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RedirectsController extends PublicApiController
{
    /** Пути страниц «Потолки в комнату» — никогда не редиректим (обрабатывает SPA). */
    private const ROOM_PAGE_PATHS = [
        '/potolki-v-prihozhuju',
        '/potolki-v-gostinuju',
        '/potolki-v-spalnju',
        '/potolki-na-kuhnju',
        '/potolki-v-detskuju',
        '/potolki-v-vannuju',
    ];

    /**
     * GET /api/v1/redirects/check?host=...&path=/old
     * Сначала redirects текущего site, затем root. Только is_active.
     * Пути из ROOM_PAGE_PATHS не редиректятся (отдаются SPA).
     */
    public function check(Request $request): JsonResponse
    {
        $path = $request->query('path', '/');
        $path = '/' . ltrim($path, '/');

        if (in_array($path, self::ROOM_PAGE_PATHS, true)) {
            return response()->json(['matched' => false, 'to' => null, 'code' => null]);
        }

        $site = $this->resolveSite($request);
        $resolver = app(SiteResolverService::class);
        $root = $resolver->getRootSite();

        $redirect = Redirect::where('is_active', true)
            ->where('site_id', $site->id)
            ->where('from_path', $path)
            ->first();

        if (!$redirect && $root && $root->id !== $site->id) {
            $redirect = Redirect::where('is_active', true)
                ->where('site_id', $root->id)
                ->where('from_path', $path)
                ->first();
        }

        if (!$redirect) {
            return response()->json(['matched' => false, 'to' => null, 'code' => null]);
        }
        return response()->json([
            'matched' => true,
            'to' => $redirect->to_url,
            'code' => (int) ($redirect->code ?: 301),
        ]);
    }
}
