<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    @php
        $appUrl = rtrim(config('app.url', 'https://proffi-center.ru'), '/');
        $canonical = $appUrl . (request()->path() === '/' ? '/' : '/' . request()->path());
        $title = 'Натяжные потолки в Анапе — Proffi Center';
        $description = 'Установка натяжных потолков в Анапе. Собственное производство, низкие цены, гарантия качества. Закажите замер бесплатно.';
        $ogImage = $appUrl . '/favicon.svg';
    @endphp
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="{{ $canonical }}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="{{ $title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:url" content="{{ $canonical }}" />
    <meta property="og:image" content="{{ $ogImage }}" />
    <meta property="og:site_name" content="Proffi Center" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $title }}" />
    <meta name="twitter:description" content="{{ $description }}" />
    <meta name="twitter:image" content="{{ $ogImage }}" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Proffi Center","url":"{{ $appUrl }}"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Proffi Center","url":"{{ $appUrl }}"}</script>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Главная","item":"{{ $appUrl }}/"}]}</script>
    <link rel="stylesheet" href="{{ asset('css/reset.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/bootstrap-grid-3.3.1.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/fonts-local.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/main2.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/media.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/normalize.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/component.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/react-overrides.css') }}" />
    @php
        $buildPath = public_path('build/assets');
        $jsFile = collect(glob($buildPath . '/index-*.js'))->map(fn ($f) => basename($f))->first();
        $cssFile = collect(glob($buildPath . '/index-*.css'))->map(fn ($f) => basename($f))->first();
    @endphp
    @if($cssFile)
    <link rel="stylesheet" crossorigin href="{{ asset('build/assets/' . $cssFile) }}">
    @endif
    <!-- Yandex.Metrika counter -->
    <script type="text/javascript">
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(54757786, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true});
    </script>
    <noscript><div><img src="https://mc.yandex.ru/watch/54757786" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
    <!-- /Yandex.Metrika counter -->
</head>
<body>
    <div id="root"></div>
    @if($jsFile)
    <script type="module" crossorigin src="{{ asset('build/assets/' . $jsFile) }}"></script>
    @endif
</body>
</html>
