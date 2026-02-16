<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Site extends Model
{
    use HasFactory;
    protected $table = 'sites';

    protected $fillable = ['domain', 'city_id', 'is_primary'];

    protected $casts = [
        'is_primary' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(SiteContact::class, 'site_id');
    }

    public function contact(): HasOne
    {
        return $this->hasOne(SiteContact::class, 'site_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(Page::class, 'site_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'site_id');
    }

    public function productCategories(): HasMany
    {
        return $this->hasMany(ProductCategory::class, 'site_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'site_id');
    }

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class, 'site_id');
    }

    public function redirects(): HasMany
    {
        return $this->hasMany(Redirect::class, 'site_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'site_id');
    }

    public function seoSetting(): HasOne
    {
        return $this->hasOne(SeoSetting::class, 'site_id');
    }

    public function schemaBlocks(): MorphMany
    {
        return $this->morphMany(SchemaBlock::class, 'schemaable')->orderBy('order');
    }

    public static function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }
}
