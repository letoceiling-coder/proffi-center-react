<?php

namespace Database\Factories;

use App\Models\ContentBlock;
use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContentBlockFactory extends Factory
{
    protected $model = ContentBlock::class;

    public function definition(): array
    {
        return [
            'blockable_type' => Page::class,
            'blockable_id' => Page::factory(),
            'type' => 'text',
            'data' => ['text' => fake()->paragraph()],
            'order' => 0,
        ];
    }
}
