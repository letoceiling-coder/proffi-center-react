<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\Review;
use App\Models\SeoSetting;
use App\Models\Site;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_site_resolve_by_host_returns_site(): void
    {
        $site = Site::factory()->create(['domain' => 'example.com']);
        $response = $this->getJson('/api/v1/site/resolve?host=example.com');
        $response->assertStatus(200)
            ->assertJsonPath('data.site.id', $site->id)
            ->assertJsonPath('data.site.domain', 'example.com');
    }

    public function test_site_resolve_fallback_to_root_when_host_unknown(): void
    {
        $root = Site::factory()->primary()->create(['domain' => 'root.local']);
        $response = $this->getJson('/api/v1/site/resolve?host=unknown.example.com');
        $response->assertStatus(200)
            ->assertJsonPath('data.site.id', $root->id)
            ->assertJsonPath('data.site.domain', 'root.local');
    }

    public function test_site_resolve_uses_root_when_no_site_matches(): void
    {
        Site::factory()->primary()->create(['domain' => 'main.org']);
        $response = $this->getJson('/api/v1/site/resolve?host=other.org');
        $response->assertStatus(200)->assertJsonPath('data.site.domain', 'main.org');
    }

    public function test_menu_resolve_returns_tree(): void
    {
        $site = Site::factory()->create();
        $menu = Menu::create(['site_id' => $site->id, 'slug' => 'header', 'title' => 'Header']);
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Home', 'link_type' => 'url', 'link_value' => '/', 'order' => 0]);
        $response = $this->getJson('/api/v1/menu/header?host=' . $site->domain);
        $response->assertStatus(200)
            ->assertJsonPath('data.0.title', 'Home')
            ->assertJsonPath('data.0.href', '/')
            ->assertJsonPath('meta.site.id', $site->id);
    }

    public function test_menu_fallback_root_when_current_site_has_no_menu(): void
    {
        $root = Site::factory()->primary()->create();
        $rootMenu = Menu::create(['site_id' => $root->id, 'slug' => 'footer', 'title' => 'Footer']);
        MenuItem::create(['menu_id' => $rootMenu->id, 'parent_id' => null, 'title' => 'Root link', 'link_type' => 'url', 'link_value' => '/root', 'order' => 0]);
        $other = Site::factory()->create(['domain' => 'other.com']);
        $response = $this->getJson('/api/v1/menu/footer?host=other.com');
        $response->assertStatus(200)->assertJsonPath('data.0.title', 'Root link')->assertJsonPath('data.0.href', '/root');
    }

    public function test_menu_invalid_key_returns_404(): void
    {
        $site = Site::factory()->create();
        $response = $this->getJson('/api/v1/menu/invalid?host=' . $site->domain);
        $response->assertStatus(404);
    }

    public function test_page_by_slug_current_site_hit(): void
    {
        $site = Site::factory()->create();
        $page = Page::factory()->published()->create(['site_id' => $site->id, 'slug' => 'about', 'title' => 'About']);
        $response = $this->getJson('/api/v1/page/about?host=' . $site->domain);
        $response->assertStatus(200)
            ->assertJsonPath('data.slug', 'about')
            ->assertJsonPath('data.title', 'About');
        $this->assertNotEmpty($response->json('meta.seo'));
        $this->assertArrayHasKey('title', $response->json('meta.seo'));
    }

    public function test_page_by_slug_fallback_root_hit(): void
    {
        $root = Site::factory()->primary()->create();
        $other = Site::factory()->create(['domain' => 'other.org']);
        Page::factory()->published()->create(['site_id' => $root->id, 'slug' => 'contact', 'title' => 'Contact']);
        $response = $this->getJson('/api/v1/page/contact?host=other.org');
        $response->assertStatus(200)->assertJsonPath('data.slug', 'contact')->assertJsonPath('data.title', 'Contact');
    }

    public function test_page_draft_not_returned_returns_404(): void
    {
        $site = Site::factory()->create();
        Page::factory()->create(['site_id' => $site->id, 'slug' => 'draft-page', 'title' => 'Draft', 'status' => 'draft']);
        $response = $this->getJson('/api/v1/page/draft-page?host=' . $site->domain);
        $response->assertStatus(404);
    }

    public function test_page_not_found_returns_404(): void
    {
        $site = Site::factory()->create();
        $response = $this->getJson('/api/v1/page/nonexistent?host=' . $site->domain);
        $response->assertStatus(404);
    }

    public function test_redirects_check_current_site_precedence_over_root(): void
    {
        $root = Site::factory()->primary()->create();
        $site = Site::factory()->create(['domain' => 'sub.example.com']);
        Redirect::create(['site_id' => $root->id, 'from_path' => '/old', 'to_url' => 'https://root.com/new', 'code' => 301, 'is_active' => true]);
        Redirect::create(['site_id' => $site->id, 'from_path' => '/old', 'to_url' => 'https://sub.example.com/new', 'code' => 302, 'is_active' => true]);
        $response = $this->getJson('/api/v1/redirects/check?host=sub.example.com&path=/old');
        $response->assertStatus(200)
            ->assertJsonPath('matched', true)
            ->assertJsonPath('to', 'https://sub.example.com/new')
            ->assertJsonPath('code', 302);
    }

    public function test_redirects_check_no_match_returns_matched_false(): void
    {
        $site = Site::factory()->create();
        $response = $this->getJson('/api/v1/redirects/check?host=' . $site->domain . '&path=/no-redirect');
        $response->assertStatus(200)->assertJsonPath('matched', false)->assertJsonPath('to', null);
    }

    public function test_robots_txt_returns_text_plain(): void
    {
        $site = Site::factory()->create();
        $response = $this->get('/api/v1/robots.txt?host=' . $site->domain);
        $response->assertStatus(200);
        $this->assertStringContainsString('text/plain', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('User-agent: *', $response->getContent());
    }

    public function test_robots_txt_includes_seo_append_when_set(): void
    {
        $site = Site::factory()->create();
        SeoSetting::create(['site_id' => $site->id, 'robots_txt_append' => "Disallow: /admin\nSitemap: https://example.com/sitemap.xml"]);
        $response = $this->get('/api/v1/robots.txt?host=' . $site->domain);
        $response->assertStatus(200);
        $this->assertStringContainsString('Disallow: /admin', $response->getContent());
    }

    public function test_sitemap_xml_returns_application_xml(): void
    {
        $site = Site::factory()->create();
        $response = $this->get('/api/v1/sitemap.xml?host=' . $site->domain);
        $response->assertStatus(200);
        $this->assertStringContainsString('application/xml', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('<urlset', $response->getContent());
    }

    public function test_sitemap_xml_includes_published_pages(): void
    {
        $site = Site::factory()->create(['domain' => 'sitemap.example.com']);
        Page::factory()->published()->create(['site_id' => $site->id, 'slug' => 'test-page']);
        $response = $this->get('/api/v1/sitemap.xml?host=sitemap.example.com');
        $response->assertStatus(200);
        $body = $response->getContent();
        $this->assertStringContainsString('test-page', $body);
    }

    public function test_reviews_current_site_only_published(): void
    {
        $site = Site::factory()->create();
        Review::factory()->create(['site_id' => $site->id, 'status' => 'published', 'published_at' => now()->subDay(), 'author_name' => 'Published']);
        Review::factory()->create(['site_id' => $site->id, 'status' => 'draft', 'author_name' => 'Draft']);
        $response = $this->getJson('/api/v1/reviews?host=' . $site->domain);
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertSame('Published', $data[0]['author_name']);
    }

    public function test_public_api_does_not_require_auth(): void
    {
        $site = Site::factory()->create();
        $this->getJson('/api/v1/site/resolve?host=' . $site->domain)->assertStatus(200);
        $this->getJson('/api/v1/menu/header?host=' . $site->domain)->assertStatus(200);
    }
}
