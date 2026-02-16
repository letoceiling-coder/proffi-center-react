<?php

namespace Database\Factories;

use App\Models\ProductCategory;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductCategoryFactory extends Factory
{
    protected $model = ProductCategory::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(1);
        return [
            'site_id' => Site::factory(),
            'slug' => $slug,
            'title' => fake()->words(3, true),
            'image_media_id' => null,
            'image_active_media_id' => null,
            'sort_order' => 0,
        ];
    }
}
