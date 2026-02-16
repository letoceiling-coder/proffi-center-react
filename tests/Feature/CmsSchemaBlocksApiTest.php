<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\Role;
use App\Models\SchemaBlock;
use App\Models\Service;
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsSchemaBlocksApiTest extends TestCase
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

    public function test_schema_blocks_index_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/cms/schema-blocks');
        $response->assertStatus(401);
    }

    public function test_schema_blocks_index_filtered_by_site_id(): void
    {
        $site = Site::factory()->create();
        SchemaBlock::create([
            'schemaable_type' => Site::class,
            'schemaable_id' => $site->id,
            'type' => 'Organization',
            'data' => ['@type' => 'Organization', 'name' => 'Test'],
            'is_enabled' => true,
            'order' => 0,
        ]);
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/schema-blocks?site_id=' . $site->id);
        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_schema_blocks_store_creates_block(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/schema-blocks', [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'Organization',
                'data' => ['@type' => 'Organization', 'name' => 'Company'],
                'is_enabled' => true,
                'order' => 0,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.type', 'Organization')->assertJsonPath('data.data.name', 'Company');
        $this->assertDatabaseHas('schema_blocks', ['type' => 'Organization', 'schemaable_id' => $site->id]);
    }

    public function test_schema_blocks_validation_type(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/schema-blocks', [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'InvalidType',
                'data' => ['@type' => 'Organization', 'name' => 'X'],
                'is_enabled' => true,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['type']);
    }

    public function test_schema_blocks_validation_data_json_and_required_keys(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/schema-blocks', [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'Organization',
                'data' => [],
                'is_enabled' => true,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['data']);
    }

    public function test_schema_blocks_update_and_destroy(): void
    {
        $site = Site::factory()->create();
        $block = SchemaBlock::create([
            'schemaable_type' => Site::class,
            'schemaable_id' => $site->id,
            'type' => 'Organization',
            'data' => ['@type' => 'Organization', 'name' => 'Old'],
            'is_enabled' => true,
            'order' => 0,
        ]);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/schema-blocks/' . $block->id, [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'Organization',
                'data' => ['@type' => 'Organization', 'name' => 'Updated'],
                'is_enabled' => true,
                'order' => 0,
            ]);
        $response->assertStatus(200)->assertJsonPath('data.data.name', 'Updated');

        $response = $this->withHeaders($this->auth())->deleteJson('/api/v1/cms/schema-blocks/' . $block->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('schema_blocks', ['id' => $block->id]);
    }

    public function test_schema_blocks_enable_rule_disables_previous_same_scope(): void
    {
        $site = Site::factory()->create();
        $first = SchemaBlock::create([
            'schemaable_type' => Site::class,
            'schemaable_id' => $site->id,
            'type' => 'Organization',
            'data' => ['@type' => 'Organization', 'name' => 'First'],
            'is_enabled' => true,
            'order' => 0,
        ]);
        $second = SchemaBlock::create([
            'schemaable_type' => Site::class,
            'schemaable_id' => $site->id,
            'type' => 'Organization',
            'data' => ['@type' => 'Organization', 'name' => 'Second'],
            'is_enabled' => false,
            'order' => 1,
        ]);
        $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/schema-blocks/' . $second->id, [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'Organization',
                'data' => ['@type' => 'Organization', 'name' => 'Second'],
                'is_enabled' => true,
                'order' => 1,
            ])->assertStatus(200);
        $this->assertFalse($first->fresh()->is_enabled);
        $this->assertTrue($second->fresh()->is_enabled);
    }

    public function test_schema_blocks_store_with_page_schemaable(): void
    {
        $page = Page::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/schema-blocks', [
                'schemaable_type' => Page::class,
                'schemaable_id' => $page->id,
                'type' => 'FAQPage',
                'data' => ['@type' => 'FAQPage', 'mainEntity' => []],
                'is_enabled' => true,
                'order' => 0,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.schemaable_id', $page->id);
    }

    public function test_schema_blocks_validation_schemaable_not_found(): void
    {
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/schema-blocks', [
                'schemaable_type' => Site::class,
                'schemaable_id' => 99999,
                'type' => 'Organization',
                'data' => ['@type' => 'Organization', 'name' => 'X'],
                'is_enabled' => true,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['schemaable_id']);
    }

    public function test_schema_blocks_show_returns_block(): void
    {
        $site = Site::factory()->create();
        $block = SchemaBlock::create([
            'schemaable_type' => Site::class,
            'schemaable_id' => $site->id,
            'type' => 'LocalBusiness',
            'data' => ['@type' => 'LocalBusiness', 'name' => 'Biz'],
            'is_enabled' => true,
            'order' => 0,
        ]);
        $response = $this->withHeaders($this->auth())->getJson('/api/v1/cms/schema-blocks/' . $block->id);
        $response->assertStatus(200)->assertJsonPath('data.id', $block->id)->assertJsonPath('data.type', 'LocalBusiness');
    }
}
