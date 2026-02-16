<?php

namespace Tests\Feature;

use App\Models\CmsMedia;
use App\Models\CmsMediaFile;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\Role;
use App\Models\SeoMeta;
use App\Models\SeoSetting;
use App\Models\Site;
use App\Models\User;
use App\Services\SeoResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsSeoApiTest extends TestCase
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

    // --- SeoSettings ---

    public function test_seo_settings_index_requires_site_id(): void
    {
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/seo-settings');
        $response->assertStatus(422)->assertJsonValidationErrors(['site_id']);
    }

    public function test_seo_settings_index_returns_or_creates_for_site(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/seo-settings?site_id=' . $site->id);
        $response->assertStatus(200)->assertJsonPath('data.site_id', $site->id);
        $this->assertDatabaseHas('seo_settings', ['site_id' => $site->id]);

        $response2 = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/seo-settings?site_id=' . $site->id);
        $response2->assertStatus(200);
        $this->assertEquals(1, SeoSetting::where('site_id', $site->id)->count());
    }

    public function test_seo_settings_update_unique_per_site(): void
    {
        $site = Site::factory()->create();
        $setting = SeoSetting::create([
            'site_id' => $site->id,
            'default_title_suffix' => ' | Site',
            'default_description' => 'Default desc',
        ]);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/seo-settings/' . $setting->id, [
                'default_title_suffix' => ' | Updated',
                'default_description' => 'New default',
            ]);
        $response->assertStatus(200)
            ->assertJsonPath('data.default_description', 'New default');
        $this->assertStringContainsString('Updated', $response->json('data.default_title_suffix'));
    }

    // --- SeoMeta ---

    public function test_seo_meta_show_returns_null_when_empty(): void
    {
        $page = Page::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/pages/' . $page->id . '/seo-meta');
        $response->assertStatus(200)->assertJsonPath('data', null);
    }

    public function test_seo_meta_upsert_for_page(): void
    {
        $page = Page::factory()->create(['title' => 'Page Title']);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/pages/' . $page->id . '/seo-meta', [
                'title' => 'SEO Title',
                'description' => 'SEO description',
                'h1' => 'H1',
                'robots' => 'index,follow',
            ]);
        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'SEO Title')
            ->assertJsonPath('data.description', 'SEO description');
        $this->assertDatabaseHas('seo_meta', ['seo_metaable_id' => $page->id, 'seo_metaable_type' => Page::class]);

        $response2 = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/pages/' . $page->id . '/seo-meta', ['title' => 'Updated SEO Title']);
        $response2->assertStatus(200)->assertJsonPath('data.title', 'Updated SEO Title');
        $this->assertEquals(1, SeoMeta::where('seo_metaable_id', $page->id)->where('seo_metaable_type', Page::class)->count());
    }

    public function test_seo_meta_og_image_media_id_must_exist(): void
    {
        $page = Page::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/pages/' . $page->id . '/seo-meta', [
                'og_image_media_id' => 99999,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['og_image_media_id']);
    }

    public function test_seo_meta_og_image_media_id_accepted_when_exists(): void
    {
        $page = Page::factory()->create();
        $media = CmsMedia::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/pages/' . $page->id . '/seo-meta', [
                'og_image_media_id' => $media->id,
            ]);
        $response->assertStatus(200)->assertJsonPath('data.og_image_media_id', $media->id);
    }

    public function test_seo_meta_unknown_entity_returns_404(): void
    {
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/unknown/1/seo-meta');
        $response->assertStatus(404);
    }

    // --- Redirects ---

    public function test_redirects_store_validates_from_path_starts_with_slash(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/redirects', [
                'site_id' => $site->id,
                'from_path' => 'no-leading-slash',
                'to_url' => 'https://example.com/target',
                'code' => 301,
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['from_path']);
    }

    public function test_redirects_store_and_unique_per_site(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/redirects', [
                'site_id' => $site->id,
                'from_path' => '/old-page',
                'to_url' => '/new-page',
                'code' => 301,
            ]);
        $response->assertStatus(201)->assertJsonPath('data.from_path', '/old-page')->assertJsonPath('data.code', 301);

        $dup = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/redirects', [
                'site_id' => $site->id,
                'from_path' => '/old-page',
                'to_url' => '/other',
                'code' => 302,
            ]);
        $dup->assertStatus(422)->assertJsonValidationErrors(['from_path']);
    }

    public function test_redirects_same_from_path_different_sites_allowed(): void
    {
        $site1 = Site::factory()->create();
        $site2 = Site::factory()->create();
        $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/redirects', [
                'site_id' => $site1->id,
                'from_path' => '/same',
                'to_url' => '/target1',
                'code' => 301,
            ])->assertStatus(201);
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/redirects', [
                'site_id' => $site2->id,
                'from_path' => '/same',
                'to_url' => '/target2',
                'code' => 302,
            ]);
        $response->assertStatus(201);
        $this->assertEquals(2, Redirect::where('from_path', '/same')->count());
    }

    public function test_redirects_update_and_delete(): void
    {
        $site = Site::factory()->create();
        $redirect = Redirect::create([
            'site_id' => $site->id,
            'from_path' => '/a',
            'to_url' => '/b',
            'code' => 301,
        ]);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/redirects/' . $redirect->id, [
                'site_id' => $site->id,
                'from_path' => '/a',
                'to_url' => '/b-new',
                'code' => 302,
            ]);
        $response->assertStatus(200)->assertJsonPath('data.to_url', '/b-new')->assertJsonPath('data.code', 302);

        $del = $this->withHeaders($this->auth())->deleteJson('/api/v1/cms/redirects/' . $redirect->id);
        $del->assertStatus(200);
        $this->assertDatabaseMissing('redirects', ['id' => $redirect->id]);
    }

    // --- SeoResolver ---

    public function test_seo_resolver_meta_overrides_settings(): void
    {
        $site = Site::factory()->create();
        SeoSetting::create([
            'site_id' => $site->id,
            'default_title_suffix' => ' | Suffix',
            'default_description' => 'Site default description',
        ]);
        $page = Page::factory()->create(['site_id' => $site->id, 'title' => 'Page Title']);
        $page->seoMeta()->create([
            'title' => 'Custom SEO Title',
            'description' => 'Custom meta description',
            'h1' => 'Custom H1',
            'robots' => 'noindex,nofollow',
        ]);
        $resolver = new SeoResolver();
        $result = $resolver->resolveFor($page, $site);
        $this->assertSame('Custom SEO Title', $result['title']);
        $this->assertSame('Custom meta description', $result['description']);
        $this->assertSame('Custom H1', $result['h1']);
        $this->assertSame('noindex,nofollow', $result['robots']);
    }

    public function test_seo_resolver_fallback_to_entity_and_settings(): void
    {
        $site = Site::factory()->create();
        SeoSetting::create([
            'site_id' => $site->id,
            'default_title_suffix' => ' | My Site',
            'default_description' => 'Default site description',
        ]);
        $page = Page::factory()->create(['site_id' => $site->id, 'title' => 'About Us']);
        $resolver = new SeoResolver();
        $result = $resolver->resolveFor($page, $site);
        $this->assertStringContainsString('About Us', $result['title']);
        $this->assertStringContainsString('My Site', $result['title']);
        $this->assertSame('Default site description', $result['description']);
        $this->assertSame('About Us', $result['h1']);
        $this->assertSame('index,follow', $result['robots']);
    }

    public function test_seo_resolver_fallback_to_root_site_settings(): void
    {
        $rootSite = Site::factory()->primary()->create();
        $childSite = Site::factory()->create();
        SeoSetting::create([
            'site_id' => $rootSite->id,
            'default_title_suffix' => ' | Root',
            'default_description' => 'Root default description',
        ]);
        $page = Page::factory()->create(['site_id' => $childSite->id, 'title' => 'Child Page']);
        $resolver = new SeoResolver();
        $result = $resolver->resolveFor($page, $childSite);
        $this->assertStringContainsString('Child Page', $result['title']);
        $this->assertStringContainsString('Root', $result['title']);
        $this->assertSame('Root default description', $result['description']);
    }
}
