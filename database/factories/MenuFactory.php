<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        $slug = fake()->unique()->slug(1);
        return [
            'site_id' => Site::factory(),
            'slug' => $slug,
            'title' => fake()->words(2, true),
        ];
    }
}
