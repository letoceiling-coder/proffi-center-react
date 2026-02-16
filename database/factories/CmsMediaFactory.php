<?php

namespace Database\Factories;

use App\Models\CmsMedia;
use Illuminate\Database\Eloquent\Factories\Factory;

class CmsMediaFactory extends Factory
{
    protected $model = CmsMedia::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'alt' => fake()->sentence(2),
            'caption' => fake()->optional()->sentence(),
        ];
    }
}
