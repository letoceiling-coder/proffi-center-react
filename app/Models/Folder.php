<?php

namespace App\Models;

use App\Models\Traits\Filterable;
use App\Models\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Folder extends Model
{
    use Filterable, HasUserScope, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'src',
        'parent_id',
        'position',
        'protected',
        'is_trash',
        'user_id',
        'deleted_at',
    ];

    protected $with = ['user', 'files'];

    protected $appends = ['filesCount'];

    protected $casts = [
        'parent_id' => 'integer',
        'position' => 'integer',
        'protected' => 'boolean',
        'is_trash' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id', 'id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id', 'id')
            ->orderBy('position', 'asc')
            ->orderBy('id', 'asc');
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(Media::class, 'folder_id', 'id')
            ->orderBy('created_at', 'desc');
    }

    public function filesCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->files()->count(),
        );
    }

    public function slug(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? str(strtolower($this->name))->slug(),
            set: fn ($value) => $value ?: str(strtolower($this->name))->slug(),
        );
    }

    public function getFullPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parent;
        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }
        return implode(' / ', $path);
    }

    public function isRoot(): bool
    {
        return $this->parent_id === null;
    }

    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    public function hasFiles(): bool
    {
        return $this->files()->exists();
    }

    public function isProtected(): bool
    {
        return $this->protected === true;
    }

    public function isTrash(): bool
    {
        return $this->is_trash === true;
    }

    public static function getTrashFolder(): ?Folder
    {
        return self::withoutUserScope()->where('is_trash', true)->first();
    }
}
