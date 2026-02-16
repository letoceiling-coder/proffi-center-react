<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsMedia;
use App\Models\CmsMediable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CmsMediaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CmsMedia::query()->withCount('files');
        if ($request->filled('search')) {
            $s = $request->get('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('alt', 'like', "%{$s}%")
                    ->orWhere('caption', 'like', "%{$s}%");
            });
        }
        $sort = $request->get('sort', 'created_at');
        $order = $request->get('order', 'desc');
        if (in_array($sort, ['id', 'name', 'created_at'])) {
            $query->orderBy($sort, $order === 'desc' ? 'desc' : 'asc');
        }
        $perPage = min(max((int) $request->get('per_page', 20), 1), (int) config('media.pagination.per_page_max', 100));
        $data = $query->paginate($perPage);
        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'alt' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
        ]);
        $media = CmsMedia::create($validated);
        return response()->json(['data' => $media], 201);
    }

    public function show(CmsMedia $cms_media): JsonResponse
    {
        $cms_media->load('files');
        return response()->json(['data' => $cms_media]);
    }

    public function update(Request $request, CmsMedia $cms_media): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'alt' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
        ]);
        $cms_media->update($validated);
        return response()->json(['data' => $cms_media->fresh()]);
    }

    public function destroy(CmsMedia $cms_media): JsonResponse
    {
        foreach ($cms_media->files as $file) {
            Storage::disk($file->disk)->delete($file->path);
        }
        $cms_media->delete();
        return response()->json(['message' => 'Медиа удалено']);
    }

    public function upload(Request $request): JsonResponse
    {
        $maxKb = (int) config('media.upload.max_size', 10240);
        $allowedMime = config('media.upload.allowed_mime_types', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
        if (config('media.upload.allow_all_types')) {
            $mimeRule = 'required|file|max:' . $maxKb;
        } else {
            $mimeRule = 'required|file|max:' . $maxKb . '|mimetypes:' . implode(',', $allowedMime);
        }

        $request->validate([
            'file' => $mimeRule,
            'name' => 'nullable|string|max:255',
            'alt' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        $disk = 'public';
        $path = $file->store('cms/' . date('Y/m/d'), $disk);
        if (!$path) {
            return response()->json(['message' => 'Ошибка сохранения файла', 'errors' => ['file' => ['Не удалось сохранить файл.']]], 422);
        }

        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        $width = null;
        $height = null;
        if (str_starts_with($mimeType, 'image/')) {
            $imagePath = $file->getRealPath();
            $info = @getimagesize($imagePath);
            if ($info) {
                $width = $info[0];
                $height = $info[1];
            }
        }

        $media = CmsMedia::create([
            'name' => $request->input('name') ?: $file->getClientOriginalName(),
            'alt' => $request->input('alt'),
            'caption' => $request->input('caption'),
        ]);

        $media->files()->create([
            'disk' => $disk,
            'path' => $path,
            'variant' => 'original',
            'mime_type' => $mimeType,
            'size' => $size,
            'width' => $width,
            'height' => $height,
        ]);

        $media->load('files');
        return response()->json(['data' => $media], 201);
    }

    /** Привязать медиа к сущности (page, service, product). */
    public function attach(Request $request, CmsMedia $cms_media): JsonResponse
    {
        $validated = $request->validate([
            'mediable_type' => ['required', 'string', Rule::in([\App\Models\Page::class, \App\Models\Service::class, \App\Models\Product::class])],
            'mediable_id' => 'required|integer|min:1',
            'role' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
        ]);
        $mediableType = $validated['mediable_type'];
        $mediableId = (int) $validated['mediable_id'];
        $role = $validated['role'] ?? null;
        $order = (int) ($validated['order'] ?? 0);

        $exists = \App\Models\CmsMediable::where('media_id', $cms_media->id)
            ->where('mediable_type', $mediableType)
            ->where('mediable_id', $mediableId)
            ->where('role', $role)
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'Медиа уже привязано к этой сущности с таким role', 'errors' => ['mediable' => ['Дубликат привязки.']]], 422);
        }

        $mediable = $mediableType::find($mediableId);
        if (!$mediable) {
            return response()->json(['message' => 'Сущность не найдена', 'errors' => ['mediable_id' => ['Не найдено.']]], 422);
        }

        $mediable->cmsMedia()->attach($cms_media->id, ['role' => $role, 'order' => $order]);
        return response()->json(['message' => 'Медиа привязано', 'data' => ['media_id' => $cms_media->id]]);
    }

    /** Отвязать медиа от сущности. */
    public function detach(Request $request, CmsMedia $cms_media): JsonResponse
    {
        $validated = $request->validate([
            'mediable_type' => ['required', 'string', Rule::in([\App\Models\Page::class, \App\Models\Service::class, \App\Models\Product::class])],
            'mediable_id' => 'required|integer|min:1',
            'role' => 'nullable|string|max:50',
        ]);
        $mediableType = $validated['mediable_type'];
        $mediableId = (int) $validated['mediable_id'];
        $role = $validated['role'] ?? null;

        $query = CmsMediable::where('media_id', $cms_media->id)
            ->where('mediable_type', $mediableType)
            ->where('mediable_id', $mediableId);
        if ($role !== null) {
            $query->where('role', $role);
        }
        $query->delete();
        return response()->json(['message' => 'Медиа отвязано']);
    }
}
