<?php

namespace App\Http\Controllers\Api\V1\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Response as ResponseFactory;

class RobotsController extends PublicApiController
{
    /**
     * GET /api/v1/robots.txt?host=...
     * Базовые правила + seo_settings.robots_txt_append (если есть). Content-Type: text/plain.
     */
    public function index(Request $request): Response
    {
        $site = $this->resolveSite($request);
        $seo = $site->seoSetting;
        $body = "User-agent: *\nAllow: /\n";
        if ($seo && $seo->robots_txt_append) {
            $body .= "\n" . trim($seo->robots_txt_append) . "\n";
        }
        return new Response($body, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
