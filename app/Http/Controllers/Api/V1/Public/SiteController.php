<?php

namespace App\Http\Controllers\Api\V1\Public;

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
                'city' => $city ? ['id' => $city->id, 'name' => $city->name] : null,
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
