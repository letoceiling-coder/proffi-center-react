<?php

namespace App\Services;

use App\Models\CmsMedia;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SeoMeta;
use App\Models\Service;
use App\Models\Site;
use App\Models\SeoSetting;
use Illuminate\Support\Facades\Storage;

final class SeoResolver
{
    /**
     * Возвращает итоговые SEO-данные для сущности в контексте сайта.
     * Приоритет: 1) seo_meta сущности, 2) поля сущности, 3) seo_settings сайта, 4) seo_settings root site.
     *
     * @param Page|Service|ProductCategory|Product $entity
     * @return array{title: string, description: string|null, h1: string, canonical: string, robots: string, og_title: string|null, og_description: string|null, og_image_url: string|null}
     */
    public function resolveFor(object $entity, Site $site): array
    {
        $site = $entity->site ?? $site;
        $seoMeta = $entity->seoMeta;
        $settings = $this->getSettingsForSite($site);
        $rootSettings = $this->getRootSettings();

        $title = $this->resolveTitle($entity, $seoMeta, $settings, $rootSettings);
        $description = $this->resolveDescription($entity, $seoMeta, $settings, $rootSettings);
        $h1 = $this->resolveH1($entity, $seoMeta);
        $canonical = $this->resolveCanonical($entity, $seoMeta, $site);
        $robots = $this->resolveRobots($seoMeta);
        $ogTitle = $seoMeta?->og_title ?: $title;
        $ogDescription = $seoMeta?->og_description ?: $description;
        $ogImageUrl = $this->resolveOgImageUrl($seoMeta);

        return [
            'title' => $title,
            'description' => $description,
            'h1' => $h1,
            'canonical' => $canonical,
            'robots' => $robots,
            'og_title' => $ogTitle,
            'og_description' => $ogDescription,
            'og_image_url' => $ogImageUrl,
        ];
    }

    private function getSettingsForSite(Site $site): ?SeoSetting
    {
        return SeoSetting::where('site_id', $site->id)->first();
    }

    private function getRootSettings(): ?SeoSetting
    {
        $rootSite = Site::where('is_primary', true)->first();
        return $rootSite ? $this->getSettingsForSite($rootSite) : null;
    }

    private function resolveTitle(object $entity, ?SeoMeta $seoMeta, ?SeoSetting $settings, ?SeoSetting $rootSettings): string
    {
        if ($seoMeta?->title !== null && $seoMeta->title !== '') {
            return $seoMeta->title;
        }
        $entityTitle = $this->getEntityTitle($entity);
        if ($entityTitle !== null && $entityTitle !== '') {
            $suffix = $settings?->default_title_suffix ?? $rootSettings?->default_title_suffix;
            return $suffix ? $entityTitle . ' ' . $suffix : $entityTitle;
        }
        return '';
    }

    private function resolveDescription(object $entity, ?SeoMeta $seoMeta, ?SeoSetting $settings, ?SeoSetting $rootSettings): ?string
    {
        if ($seoMeta?->description !== null && $seoMeta->description !== '') {
            return $seoMeta->description;
        }
        $entityDesc = $this->getEntityDescription($entity);
        if ($entityDesc !== null && $entityDesc !== '') {
            return $entityDesc;
        }
        return $settings?->default_description ?? $rootSettings?->default_description;
    }

    private function resolveH1(object $entity, ?SeoMeta $seoMeta): string
    {
        if ($seoMeta?->h1 !== null && $seoMeta->h1 !== '') {
            return $seoMeta->h1;
        }
        return (string) $this->getEntityTitle($entity);
    }

    private function resolveCanonical(object $entity, ?SeoMeta $seoMeta, Site $site): string
    {
        if ($seoMeta?->canonical_url !== null && $seoMeta->canonical_url !== '') {
            return $seoMeta->canonical_url;
        }
        $path = $this->buildEntityPath($entity);
        $domain = $site->domain;
        $scheme = str_starts_with($domain, 'https') ? 'https' : 'http';
        if (!str_starts_with($domain, 'http')) {
            $domain = $scheme . '://' . $domain;
        }
        $base = rtrim($domain, '/');
        return $path === '/' ? $base : $base . $path;
    }

    private function resolveRobots(?SeoMeta $seoMeta): string
    {
        if ($seoMeta?->robots !== null && $seoMeta->robots !== '') {
            return $seoMeta->robots;
        }
        return 'index,follow';
    }

    private function resolveOgImageUrl(?SeoMeta $seoMeta): ?string
    {
        if (!$seoMeta?->og_image_media_id) {
            return null;
        }
        $media = CmsMedia::find($seoMeta->og_image_media_id);
        if (!$media) {
            return null;
        }
        $file = $media->files()->where('variant', 'og')->first()
            ?? $media->files()->where('variant', 'original')->first()
            ?? $media->files()->first();
        if (!$file) {
            return null;
        }
        return Storage::disk($file->disk)->url($file->path);
    }

    private function getEntityTitle(object $entity): ?string
    {
        return match (true) {
            $entity instanceof Page, $entity instanceof Service, $entity instanceof ProductCategory => $entity->title ?? null,
            $entity instanceof Product => $entity->name ?? null,
            default => null,
        };
    }

    private function getEntityDescription(object $entity): ?string
    {
        if ($entity instanceof Product && !empty($entity->short_description)) {
            return $entity->short_description;
        }
        return null;
    }

    /**
     * Строит путь сущности для canonical (без домена).
     */
    private function buildEntityPath(object $entity): string
    {
        if ($entity instanceof Page) {
            return '/' . ltrim($entity->slug, '/');
        }
        if ($entity instanceof Service) {
            return '/uslugi/' . ltrim($entity->slug, '/');
        }
        if ($entity instanceof ProductCategory) {
            return '/catalog/' . ltrim($entity->slug, '/');
        }
        if ($entity instanceof Product) {
            $cat = $entity->productCategory;
            $catSlug = $cat ? $cat->slug : 'category';
            return '/catalog/' . $catSlug . '/' . ltrim($entity->slug, '/');
        }
        return '/';
    }
}
