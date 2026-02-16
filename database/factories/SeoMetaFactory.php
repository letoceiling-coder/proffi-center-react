<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\SeoMeta;
use Illuminate\Database\Eloquent\Factories\Factory;

class SeoMetaFactory extends Factory
{
    protected $model = SeoMeta::class;

    public function definition(): array
    {
        return [
            'seo_metaable_type' => Page::class,
            'seo_metaable_id' => Page::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'h1' => fake()->sentence(2),
        ];
    }
}
