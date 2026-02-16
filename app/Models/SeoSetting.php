<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeoSetting extends Model
{
    protected $table = 'seo_settings';

    protected $fillable = [
        'site_id',
        'default_title_suffix',
        'default_description',
        'verification_google',
        'verification_yandex',
        'robots_txt_append',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }
}
