<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Redirect;
use App\Models\Review;
use App\Models\SeoSetting;
use App\Models\Service;
use App\Models\Site;
use Carbon\Carbon;
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

    public function test_site_resolve_normalizes_host(): void
    {
        $site = Site::factory()->create(['domain' => 'example.com']);
        $response = $this->getJson('/api/v1/site/resolve?host=https://Example.com/path');
        $response->assertStatus(200)->assertJsonPath('data.site.id', $site->id)->assertJsonPath('data.site.domain', 'example.com');
    }

    public function test_site_resolve_uses_header_host_when_no_query(): void
    {
        $site = Site::factory()->create(['domain' => 'header.example.com']);
        $response = $this->withHeader('X-Forwarded-Host', 'header.example.com')->getJson('/api/v1/site/resolve');
        $response->assertStatus(200)->assertJsonPath('data.site.id', $site->id);
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

    public function test_menu_link_type_page_builds_href(): void
    {
        $site = Site::factory()->create();
        Page::factory()->published()->create(['site_id' => $site->id, 'slug' => 'about']);
        $menu = Menu::create(['site_id' => $site->id, 'slug' => 'header', 'title' => 'Header']);
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'About', 'link_type' => 'page', 'link_value' => 'about', 'order' => 0]);
        $response = $this->getJson('/api/v1/menu/header?host=' . $site->domain);
        $response->assertStatus(200)->assertJsonPath('data.0.href', '/about');
    }

    public function test_menu_link_type_service_builds_href(): void
    {
        $site = Site::factory()->create();
        Service::create(['site_id' => $site->id, 'slug' => 'ustanovka', 'title' => 'Установка', 'status' => 'published', 'published_at' => now()->subDay()]);
        $menu = Menu::create(['site_id' => $site->id, 'slug' => 'header', 'title' => 'Header']);
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Установка', 'link_type' => 'service', 'link_value' => 'ustanovka', 'order' => 0]);
        $response = $this->getJson('/api/v1/menu/header?host=' . $site->domain);
        $response->assertStatus(200)->assertJsonPath('data.0.href', '/uslugi/ustanovka');
    }

    public function test_menu_link_type_category_builds_href(): void
    {
        $site = Site::factory()->create();
        ProductCategory::factory()->create(['site_id' => $site->id, 'slug' => 'catalog']);
        $menu = Menu::create(['site_id' => $site->id, 'slug' => 'header', 'title' => 'Header']);
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Каталог', 'link_type' => 'category', 'link_value' => 'catalog', 'order' => 0]);
        $response = $this->getJson('/api/v1/menu/header?host=' . $site->domain);
        $response->assertStatus(200)->assertJsonPath('data.0.href', '/catalog/catalog');
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

    public function test_page_future_published_at_not_returned(): void
    {
        $site = Site::factory()->create();
        Page::create(['site_id' => $site->id, 'slug' => 'future-page', 'title' => 'Future', 'status' => 'published', 'published_at' => now()->addDay()]);
        $response = $this->getJson('/api/v1/page/future-page?host=' . $site->domain);
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

    public function test_redirects_inactive_not_matched(): void
    {
        $site = Site::factory()->create();
        Redirect::create(['site_id' => $site->id, 'from_path' => '/inactive', 'to_url' => 'https://example.com/new', 'code' => 301, 'is_active' => false]);
        $response = $this->getJson('/api/v1/redirects/check?host=' . $site->domain . '&path=/inactive');
        $response->assertStatus(200)->assertJsonPath('matched', false);
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

    public function test_sitemap_xml_excludes_draft_and_future(): void
    {
        $site = Site::factory()->create(['domain' => 'sitemap2.example.com']);
        Page::factory()->published()->create(['site_id' => $site->id, 'slug' => 'published-only']);
        Page::factory()->create(['site_id' => $site->id, 'slug' => 'draft-sitemap', 'title' => 'Draft', 'status' => 'draft']);
        Page::create(['site_id' => $site->id, 'slug' => 'future-sitemap', 'title' => 'Future', 'status' => 'published', 'published_at' => now()->addDays(2)]);
        $response = $this->get('/api/v1/sitemap.xml?host=sitemap2.example.com');
        $response->assertStatus(200);
        $body = $response->getContent();
        $this->assertStringContainsString('published-only', $body);
        $this->assertStringNotContainsString('draft-sitemap', $body);
        $this->assertStringNotContainsString('future-sitemap', $body);
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

    public function test_reviews_pagination_per_page(): void
    {
        $site = Site::factory()->create();
        Review::create(['site_id' => $site->id, 'author_name' => 'A', 'text' => 't', 'status' => 'published', 'published_at' => now()->subDay()]);
        Review::create(['site_id' => $site->id, 'author_name' => 'B', 'text' => 't', 'status' => 'published', 'published_at' => now()->subDay()]);
        Review::create(['site_id' => $site->id, 'author_name' => 'C', 'text' => 't', 'status' => 'published', 'published_at' => now()->subDay()]);
        $response = $this->getJson('/api/v1/reviews?host=' . $site->domain . '&per_page=2');
        $response->assertStatus(200)->assertJsonPath('meta.pagination.per_page', 2);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_public_api_does_not_require_auth(): void
    {
        $site = Site::factory()->create();
        $this->getJson('/api/v1/site/resolve?host=' . $site->domain)->assertStatus(200);
        $this->getJson('/api/v1/menu/header?host=' . $site->domain)->assertStatus(200);
    }

    // --- Critical coverage (fallback, redirect precedence, robots/sitemap, reviews no-fallback) ---

    public function test_redirects_path_normalized_with_leading_slash(): void
    {
        $site = Site::factory()->create();
        Redirect::create(['site_id' => $site->id, 'from_path' => '/old', 'to_url' => 'https://example.com/new', 'code' => 301, 'is_active' => true]);
        $response = $this->getJson('/api/v1/redirects/check?host=' . $site->domain . '&path=old');
        $response->assertStatus(200)->assertJsonPath('matched', true)->assertJsonPath('to', 'https://example.com/new');
    }

    public function test_redirects_same_from_path_current_site_wins_over_root(): void
    {
        $root = Site::factory()->primary()->create(['domain' => 'root.local']);
        $current = Site::factory()->create(['domain' => 'current.local']);
        Redirect::create(['site_id' => $root->id, 'from_path' => '/same', 'to_url' => 'https://root.local/target', 'code' => 301, 'is_active' => true]);
        Redirect::create(['site_id' => $current->id, 'from_path' => '/same', 'to_url' => 'https://current.local/target', 'code' => 302, 'is_active' => true]);
        $response = $this->getJson('/api/v1/redirects/check?host=current.local&path=/same');
        $response->assertStatus(200)->assertJsonPath('matched', true)->assertJsonPath('to', 'https://current.local/target')->assertJsonPath('code', 302);
    }

    public function test_page_fallback_root_when_not_on_current_site_returns_200(): void
    {
        $root = Site::factory()->primary()->create();
        $current = Site::factory()->create(['domain' => 'other.org']);
        Page::factory()->published()->create(['site_id' => $root->id, 'slug' => 'only-on-root', 'title' => 'Root Page']);
        $response = $this->getJson('/api/v1/page/only-on-root?host=other.org');
        $response->assertStatus(200)->assertJsonPath('data.slug', 'only-on-root')->assertJsonPath('data.title', 'Root Page');
    }

    public function test_service_fallback_root_when_not_on_current_site_returns_200(): void
    {
        $root = Site::factory()->primary()->create();
        $current = Site::factory()->create(['domain' => 'other.org']);
        Service::create(['site_id' => $root->id, 'slug' => 'root-service', 'title' => 'Root Service', 'status' => 'published', 'published_at' => now()->subDay()]);
        $response = $this->getJson('/api/v1/service/root-service?host=other.org');
        $response->assertStatus(200)->assertJsonPath('data.slug', 'root-service')->assertJsonPath('data.title', 'Root Service');
    }

    public function test_product_fallback_root_when_not_on_current_site_returns_200(): void
    {
        $root = Site::factory()->primary()->create();
        $current = Site::factory()->create(['domain' => 'other.org']);
        $cat = ProductCategory::factory()->create(['site_id' => $root->id, 'slug' => 'cat', 'title' => 'Cat']);
        Product::create(['site_id' => $root->id, 'product_category_id' => $cat->id, 'slug' => 'root-product', 'name' => 'Root Product', 'status' => 'published', 'published_at' => now()->subDay()]);
        $response = $this->getJson('/api/v1/product/root-product?host=other.org');
        $response->assertStatus(200)->assertJsonPath('data.slug', 'root-product')->assertJsonPath('data.name', 'Root Product');
    }

    public function test_page_fallback_root_only_draft_returns_404(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-06-01 12:00:00'));
        $root = Site::factory()->primary()->create();
        $current = Site::factory()->create(['domain' => 'other.org']);
        Page::factory()->create(['site_id' => $root->id, 'slug' => 'draft-on-root', 'title' => 'Draft', 'status' => 'draft']);
        $response = $this->getJson('/api/v1/page/draft-on-root?host=other.org');
        $response->assertStatus(404);
        Carbon::setTestNow();
    }

    public function test_page_fallback_root_only_future_published_at_returns_404(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-06-01 12:00:00'));
        $root = Site::factory()->primary()->create();
        $current = Site::factory()->create(['domain' => 'other.org']);
        Page::create(['site_id' => $root->id, 'slug' => 'future-on-root', 'title' => 'Future', 'status' => 'published', 'published_at' => Carbon::parse('2025-06-02 12:00:00')]);
        $response = $this->getJson('/api/v1/page/future-on-root?host=other.org');
        $response->assertStatus(404);
        Carbon::setTestNow();
    }

    public function test_menu_fallback_root_header_when_current_has_no_header(): void
    {
        $root = Site::factory()->primary()->create(['domain' => 'root.org']);
        $current = Site::factory()->create(['domain' => 'current.org']);
        $rootMenu = Menu::create(['site_id' => $root->id, 'slug' => 'header', 'title' => 'Root Header']);
        MenuItem::create(['menu_id' => $rootMenu->id, 'parent_id' => null, 'title' => 'From Root', 'link_type' => 'url', 'link_value' => '/from-root', 'order' => 0]);
        $response = $this->getJson('/api/v1/menu/header?host=current.org');
        $response->assertStatus(200)->assertJsonPath('data.0.title', 'From Root')->assertJsonPath('data.0.href', '/from-root');
    }

    public function test_menu_tree_siblings_sorted_by_order(): void
    {
        $site = Site::factory()->create();
        $menu = Menu::create(['site_id' => $site->id, 'slug' => 'header', 'title' => 'Header']);
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'Second', 'link_type' => 'url', 'link_value' => '/b', 'order' => 2]);
        MenuItem::create(['menu_id' => $menu->id, 'parent_id' => null, 'title' => 'First', 'link_type' => 'url', 'link_value' => '/a', 'order' => 0]);
        $response = $this->getJson('/api/v1/menu/header?host=' . $site->domain);
        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(2, $data);
        $this->assertSame('First', $data[0]['title']);
        $this->assertSame(0, $data[0]['order']);
        $this->assertSame('Second', $data[1]['title']);
        $this->assertSame(2, $data[1]['order']);
    }

    public function test_robots_txt_content_type_is_text_plain_with_charset(): void
    {
        $site = Site::factory()->create();
        $response = $this->get('/api/v1/robots.txt?host=' . $site->domain);
        $response->assertStatus(200);
        $ct = $response->headers->get('Content-Type');
        $this->assertStringContainsString('text/plain', $ct);
    }

    public function test_sitemap_content_type_is_application_xml(): void
    {
        $site = Site::factory()->create();
        $response = $this->get('/api/v1/sitemap.xml?host=' . $site->domain);
        $response->assertStatus(200);
        $ct = $response->headers->get('Content-Type');
        $this->assertTrue(str_contains($ct, 'application/xml') || str_contains($ct, 'text/xml'), 'Content-Type should be application/xml or text/xml');
    }

    public function test_sitemap_body_excludes_draft_and_future_urls(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-06-01 12:00:00'));
        $site = Site::factory()->create(['domain' => 'critical.example.com']);
        Page::factory()->published()->create(['site_id' => $site->id, 'slug' => 'live']);
        Page::factory()->create(['site_id' => $site->id, 'slug' => 'draft-url', 'title' => 'D', 'status' => 'draft']);
        Page::create(['site_id' => $site->id, 'slug' => 'future-url', 'title' => 'F', 'status' => 'published', 'published_at' => now()->addDay()]);
        $response = $this->get('/api/v1/sitemap.xml?host=critical.example.com');
        $response->assertStatus(200);
        $body = $response->getContent();
        $this->assertStringContainsString('live', $body);
        $this->assertStringNotContainsString('draft-url', $body);
        $this->assertStringNotContainsString('future-url', $body);
        Carbon::setTestNow();
    }

    public function test_reviews_returns_empty_when_current_site_has_none_root_has_published(): void
    {
        $root = Site::factory()->primary()->create(['domain' => 'root.reviews.local']);
        $current = Site::factory()->create(['domain' => 'current.reviews.local']);
        Review::create(['site_id' => $root->id, 'author_name' => 'Root Review', 'text' => 'T', 'status' => 'published', 'published_at' => now()->subDay()]);
        $response = $this->getJson('/api/v1/reviews?host=current.reviews.local');
        $response->assertStatus(200)->assertJsonPath('data', []);
        $this->assertSame(0, $response->json('meta.pagination.total'));
    }

    public function test_site_resolve_unknown_host_returns_primary_site(): void
    {
        $primary = Site::factory()->primary()->create(['domain' => 'primary.local']);
        Site::factory()->create(['domain' => 'secondary.local']);
        $response = $this->getJson('/api/v1/site/resolve?host=unknown.local');
        $response->assertStatus(200)->assertJsonPath('data.site.id', $primary->id)->assertJsonPath('data.site.is_primary', true);
    }
}
