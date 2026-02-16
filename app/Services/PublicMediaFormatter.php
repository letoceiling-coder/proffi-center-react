<?php

namespace App\Services;

use App\Models\CmsMedia;
use Illuminate\Support\Facades\Storage;

final class PublicMediaFormatter
{
    /**
     * Форматирует медиа сущности для публичного API: cover + gallery с URL.
     *
     * @param \Illuminate\Database\Eloquent\Model $entity (Page|Service|Product with cmsMedia relation loaded)
     * @return array{cover: array|null, gallery: array<int, array>}
     */
    public function formatForEntity(object $entity): array
    {
        $cover = null;
        $gallery = [];
        if (!method_exists($entity, 'cmsMedia')) {
            return ['cover' => null, 'gallery' => []];
        }
        $medias = $entity->cmsMedia()->orderBy('cms_mediables.order')->get();
        foreach ($medias as $media) {
            $url = $this->mediaUrl($media);
            $item = ['url' => $url, 'alt' => $media->alt, 'caption' => $media->caption];
            $role = $media->pivot->role ?? null;
            if ($role === 'cover') {
                $cover = $item;
            } else {
                $gallery[] = $item;
            }
        }
        if ($cover === null && count($gallery) > 0) {
            $cover = $gallery[0];
            $gallery = array_slice($gallery, 1);
        }
        return ['cover' => $cover, 'gallery' => $gallery];
    }

    public function mediaUrl(CmsMedia $media): ?string
    {
        $file = $media->files()->where('variant', 'og')->first()
            ?? $media->files()->where('variant', 'original')->first()
            ?? $media->files()->first();
        if (!$file) {
            return null;
        }
        return Storage::disk($file->disk)->url($file->path);
    }
}
