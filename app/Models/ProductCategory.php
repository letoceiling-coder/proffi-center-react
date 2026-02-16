<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class ProductCategory extends Model
{
    use HasFactory;

    protected $table = 'product_categories';

    protected static function booted(): void
    {
        static::deleting(function (ProductCategory $model) {
            $model->seoMeta()?->delete();
        });
    }

    protected $fillable = [
        'site_id',
        'slug',
        'title',
        'image_media_id',
        'image_active_media_id',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function imageMedia(): BelongsTo
    {
        return $this->belongsTo(CmsMedia::class, 'image_media_id');
    }

    public function imageActiveMedia(): BelongsTo
    {
        return $this->belongsTo(CmsMedia::class, 'image_active_media_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'product_category_id');
    }

    public function seoMeta(): MorphOne
    {
        return $this->morphOne(SeoMeta::class, 'seo_metaable');
    }
}
