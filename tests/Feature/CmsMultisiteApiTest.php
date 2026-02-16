<?php

namespace Tests\Feature;

use App\Models\CmsMedia;
use App\Models\Region;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CmsMultisiteApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $this->user = User::factory()->create();
        $this->user->roles()->attach(Role::where('slug', 'admin')->first()->id);
    }

    public function test_cms_regions_index_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/cms/regions');
        $response->assertStatus(401);
    }

    public function test_cms_regions_index_returns_paginated_list(): void
    {
        Region::factory()->count(3)->create();
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/cms/regions');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'per_page', 'total']);
        $this->assertCount(3, $response->json('data'));
    }

    public function test_cms_regions_store_creates_region(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/cms/regions', [
                'name' => 'Краснодарский край',
                'country_code' => 'RU',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Краснодарский край')
            ->assertJsonPath('data.country_code', 'RU');
        $this->assertDatabaseHas('regions', ['name' => 'Краснодарский край']);
    }

    public function test_cms_media_index_returns_list(): void
    {
        CmsMedia::factory()->count(2)->create();
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/cms/cms-media');

        $response->assertStatus(200)->assertJsonStructure(['data', 'current_page']);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_cms_media_upload_creates_media_and_file(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('test.jpg', 100, 100)->size(100);
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->withHeader('Accept', 'application/json')
            ->post('/api/v1/cms/cms-media/upload', [
                'file' => $file,
                'name' => 'Test image',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Test image');
        $this->assertDatabaseHas('cms_media', ['name' => 'Test image']);
        $this->assertDatabaseHas('cms_media_files', ['variant' => 'original']);
    }
}
