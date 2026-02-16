<?php

namespace Tests\Feature;

use App\Models\ContentBlock;
use App\Models\CmsMedia;
use App\Models\CmsMediable;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\Service;
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsContentApiTest extends TestCase
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

    public function test_pages_index_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/cms/pages');
        $response->assertStatus(401);
    }

    public function test_pages_store_creates_page(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/pages', [
                'site_id' => $site->id,
                'slug' => 'about',
                'title' => 'О нас',
                'status' => 'draft',
            ]);
        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'О нас')
            ->assertJsonPath('data.slug', 'about');
        $this->assertDatabaseHas('pages', ['slug' => 'about', 'site_id' => $site->id]);
    }

    public function test_pages_update_and_destroy(): void
    {
        $page = Page::factory()->create(['title' => 'Old', 'slug' => 'old']);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/pages/' . $page->id, [
                'site_id' => $page->site_id,
                'slug' => 'old',
                'title' => 'Updated',
                'status' => 'draft',
            ]);
        $response->assertStatus(200)->assertJsonPath('data.title', 'Updated');

        $response = $this->withHeaders($this->auth())
            ->deleteJson('/api/v1/cms/pages/' . $page->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
    }

    public function test_services_store_and_index(): void
    {
        $site = Site::factory()->create();
        $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/services', [
                'site_id' => $site->id,
                'slug' => 'usluga',
                'title' => 'Услуга',
                'status' => 'draft',
            ])->assertStatus(201);

        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/services?site_id=' . $site->id);
        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_product_categories_store_with_valid_image_media_id(): void
    {
        $site = Site::factory()->create();
        $media = CmsMedia::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/product-categories', [
                'site_id' => $site->id,
                'slug' => 'cat1',
                'title' => 'Категория',
                'image_media_id' => $media->id,
            ]);
        $response->assertStatus(201);
        $this->assertEquals($media->id, $response->json('data.image_media_id'));
    }

    public function test_product_categories_store_with_invalid_image_media_id_fails(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/product-categories', [
                'site_id' => $site->id,
                'slug' => 'cat2',
                'title' => 'Категория',
                'image_media_id' => 99999,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['image_media_id']);
    }

    public function test_products_store_with_category_and_gallery(): void
    {
        $site = Site::factory()->create();
        $category = ProductCategory::factory()->create(['site_id' => $site->id]);
        $media = CmsMedia::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/products', [
                'site_id' => $site->id,
                'product_category_id' => $category->id,
                'slug' => 'product-1',
                'name' => 'Товар',
                'status' => 'draft',
            ]);
        $response->assertStatus(201);
        $product = Product::where('slug', 'product-1')->first();
        $this->assertNotNull($product);

        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/products/' . $product->id . '/gallery', [
                'media_ids' => [$media->id],
            ]);
        $response->assertStatus(200);
        $this->assertTrue(
            CmsMediable::where('mediable_type', Product::class)->where('mediable_id', $product->id)->where('role', 'gallery')->exists()
        );
    }

    public function test_blocks_create_for_page_reorder_and_delete(): void
    {
        $page = Page::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/pages/' . $page->id . '/blocks', [
                'type' => 'hero',
                'data' => ['title' => 'Hero title', 'subtitle' => 'Sub'],
                'order' => 0,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.type', 'hero');
        $block = ContentBlock::where('blockable_id', $page->id)->where('blockable_type', Page::class)->first();
        $this->assertNotNull($block);

        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/blocks/' . $block->id . '/move', ['direction' => 'down']);
        $response->assertStatus(200);

        $response = $this->withHeaders($this->auth())
            ->deleteJson('/api/v1/cms/blocks/' . $block->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('content_blocks', ['id' => $block->id]);
    }
}
