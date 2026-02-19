<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalcDrawing extends Model
{
    use SoftDeletes;

    protected $table = 'calc_drawings';

    protected $fillable = [
        'client_id', 'address_id', 'room_id', 'room_note', 'title', 'status',
        'area', 'perimeter', 'perimeter_shrink', 'corners_count',
        'canvas_area', 'material_name', 'material_price', 'mount_price',
        'canvas_angle', 'has_seams', 'seams_count', 'lighting_count',
        'drawing_data', 'raw_drawing_data', 'raw_cuts_json',
        'goods_data', 'works_data',
        'cut_img_svg', 'calc_img_svg',
    ];

    protected $casts = [
        'area'             => 'float',
        'perimeter'        => 'float',
        'perimeter_shrink' => 'float',
        'canvas_area'      => 'float',
        'material_price'   => 'float',
        'mount_price'      => 'float',
        'has_seams'        => 'boolean',
        'drawing_data'     => 'array',
        'raw_drawing_data' => 'array',
        'raw_cuts_json'    => 'array',
        'goods_data'       => 'array',
        'works_data'       => 'array',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(CalcClient::class, 'client_id');
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(CalcClientAddress::class, 'address_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(CalcRoom::class, 'room_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(CalcDrawingImage::class, 'drawing_id');
    }

    /**
     * Заполнить метрики из optimized_drawing_data.
     */
    public function fillFromDrawingData(array $data): void
    {
        $room  = $data['room_parameters'] ?? [];
        $mat   = $data['material_and_canvas'] ?? [];
        $seams = $data['seams_data'] ?? [];
        $light = $data['lighting'] ?? [];

        $this->area             = (float) ($room['room_area'] ?? 0);
        $this->perimeter        = (float) ($room['perimeter'] ?? 0);
        $this->perimeter_shrink = (float) ($room['perimeter_shrink'] ?? 0);
        $this->corners_count    = (int)   ($room['angles_count'] ?? 0);
        $this->canvas_area      = isset($mat['sq_polotna'])     ? (float) $mat['sq_polotna']     : null;
        $this->canvas_angle     = isset($mat['angle_final'])    ? (int)   $mat['angle_final']    : null;
        $this->has_seams        = (bool) ($seams['seam_flag'] ?? false);
        $this->seams_count      = (int)  ($seams['seam_count'] ?? 0);
        $this->lighting_count   = (int)  ($light['lighting_count'] ?? 0);

        $matData = $mat['material_data'] ?? null;
        if ($matData) {
            $this->material_name  = $matData['material_name'] ?? null;
            $this->material_price = isset($matData['price'])         ? (float) $matData['price']         : null;
            $this->mount_price    = isset($matData['price_montage']) ? (float) $matData['price_montage'] : null;
        }
    }
}
