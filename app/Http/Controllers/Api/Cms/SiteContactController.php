<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\SiteContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SiteContact::query()->with('site:id,domain');
        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->where('company_name', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('address_street', 'like', "%{$s}%");
            });
        }
        $sort = $request->get('sort', 'id');
        $order = $request->get('order', 'desc');
        if (in_array($sort, ['id', 'site_id', 'company_name', 'created_at'])) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address_street' => 'nullable|string|max:255',
            'address_locality' => 'nullable|string|max:255',
            'address_postal_code' => 'nullable|string|max:20',
            'work_time' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'logo_media_id' => 'nullable|exists:cms_media,id',
            'price_display_from' => 'nullable|string|max:50',
            'legal_link' => 'nullable|string|max:500',
        ]);
        $contact = SiteContact::create($validated);
        $contact->load('site:id,domain');
        return response()->json(['data' => $contact], 201);
    }

    public function show(SiteContact $site_contact): JsonResponse
    {
        $site_contact->load(['site', 'logoMedia']);
        return response()->json(['data' => $site_contact]);
    }

    public function update(Request $request, SiteContact $site_contact): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address_street' => 'nullable|string|max:255',
            'address_locality' => 'nullable|string|max:255',
            'address_postal_code' => 'nullable|string|max:20',
            'work_time' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'logo_media_id' => 'nullable|exists:cms_media,id',
            'price_display_from' => 'nullable|string|max:50',
            'legal_link' => 'nullable|string|max:500',
        ]);
        $site_contact->update($validated);
        $site_contact->load(['site', 'logoMedia']);
        return response()->json(['data' => $site_contact->fresh()]);
    }

    public function destroy(SiteContact $site_contact): JsonResponse
    {
        $site_contact->delete();
        return response()->json(['message' => 'Контакт удалён']);
    }
}
