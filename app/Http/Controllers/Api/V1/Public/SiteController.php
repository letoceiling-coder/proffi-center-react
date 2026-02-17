<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\Site;
use App\Services\SiteResolverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteController extends PublicApiController
{
    /**
     * GET /api/v1/site/resolve?host=example.com
     */
    public function resolve(Request $request): JsonResponse
    {
        $site = $this->resolveSite($request);
        $site->load(['contact.logoMedia', 'city.region', 'seoSetting']);
        $contact = $site->contact;
        $city = $site->city;
        $region = $city?->region;
        $seoSetting = $site->seoSetting;

        $data = [
            'site' => [
                'id' => $site->id,
                'domain' => $site->domain,
                'is_primary' => $site->is_primary,
                'city' => $city ? [
                    'id' => $city->id,
                    'name' => $city->name,
                    'slug' => $city->slug,
                    'name_prepositional' => $city->name_prepositional ?? $city->name,
                ] : null,
                'region' => $region ? ['id' => $region->id, 'name' => $region->name] : null,
                'contacts' => $contact ? [
                    'phone' => $contact->phone,
                    'email' => $contact->email,
                    'address_street' => $contact->address_street,
                    'address_locality' => $contact->address_locality,
                    'address_postal_code' => $contact->address_postal_code,
                    'work_time' => $contact->work_time,
                    'company_name' => $contact->company_name,
                ] : null,
            ],
            'seo_settings' => $seoSetting ? [
                'default_title_suffix' => $seoSetting->default_title_suffix,
                'default_description' => $seoSetting->default_description,
                'robots_txt_append' => $seoSetting->robots_txt_append,
            ] : null,
            'flags' => [],
        ];

        return response()->json(['data' => $data]);
    }

    /**
     * GET /api/v1/city-sites — список сайтов-городов (поддоменов) для выбора в шапке.
     * Динамический список: не нужно заводить поддомены вручную в коде.
     */
    public function citySites(): JsonResponse
    {
        $sites = Site::whereNotNull('city_id')
            ->with('city')
            ->orderBy('domain')
            ->get();

        $items = $sites->map(fn (Site $site) => [
            'name' => $site->city?->name ?? $site->domain,
            'slug' => $site->city?->slug ?? '',
            'href' => 'https://' . $site->domain,
        ])->values();

        return response()->json(['data' => ['cities' => $items]]);
    }

    /**
     * GET /api/v1/site/by-city/{slug}?host=...
     * Данные сайта по slug города (для основного домена без редиректа).
     */
    public function byCity(Request $request, string $slug): JsonResponse
    {
        $resolver = app(SiteResolverService::class);
        $host = $this->getHost($request);
        $site = $resolver->resolve($host, $slug);
        $site->load(['contact.logoMedia', 'city.region']);
        $contact = $site->contact;
        $city = $site->city;
        $region = $city?->region;
        $seoSetting = $site->seoSetting;

        $data = [
            'site' => [
                'id' => $site->id,
                'domain' => $site->domain,
                'is_primary' => $site->is_primary,
                'city' => $city ? [
                    'id' => $city->id,
                    'name' => $city->name,
                    'slug' => $city->slug,
                    'name_prepositional' => $city->name_prepositional ?? $city->name,
                ] : null,
                'region' => $region ? ['id' => $region->id, 'name' => $region->name] : null,
                'contacts' => $contact ? [
                    'phone' => $contact->phone,
                    'email' => $contact->email,
                    'address_street' => $contact->address_street,
                    'address_locality' => $contact->address_locality,
                    'address_postal_code' => $contact->address_postal_code,
                    'work_time' => $contact->work_time,
                    'company_name' => $contact->company_name,
                ] : null,
            ],
            'seo_settings' => $seoSetting ? [
                'default_title_suffix' => $seoSetting->default_title_suffix,
                'default_description' => $seoSetting->default_description,
                'robots_txt_append' => $seoSetting->robots_txt_append,
            ] : null,
            'flags' => [],
        ];

        return response()->json(['data' => $data]);
    }
}
