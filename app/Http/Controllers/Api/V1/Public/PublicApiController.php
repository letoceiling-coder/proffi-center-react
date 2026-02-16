<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Models\Site;
use App\Services\SchemaResolver;
use App\Services\SeoResolver;
use App\Services\SiteResolverService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

abstract class PublicApiController extends Controller
{
    protected function getHost(Request $request): string
    {
        $host = $request->query('host') ?? $request->header('X-Forwarded-Host') ?? $request->getHost();
        return $host ?: '';
    }

    protected function resolveSite(Request $request): Site
    {
        return app(SiteResolverService::class)->resolveByHost($this->getHost($request));
    }

    protected function meta(Site $site, ?object $entity = null): array
    {
        $seo = $entity ? app(SeoResolver::class)->resolveFor($entity, $site) : null;
        $schema = app(SchemaResolver::class)->resolveFor($site, $entity);
        return [
            'site' => $this->siteMeta($site),
            'seo' => $seo,
            'schema' => $schema,
        ];
    }

    protected function siteMeta(Site $site): array
    {
        if (!$site->relationLoaded('contact')) {
            $site->load(['contact.logoMedia', 'city.region']);
        }
        $contact = $site->contact;
        $city = $site->city;
        $region = $city?->region;
        return [
            'id' => $site->id,
            'domain' => $site->domain,
            'city' => $city ? ['id' => $city->id, 'name' => $city->name] : null,
            'region' => $region ? ['id' => $region->id, 'name' => $region->name] : null,
            'contacts' => $contact ? [
                'phone' => $contact->phone,
                'email' => $contact->email,
                'address_street' => $contact->address_street,
                'address_locality' => $contact->address_locality,
                'address_postal_code' => $contact->address_postal_code,
                'work_time' => $contact->work_time,
                'company_name' => $contact->company_name,
                'logo_url' => $contact->logoMedia ? app(\App\Services\PublicMediaFormatter::class)->mediaUrl($contact->logoMedia) : null,
            ] : null,
        ];
    }
}
