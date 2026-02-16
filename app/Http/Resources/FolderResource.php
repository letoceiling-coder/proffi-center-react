<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FolderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'src' => $this->src,
            'parent_id' => $this->parent_id,
            'parent' => $this->whenLoaded('parent', fn () => new FolderResource($this->parent)),
            'children' => FolderResource::collection($this->whenLoaded('children')),
            'position' => $this->position,
            'count' => $this->filesCount,
            'countFolder' => $this->relationLoaded('children') ? $this->children->count() : 0,
            'protected' => $this->protected ?? false,
            'is_trash' => $this->is_trash ?? false,
        ];
    }
}
