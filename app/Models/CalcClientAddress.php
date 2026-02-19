<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalcClientAddress extends Model
{
    use SoftDeletes;

    protected $table = 'calc_client_addresses';

    protected $fillable = ['client_id', 'address'];

    public function client(): BelongsTo
    {
        return $this->belongsTo(CalcClient::class, 'client_id');
    }

    public function drawings(): HasMany
    {
        return $this->hasMany(CalcDrawing::class, 'address_id');
    }
}
