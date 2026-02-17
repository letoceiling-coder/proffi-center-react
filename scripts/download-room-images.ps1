# Скачивание фото для страниц "Потолки в комнату" с proffi-center.ru в Laravel public/images/potolki
# Запуск из корня проекта: powershell -ExecutionPolicy Bypass -File scripts/download-room-images.ps1

$baseUrl = "https://proffi-center.ru/template/globalTemplate/images"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$outDir = Join-Path (Join-Path (Join-Path $projectRoot "public") "images") "potolki"
$files = @("potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg")

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force
}

foreach ($f in $files) {
    $url = "$baseUrl/potolki/$f"
    $path = Join-Path $outDir $f
    try {
        Invoke-WebRequest -Uri $url -OutFile $path -UseBasicParsing
        Write-Host "OK: $f"
    } catch {
        $url2 = "$baseUrl/$f"
        try {
            Invoke-WebRequest -Uri $url2 -OutFile $path -UseBasicParsing
            Write-Host "OK (alt): $f"
        } catch {
            Write-Host "FAIL: $f - $_"
        }
    }
}

Write-Host "Done. Files in: $outDir"
