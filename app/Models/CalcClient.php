<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalcClient extends Model
{
    use SoftDeletes;

    protected $table = 'calc_clients';

    protected $fillable = ['telegram_id', 'name', 'phone'];

    public function addresses(): HasMany
    {
        return $this->hasMany(CalcClientAddress::class, 'client_id');
    }

    public function drawings(): HasMany
    {
        return $this->hasMany(CalcDrawing::class, 'client_id');
    }
}
