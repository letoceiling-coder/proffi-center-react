# Сборка React и копирование в Laravel public для proffi-center.loc
# Запуск из корня проекта: .\scripts\build-frontend.ps1

$ErrorActionPreference = "Stop"
$root = (Get-Item $PSScriptRoot).Parent.FullName

$frontend = Join-Path $root "frontend"
$dist = Join-Path $frontend "dist"
$public = Join-Path $root "public"
$build = Join-Path $public "build"

Write-Host "Build React..."
Set-Location $frontend
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Copy build to Laravel public..."

$buildAssets = Join-Path $build "assets"
if (-not (Test-Path $buildAssets)) { New-Item -ItemType Directory -Path $buildAssets -Force | Out-Null }
# Удаляем старые бандлы, чтобы Laravel подхватил только новый (glob в spa.blade.php берёт первый файл)
Get-ChildItem -Path $buildAssets -ErrorAction SilentlyContinue | Remove-Item -Force
Copy-Item -Path (Join-Path $dist "assets\*") -Destination $buildAssets -Recurse -Force

$publicCss = Join-Path $public "css"
if (-not (Test-Path $publicCss)) { New-Item -ItemType Directory -Path $publicCss -Force | Out-Null }
if (Test-Path (Join-Path $dist "css")) {
    Copy-Item -Path (Join-Path $dist "css\*") -Destination $publicCss -Recurse -Force
}

if (Test-Path (Join-Path $dist "vite.svg")) {
    Copy-Item -Path (Join-Path $dist "vite.svg") -Destination $public -Force
}

$publicFonts = Join-Path $public "fonts"
$frontendFonts = Join-Path $frontend "public\fonts"
if (Test-Path $frontendFonts) {
    if (-not (Test-Path $publicFonts)) { New-Item -ItemType Directory -Path $publicFonts -Force | Out-Null }
    Copy-Item -Path (Join-Path $frontendFonts "*") -Destination $publicFonts -Recurse -Force
}

Write-Host "Done. SPA: http://proffi-center.loc/"
Set-Location $root
