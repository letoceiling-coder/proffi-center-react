<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $metadata = $this->metadata ? json_decode($this->metadata, true) : [];
        $path = $metadata['path'] ?? ($this->disk . '/' . $this->name);
        $url = '/' . ltrim($path, '/');
        $trashFolder = \App\Models\Folder::getTrashFolder();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'original_name' => $this->original_name,
            'extension' => $this->extension,
            'disk' => $this->disk,
            'width' => $this->width,
            'height' => $this->height,
            'type' => $this->type,
            'size' => $this->size,
            'folder_id' => $this->folder_id,
            'user_id' => $this->user_id,
            'telegram_file_id' => $this->telegram_file_id,
            'temporary' => $this->temporary,
            'url' => $url,
            'thumbnail' => $this->type === 'photo' ? $url : null,
            'original_folder_id' => $this->original_folder_id,
            'deleted_at' => $this->deleted_at,
            'is_in_trash' => $trashFolder && $this->folder_id == $trashFolder->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'folder' => $this->whenLoaded('folder', fn () => new FolderResource($this->folder)),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
