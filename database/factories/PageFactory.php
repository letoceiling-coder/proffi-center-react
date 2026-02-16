<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class PageFactory extends Factory
{
    protected $model = Page::class;

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

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);
    }
}
