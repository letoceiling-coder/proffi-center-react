<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\SeoMeta;
use App\Models\Site;
use Illuminate\Database\Seeder;

/**
 * Страницы «Натяжные потолки в прихожую/гостиную/спальню/на кухню/в детскую/в ванную».
 * Контент по образцу proffi-center.ru. Идемпотентно.
 */
class PotolkiPoKomnatamSeeder extends Seeder
{
    private const PAGES = [
        'potolki-v-prihozhuju' => [
            'title' => 'Натяжные потолки в прихожую',
            'description' => 'Позволяют сделать ее визуально больше, а потолок – безукоризненно гладким. С помощью такой конструкции удается скрыть практически все недостатки, устранение которых другими способами является более затратным и проблематичным.',
            'image' => '/images/potolki/potolok2_1.jpg',
        ],
        'potolki-v-gostinuju' => [
            'title' => 'Натяжные потолки в гостиную',
            'description' => 'Позволяет скрыть все недостатки натурального, обеспечивая идеально ровную поверхность. Разнообразие текстур, цветовых решений и комбинаций позволяет реализовывать самые смелые дизайнерские задумки.',
            'image' => '/images/potolki/potolok2_2.jpg',
        ],
        'potolki-v-spalnju' => [
            'title' => 'Натяжные потолки в спальню',
            'description' => 'В спальной комнате человеку необходимо чувствовать себя максимально спокойно, комфортно и уютно и настраивать его на такой лад должен дизайн помещения. Натяжной потолок в спальне позволяет добиться в интерьере идеальной гармонии и завершенности, делая отдых максимально приятным.',
            'image' => '/images/potolki/potolok2_3.jpg',
        ],
        'potolki-na-kuhnju' => [
            'title' => 'Натяжные потолки на кухню',
            'description' => 'Благодаря антистатическим свойствам на кухонных натяжных потолках скапливается минимальное количество грязи, копоти и жирных испарений. Их можно легко помыть любым средством для мытья окон на спиртосодержащей основе. ПВХ-пленка отлично справляется с нагрузкой до 100 л/м².',
            'image' => '/images/potolki/potolok2_4.jpg',
        ],
        'potolki-v-detskuju' => [
            'title' => 'Натяжные потолки в детскую',
            'description' => 'В детской комнате может быть создана атмосфера безудержного веселья, или спокойной тишины, доброй сказки или фантастических приключений. Эффект «Звездного неба», а также многоуровневые конструкции позволяют добиться необходимого эффекта.',
            'image' => '/images/potolki/potolok2_5.jpg',
        ],
        'potolki-v-vannuju' => [
            'title' => 'Натяжные потолки в ванную',
            'description' => 'В ванной комнате в силу повышенной влажности высок риск появления на потолке плесени или грибка. Полимерный материал позволяет легко предупредить возникновение данных проблем. Требуя минимального ухода, помогает создать в помещении максимально комфортную обстановку.',
            'image' => '/images/potolki/potolok2_6.jpg',
        ],
    ];

    public function run(): void
    {
        $site = Site::where('is_primary', true)->firstOrFail();
        $publishedAt = now()->subDay();

        foreach (self::PAGES as $slug => $data) {
            $page = Page::firstOrCreate(
                ['site_id' => $site->id, 'slug' => $slug],
                [
                    'title' => $data['title'],
                    'status' => 'published',
                    'published_at' => $publishedAt,
                ]
            );

            if ($page->blocks()->count() > 0) {
                continue;
            }

            $imageHtml = $data['image']
                ? '<p class="block-image"><img src="' . $data['image'] . '" alt="' . htmlspecialchars($data['title']) . '" style="max-width:100%;height:auto;" /></p>'
                : '';

            $page->blocks()->createMany([
                [
                    'type' => 'hero',
                    'data' => [
                        'title' => $data['title'],
                        'subtitle' => null,
                        'cta_text' => 'Заказать замер',
                        'cta_url' => '/#zamer',
                    ],
                    'order' => 1,
                ],
                [
                    'type' => 'simple_text',
                    'data' => [
                        'html' => $imageHtml . '<p>' . $data['description'] . '</p>',
                    ],
                    'order' => 2,
                ],
                [
                    'type' => 'zamer',
                    'data' => ['enabled' => true],
                    'order' => 3,
                ],
            ]);

            SeoMeta::updateOrCreate(
                ['seo_metaable_type' => Page::class, 'seo_metaable_id' => $page->id],
                [
                    'title' => $data['title'] . ' — Proffi Center',
                    'description' => $data['description'],
                    'h1' => $data['title'],
                ]
            );
        }
    }
}
