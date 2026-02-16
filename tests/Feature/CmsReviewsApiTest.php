<?php

namespace Tests\Feature;

use App\Models\CmsMedia;
use App\Models\Review;
use App\Models\ReviewMedia;
use App\Models\Role;
use App\Models\Site;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsReviewsApiTest extends TestCase
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

    public function test_reviews_index_requires_auth(): void
    {
        $response = $this->getJson('/api/v1/cms/reviews');
        $response->assertStatus(401);
    }

    public function test_reviews_index_filtered_by_site_and_status(): void
    {
        $site = Site::factory()->create();
        Review::create(['site_id' => $site->id, 'author_name' => 'A', 'text' => 'T', 'status' => 'published']);
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/reviews?site_id=' . $site->id . '&status=published');
        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_reviews_store_creates_review(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/reviews', [
                'site_id' => $site->id,
                'author_name' => 'Author',
                'text' => 'Review text',
                'status' => 'draft',
            ]);
        $response->assertStatus(201)->assertJsonPath('data.author_name', 'Author')->assertJsonPath('data.text', 'Review text');
        $this->assertDatabaseHas('reviews', ['site_id' => $site->id, 'author_name' => 'Author']);
    }

    public function test_reviews_validation_author_and_text_required(): void
    {
        $site = Site::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/reviews', [
                'site_id' => $site->id,
                'author_name' => '',
                'text' => '',
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['author_name', 'text']);
    }

    public function test_reviews_update_and_destroy(): void
    {
        $review = Review::factory()->create(['author_name' => 'Old', 'text' => 'T']);
        $response = $this->withHeaders($this->auth())
            ->putJson('/api/v1/cms/reviews/' . $review->id, [
                'site_id' => $review->site_id,
                'author_name' => 'Updated',
                'text' => $review->text,
                'status' => $review->status,
            ]);
        $response->assertStatus(200)->assertJsonPath('data.author_name', 'Updated');

        $response = $this->withHeaders($this->auth())->deleteJson('/api/v1/cms/reviews/' . $review->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_reviews_sync_media_valid(): void
    {
        $review = Review::factory()->create();
        $media = CmsMedia::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/reviews/' . $review->id . '/media', [
                'media_ids' => [$media->id],
            ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('review_media', ['review_id' => $review->id, 'media_id' => $media->id]);
    }

    public function test_reviews_sync_media_invalid_media_id_fails(): void
    {
        $review = Review::factory()->create();
        $response = $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/reviews/' . $review->id . '/media', [
                'media_ids' => [99999],
            ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['media_ids.0']);
    }

    public function test_reviews_sync_media_ordering_preserved(): void
    {
        $review = Review::factory()->create();
        $m1 = CmsMedia::factory()->create();
        $m2 = CmsMedia::factory()->create();
        $this->withHeaders($this->auth())
            ->postJson('/api/v1/cms/reviews/' . $review->id . '/media', [
                'media_ids' => [$m2->id, $m1->id],
            ])->assertStatus(200);
        $rm1 = ReviewMedia::where('review_id', $review->id)->where('media_id', $m2->id)->first();
        $rm2 = ReviewMedia::where('review_id', $review->id)->where('media_id', $m1->id)->first();
        $this->assertEquals(0, $rm1->order);
        $this->assertEquals(1, $rm2->order);
    }

    public function test_reviews_detach_media(): void
    {
        $review = Review::factory()->create();
        $media = CmsMedia::factory()->create();
        $review->media()->attach($media->id, ['order' => 0]);
        $response = $this->withHeaders($this->auth())
            ->deleteJson('/api/v1/cms/reviews/' . $review->id . '/media/' . $media->id);
        $response->assertStatus(200);
        $this->assertDatabaseMissing('review_media', ['review_id' => $review->id, 'media_id' => $media->id]);
    }

    public function test_reviews_cascade_delete_review_media(): void
    {
        $review = Review::factory()->create();
        $media = CmsMedia::factory()->create();
        ReviewMedia::create(['review_id' => $review->id, 'media_id' => $media->id, 'order' => 0]);
        $review->delete();
        $this->assertDatabaseMissing('review_media', ['review_id' => $review->id]);
    }

    public function test_reviews_show_includes_media(): void
    {
        $review = Review::factory()->create();
        $media = CmsMedia::factory()->create();
        $review->media()->attach($media->id, ['order' => 0]);
        $response = $this->withHeaders($this->auth())->getJson('/api/v1/cms/reviews/' . $review->id);
        $response->assertStatus(200)->assertJsonPath('data.id', $review->id);
        $this->assertNotEmpty($response->json('data.media'));
    }

    public function test_reviews_filter_by_status_draft(): void
    {
        $site = Site::factory()->create();
        Review::create(['site_id' => $site->id, 'author_name' => 'A', 'text' => 'T', 'status' => 'draft']);
        $response = $this->withHeaders($this->auth())
            ->getJson('/api/v1/cms/reviews?site_id=' . $site->id . '&status=draft');
        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }
}
