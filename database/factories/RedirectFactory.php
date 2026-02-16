<?php

namespace Database\Factories;

use App\Models\Redirect;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class RedirectFactory extends Factory
{
    protected $model = Redirect::class;

    public function definition(): array
    {
        return [
            'site_id' => Site::factory(),
            'from_path' => '/' . fake()->unique()->slug(2),
            'to_url' => fake()->url(),
            'code' => 301,
            'is_active' => true,
        ];
    }
}
