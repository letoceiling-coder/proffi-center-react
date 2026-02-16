<?php

namespace Database\Factories;

use App\Models\Site;
use App\Models\SiteContact;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiteContactFactory extends Factory
{
    protected $model = SiteContact::class;

    public function definition(): array
    {
        return [
            'site_id' => Site::factory(),
            'phone' => fake()->optional()->phoneNumber(),
            'email' => fake()->optional()->safeEmail(),
            'company_name' => fake()->optional()->company(),
        ];
    }
}
