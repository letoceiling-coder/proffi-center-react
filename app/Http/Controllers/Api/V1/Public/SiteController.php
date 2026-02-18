<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\City;
use App\Models\Site;
use App\Services\SiteResolverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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

    /**
     * GET /api/v1/site/suggest-city
     * Определение города по IP пользователя (для основного домена).
     * Возвращает { city_slug: string } если город найден в БД, иначе {}.
     */
    public function suggestCity(Request $request): JsonResponse
    {
        $ip = $request->ip();
        if (!$ip || $ip === '127.0.0.1' || $ip === '::1') {
            return response()->json(['data' => []]);
        }

        try {
            $response = Http::timeout(3)->get('http://ip-api.com/json/' . urlencode($ip), [
                'fields' => 'city,regionName',
                'lang' => 'ru',
            ]);
            if (!$response->successful()) {
                return response()->json(['data' => []]);
            }
            $body = $response->json();
            $cityName = $body['city'] ?? $body['regionName'] ?? null;
            if (!$cityName || !is_string($cityName)) {
                return response()->json(['data' => []]);
            }
            $cityName = trim($cityName);
            $city = City::query()
                ->whereHas('sites')
                ->where(function ($q) use ($cityName) {
                    $q->where('name', $cityName)
                        ->orWhere('name_prepositional', $cityName)
                        ->orWhere('slug', Str::slug($cityName));
                })
                ->first();
            if ($city) {
                return response()->json(['data' => ['city_slug' => $city->slug]]);
            }
            $slug = Str::slug($cityName);
            if ($slug !== '') {
                $cityBySlug = City::query()->whereHas('sites')->where('slug', $slug)->first();
                if ($cityBySlug) {
                    return response()->json(['data' => ['city_slug' => $cityBySlug->slug]]);
                }
            }
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json(['data' => []]);
    }
}
