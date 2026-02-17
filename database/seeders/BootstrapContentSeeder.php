<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Review;
use App\Models\SchemaBlock;
use App\Models\SeoMeta;
use App\Models\Service;
use App\Models\Site;
use Illuminate\Database\Seeder;

/**
 * Bootstrap minimal CMS content for root site: pages, services, catalog, menus, blocks, SEO, schema, reviews.
 * Idempotent: firstOrCreate / updateOrCreate to avoid duplicates on re-run.
 */
class BootstrapContentSeeder extends Seeder
{
    public function run(): void
    {
        $site = Site::where('is_primary', true)->firstOrFail();

        $this->seedMenus($site);
        $this->seedPages($site);
        $this->seedServices($site);
        $this->seedProductCatalog($site);
        $this->seedSeoMeta($site);
        $this->seedSchemaBlocks($site);
        $this->seedReviews($site);
    }

    private function seedMenus(Site $site): void
    {
        $header = Menu::firstOrCreate(
            ['site_id' => $site->id, 'slug' => 'header'],
            ['title' => 'Header']
        );
        $footer = Menu::firstOrCreate(
            ['site_id' => $site->id, 'slug' => 'footer'],
            ['title' => 'Footer']
        );

        $headerItems = [
            ['title' => 'Главная', 'link_type' => 'url', 'link_value' => '/', 'order' => 0],
            ['title' => 'О компании', 'link_type' => 'page', 'link_value' => 'o-kompanii', 'order' => 1],
            ['title' => 'Услуги', 'link_type' => 'url', 'link_value' => '/uslugi', 'order' => 2],
            ['title' => 'Каталог', 'link_type' => 'url', 'link_value' => '/catalog', 'order' => 3],
            ['title' => 'Контакты', 'link_type' => 'page', 'link_value' => 'kontakty', 'order' => 4],
        ];
        foreach ($headerItems as $item) {
            MenuItem::firstOrCreate(
                [
                    'menu_id' => $header->id,
                    'title' => $item['title'],
                ],
                [
                    'parent_id' => null,
                    'link_type' => $item['link_type'],
                    'link_value' => $item['link_value'],
                    'open_new_tab' => false,
                    'order' => $item['order'],
                ]
            );
        }

        MenuItem::firstOrCreate(
            ['menu_id' => $footer->id, 'title' => 'Главная'],
            ['parent_id' => null, 'link_type' => 'url', 'link_value' => '/', 'open_new_tab' => false, 'order' => 0]
        );
        MenuItem::firstOrCreate(
            ['menu_id' => $footer->id, 'title' => 'Политика'],
            ['parent_id' => null, 'link_type' => 'page', 'link_value' => 'privacy-policy', 'open_new_tab' => false, 'order' => 1]
        );
    }

    private function seedPages(Site $site): void
    {
        $publishedAt = now()->subDay();

        $pages = [
            ['slug' => 'o-kompanii', 'title' => 'О компании'],
            ['slug' => 'kontakty', 'title' => 'Контакты'],
            ['slug' => 'privacy-policy', 'title' => 'Политика конфиденциальности'],
        ];

        foreach ($pages as $p) {
            $page = Page::firstOrCreate(
                ['site_id' => $site->id, 'slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'status' => 'published',
                    'published_at' => $publishedAt,
                ]
            );

            if ($page->blocks()->count() > 0) {
                continue;
            }

            $page->blocks()->createMany([
                [
                    'type' => 'hero',
                    'data' => [
                        'title' => $p['title'],
                        'subtitle' => $p['slug'] === 'kontakty' ? 'Свяжитесь с нами' : null,
                        'cta_text' => $p['slug'] === 'o-kompanii' ? 'Заказать замер' : null,
                        'cta_url' => $p['slug'] === 'o-kompanii' ? '/#zamer' : null,
                    ],
                    'order' => 1,
                ],
                [
                    'type' => 'simple_text',
                    'data' => [
                        'html' => $p['slug'] === 'o-kompanii'
                            ? '<p>Мы занимаемся установкой натяжных потолков в Анапе. Качество и гарантия.</p>'
                            : ($p['slug'] === 'kontakty'
                                ? '<p>Телефон: +7 (999) 123-45-67</p><p>Адрес: г. Анапа</p>'
                                : '<p>Текст политики конфиденциальности.</p>'),
                    ],
                    'order' => 2,
                ],
                [
                    'type' => 'pr_table',
                    'data' => [
                        'title' => 'Преимущества',
                        'subtitle' => null,
                        'rows' => [
                            ['characteristic' => 'Гарантия', 'us' => '5 лет', 'other' => '1 год', 'isHeader' => true],
                            ['characteristic' => 'Срок', 'us' => '1 день', 'other' => '3–5 дней', 'isHeader' => false],
                        ],
                    ],
                    'order' => 3,
                ],
                [
                    'type' => 'form_low_price',
                    'data' => ['enabled' => true],
                    'order' => 4,
                ],
                [
                    'type' => 'zamer',
                    'data' => ['enabled' => true],
                    'order' => 5,
                ],
            ]);
        }
    }

    private function seedServices(Site $site): void
    {
        $publishedAt = now()->subDay();
        $services = [
            ['slug' => 'ustanovka', 'title' => 'Установка натяжных потолков'],
            ['slug' => 'remont', 'title' => 'Ремонт потолков'],
            ['slug' => 'demontazh', 'title' => 'Демонтаж потолков'],
        ];

        foreach ($services as $s) {
            $service = Service::firstOrCreate(
                ['site_id' => $site->id, 'slug' => $s['slug']],
                [
                    'title' => $s['title'],
                    'status' => 'published',
                    'published_at' => $publishedAt,
                ]
            );

            if ($service->blocks()->count() > 0) {
                continue;
            }

            $service->blocks()->createMany([
                [
                    'type' => 'hero',
                    'data' => ['title' => $s['title'], 'subtitle' => null, 'cta_text' => null, 'cta_url' => null],
                    'order' => 1,
                ],
                [
                    'type' => 'simple_text',
                    'data' => ['html' => '<p>Описание услуги ' . $s['title'] . '.</p>'],
                    'order' => 2,
                ],
                [
                    'type' => 'zamer',
                    'data' => ['enabled' => true],
                    'order' => 3,
                ],
            ]);
        }
    }

    private function seedProductCatalog(Site $site): void
    {
        $category = ProductCategory::firstOrCreate(
            ['site_id' => $site->id, 'slug' => 'catalog'],
            ['title' => 'Каталог', 'sort_order' => 0]
        );

        $publishedAt = now()->subDay();
        $products = [
            ['slug' => 'product-1', 'name' => 'Потолок матовый', 'price' => 1500],
            ['slug' => 'product-2', 'name' => 'Потолок глянцевый', 'price' => 1800],
            ['slug' => 'product-3', 'name' => 'Потолок сатин', 'price' => 1700],
        ];

        foreach ($products as $i => $p) {
            $product = Product::firstOrCreate(
                ['site_id' => $site->id, 'slug' => $p['slug']],
                [
                    'product_category_id' => $category->id,
                    'name' => $p['name'],
                    'short_description' => 'Краткое описание ' . $p['name'],
                    'price' => $p['price'],
                    'status' => 'published',
                    'published_at' => $publishedAt,
                    'sort_order' => $i,
                ]
            );

            if ($product->blocks()->count() > 0) {
                continue;
            }

            $product->blocks()->createMany([
                [
                    'type' => 'hero',
                    'data' => ['title' => $p['name'], 'subtitle' => null, 'cta_text' => null, 'cta_url' => null],
                    'order' => 1,
                ],
                [
                    'type' => 'simple_text',
                    'data' => ['html' => '<p>Описание товара ' . $p['name'] . '.</p>'],
                    'order' => 2,
                ],
            ]);
        }
    }

    private function seedSeoMeta(Site $site): void
    {
        $pageO = Page::where('site_id', $site->id)->where('slug', 'o-kompanii')->first();
        $pageK = Page::where('site_id', $site->id)->where('slug', 'kontakty')->first();
        $pageP = Page::where('site_id', $site->id)->where('slug', 'privacy-policy')->first();

        if ($pageO) {
            SeoMeta::updateOrCreate(
                ['seo_metaable_type' => Page::class, 'seo_metaable_id' => $pageO->id],
                [
                    'title' => 'О компании — Proffi Center',
                    'description' => 'О компании Proffi Center. Натяжные потолки в Анапе.',
                    'h1' => 'О компании',
                ]
            );
        }
        if ($pageK) {
            SeoMeta::updateOrCreate(
                ['seo_metaable_type' => Page::class, 'seo_metaable_id' => $pageK->id],
                [
                    'title' => 'Контакты — Proffi Center',
                    'description' => 'Контакты Proffi Center. Адрес, телефон.',
                    'h1' => 'Контакты',
                ]
            );
        }
        if ($pageP) {
            SeoMeta::updateOrCreate(
                ['seo_metaable_type' => Page::class, 'seo_metaable_id' => $pageP->id],
                [
                    'title' => 'Политика конфиденциальности — Proffi Center',
                    'description' => 'Политика конфиденциальности.',
                    'h1' => 'Политика конфиденциальности',
                ]
            );
        }
    }

    private function seedSchemaBlocks(Site $site): void
    {
        SchemaBlock::firstOrCreate(
            [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'Organization',
            ],
            [
                'data' => [
                    '@type' => 'Organization',
                    'name' => 'Proffi Center',
                    'url' => 'https://localhost',
                ],
                'is_enabled' => true,
                'order' => 0,
            ]
        );

        SchemaBlock::firstOrCreate(
            [
                'schemaable_type' => Site::class,
                'schemaable_id' => $site->id,
                'type' => 'BreadcrumbList',
            ],
            [
                'data' => [
                    '@type' => 'BreadcrumbList',
                    'itemListElement' => [
                        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Главная', 'item' => 'https://localhost/'],
                    ],
                ],
                'is_enabled' => true,
                'order' => 1,
            ]
        );
    }

    private function seedReviews(Site $site): void
    {
        $publishedAt = now()->subDay();
        $reviews = [
            ['author_name' => 'Иван П.', 'text' => 'Отличная работа, быстро и качественно установили потолок.'],
            ['author_name' => 'Мария К.', 'text' => 'Рекомендую компанию. Цены адекватные, мастера вежливые.'],
            ['author_name' => 'Алексей В.', 'text' => 'Доволен результатом. Замер бесплатный, всё объяснили.'],
        ];

        foreach ($reviews as $r) {
            Review::firstOrCreate(
                [
                    'site_id' => $site->id,
                    'author_name' => $r['author_name'],
                    'text' => $r['text'],
                ],
                [
                    'phone' => null,
                    'status' => 'published',
                    'published_at' => $publishedAt,
                ]
            );
        }
    }
}
