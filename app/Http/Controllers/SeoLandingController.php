<?php

namespace App\Http\Controllers;

use App\Services\PublicContentResolver;
use App\Services\ServerSeoService;
use App\Services\SiteResolverService;
use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * Отдаёт HTML с серверными SEO-мета и минимальным контентом для краулеров.
 * React SPA после загрузки перехватывает роутинг и отрисовывает полноценный UI.
 */
final class SeoLandingController extends Controller
{
    public function __construct(
        private ServerSeoService $seoService,
        private PublicContentResolver $contentResolver,
        private SiteResolverService $siteResolver,
    ) {}

    public function showHome(Request $request): View
    {
        $site = $this->resolveSite($request);
        $seo = $this->seoService->buildForHome($site);
        $body = '<h1>' . e($seo->h1 ?? 'Натяжные потолки') . '</h1>';
        $body .= '<p>Установка натяжных потолков. Собственное производство, низкие цены, гарантия качества. Закажите замер бесплатно.</p>';
        $body .= '<p><a href="/uslugi">Услуги</a> · <a href="/o-kompanii">О компании</a> · <a href="/gde-zakazat-potolki">Контакты</a></p>';

        return view('layouts.seo-spa', [
            'seo' => $seo,
            'seoBodyContent' => $body,
        ]);
    }

    public function showService(Request $request, string $slug): View|\Illuminate\Http\Response
    {
        $site = $this->resolveSite($request);
        $service = $this->contentResolver->resolveService($slug, $site);
        if (!$service) {
            abort(404);
        }
        $seo = $this->seoService->buildForService($service, $site);
        $excerpt = $service->excerpt ?? $service->description;
        $body = '<h1>' . e($seo->h1 ?? $service->title) . '</h1>';
        if ($excerpt) {
            $body .= '<p>' . e(\Illuminate\Support\Str::limit(strip_tags($excerpt), 300)) . '</p>';
        }
        $body .= '<p><a href="/">Главная</a> · <a href="/uslugi">Услуги</a> · <a href="/o-kompanii">О компании</a></p>';

        return view('layouts.seo-spa', [
            'seo' => $seo,
            'seoBodyContent' => $body,
        ]);
    }

    public function showPage(Request $request, string $slug): View
    {
        $site = $this->resolveSite($request);
        $page = $this->contentResolver->resolvePage($slug, $site);
        if (!$page) {
            return $this->spaWithDefaultSeo($request, '/' . $slug);
        }
        $seo = $this->seoService->buildForPage($page, $site);
        $excerpt = $page->excerpt ?? $page->content;
        $body = '<h1>' . e($seo->h1 ?? $page->title) . '</h1>';
        if ($excerpt) {
            $body .= '<p>' . e(\Illuminate\Support\Str::limit(strip_tags($excerpt), 300)) . '</p>';
        }
        $body .= '<p><a href="/">Главная</a> · <a href="/uslugi">Услуги</a> · <a href="/gde-zakazat-potolki">Контакты</a></p>';

        return view('layouts.seo-spa', [
            'seo' => $seo,
            'seoBodyContent' => $body,
        ]);
    }

    public function showStatic(Request $request, string $pathKey): View
    {
        $site = $this->resolveSite($request);
        $seo = $this->seoService->buildForStatic($pathKey, $site);
        $body = '<h1>' . e($seo->h1 ?? 'Proffi Center') . '</h1>';
        $body .= '<p>' . e($seo->description ?? '') . '</p>';
        $body .= '<p><a href="/">Главная</a> · <a href="/uslugi">Услуги</a> · <a href="/gde-zakazat-potolki">Контакты</a></p>';

        return view('layouts.seo-spa', [
            'seo' => $seo,
            'seoBodyContent' => $body,
        ]);
    }

    /** SPA с дефолтными meta (для неизвестного slug или когда контент не найден). */
    private function spaWithDefaultSeo(Request $request, string $path): View
    {
        $site = $this->resolveSite($request);
        $seo = $this->seoService->buildDefault($site, $path);
        return view('layouts.seo-spa', ['seo' => $seo, 'seoBodyContent' => '']);
    }

    private function resolveSite(Request $request): \App\Models\Site
    {
        $host = $request->query('host') ?? $request->header('X-Forwarded-Host') ?? $request->getHost();
        return $this->siteResolver->resolveByHost($host ?: 'localhost');
    }
}
