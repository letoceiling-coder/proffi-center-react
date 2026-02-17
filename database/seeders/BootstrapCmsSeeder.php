<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Region;
use App\Models\SeoSetting;
use App\Models\Site;
use App\Models\SiteContact;
use Illuminate\Database\Seeder;

/**
 * Bootstrap root site and minimal CMS data so public API (site/resolve, menu/*, robots, sitemap) returns 200.
 * Idempotent: uses firstOrCreate / updateOrCreate so re-running does not duplicate.
 */
class BootstrapCmsSeeder extends Seeder
{
    public function run(): void
    {
        $region = Region::firstOrCreate(
            ['name' => 'Краснодарский край'],
            ['country_code' => 'RU']
        );

        $city = City::firstOrCreate(
            ['region_id' => $region->id, 'slug' => 'anapa'],
            [
                'name' => 'Анапа',
                'name_prepositional' => 'Анапе',
            ]
        );

        $site = Site::firstOrCreate(
            ['domain' => 'localhost'],
            [
                'city_id' => null,
                'is_primary' => true,
            ]
        );

        SiteContact::updateOrCreate(
            ['site_id' => $site->id],
            [
                'phone' => null,
                'email' => null,
                'address_street' => null,
                'address_locality' => null,
                'address_postal_code' => null,
                'work_time' => null,
                'company_name' => null,
                'logo_media_id' => null,
                'price_display_from' => null,
                'legal_link' => null,
            ]
        );

        SeoSetting::updateOrCreate(
            ['site_id' => $site->id],
            [
                'default_title_suffix' => ' — Proffi Center',
                'default_description' => 'Натяжные потолки в Анапе. Установка, замер, гарантия.',
                'verification_google' => null,
                'verification_yandex' => null,
                'robots_txt_append' => '',
            ]
        );

        $headerMenu = Menu::firstOrCreate(
            ['site_id' => $site->id, 'slug' => 'header'],
            ['title' => 'Header']
        );

        $footerMenu = Menu::firstOrCreate(
            ['site_id' => $site->id, 'slug' => 'footer'],
            ['title' => 'Footer']
        );

        MenuItem::firstOrCreate(
            [
                'menu_id' => $headerMenu->id,
                'title' => 'Главная',
                'link_value' => '/',
            ],
            [
                'parent_id' => null,
                'link_type' => 'url',
                'open_new_tab' => false,
                'order' => 0,
            ]
        );

        MenuItem::firstOrCreate(
            [
                'menu_id' => $headerMenu->id,
                'title' => 'О компании',
                'link_value' => '/o-kompanii',
            ],
            [
                'parent_id' => null,
                'link_type' => 'url',
                'open_new_tab' => false,
                'order' => 1,
            ]
        );

        MenuItem::firstOrCreate(
            [
                'menu_id' => $footerMenu->id,
                'title' => 'Главная',
                'link_value' => '/',
            ],
            [
                'parent_id' => null,
                'link_type' => 'url',
                'open_new_tab' => false,
                'order' => 0,
            ]
        );
    }
}
