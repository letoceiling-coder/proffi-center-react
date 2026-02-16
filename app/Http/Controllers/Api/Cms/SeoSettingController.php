<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\SeoSetting;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeoSettingController extends Controller
{
    /**
     * GET /api/v1/cms/seo-settings?site_id=1
     * Возвращает запись seo_settings для сайта; если нет — 200 с data: null (или создаём при первом обращении).
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['site_id' => 'required|exists:sites,id']);
        $siteId = (int) $request->get('site_id');
        $setting = SeoSetting::where('site_id', $siteId)->first();
        if (!$setting) {
            $setting = SeoSetting::create(['site_id' => $siteId]);
        }
        $setting->load('site:id,domain');
        return response()->json(['data' => $setting]);
    }

    public function show(SeoSetting $seo_setting): JsonResponse
    {
        $seo_setting->load('site');
        return response()->json(['data' => $seo_setting]);
    }

    public function update(Request $request, SeoSetting $seo_setting): JsonResponse
    {
        $validated = $request->validate([
            'default_title_suffix' => 'nullable|string|max:255',
            'default_description' => 'nullable|string|max:5000',
            'verification_google' => 'nullable|string|max:500',
            'verification_yandex' => 'nullable|string|max:500',
            'robots_txt_append' => 'nullable|string|max:10000',
        ]);
        $seo_setting->update($validated);
        return response()->json(['data' => $seo_setting->fresh()]);
    }
}
