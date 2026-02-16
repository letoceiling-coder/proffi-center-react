<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_admin_login_returns_token(): void
    {
        $user = User::factory()->create(['email' => 'admin@test.com']);
        $user->roles()->attach(Role::where('slug', 'admin')->first()->id);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_admin_menu_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/admin/menu');
        $response->assertStatus(401);
    }

    public function test_admin_menu_returns_menu_for_admin(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('slug', 'admin')->first()->id);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/menu');

        $response->assertStatus(200)
            ->assertJsonStructure(['menu'])
            ->assertJsonPath('menu.0.title', 'Медиа');
    }

    public function test_admin_route_returns_admin_view(): void
    {
        $this->withoutVite();
        $response = $this->get('/admin');
        $response->assertStatus(200);
        $response->assertViewIs('admin');
    }
}
