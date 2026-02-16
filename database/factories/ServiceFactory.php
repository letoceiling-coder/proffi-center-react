<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(2);
        return [
            'site_id' => Site::factory(),
            'slug' => $slug,
            'title' => fake()->sentence(3),
            'status' => 'draft',
            'published_at' => null,
        ];
    }
}
