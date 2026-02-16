<?php

namespace Database\Factories;

use App\Models\CmsMedia;
use App\Models\CmsMediaFile;
use Illuminate\Database\Eloquent\Factories\Factory;

class CmsMediaFileFactory extends Factory
{
    protected $model = CmsMediaFile::class;

    public function definition(): array
    {
        return [
            'media_id' => CmsMedia::factory(),
            'disk' => 'public',
            'path' => 'media/' . fake()->uuid() . '.jpg',
            'variant' => null,
            'mime_type' => 'image/jpeg',
            'size' => fake()->numberBetween(1000, 500000),
            'width' => 800,
            'height' => 600,
        ];
    }
}
