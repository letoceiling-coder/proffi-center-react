<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SchemaBlock extends Model
{
    protected $table = 'schema_blocks';

    protected $fillable = ['schemaable_type', 'schemaable_id', 'type', 'data', 'is_enabled', 'order'];

    protected $casts = [
        'data' => 'array',
        'is_enabled' => 'boolean',
        'order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function schemaable(): MorphTo
    {
        return $this->morphTo();
    }
}
