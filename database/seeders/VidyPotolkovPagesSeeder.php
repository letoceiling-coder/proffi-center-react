<?php

namespace Database\Seeders;

use App\Models\ContentBlock;
use App\Models\Page;
use App\Models\SeoMeta;
use App\Models\Site;
use Illuminate\Database\Seeder;

/**
 * Страницы из меню «Матовые потолки» и подменю: типы потолков (матовые, глянцевые, тканевые и т.д.).
 * Чтобы GET /api/v1/page/{slug} не возвращал 404 для этих путей. Идемпотентно.
 */
class VidyPotolkovPagesSeeder extends Seeder
{
    /** slug => title (как в меню на фронте) */
    private const PAGES = [
        'matovye-potolki' => 'Матовые потолки',
        'glyancevye-potolki' => 'Глянцевые потолки',
        'tkanevye-potolki' => 'Тканевые потолки',
        'mnogourovnevye-potolki' => 'Многоуровневые потолки',
        'potolki-fotopechat' => 'Потолки с фотопечатью',
        'potolki-zvezdnoe-nebo' => 'Потолки «Звездное небо»',
        'konturnyye-potolki' => 'Контурные потолки',
        'paryashchiye-potolki' => 'Парящие потолки',
        'osveshcheniye-dlya-natyazhnykh-potolkov' => 'Освещение для натяжных потолков',
        'gardiny-dlya-shtor-pod-natyazhnoj-potolok' => 'Виды гардин, карнизов',
        'natyazhnye-potolki-double-vision' => 'Double Vision',
        'svetoprozrachnyye-natyazhnyye-potolki' => 'Светопрозрачные потолки',
    ];

    public function run(): void
    {
        $site = Site::where('is_primary', true)->first();
        if (!$site) {
            return;
        }

        $publishedAt = now()->subDay();

        foreach (self::PAGES as $slug => $title) {
            $page = Page::firstOrCreate(
                ['site_id' => $site->id, 'slug' => $slug],
                [
                    'title' => $title,
                    'status' => 'published',
                    'published_at' => $publishedAt,
                ]
            );

            if ($page->blocks()->count() > 0) {
                continue;
            }

            $page->blocks()->createMany([
                [
                    'type' => 'simple_text',
                    'data' => [
                        'html' => '<p>Информация о виде натяжных потолков «' . $title . '». Контент можно дополнить в админке.</p>',
                    ],
                    'order' => 1,
                ],
                [
                    'type' => 'zamer',
                    'data' => ['enabled' => true],
                    'order' => 2,
                ],
            ]);

            SeoMeta::updateOrCreate(
                ['seo_metaable_type' => Page::class, 'seo_metaable_id' => $page->id],
                [
                    'title' => $title . ' — Proffi Center',
                    'description' => $title . '. Заказать замер и установку натяжных потолков.',
                    'h1' => $title,
                ]
            );
        }
    }
}
