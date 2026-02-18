<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Натяжные потолки в Анапе — Proffi Center</title>
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
