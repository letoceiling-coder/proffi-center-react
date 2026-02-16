<?php

namespace App\Models;

use App\Models\Traits\Filterable;
use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    use Filterable, HasUserScope;

    protected $table = 'media';

    protected $fillable = [
        'name',
        'original_name',
        'extension',
        'disk',
        'width',
        'height',
        'type',
        'size',
        'folder_id',
        'original_folder_id',
        'user_id',
        'telegram_file_id',
        'metadata',
        'temporary',
        'deleted_at',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'size' => 'integer',
        'folder_id' => 'integer',
        'original_folder_id' => 'integer',
        'user_id' => 'integer',
        'temporary' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'folder_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function getUrlAttribute(): string
    {
        $metadata = $this->metadata ? json_decode($this->metadata, true) : [];
        $path = $metadata['path'] ?? ($this->disk . '/' . $this->name);
        return '/' . ltrim($path, '/');
    }

    public function getFullPathAttribute(): string
    {
        $metadata = $this->metadata ? json_decode($this->metadata, true) : [];
        $path = $metadata['path'] ?? ($this->disk . '/' . $this->name);
        return public_path($path);
    }

    public function getSizeFormattedAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function isImage(): bool
    {
        return $this->type === 'photo';
    }

    public function isVideo(): bool
    {
        return $this->type === 'video';
    }

    public function isDocument(): bool
    {
        return $this->type === 'document';
    }

    public function fileExists(): bool
    {
        return file_exists($this->fullPath);
    }

    public function getMimeType(): ?string
    {
        $metadata = $this->metadata ? json_decode($this->metadata, true) : [];
        return $metadata['mime_type'] ?? null;
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeInFolder($query, ?int $folderId)
    {
        if ($folderId === null) {
            return $query->whereNull('folder_id');
        }
        return $query->where('folder_id', $folderId);
    }

    public function scopeTemporary($query, bool $temporary = true)
    {
        return $query->where('temporary', $temporary);
    }
}
