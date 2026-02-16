<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SeoMeta extends Model
{
    use HasFactory;
    protected $table = 'seo_meta';

    protected $fillable = [
        'seo_metaable_type',
        'seo_metaable_id',
        'title',
        'description',
        'h1',
        'canonical_url',
        'robots',
        'og_title',
        'og_description',
        'og_image_media_id',
        'twitter_card',
        'twitter_title',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function seoMetaable(): MorphTo
    {
        return $this->morphTo();
    }

    public function ogImageMedia(): BelongsTo
    {
        return $this->belongsTo(CmsMedia::class, 'og_image_media_id');
    }
}
