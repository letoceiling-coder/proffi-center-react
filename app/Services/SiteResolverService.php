<?php

namespace App\Services;

use App\Models\Site;

final class SiteResolverService
{
    /**
     * Резолв сайта по host (domain).
     * Сначала ищем по domain = host, иначе fallback на root site (is_primary=1).
     */
    public function resolveByHost(string $host): Site
    {
        $host = $this->normalizeHost($host);
        $site = Site::where('domain', $host)->first();
        if ($site) {
            return $site;
        }
        $root = Site::where('is_primary', true)->first();
        if ($root) {
            return $root;
        }
        return Site::query()->firstOrFail();
    }

    public function getRootSite(): ?Site
    {
        return Site::where('is_primary', true)->first();
    }

    private function normalizeHost(string $host): string
    {
        $host = trim($host);
        $host = preg_replace('#^https?://#', '', $host);
        $host = explode('/', $host)[0];
        return strtolower($host);
    }
}
