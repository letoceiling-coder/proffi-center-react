<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RegionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Region::query()->withCount('cities');
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('country_code', 'like', "%{$s}%");
            });
        }
        $sort = $request->get('sort', 'name');
        $order = $request->get('order', 'asc');
        if (in_array($sort, ['id', 'name', 'country_code', 'created_at'])) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country_code' => 'nullable|string|size:2',
        ]);
        $region = Region::create($validated);
        return response()->json(['data' => $region], 201);
    }

    public function show(Region $region): JsonResponse
    {
        $region->loadCount('cities');
        return response()->json(['data' => $region]);
    }

    public function update(Request $request, Region $region): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'country_code' => 'nullable|string|size:2',
        ]);
        $region->update($validated);
        return response()->json(['data' => $region->fresh()]);
    }

    public function destroy(Region $region): JsonResponse
    {
        if ($region->cities()->exists()) {
            return response()->json(['message' => 'Невозможно удалить регион с городами', 'errors' => ['region_id' => ['Сначала удалите города.']]], 422);
        }
        $region->delete();
        return response()->json(['message' => 'Регион удалён']);
    }
}
