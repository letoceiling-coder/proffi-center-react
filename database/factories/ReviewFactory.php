<?php

namespace Database\Factories;

use App\Models\Review;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'site_id' => Site::factory(),
            'author_name' => fake()->name(),
            'text' => fake()->paragraph(),
            'phone' => null,
            'published_at' => null,
            'status' => 'draft',
        ];
    }
}
