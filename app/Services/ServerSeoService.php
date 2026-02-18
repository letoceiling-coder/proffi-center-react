<?php

namespace App\Services;

use App\DataTransferObjects\SeoMeta;
use App\Models\Page;
use App\Models\Service;
use App\Models\Site;
use Illuminate\Support\Facades\Storage;

/**
 * Строит SeoMeta для серверной выдачи (SEO landing routes).
 * Используется в Blade до загрузки React.
 */
final class ServerSeoService
{
    private const SITE_NAME = 'Proffi Center';

    private const STATIC_META = [
        'uslugi' => [
            'title' => 'Услуги — натяжные потолки под ключ',
            'description' => 'Установка натяжных потолков: замер, монтаж, освещение. Полный спектр услуг от Proffi Center.',
        ],
        'o-kompanii' => [
            'title' => 'О компании Proffi Center',
            'description' => 'Proffi Center — установка натяжных потолков с 2013 года. Собственное производство, гарантия качества.',
        ],
        'gde-zakazat-potolki' => [
            'title' => 'Где заказать натяжные потолки — контакты',
            'description' => 'Адрес, телефон, карта. Закажите замер натяжных потолков в вашем городе.',
        ],
        'natjazhnye-potolki-kalkuljator' => [
            'title' => 'Калькулятор натяжных потолков — расчёт стоимости',
            'description' => 'Онлайн-калькулятор стоимости натяжного потолка. Узнайте цену за 1 минуту.',
        ],
        'natyazhnyye-potolki-otzyvy' => [
            'title' => 'Отзывы о натяжных потолках — Proffi Center',
            'description' => 'Отзывы клиентов о качестве установки натяжных потолков и работе компании.',
        ],
        'gotovye-potolki' => [
            'title' => 'Готовые натяжные потолки — Proffi Center',
            'description' => 'Каталог готовых натяжных потолков. Матовые, глянцевые, тканевые. Цены и фото.',
        ],
        'skidki-na-potolki' => [
            'title' => 'Скидки на натяжные потолки — Proffi Center',
            'description' => 'Акции и скидки на установку натяжных потолков.',
        ],
        'aktsiya' => [
            'title' => 'Акции и подарки — Proffi Center',
            'description' => 'Специальные предложения и подарки при заказе натяжных потолков.',
        ],
        'dogovor' => [
            'title' => 'Договор и документы — Proffi Center',
            'description' => 'Условия договора на установку натяжных потолков.',
        ],
        'dolyami' => [
            'title' => 'Оплата Долями от Т-Банка — Proffi Center',
            'description' => 'Долями — сервис оплаты покупок частями: 4 платежа за 6 недель. Первый сразу, остальные каждые 2 недели. Подробности на dolyame.ru.',
        ],
        'vozvrat' => [
            'title' => 'Возврат и обмен — Proffi Center',
            'description' => 'Условия возврата и обмена товаров.',
        ],
        'catalog' => [
            'title' => 'Каталог натяжных потолков — Proffi Center',
            'description' => 'Каталог товаров: натяжные потолки, комплектующие, освещение.',
        ],
    ];

    public function __construct(
        private SeoResolver $seoResolver,
        private SchemaResolver $schemaResolver,
        private SiteResolverService $siteResolver,
    ) {}

    public function buildForHome(Site $site): SeoMeta
    {
        $site->load(['contact', 'city.region']);
        $baseUrl = $this->baseUrl($site);
        $cityName = $site->city?->name ?? 'Анапа';
        $title = "Натяжные потолки в {$cityName} — " . self::SITE_NAME;
        $description = 'Установка натяжных потолков в ' . ($site->city?->name_prepositional ?? $cityName) . '. Собственное производство, низкие цены, гарантия качества. Закажите замер бесплатно.';
        $canonical = $baseUrl . '/';
        $jsonLd = $this->baseOrganizationLd($site, $baseUrl);
        $jsonLd[] = $this->webSiteLd($baseUrl);
        $jsonLd[] = $this->breadcrumbLd($baseUrl, [['name' => 'Главная', 'url' => '/']]);
        $jsonLd = array_merge($jsonLd, $this->schemaResolver->resolveFor($site, null));

        return new SeoMeta(
            title: $title,
            description: $description,
            canonical: $canonical,
            ogImage: $this->defaultOgImage($baseUrl),
            h1: "Натяжные потолки в {$cityName}",
            jsonLd: $jsonLd,
        );
    }

    public function buildForService(Service $service, Site $site): SeoMeta
    {
        $site->load(['contact', 'city.region']);
        $resolved = $this->seoResolver->resolveFor($service, $site);
        $baseUrl = $this->baseUrl($site);
        $canonical = $resolved['canonical'];
        $ogImage = $resolved['og_image_url'] ?: $this->defaultOgImage($baseUrl);
        $jsonLd = $this->baseOrganizationLd($site, $baseUrl);
        $jsonLd[] = $this->serviceLd($service, $site, $baseUrl);
        $jsonLd[] = $this->breadcrumbLd($baseUrl, [
            ['name' => 'Главная', 'url' => '/'],
            ['name' => 'Услуги', 'url' => '/uslugi'],
            ['name' => $resolved['h1'], 'url' => parse_url($canonical, PHP_URL_PATH)],
        ]);
        $jsonLd = array_merge($jsonLd, $this->schemaResolver->resolveFor($site, $service));

        return new SeoMeta(
            title: $resolved['title'],
            description: $resolved['description'],
            canonical: $canonical,
            robots: $resolved['robots'],
            ogTitle: $resolved['og_title'],
            ogDescription: $resolved['og_description'],
            ogImage: $ogImage,
            ogUrl: $canonical,
            h1: $resolved['h1'],
            jsonLd: $jsonLd,
        );
    }

    public function buildForPage(Page $page, Site $site): SeoMeta
    {
        $site->load(['contact', 'city.region']);
        $resolved = $this->seoResolver->resolveFor($page, $site);
        $baseUrl = $this->baseUrl($site);
        $canonical = $resolved['canonical'];
        $ogImage = $resolved['og_image_url'] ?: $this->defaultOgImage($baseUrl);
        $path = '/' . ltrim($page->slug, '/');
        $jsonLd = $this->baseOrganizationLd($site, $baseUrl);
        $jsonLd[] = $this->breadcrumbLd($baseUrl, [
            ['name' => 'Главная', 'url' => '/'],
            ['name' => $resolved['h1'], 'url' => $path],
        ]);
        $jsonLd = array_merge($jsonLd, $this->schemaResolver->resolveFor($site, $page));

        return new SeoMeta(
            title: $resolved['title'],
            description: $resolved['description'],
            canonical: $canonical,
            robots: $resolved['robots'],
            ogTitle: $resolved['og_title'],
            ogDescription: $resolved['og_description'],
            ogImage: $ogImage,
            ogUrl: $canonical,
            h1: $resolved['h1'],
            jsonLd: $jsonLd,
        );
    }

    public function buildForStatic(string $pathKey, Site $site): SeoMeta
    {
        $site->load(['contact', 'city.region']);
        $baseUrl = $this->baseUrl($site);
        $meta = self::STATIC_META[$pathKey] ?? [
            'title' => self::SITE_NAME,
            'description' => 'Натяжные потолки от производителя.',
        ];
        $path = '/' . $pathKey;
        $canonical = $baseUrl . $path;
        $jsonLd = $this->baseOrganizationLd($site, $baseUrl);
        $jsonLd[] = $this->breadcrumbLd($baseUrl, [
            ['name' => 'Главная', 'url' => '/'],
            ['name' => $meta['title'], 'url' => $path],
        ]);

        return new SeoMeta(
            title: $meta['title'],
            description: $meta['description'],
            canonical: $canonical,
            ogImage: $this->defaultOgImage($baseUrl),
            h1: explode(' — ', $meta['title'])[0],
            jsonLd: $jsonLd,
        );
    }

    /** Дефолтные meta для SPA fallback (любой путь без своей landing). */
    public function buildDefault(Site $site, string $path = '/'): SeoMeta
    {
        $site->load(['contact', 'city.region']);
        $baseUrl = $this->baseUrl($site);
        $canonical = $path === '/' || $path === '' ? $baseUrl . '/' : $baseUrl . '/' . ltrim($path, '/');
        $jsonLd = $this->baseOrganizationLd($site, $baseUrl);
        $jsonLd[] = $this->webSiteLd($baseUrl);

        return new SeoMeta(
            title: 'Натяжные потолки в Анапе — ' . self::SITE_NAME,
            description: 'Установка натяжных потолков. Собственное производство, низкие цены, гарантия качества.',
            canonical: $canonical,
            ogImage: $this->defaultOgImage($baseUrl),
            jsonLd: $jsonLd,
        );
    }

    public static function getStaticPathKeys(): array
    {
        return array_keys(self::STATIC_META);
    }

    private function baseUrl(Site $site): string
    {
        $domain = $site->domain;
        if (!str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }
        return rtrim($domain, '/');
    }

    private function defaultOgImage(string $baseUrl): string
    {
        return $baseUrl . '/favicon.svg';
    }

    private function baseOrganizationLd(Site $site, string $baseUrl): array
    {
        $contact = $site->contact;
        $city = $site->city;
        $ld = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $contact?->company_name ?? self::SITE_NAME,
            'url' => $baseUrl,
        ];
        if ($contact?->phone) {
            $ld['telephone'] = $contact->phone;
        }
        if ($contact?->email) {
            $ld['email'] = $contact->email;
        }
        if ($contact && ($contact->address_street || $contact->address_locality)) {
            $ld['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $contact->address_street,
                'addressLocality' => $contact->address_locality,
                'postalCode' => $contact->address_postal_code,
            ];
        }
        if ($city) {
            $ld['areaServed'] = $city->name;
        }
        return [$ld];
    }

    private function webSiteLd(string $baseUrl): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => self::SITE_NAME,
            'url' => $baseUrl,
        ];
    }

    private function serviceLd(Service $service, Site $site, string $baseUrl): array
    {
        $contact = $site->contact;
        $ld = [
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $service->title,
            'url' => $baseUrl . '/uslugi/' . ltrim($service->slug, '/'),
        ];
        if ($contact?->company_name) {
            $ld['provider'] = [
                '@type' => 'Organization',
                'name' => $contact->company_name,
            ];
        }
        if ($site->city) {
            $ld['areaServed'] = $site->city->name;
        }
        return $ld;
    }

    private function breadcrumbLd(string $baseUrl, array $items): array
    {
        $list = [];
        foreach ($items as $i => $item) {
            $entry = [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $item['name'],
            ];
            if (!empty($item['url'])) {
                $entry['item'] = str_starts_with($item['url'], 'http') ? $item['url'] : $baseUrl . $item['url'];
            }
            $list[] = $entry;
        }
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $list,
        ];
    }
}
