<?php

namespace Tests\Feature;

use App\Models\ContentBlock;
use App\Models\CmsMedia;
use App\Models\CmsMediaFile;
use App\Models\Page;
use App\Models\Redirect;
use App\Models\SeoMeta;
use App\Models\Site;
use App\Models\SiteContact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\QueryException;
use Tests\TestCase;

class ModelsRelationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_site_has_many_contacts(): void
    {
        $site = Site::factory()->create();
        SiteContact::factory()->count(3)->create(['site_id' => $site->id]);

        $this->assertCount(3, $site->contacts);
        $this->assertTrue($site->contacts->first()->relationLoaded('site') === false);
        $site->load('contacts');
        $this->assertCount(3, $site->contacts);
        $this->assertEquals($site->id, $site->contacts->first()->site_id);
    }

    public function test_site_contacts_relation_returns_site_contacts(): void
    {
        $site = Site::factory()->create();
        $contact = SiteContact::factory()->create(['site_id' => $site->id]);

        $this->assertTrue($site->contacts()->exists());
        $this->assertEquals($contact->id, $site->contacts()->first()->id);
    }

    public function test_page_slug_unique_per_site_throws_exception(): void
    {
        $site = Site::factory()->create();
        Page::factory()->create(['site_id' => $site->id, 'slug' => 'same-slug']);

        $this->expectException(QueryException::class);

        Page::factory()->create(['site_id' => $site->id, 'slug' => 'same-slug']);
    }

    public function test_site_domain_unique_throws_exception(): void
    {
        Site::factory()->create(['domain' => 'same-domain.test']);

        $this->expectException(QueryException::class);

        Site::factory()->create(['domain' => 'same-domain.test']);
    }

    public function test_seo_meta_morph_one_to_page(): void
    {
        $page = Page::factory()->create();
        $seo = SeoMeta::factory()->create([
            'seo_metaable_type' => Page::class,
            'seo_metaable_id' => $page->id,
        ]);

        $this->assertNotNull($page->seoMeta);
        $this->assertEquals($seo->id, $page->seoMeta->id);
        $this->assertEquals(Page::class, $page->seoMeta->seo_metaable_type);
        $this->assertEquals($page->id, $page->seoMeta->seo_metaable_id);
    }

    public function test_page_has_one_seo_meta(): void
    {
        $page = Page::factory()->create();
        $this->assertNull($page->seoMeta);

        $seo = $page->seoMeta()->create([
            'title' => 'SEO Title',
            'description' => 'SEO Desc',
        ]);

        $page->refresh();
        $this->assertNotNull($page->seoMeta);
        $this->assertEquals('SEO Title', $page->seoMeta->title);
    }

    public function test_content_blocks_morph_many_and_order(): void
    {
        $page = Page::factory()->create();
        ContentBlock::factory()->create(['blockable_type' => Page::class, 'blockable_id' => $page->id, 'order' => 2]);
        ContentBlock::factory()->create(['blockable_type' => Page::class, 'blockable_id' => $page->id, 'order' => 0]);
        ContentBlock::factory()->create(['blockable_type' => Page::class, 'blockable_id' => $page->id, 'order' => 1]);

        $blocks = $page->blocks;
        $this->assertCount(3, $blocks);
        $this->assertEquals(0, $blocks[0]->order);
        $this->assertEquals(1, $blocks[1]->order);
        $this->assertEquals(2, $blocks[2]->order);
    }

    public function test_content_blocks_ordered_by_order(): void
    {
        $page = Page::factory()->create();
        $first = ContentBlock::factory()->create(['blockable_type' => Page::class, 'blockable_id' => $page->id, 'order' => 10]);
        $second = ContentBlock::factory()->create(['blockable_type' => Page::class, 'blockable_id' => $page->id, 'order' => 5]);

        $ordered = $page->blocks()->get();
        $this->assertEquals($second->id, $ordered->first()->id);
        $this->assertEquals($first->id, $ordered->last()->id);
    }

    public function test_cms_media_files_cascade_when_cms_media_deleted(): void
    {
        $media = CmsMedia::factory()->create();
        $file1 = CmsMediaFile::factory()->create(['media_id' => $media->id]);
        $file2 = CmsMediaFile::factory()->create(['media_id' => $media->id]);

        $this->assertCount(2, $media->files);
        $media->delete();
        $this->assertDatabaseMissing('cms_media', ['id' => $media->id]);
        $this->assertDatabaseMissing('cms_media_files', ['id' => $file1->id]);
        $this->assertDatabaseMissing('cms_media_files', ['id' => $file2->id]);
    }

    public function test_redirects_unique_site_id_from_path_throws_exception(): void
    {
        $site = Site::factory()->create();
        Redirect::factory()->create(['site_id' => $site->id, 'from_path' => '/same-path']);

        $this->expectException(QueryException::class);

        Redirect::factory()->create(['site_id' => $site->id, 'from_path' => '/same-path']);
    }

    public function test_redirects_same_path_different_sites_allowed(): void
    {
        $site1 = Site::factory()->create();
        $site2 = Site::factory()->create();
        $r1 = Redirect::factory()->create(['site_id' => $site1->id, 'from_path' => '/contact']);
        $r2 = Redirect::factory()->create(['site_id' => $site2->id, 'from_path' => '/contact']);

        $this->assertNotEquals($r1->id, $r2->id);
        $this->assertEquals('/contact', $r1->from_path);
        $this->assertEquals('/contact', $r2->from_path);
    }
}
