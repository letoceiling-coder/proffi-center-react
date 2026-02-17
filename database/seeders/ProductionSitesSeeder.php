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
 * Production: proffi-center.ru + поддомены для Анапы, Ставрополя, Москвы.
 * Контакты и адреса для каждого города. Idempotent.
 */
class ProductionSitesSeeder extends Seeder
{
    public function run(): void
    {
        // Снять primary с localhost, если есть (для dev-окружения)
        Site::where('domain', 'localhost')->update(['is_primary' => false]);

        $regionKrasnodar = Region::firstOrCreate(
            ['name' => 'Краснодарский край'],
            ['country_code' => 'RU']
        );
        $regionStavropol = Region::firstOrCreate(
            ['name' => 'Ставропольский край'],
            ['country_code' => 'RU']
        );
        $regionMoscow = Region::firstOrCreate(
            ['name' => 'Москва и Московская область'],
            ['country_code' => 'RU']
        );

        $cityAnapa = City::firstOrCreate(
            ['region_id' => $regionKrasnodar->id, 'slug' => 'anapa'],
            ['name' => 'Анапа', 'name_prepositional' => 'Анапе']
        );
        $cityStavropol = City::firstOrCreate(
            ['region_id' => $regionStavropol->id, 'slug' => 'stavropol'],
            ['name' => 'Ставрополь', 'name_prepositional' => 'Ставрополе']
        );
        $cityMoscow = City::firstOrCreate(
            ['region_id' => $regionMoscow->id, 'slug' => 'moscow'],
            ['name' => 'Москва', 'name_prepositional' => 'Москве']
        );

        // Основной домен (корневой сайт)
        $rootSite = Site::firstOrCreate(
            ['domain' => 'proffi-center.ru'],
            ['city_id' => null, 'is_primary' => true]
        );
        $rootSite->update(['is_primary' => true, 'city_id' => null]);

        $this->upsertContact($rootSite->id, [
            'phone' => null,
            'address_street' => null,
            'address_locality' => null,
        ]);
        $this->upsertSeoAndMenus($rootSite->id, 'Proffi Center', 'Натяжные потолки. Установка, замер, гарантия.');

        // Анапа: ул. Омелькова 20 к1, 89996371182
        $siteAnapa = Site::firstOrCreate(
            ['domain' => 'anapa.proffi-center.ru'],
            ['city_id' => $cityAnapa->id, 'is_primary' => false]
        );
        $siteAnapa->update(['city_id' => $cityAnapa->id]);
        $this->upsertContact($siteAnapa->id, [
            'phone' => '89996371182',
            'address_street' => 'ул. Омелькова 20 к1',
            'address_locality' => 'Анапа',
        ]);
        $this->upsertSeoAndMenus($siteAnapa->id, 'Proffi Center — Анапа', 'Натяжные потолки в Анапе. Установка, замер, гарантия.');

        // Ставрополь: Аграрник 252, 89897625658
        $siteStavropol = Site::firstOrCreate(
            ['domain' => 'stavropol.proffi-center.ru'],
            ['city_id' => $cityStavropol->id, 'is_primary' => false]
        );
        $siteStavropol->update(['city_id' => $cityStavropol->id]);
        $this->upsertContact($siteStavropol->id, [
            'phone' => '89897625658',
            'address_street' => 'Аграрник 252',
            'address_locality' => 'Ставрополь',
        ]);
        $this->upsertSeoAndMenus($siteStavropol->id, 'Proffi Center — Ставрополь', 'Натяжные потолки в Ставрополе. Установка, замер, гарантия.');

        // Москва: Боброво ул. Рымская 11/1, 89263383279
        $siteMoscow = Site::firstOrCreate(
            ['domain' => 'moscow.proffi-center.ru'],
            ['city_id' => $cityMoscow->id, 'is_primary' => false]
        );
        $siteMoscow->update(['city_id' => $cityMoscow->id]);
        $this->upsertContact($siteMoscow->id, [
            'phone' => '89263383279',
            'address_street' => 'ул. Рымская 11/1',
            'address_locality' => 'Боброво, Москва',
        ]);
        $this->upsertSeoAndMenus($siteMoscow->id, 'Proffi Center — Москва', 'Натяжные потолки в Москве. Установка, замер, гарантия.');
    }

    private function upsertContact(int $siteId, array $data): void
    {
        SiteContact::updateOrCreate(
            ['site_id' => $siteId],
            array_merge([
                'email' => null,
                'address_postal_code' => null,
                'work_time' => null,
                'company_name' => null,
                'logo_media_id' => null,
                'price_display_from' => null,
                'legal_link' => null,
            ], $data)
        );
    }

    private function upsertSeoAndMenus(int $siteId, string $titleSuffix, string $description): void
    {
        SeoSetting::updateOrCreate(
            ['site_id' => $siteId],
            [
                'default_title_suffix' => ' — ' . $titleSuffix,
                'default_description' => $description,
                'verification_google' => null,
                'verification_yandex' => null,
                'robots_txt_append' => '',
            ]
        );

        $headerMenu = Menu::firstOrCreate(
            ['site_id' => $siteId, 'slug' => 'header'],
            ['title' => 'Header']
        );
        $footerMenu = Menu::firstOrCreate(
            ['site_id' => $siteId, 'slug' => 'footer'],
            ['title' => 'Footer']
        );

        MenuItem::firstOrCreate(
            ['menu_id' => $headerMenu->id, 'title' => 'Главная', 'link_value' => '/'],
            ['parent_id' => null, 'link_type' => 'url', 'open_new_tab' => false, 'order' => 0]
        );
        MenuItem::firstOrCreate(
            ['menu_id' => $headerMenu->id, 'title' => 'О компании', 'link_value' => '/o-kompanii'],
            ['parent_id' => null, 'link_type' => 'url', 'open_new_tab' => false, 'order' => 1]
        );
        MenuItem::firstOrCreate(
            ['menu_id' => $footerMenu->id, 'title' => 'Главная', 'link_value' => '/'],
            ['parent_id' => null, 'link_type' => 'url', 'open_new_tab' => false, 'order' => 0]
        );
    }
}
