<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('vite.svg') }}" />
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
</head>
<body>
    <div id="root"></div>
    @if($jsFile)
    <script type="module" crossorigin src="{{ asset('build/assets/' . $jsFile) }}"></script>
    @endif
</body>
</html>
