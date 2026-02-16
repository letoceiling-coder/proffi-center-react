<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Menu::query()->with('site:id,domain');
        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('slug', 'like', "%{$q}%")->orWhere('title', 'like', "%{$q}%");
            });
        }
        $sort = $request->get('sort', 'id');
        $order = $request->get('order', 'asc');
        if (in_array($sort, ['id', 'slug', 'title', 'site_id', 'created_at'])) {
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
            'slug' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z0-9_-]+$/',
                Rule::unique('menus')->where('site_id', $request->input('site_id')),
            ],
            'title' => 'nullable|string|max:255',
        ]);
        $menu = Menu::create($validated);
        $menu->load('site:id,domain');
        return response()->json(['data' => $menu], 201);
    }

    public function show(Menu $menu): JsonResponse
    {
        $menu->load('site');
        return response()->json(['data' => $menu]);
    }

    public function update(Request $request, Menu $menu): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'slug' => [
                'required',
                'string',
                'max:50',
                'regex:/^[a-z0-9_-]+$/',
                Rule::unique('menus')->where('site_id', $request->input('site_id'))->ignore($menu->id),
            ],
            'title' => 'nullable|string|max:255',
        ]);
        $menu->update($validated);
        $menu->load('site');
        return response()->json(['data' => $menu->fresh()]);
    }

    public function destroy(Menu $menu): JsonResponse
    {
        $menu->delete();
        return response()->json(['message' => 'Меню удалено']);
    }
}
