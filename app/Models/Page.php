<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Page extends Model
{
    use HasFactory;
    protected $table = 'pages';

    protected $fillable = ['site_id', 'slug', 'title', 'status', 'published_at'];

    protected $casts = [
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Page $model) {
            $model->blocks()->delete();
            $model->seoMeta()->delete();
            $model->schemaBlocks()->delete();
            $model->cmsMedia()->detach();
        });
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }

    public function seoMeta(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seo_metaable');
    }

    public function blocks(): MorphMany
    {
        return $this->morphMany(ContentBlock::class, 'blockable')->orderBy('order');
    }

    public function schemaBlocks(): MorphMany
    {
        return $this->morphMany(SchemaBlock::class, 'schemaable')->orderBy('order');
    }

    public function cmsMedia(): MorphToMany
    {
        return $this->morphToMany(CmsMedia::class, 'mediable', 'cms_mediables', 'mediable_id', 'media_id')
            ->withPivot('role', 'order')
            ->withTimestamps();
    }
}
