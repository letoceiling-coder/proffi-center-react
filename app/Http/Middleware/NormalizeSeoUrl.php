<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Редиректы для SEO: https, единый хост (www / non-www).
 * Предпочтительный URL берётся из APP_URL (например https://proffi-center.ru).
 */
class NormalizeSeoUrl
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('app.env') !== 'production') {
            return $next($request);
        }
        $canonicalUrl = rtrim((string) config('app.url'), '/');
        if ($canonicalUrl === '') {
            return $next($request);
        }
        $parsed = parse_url($canonicalUrl);
        $canonicalHost = $parsed['host'] ?? null;
        $canonicalScheme = $parsed['scheme'] ?? 'https';
        if (!$canonicalHost) {
            return $next($request);
        }

        $currentHost = $request->getHost();
        $currentScheme = $request->getScheme();
        $path = '/' . ltrim($request->path(), '/');
        if ($path === '//') {
            $path = '/';
        }

        $currentHostLower = strtolower($currentHost);
        $canonicalHostLower = strtolower($canonicalHost);
        // Допускаем основной домен и любые поддомены (moscow., anapa., stavropol., www. и т.д.)
        $isOurDomain = $currentHostLower === $canonicalHostLower
            || str_ends_with($currentHostLower, '.' . $canonicalHostLower);

        $needRedirect = false;
        if ($canonicalScheme === 'https' && $currentScheme !== 'https') {
            $needRedirect = true;
        }
        // Редирект только если хост не наш (не основной и не поддомен)
        if (!$isOurDomain) {
            $needRedirect = true;
        }

        if ($needRedirect) {
            $targetUrl = $canonicalScheme . '://' . $canonicalHost . $path;
            $query = $request->getQueryString();
            if ($query !== null && $query !== '') {
                $targetUrl .= '?' . $query;
            }
            return redirect()->to($targetUrl, 301);
        }

        return $next($request);
    }
}
