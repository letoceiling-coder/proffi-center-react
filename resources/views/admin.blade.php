<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Админ-панель</title>
    @php
        $viteManifest = public_path('build/manifest.json');
    @endphp
    @if(file_exists($viteManifest))
        @vite(['resources/css/app.css', 'resources/js/admin.js'])
    @else
        <script>
            window.VITE_MANIFEST_MISSING = true;
        </script>
    @endif
</head>
<body class="min-h-screen bg-gray-100">
    <div id="admin-app"></div>
    @if(!file_exists($viteManifest))
        <div id="admin-build-required" style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;padding:2rem;text-align:center;">
            <h1 style="font-size:1.5rem;margin-bottom:1rem;">Соберите фронтенд админ-панели</h1>
            <p style="color:#666;margin-bottom:1.5rem;">Файл <code>public/build/manifest.json</code> не найден. Выполните в корне проекта:</p>
            <pre style="background:#1f2937;color:#e5e7eb;padding:1rem 1.5rem;border-radius:8px;overflow-x:auto;">npm run build</pre>
            <p style="color:#666;margin-top:1rem;font-size:0.875rem;">После сборки обновите страницу.</p>
        </div>
    @endif
</body>
</html>
