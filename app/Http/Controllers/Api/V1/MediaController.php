<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Folder;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Media::query();
        $trashFolder = Folder::getTrashFolder();
        $isTrashFolder = false;

        if ($request->has('folder_id')) {
            $folderId = $request->get('folder_id');
            if ($folderId === null || $folderId === 'null' || $folderId === '' || $folderId === 0 || $folderId === '0') {
                $query->whereNull('folder_id');
            } else {
                $query->where('folder_id', $folderId);
                if ($trashFolder && ($folderId == $trashFolder->id || $folderId == 4)) {
                    $isTrashFolder = true;
                }
            }
        } else {
            $query->whereNull('folder_id');
        }

        if (!$isTrashFolder) {
            $query->whereNull('deleted_at');
        }

        if ($request->filled('original_folder_id')) {
            $query->where('original_folder_id', $request->get('original_folder_id'));
        }

        if ($request->filled('search')) {
            $search = trim($request->get('search'));
            $query->where(function ($q) use ($search) {
                $q->where('original_name', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('extension', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }
        if ($request->filled('extension')) {
            $query->where('extension', $request->get('extension'));
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSortFields = ['name', 'original_name', 'size', 'type', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->get('per_page', config('media.pagination.per_page_default', 20));
        $perPageMax = config('media.pagination.per_page_max', 100);
        if ($perPage > $perPageMax) {
            $perPage = $perPageMax;
        }
        if ($perPage < 1) {
            $perPage = config('media.pagination.per_page_default', 20);
        }

        return MediaResource::collection($query->paginate($perPage));
    }

    public function store(StoreMediaRequest $request): JsonResponse
    {
        try {
            $file = $request->file('file');
            $folderId = $request->input('folder_id');

            if ($folderId == 4) {
                return response()->json(['success' => false, 'message' => 'Нельзя загружать файлы напрямую в корзину.'], 403);
            }
            if ($folderId) {
                $targetFolder = Folder::find($folderId);
                if ($targetFolder && $targetFolder->is_trash) {
                    return response()->json(['success' => false, 'message' => 'Нельзя загружать файлы в корзину.'], 403);
                }
            }

            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getClientMimeType();
            $fileSize = $file->getSize();
            $fileName = uniqid() . '_' . time() . '.' . $extension;
            $type = $this->getFileType($mimeType);
            $uploadPath = 'upload';
            if ($folderId) {
                $folder = Folder::find($folderId);
                if ($folder) {
                    $uploadPath = 'upload/' . $this->getFolderPath($folder);
                }
            }

            $fullPath = public_path($uploadPath);
            if (!file_exists($fullPath)) {
                mkdir($fullPath, 0755, true);
            }
            $file->move($fullPath, $fileName);
            $relativePath = $uploadPath . '/' . $fileName;

            $width = null;
            $height = null;
            if ($type === 'photo') {
                $imagePath = public_path($relativePath);
                $imageInfo = @getimagesize($imagePath);
                if ($imageInfo !== false) {
                    $width = $imageInfo[0];
                    $height = $imageInfo[1];
                }
            }

            $media = Media::create([
                'name' => $fileName,
                'original_name' => $originalName,
                'extension' => $extension,
                'disk' => $uploadPath,
                'width' => $width,
                'height' => $height,
                'type' => $type,
                'size' => $fileSize,
                'folder_id' => $folderId,
                'user_id' => auth()->check() ? auth()->id() : null,
                'temporary' => false,
                'metadata' => json_encode(['path' => $relativePath, 'mime_type' => $mimeType]),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Файл успешно загружен',
                'data' => new MediaResource($media),
            ]);
        } catch (\Exception $e) {
            Log::error('Media upload error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Ошибка загрузки файла', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): MediaResource
    {
        $media = Media::with(['folder', 'user'])->findOrFail($id);
        return new MediaResource($media);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        $request->validate([
            'folder_id' => 'nullable|exists:folders,id',
            'file' => 'nullable|file|max:10240',
        ]);

        try {
            $newFolderId = $request->input('folder_id');
            if ($newFolderId === '' || $newFolderId === 'null') {
                $newFolderId = null;
            }
            $newFile = $request->file('file');

            if ($newFile) {
                $oldPath = public_path($media->disk . '/' . $media->name);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
                $originalName = $newFile->getClientOriginalName();
                $extension = $newFile->getClientOriginalExtension();
                $mimeType = $newFile->getClientMimeType();
                $fileSize = $newFile->getSize();
                $fileName = uniqid() . '_' . time() . '.' . $extension;
                $type = $this->getFileType($mimeType);
                $uploadPath = $media->disk;
                if ($newFolderId !== null) {
                    $folder = Folder::find($newFolderId);
                    if ($folder) {
                        $uploadPath = 'upload/' . $this->getFolderPath($folder);
                    }
                }
                $fullPath = public_path($uploadPath);
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0755, true);
                }
                $newFile->move($fullPath, $fileName);
                $relativePath = $uploadPath . '/' . $fileName;
                $width = null;
                $height = null;
                if ($type === 'photo') {
                    $imageInfo = @getimagesize(public_path($relativePath));
                    if ($imageInfo !== false) {
                        $width = $imageInfo[0];
                        $height = $imageInfo[1];
                    }
                }
                $metadata = $media->metadata ? json_decode($media->metadata, true) : [];
                $metadata['path'] = $relativePath;
                $metadata['mime_type'] = $mimeType;
                $media->update([
                    'name' => $fileName,
                    'original_name' => $originalName,
                    'extension' => $extension,
                    'disk' => $uploadPath,
                    'width' => $width,
                    'height' => $height,
                    'type' => $type,
                    'size' => $fileSize,
                    'folder_id' => $newFolderId ?? $media->folder_id,
                    'metadata' => json_encode($metadata),
                ]);
                return response()->json(['success' => true, 'message' => 'Файл успешно обновлён', 'data' => new MediaResource($media->fresh())]);
            }

            if ($newFolderId == 4) {
                return response()->json(['success' => false, 'message' => 'Нельзя перемещать файлы напрямую в корзину. Используйте функцию удаления.'], 403);
            }
            if ($newFolderId) {
                $targetFolder = Folder::find($newFolderId);
                if ($targetFolder && $targetFolder->is_trash) {
                    return response()->json(['success' => false, 'message' => 'Нельзя перемещать файлы в корзину.'], 403);
                }
            }

            $currentFolderId = $media->folder_id;
            if (($newFolderId !== $currentFolderId) || (is_null($newFolderId) && !is_null($currentFolderId)) || (!is_null($newFolderId) && is_null($currentFolderId))) {
                $oldPath = public_path($media->disk . '/' . $media->name);
                $newUploadPath = 'upload';
                if ($newFolderId) {
                    $folder = Folder::find($newFolderId);
                    if ($folder) {
                        $newUploadPath = 'upload/' . $this->getFolderPath($folder);
                    }
                }
                $newFullPath = public_path($newUploadPath);
                if (!file_exists($newFullPath)) {
                    mkdir($newFullPath, 0755, true);
                }
                $newFilePath = $newFullPath . '/' . $media->name;
                if (file_exists($oldPath)) {
                    rename($oldPath, $newFilePath);
                }
                $metadata = $media->metadata ? json_decode($media->metadata, true) : [];
                $metadata['path'] = $newUploadPath . '/' . $media->name;
                $media->update(['folder_id' => $newFolderId, 'disk' => $newUploadPath, 'metadata' => json_encode($metadata)]);
            }

            return response()->json(['success' => true, 'message' => 'Файл успешно перемещён', 'data' => new MediaResource($media)]);
        } catch (\Exception $e) {
            Log::error('Media move error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Ошибка перемещения файла', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        try {
            $media = Media::findOrFail($id);
            $trashFolder = Folder::getTrashFolder();
            if (!$trashFolder) {
                return response()->json(['success' => false, 'message' => 'Корзина не найдена'], 404);
            }
            if ($media->folder_id == $trashFolder->id) {
                $metadata = $media->metadata ? json_decode($media->metadata, true) : [];
                $filePath = public_path($metadata['path'] ?? ($media->disk . '/' . $media->name));
                if (file_exists($filePath) && is_file($filePath)) {
                    unlink($filePath);
                }
                $media->delete();
                return response()->json(['success' => true, 'message' => 'Файл безвозвратно удалён', 'permanently_deleted' => true]);
            }
            $media->original_folder_id = $media->folder_id;
            $media->folder_id = $trashFolder->id;
            $media->deleted_at = now();
            $media->save();
            return response()->json(['success' => true, 'message' => 'Файл перемещён в корзину', 'moved_to_trash' => true, 'data' => new MediaResource($media)]);
        } catch (\Exception $e) {
            Log::error('Media deletion error', ['media_id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Ошибка удаления файла'], 500);
        }
    }

    public function restore(string $id): JsonResponse
    {
        try {
            $media = Media::findOrFail($id);
            $trashFolder = Folder::getTrashFolder();
            if ($media->folder_id != $trashFolder->id) {
                return response()->json(['success' => false, 'message' => 'Файл не находится в корзине'], 400);
            }
            $media->folder_id = $media->original_folder_id;
            $media->original_folder_id = null;
            $media->deleted_at = null;
            $media->save();
            return response()->json(['success' => true, 'message' => 'Файл успешно восстановлен', 'data' => new MediaResource($media)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка восстановления файла'], 500);
        }
    }

    public function emptyTrash(): JsonResponse
    {
        try {
            $trashFolder = Folder::getTrashFolder();
            if (!$trashFolder) {
                return response()->json(['success' => false, 'message' => 'Корзина не найдена'], 404);
            }
            $trashFiles = Media::where('folder_id', $trashFolder->id)->get();
            $deletedCount = 0;
            foreach ($trashFiles as $media) {
                $metadata = $media->metadata ? json_decode($media->metadata, true) : [];
                $filePath = public_path($metadata['path'] ?? ($media->disk . '/' . $media->name));
                if (file_exists($filePath) && is_file($filePath)) {
                    unlink($filePath);
                }
                $media->delete();
                $deletedCount++;
            }
            return response()->json(['success' => true, 'message' => "Корзина очищена. Удалено файлов: $deletedCount", 'deleted_count' => $deletedCount]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Ошибка очистки корзины'], 500);
        }
    }

    private function getFolderPath(Folder $folder): string
    {
        $path = [];
        $currentFolder = $folder;
        while ($currentFolder) {
            array_unshift($path, Str::slug($currentFolder->name));
            $currentFolder = $currentFolder->parent;
        }
        return implode('/', $path);
    }

    private function getFileType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'photo';
        }
        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }
        return 'document';
    }
}
