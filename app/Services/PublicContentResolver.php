<?php

namespace App\Services;

use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Service;
use App\Models\Site;
use Illuminate\Database\Eloquent\Model;

/**
 * Резолв опубликованного контента по slug: сначала current site, затем root site.
 */
final class PublicContentResolver
{
    public function resolvePage(string $slug, Site $site): ?Page
    {
        $root = app(SiteResolverService::class)->getRootSite();
        $page = Page::published()->where('site_id', $site->id)->where('slug', $slug)->first();
        if ($page) {
            return $page;
        }
        if ($root && $root->id !== $site->id) {
            return Page::published()->where('site_id', $root->id)->where('slug', $slug)->first();
        }
        return null;
    }

    public function resolveService(string $slug, Site $site): ?Service
    {
        $root = app(SiteResolverService::class)->getRootSite();
        $service = Service::published()->where('site_id', $site->id)->where('slug', $slug)->first();
        if ($service) {
            return $service;
        }
        if ($root && $root->id !== $site->id) {
            return Service::published()->where('site_id', $root->id)->where('slug', $slug)->first();
        }
        return null;
    }

    public function resolveProductCategory(string $slug, Site $site): ?ProductCategory
    {
        $root = app(SiteResolverService::class)->getRootSite();
        $cat = ProductCategory::where('site_id', $site->id)->where('slug', $slug)->first();
        if ($cat) {
            return $cat;
        }
        if ($root && $root->id !== $site->id) {
            return ProductCategory::where('site_id', $root->id)->where('slug', $slug)->first();
        }
        return null;
    }

    public function resolveProduct(string $slug, Site $site): ?Product
    {
        $root = app(SiteResolverService::class)->getRootSite();
        $product = Product::published()->where('site_id', $site->id)->where('slug', $slug)->first();
        if ($product) {
            return $product;
        }
        if ($root && $root->id !== $site->id) {
            return Product::published()->where('site_id', $root->id)->where('slug', $slug)->first();
        }
        return null;
    }
}
