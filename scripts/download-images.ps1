# Скачивание ВСЕХ изображений с https://proffi-center.ru/ 1:1 в public/images.
# Запуск: powershell -ExecutionPolicy Bypass -File scripts/download-images.ps1 (из корня проекта).

$base = "https://proffi-center.ru/template/globalTemplate/images"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$dest = Join-Path $projectRoot "public\images"

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force
}

# Все файлы из корня images (как на proffi-center.ru)
$files = @(
    "logo.png", "m_gerb.png", "mmenu.png", "m_close.png", "trubka.png",
    "index_banner.jpg", "l1.jpg", "l2.jpg", "l3.jpg", "l4.jpg", "l5.jpg", "l6.jpg",
    "cont.jpg", "par.jpg", "pk-5.jpg", "dv.jpg", "sp8.jpg",
    "potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg",
    "meter2.jpg", "opr.jpg", "f_star.png", "t_star.png", "digits.png", "inst.jpg",
    "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg",
    "separator.png", "i_act.png", "w.png", "i_zamer.png", "l_label.png", "rub5.png", "rub4.png", "uzbg1.png", "tel2.png",
    "blue_btn.png", "red_btn.png", "yellow_btn.png", "yellow_btn2.png", "grey_btn.png", "name2.png",
    "grafic.png", "dark_sign.png", "c1.png", "c2.png", "c3.png", "c4.png", "c5.png", "c6.png",
    "y_sign.png", "s_grafic.png", "y.png", "s30_bg.jpg", "b_sign.png", "btn_blue3.png", "btn_blue.png", "red_lenta.png", "best1.png", "aktsiya.png",
    "rub.png", "rub2.png", "fm1.jpg", "fm2.jpg", "fm3.jpg", "fm4.jpg", "s8_footer.jpg",
    "email2.png", "adressinput.png", "map-icon.png", "otz_all.png",
    "g_prev.png", "g_next.png", "prev2.png", "next2.png",
    "close.png", "m_arrow.png", "s30m_bg.jpg",
    "buy_b1.png", "buy_b2.png", "buy_b3.png", "buy_b4.png", "buy_b5.png"
)

function Download-One {
    param($url, $outPath)
    $dir = Split-Path $outPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    try {
        Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing -ErrorAction Stop
        Write-Host "OK $outPath"
        return $true
    } catch {
        Write-Host "FAIL $url : $_"
        return $false
    }
}

$count = 0
foreach ($f in $files) {
    if (Download-One -url "$base/$f" -outPath (Join-Path $dest $f)) { $count++ }
}

# to(1).jpg — имя со скобками
if (Download-One -url "$base/to(1).jpg" -outPath (Join-Path $dest "to(1).jpg")) { $count++ }

# Подкаталоги: otz, potolki (все фото комнат и отзывов 1:1)
$subdirs = @(
    @{ sub = "otz"; file = "otz.png" },
    @{ sub = "potolki"; files = @("potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg") },
    @{ sub = "cat_menu"; files = @("all_current.png", "mat.png", "gl.png", "tk.png", "ur.png", "foto.png", "stars.png") },
    @{ sub = "market"; files = @("img1.png", "img56.png", "img62.png", "img68.png", "img78.png", "img5.png") }
)

foreach ($s in $subdirs) {
    $subPath = Join-Path $dest $s.sub
    if (-not (Test-Path $subPath)) { New-Item -ItemType Directory -Path $subPath -Force | Out-Null }
    if ($s.file) {
        if (Download-One -url "$base/$($s.sub)/$($s.file)" -outPath (Join-Path $subPath $s.file)) { $count++ }
    }
    if ($s.files) {
        foreach ($f in $s.files) {
            if (Download-One -url "$base/$($s.sub)/$f" -outPath (Join-Path $subPath $f)) { $count++ }
        }
    }
}

Write-Host "Done. Downloaded: $count files to $dest"
