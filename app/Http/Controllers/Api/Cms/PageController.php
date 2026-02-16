<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Page::query()->with('site:id,domain');
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
            'slug' => ['required', 'string', 'max:255', Rule::unique('pages')->where('site_id', $request->input('site_id'))],
            'title' => 'required|string|max:255',
            'status' => 'nullable|string|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);
        $validated['status'] = $validated['status'] ?? 'draft';
        if (($validated['status'] ?? '') === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $page = Page::create($validated);
        $page->load('site:id,domain');
        return response()->json(['data' => $page], 201);
    }

    public function show(Page $page): JsonResponse
    {
        $page->load('site');
        return response()->json(['data' => $page]);
    }

    public function update(Request $request, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => 'required|exists:sites,id',
            'slug' => ['required', 'string', 'max:255', Rule::unique('pages')->where('site_id', $request->input('site_id'))->ignore($page->id)],
            'title' => 'required|string|max:255',
            'status' => 'nullable|string|in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        $page->update($validated);
        $page->load('site');
        return response()->json(['data' => $page->fresh()]);
    }

    public function destroy(Page $page): JsonResponse
    {
        $page->delete();
        return response()->json(['message' => 'Страница удалена']);
    }

    public function publish(Page $page): JsonResponse
    {
        $page->update(['status' => 'published', 'published_at' => $page->published_at ?? now()]);
        return response()->json(['data' => $page->fresh(), 'message' => 'Опубликовано']);
    }

    public function unpublish(Page $page): JsonResponse
    {
        $page->update(['status' => 'draft']);
        return response()->json(['data' => $page->fresh(), 'message' => 'Снято с публикации']);
    }
}
