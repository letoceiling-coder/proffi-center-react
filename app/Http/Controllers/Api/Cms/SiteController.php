<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Site;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Site::query()->with('city:id,name,slug');
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->where('domain', 'like', "%{$s}%");
            });
        }
        if ($request->has('is_primary')) {
            $query->where('is_primary', (bool) $request->get('is_primary'));
        }
        $sort = $request->get('sort', 'domain');
        $order = $request->get('order', 'asc');
        if (in_array($sort, ['id', 'domain', 'is_primary', 'created_at'])) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'domain' => 'required|string|max:255|unique:sites,domain',
            'city_id' => 'nullable|exists:cities,id',
            'is_primary' => 'boolean',
        ]);
        if (!empty($validated['is_primary'])) {
            Site::query()->where('is_primary', true)->update(['is_primary' => false]);
        }
        $validated['is_primary'] = (bool) ($validated['is_primary'] ?? false);
        $site = Site::create($validated);
        $site->load('city:id,name,slug');
        return response()->json(['data' => $site], 201);
    }

    public function show(Site $site): JsonResponse
    {
        $site->load('city');
        return response()->json(['data' => $site]);
    }

    public function update(Request $request, Site $site): JsonResponse
    {
        $validated = $request->validate([
            'domain' => 'required|string|max:255|unique:sites,domain,' . $site->id,
            'city_id' => 'nullable|exists:cities,id',
            'is_primary' => 'boolean',
        ]);
        if (!empty($validated['is_primary']) && !$site->is_primary) {
            Site::query()->where('is_primary', true)->update(['is_primary' => false]);
        }
        if (array_key_exists('is_primary', $validated)) {
            $validated['is_primary'] = (bool) $validated['is_primary'];
        }
        $site->update($validated);
        $site->load('city');
        return response()->json(['data' => $site->fresh()]);
    }

    public function destroy(Site $site): JsonResponse
    {
        $site->delete();
        return response()->json(['message' => 'Сайт удалён']);
    }
}
