<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\Service;
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsMenusApiTest extends TestCase
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

    protected function auth(): array
    {
        $token = $this->user->createToken('test')->plainTextToken;
        return ['Authorization' => 'Bearer ' . $token];
    }

    public function test_menus_index_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/cms/menus');
        $response->assertStatus(401);
    }

    public function test_menus_index_filtered_by_site_id(): void
    {
        $site = Site::factory()->create();
        Menu::create(['site_id' => $site->id, 'slug' => 'header', 'title' => 'Header']);
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/menus?site_id=' . $site->id);
        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_menus_store_creates_menu(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus', [
                'site_id' => $site->id,
                'slug' => 'footer',
                'title' => 'Footer menu',
            ]);
        $response->assertStatus(201)->assertJsonPath('data.slug', 'footer')->assertJsonPath('data.site_id', $site->id);
        $this->assertDatabaseHas('menus', ['slug' => 'footer', 'site_id' => $site->id]);
    }

    public function test_menus_update_and_destroy(): void
    {
        $menu = Menu::factory()->create(['slug' => 'main', 'title' => 'Main']);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/menus/' . $menu->id, [
                'site_id' => $menu->site_id,
                'slug' => 'main',
                'title' => 'Updated title',
            ]);
        $response->assertStatus(200)->assertJsonPath('data.title', 'Updated title');

        $response = $this->withHeaders($this->auth())->deleteJson('/api/v1/cms/menus/' . $menu->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('menus', ['id' => $menu->id]);
    }

    public function test_menu_items_index_returns_tree(): void
    {
        $menu = Menu::factory()->create();
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Root', 'link_type' => 'url', 'link_value' => '/', 'order' => 0]);
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/menus/' . $menu->id . '/items');
        $response->assertStatus(200)->assertJsonPath('data.menu.id', $menu->id);
        $items = $response->json('data.items');
        $this->assertCount(1, $items);
        $this->assertArrayHasKey('children', $items[0]);
    }

    public function test_menu_items_store_root_item(): void
    {
        $menu = Menu::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu->id . '/items', [
                'title' => 'Home',
                'link_type' => 'url',
                'link_value' => '/',
                'order' => 0,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.title', 'Home')->assertJsonPath('data.link_type', 'url');
        $this->assertDatabaseHas('menu_items', ['menu_id' => $menu->id, 'title' => 'Home', 'parent_id' => null]);
    }

    public function test_menu_items_store_child_item(): void
    {
        $menu = Menu::factory()->create();
        $root = MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Root', 'link_type' => 'url', 'link_value' => '/', 'order' => 0]);
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu->id . '/items', [
                'parent_id' => $root->id,
                'title' => 'Child',
                'link_type' => 'url',
                'link_value' => '/child',
                'order' => 0,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.parent_id', $root->id);
        $this->assertDatabaseHas('menu_items', ['menu_id' => $menu->id, 'parent_id' => $root->id, 'title' => 'Child']);
    }

    public function test_menu_items_parent_id_must_belong_to_same_menu(): void
    {
        $menu1 = Menu::factory()->create();
        $menu2 = Menu::factory()->create();
        $item2 = MenuItem::create(['menu_id' => $menu2->id, 'parent_id' => null, 'title' => 'Other', 'link_type' => 'url', 'link_value' => '/', 'order' => 0]);
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu1->id . '/items', [
                'parent_id' => $item2->id,
                'title' => 'Child',
                'link_type' => 'url',
                'link_value' => '/x',
                'order' => 0,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['parent_id']);
    }

    public function test_menu_items_link_value_page_must_exist_and_same_site(): void
    {
        $site = Site::factory()->create();
        $menu = Menu::factory()->create(['site_id' => $site->id]);
        $page = Page::factory()->create(['site_id' => $site->id, 'slug' => 'about']);
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu->id . '/items', [
                'title' => 'About',
                'link_type' => 'page',
                'link_value' => 'about',
                'order' => 0,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.link_value', 'about');

        $otherSite = Site::factory()->create();
        $menu2 = Menu::factory()->create(['site_id' => $otherSite->id]);
        $response2 = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu2->id . '/items', [
                'title' => 'About',
                'link_type' => 'page',
                'link_value' => 'about',
                'order' => 0,
            ]);
        $response2->assertStatus(422)->assertJsonValidationErrors(['link_value']);
    }

    public function test_menu_items_link_value_product_category_same_site(): void
    {
        $site = Site::factory()->create();
        $menu = Menu::factory()->create(['site_id' => $site->id]);
        ProductCategory::factory()->create(['site_id' => $site->id, 'slug' => 'catalog']);
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu->id . '/items', [
                'title' => 'Catalog',
                'link_type' => 'category',
                'link_value' => 'catalog',
                'order' => 0,
            ]);
        $response->assertStatus(201);

        $response2 = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menus/' . $menu->id . '/items', [
                'title' => 'Bad',
                'link_type' => 'category',
                'link_value' => 'nonexistent-slug',
                'order' => 1,
            ]);
        $response2->assertStatus(422)->assertJsonValidationErrors(['link_value']);
    }

    public function test_menu_items_update_and_delete(): void
    {
        $menu = Menu::factory()->create();
        $item = MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'A', 'link_type' => 'url', 'link_value' => '/a', 'order' => 0]);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/menu-items/' . $item->id, [
                'menu_id' => $menu->id,
                'parent_id' => null,
                'title' => 'A Updated',
                'link_type' => 'url',
                'link_value' => '/a',
                'order' => 0,
            ]);
        $response->assertStatus(200)->assertJsonPath('data.title', 'A Updated');

        $response = $this->withHeaders($this->auth())->deleteJson('/api/v1/cms/menu-items/' . $item->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('menu_items', ['id' => $item->id]);
    }

    public function test_menu_items_delete_cascades_children(): void
    {
        $menu = Menu::factory()->create();
        $root = MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Root', 'link_type' => 'url', 'link_value' => '/', 'order' => 0]);
        $child = MenuItem::create(['menu_id' => $menu->id, 'parent_id' => $root->id, 'title' => 'Child', 'link_type' => 'url', 'link_value' => '/c', 'order' => 0]);
        $this->withHeaders($this->auth())->deleteJson('/api/v1/cms/menu-items/' . $root->id);
        $this->assertDatabaseMissing('menu_items', ['id' => $root->id]);
        $this->assertDatabaseMissing('menu_items', ['id' => $child->id]);
    }

    public function test_menu_items_move_up_down(): void
    {
        $menu = Menu::factory()->create();
        $a = MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'A', 'link_type' => 'url', 'link_value' => '/a', 'order' => 0]);
        $b = MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'B', 'link_type' => 'url', 'link_value' => '/b', 'order' => 1]);
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/menu-items/' . $b->id . '/move', ['direction' => 'up']);
        $response->assertStatus(200);
        $this->assertEquals(0, $b->fresh()->order);
        $this->assertEquals(1, $a->fresh()->order);

        $response2 = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/menus/' . $menu->id . '/items');
        $response2->assertStatus(200);
        $items = $response2->json('data.items');
        $this->assertCount(2, $items);
        $this->assertEquals('B', $items[0]['title']);
        $this->assertEquals('A', $items[1]['title']);
    }
}
