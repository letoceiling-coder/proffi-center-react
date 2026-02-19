<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CalcRoom extends Model
{
    protected $table = 'calc_rooms';

    protected $fillable = ['name', 'sort'];

    public function drawings(): HasMany
    {
        return $this->hasMany(CalcDrawing::class, 'room_id');
    }
}
