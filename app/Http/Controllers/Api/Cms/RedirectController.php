<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RedirectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Redirect::query()->with('site:id,domain');
        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('from_path', 'like', "%{$q}%")->orWhere('to_url', 'like', "%{$q}%");
            });
        }
        $sort = $request->get('sort', 'id');
        $order = $request->get('order', 'desc');
        if (in_array($sort, ['id', 'from_path', 'code', 'is_active', 'created_at'])) {
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
            'from_path' => [
                'required',
                'string',
                'max:500',
                'regex:/^\//',
                Rule::unique('redirects')->where('site_id', $request->input('site_id')),
            ],
            'to_url' => 'required|string|max:500',
            'code' => 'nullable|in:301,302',
            'is_active' => 'nullable|boolean',
        ]);
        $validated['code'] = (int) ($validated['code'] ?? 301);
        $validated['is_active'] = (bool) ($validated['is_active'] ?? true);
        $redirect = Redirect::create($validated);
        $redirect->load('site:id,domain');
        return response()->json(['data' => $redirect], 201);
    }

    public function show(Redirect $redirect): JsonResponse
    {
        $redirect->load('site');
        return response()->json(['data' => $redirect]);
    }

    public function update(Request $request, Redirect $redirect): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'from_path' => [
                'required',
                'string',
                'max:500',
                'regex:/^\//',
                Rule::unique('redirects')->where('site_id', $request->input('site_id'))->ignore($redirect->id),
            ],
            'to_url' => 'required|string|max:500',
            'code' => 'nullable|in:301,302',
            'is_active' => 'nullable|boolean',
        ]);
        if (array_key_exists('code', $validated)) {
            $validated['code'] = (int) $validated['code'];
        }
        if (array_key_exists('is_active', $validated)) {
            $validated['is_active'] = (bool) $validated['is_active'];
        }
        $redirect->update($validated);
        $redirect->load('site');
        return response()->json(['data' => $redirect->fresh()]);
    }

    public function destroy(Redirect $redirect): JsonResponse
    {
        $redirect->delete();
        return response()->json(['message' => 'Редирект удалён']);
    }
}
