<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentBlock extends Model
{
    use HasFactory;
    protected $table = 'content_blocks';

    protected $fillable = ['blockable_type', 'blockable_id', 'type', 'data', 'order'];

    protected $casts = [
        'data' => 'array',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function blockable(): MorphTo
    {
        return $this->morphTo();
    }
}
