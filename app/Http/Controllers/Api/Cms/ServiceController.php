<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::query()->with('site:id,domain');
        $query->whereNotNull('site_id');

        if ($request->filled('site_id')) {
            $query->where('site_id', $request->get('site_id'));
        }
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($qb) use ($q) {
                $qb->where('title', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $sort = $request->get('sort', 'updated_at');
        $order = $request->get('order', 'desc');
        if (in_array($sort, ['id', 'title', 'slug', 'status', 'published_at', 'created_at', 'updated_at'])) {
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
            'slug' => ['required', 'string', 'max:255', Rule::unique('services')->where('site_id', $request->input('site_id'))],
            'title' => 'required|string|max:255',
            'status' => 'nullable|string|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);
        $validated['status'] = $validated['status'] ?? 'draft';
        if (($validated['status'] ?? '') === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $service = Service::create($validated);
        $service->load('site:id,domain');
        return response()->json(['data' => $service], 201);
    }

    public function show(Service $service): JsonResponse
    {
        $service->load('site');
        return response()->json(['data' => $service]);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'slug' => ['required', 'string', 'max:255', Rule::unique('services')->where('site_id', $request->input('site_id'))->ignore($service->id)],
            'title' => 'required|string|max:255',
            'status' => 'nullable|string|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        $service->update($validated);
        $service->load('site');
        return response()->json(['data' => $service->fresh()]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();
        return response()->json(['message' => 'Услуга удалена']);
    }

    public function publish(Service $service): JsonResponse
    {
        $service->update(['status' => 'published', 'published_at' => $service->published_at ?? now()]);
        return response()->json(['data' => $service->fresh(), 'message' => 'Опубликовано']);
    }

    public function unpublish(Service $service): JsonResponse
    {
        $service->update(['status' => 'draft']);
        return response()->json(['data' => $service->fresh(), 'message' => 'Снято с публикации']);
    }
}
