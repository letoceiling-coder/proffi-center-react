<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteContact extends Model
{
    use HasFactory;
    protected $table = 'site_contacts';

    protected $fillable = [
        'site_id',
        'phone',
        'email',
        'address_street',
        'address_locality',
        'address_postal_code',
        'work_time',
        'company_name',
        'logo_media_id',
        'price_display_from',
        'legal_link',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function logoMedia(): BelongsTo
    {
        return $this->belongsTo(CmsMedia::class, 'logo_media_id');
    }
}
