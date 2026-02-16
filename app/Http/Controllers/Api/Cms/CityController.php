<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = City::query()->with('region:id,name');
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('name_prepositional', 'like', "%{$s}%")
                    ->orWhere('slug', 'like', "%{$s}%");
            });
        }
        if ($request->filled('region_id')) {
            $query->where('region_id', $request->get('region_id'));
        }
        $sort = $request->get('sort', 'name');
        $order = $request->get('order', 'asc');
        if (in_array($sort, ['id', 'name', 'slug', 'region_id', 'created_at'])) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }
        $perPage = min(max((int) $request->get('per_page', 15), 1), 100);
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'region_id' => 'required|exists:regions,id',
            'name' => 'required|string|max:255',
            'name_prepositional' => 'nullable|string|max:255',
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/i', Rule::unique('cities')->where('region_id', $request->input('region_id'))],
        ]);
        $city = City::create($validated);
        $city->load('region:id,name');
        return response()->json(['data' => $city], 201);
    }

    public function show(City $city): JsonResponse
    {
        $city->load('region');
        return response()->json(['data' => $city]);
    }

    public function update(Request $request, City $city): JsonResponse
    {
        $validated = $request->validate([
            'region_id' => 'required|exists:regions,id',
            'name' => 'required|string|max:255',
            'name_prepositional' => 'nullable|string|max:255',
            'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/i', Rule::unique('cities')->where('region_id', $request->input('region_id'))->ignore($city->id)],
        ]);
        $city->update($validated);
        $city->load('region');
        return response()->json(['data' => $city->fresh()]);
    }

    public function destroy(City $city): JsonResponse
    {
        if ($city->sites()->exists()) {
            return response()->json(['message' => 'Невозможно удалить город с сайтами', 'errors' => ['city_id' => ['Сначала удалите или отвяжите сайты.']]], 422);
        }
        $city->delete();
        return response()->json(['message' => 'Город удалён']);
    }
}
