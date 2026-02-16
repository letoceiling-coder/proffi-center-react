<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class SitemapController extends PublicApiController
{
    /**
     * GET /api/v1/sitemap.xml?host=...
     * URL всех published страниц/услуг/категорий/товаров для текущего сайта. Content-Type: application/xml.
     */
    public function index(Request $request): Response
    {
        $site = $this->resolveSite($request);
        $baseUrl = $this->baseUrl($site);

        $urls = [];
        Page::published()->where('site_id', $site->id)->get()->each(function (Page $p) use ($baseUrl, &$urls) {
            $urls[] = $baseUrl . '/' . ltrim($p->slug, '/');
        });
        Service::published()->where('site_id', $site->id)->get()->each(function (Service $s) use ($baseUrl, &$urls) {
            $urls[] = $baseUrl . '/uslugi/' . ltrim($s->slug, '/');
        });
        ProductCategory::where('site_id', $site->id)->get()->each(function (ProductCategory $c) use ($baseUrl, &$urls) {
            $urls[] = $baseUrl . '/catalog/' . ltrim($c->slug, '/');
        });
        Product::published()->where('site_id', $site->id)->with('productCategory')->get()->each(function (Product $p) use ($baseUrl, &$urls) {
            $catSlug = $p->productCategory ? $p->productCategory->slug : 'category';
            $urls[] = $baseUrl . '/catalog/' . $catSlug . '/' . ltrim($p->slug, '/');
        });

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach (array_unique($urls) as $loc) {
            $xml .= '  <url><loc>' . htmlspecialchars($loc, ENT_XML1, 'UTF-8') . '</loc></url>' . "\n";
        }
        $xml .= '</urlset>';

        return new Response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    private function baseUrl($site): string
    {
        $domain = $site->domain;
        if (!str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }
        return rtrim($domain, '/');
    }
}
