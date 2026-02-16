<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class CmsMedia extends Model
{
    use HasFactory;
    protected $table = 'cms_media';

    protected $fillable = ['name', 'alt', 'caption'];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function files(): HasMany
    {
        return $this->hasMany(CmsMediaFile::class, 'media_id');
    }

    /**
     * Полиморфная связь с контентом через cms_mediables.
     * При удалении Page/Service/Product отвязываем медиа (detach), медиа не удаляется.
     */
    public function pages(): MorphToMany
    {
        return $this->morphToMany(Page::class, 'mediable', 'cms_mediables', 'media_id', 'mediable_id')
            ->withPivot('role', 'order')
            ->withTimestamps();
    }

    public function services(): MorphToMany
    {
        return $this->morphToMany(Service::class, 'mediable', 'cms_mediables', 'media_id', 'mediable_id')
            ->withPivot('role', 'order')
            ->withTimestamps();
    }

    public function products(): MorphToMany
    {
        return $this->morphToMany(Product::class, 'mediable', 'cms_mediables', 'media_id', 'mediable_id')
            ->withPivot('role', 'order')
            ->withTimestamps();
    }
}
