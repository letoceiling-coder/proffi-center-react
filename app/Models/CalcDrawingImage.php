<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CalcDrawingImage extends Model
{
    protected $table = 'calc_drawing_images';

    protected $fillable = ['drawing_id', 'type', 'path', 'disk'];

    protected $appends = ['url'];

    public function drawing(): BelongsTo
    {
        return $this->belongsTo(CalcDrawing::class, 'drawing_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}
