<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CmsMediable extends Model
{
    protected $table = 'cms_mediables';

    public $timestamps = true;

    protected $fillable = ['media_id', 'mediable_type', 'mediable_id', 'role', 'order'];

    protected $casts = [
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function media(): BelongsTo
    {
        return $this->belongsTo(CmsMedia::class, 'media_id');
    }

    public function mediable(): MorphTo
    {
        return $this->morphTo();
    }
}
