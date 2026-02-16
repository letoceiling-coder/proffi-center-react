<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $fillable = [
        'site_id',
        'product_category_id',
        'slug',
        'name',
        'short_description',
        'size_display',
        'price_old',
        'price',
        'status',
        'published_at',
        'sort_order',
    ];

    protected $casts = [
        'price_old' => 'decimal:2',
        'price' => 'decimal:2',
        'published_at' => 'datetime',
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Product $model) {
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

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
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
