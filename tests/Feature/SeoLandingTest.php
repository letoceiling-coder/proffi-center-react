<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Site;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoLandingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RoleSeeder::class);
    }

    public function test_robots_txt_returns_200_and_contains_sitemap(): void
    {
        Site::factory()->primary()->create(['domain' => 'proffi-center.ru']);
        $response = $this->get('/robots.txt');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $body = $response->getContent();
        $this->assertStringContainsString('Sitemap:', $body);
        $this->assertStringContainsString('sitemap.xml', $body);
    }

    public function test_sitemap_xml_returns_200_and_valid_xml_with_urls(): void
    {
        $site = Site::factory()->primary()->create(['domain' => 'proffi-center.ru']);
        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $body = $response->getContent();
        $this->assertStringContainsString('<?xml', $body);
        $this->assertStringContainsString('<urlset', $body);
        $this->assertStringContainsString('</urlset>', $body);
        $this->assertMatchesRegularExpression('#<loc>https?://[^<]+</loc>#', $body);
        $this->assertGreaterThanOrEqual(3, substr_count($body, '<loc>'), 'Sitemap should contain at least 3 URLs');
    }

    public function test_home_seo_landing_returns_200_with_title_and_json_ld(): void
    {
        Site::factory()->primary()->create(['domain' => 'proffi-center.ru']);
        $response = $this->get('/');
        $response->assertStatus(200);
        $body = $response->getContent();
        $this->assertStringContainsString('<title>', $body);
        $this->assertStringContainsString('</title>', $body);
        $this->assertStringContainsString('application/ld+json', $body);
        $this->assertStringContainsString('canonical', $body);
    }

    public function test_service_seo_landing_returns_200_with_meta_and_json_ld(): void
    {
        $site = Site::factory()->primary()->create(['domain' => 'proffi-center.ru']);
        $service = Service::factory()->create([
            'site_id' => $site->id,
            'slug' => 'natyazhnye-potolki',
            'title' => 'Натяжные потолки',
            'status' => 'published',
            'published_at' => now(),
        ]);
        $response = $this->get('/uslugi/' . $service->slug);
        $response->assertStatus(200);
        $body = $response->getContent();
        $this->assertStringContainsString('<title>', $body);
        $this->assertStringContainsString('</title>', $body);
        $this->assertStringContainsString('rel="canonical"', $body);
        $this->assertStringContainsString('application/ld+json', $body);
    }

    public function test_static_seo_landing_returns_200(): void
    {
        Site::factory()->primary()->create(['domain' => 'proffi-center.ru']);
        $response = $this->get('/o-kompanii');
        $response->assertStatus(200);
        $body = $response->getContent();
        $this->assertStringContainsString('<title>', $body);
        $this->assertStringContainsString('О компании', $body);
        $this->assertStringContainsString('application/ld+json', $body);
    }
}
