<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);
        return [
            'site_id' => Site::factory(),
            'product_category_id' => null,
            'slug' => $slug,
            'name' => fake()->words(4, true),
            'short_description' => fake()->optional()->sentence(),
            'size_display' => null,
            'price_old' => null,
            'price' => null,
            'status' => 'draft',
            'published_at' => null,
            'sort_order' => 0,
        ];
    }
}
