# Copy images from local template to Laravel public/images.
# Sources: p-c, then proffi-template (fallback)
# Dest:   react-proffi\public\images AND p-c\public\images (proffi-center.loc)

$srcPc = "C:\OSPanel\domains\p-c\template\globalTemplate\images"
$srcTemplate = "C:\Users\dsc-2\Documents\proffi-template\globalTemplate\images"
$destList = @(
    "c:\OSPanel\domains\react-proffi\public\images",
    "C:\OSPanel\domains\p-c\public\images"
)

# Choose source: p-c if exists, else proffi-template
$src = if (Test-Path $srcPc) { $srcPc } elseif (Test-Path $srcTemplate) { $srcTemplate } else { $null }
if (-not $src) {
    Write-Host "Source not found (tried p-c and proffi-template)"
    exit 1
}
Write-Host "Using source: $src"

function Copy-IfExists($from, $to) {
    if (Test-Path $from) { Copy-Item -Path $from -Destination $to -Force; return $true }
    return $false
}

foreach ($dest in $destList) {
    if (-not (Test-Path (Split-Path $dest))) { continue }
    Write-Host "--- $dest ---"

    # Root images
    $rootFiles = @("rub.png", "rub2.png", "rub3.png", "7let.png", "12let.png", "20let.png", "mat_pro.png", "gl_pro.png", "satin_pro.png", "tkan_pro.png", "foto_pro.png", "zn_pro.png", "best1.png", "p_made.png", "buy_rassr.png", "sk_block_bg.jpg", "o_best_price.jpg", "yellow_btn2.png", "supod.png", "karniz.png", "npphpto.jpg", "fotop.png", "podarok.png", "101.jpg", "102.jpg", "103.jpg", "104.jpg", "r1.png", "r2.png", "r3.png", "y_label.png", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "otz_man.jpg", "otz_clock.jpg", "meter2.jpg", "opr.jpg", "c_adr.png", "c_time.png", "dogovor.png", "usl_part.png", "buy_now_bg.png", "buy_b1.png", "buy_b2.png", "buy_b3.png", "buy_b4.png", "buy_b5.png", "tinkoff-bank.png", "l1.jpg", "l2.jpg", "l3.jpg", "l4.jpg", "l5.jpg", "l6.jpg", "cont.jpg", "par.jpg", "dv.jpg", "sp8.jpg", "pk-5.jpg", "logo.png", "index_banner.jpg", "m_gerb.png", "mmenu.png", "m_close.png", "trubka.png", "inst.jpg", "f_star.png", "t_star.png")
    $rootFiles += @("potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg")
    $rootFiles += @("to(1).jpg")
    foreach ($f in $rootFiles) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
        $to = Join-Path $dest $f
        $ok = Copy-IfExists (Join-Path $src $f) $to
        if (-not $ok -and $src -eq $srcPc -and (Test-Path $srcTemplate)) {
            $ok = Copy-IfExists (Join-Path $srcTemplate $f) $to
        }
        if ($ok) { Write-Host "OK $f" } else { Write-Host "SKIP (missing) $f" }
    }

    # cat_menu (обычные + _current для активного таба, all.png для неактивного «Все»)
    $catMenu = @(
        "all.png", "all_current.png",
        "mat.png", "mat_current.png",
        "gl.png", "gl_current.png",
        "tk.png", "tk_current.png",
        "ur.png", "ur_current.png",
        "foto.png", "foto_current.png",
        "stars.png", "stars_current.png"
    )
    $catDest = Join-Path $dest "cat_menu"
    New-Item -ItemType Directory -Path $catDest -Force | Out-Null
    foreach ($f in $catMenu) {
        $from = Join-Path (Join-Path $src "cat_menu") $f
        if (Test-Path $from) {
            Copy-Item -Path $from -Destination (Join-Path $catDest $f) -Force
            Write-Host "OK cat_menu/$f"
        } else { Write-Host "SKIP (missing) cat_menu/$f" }
    }

    # market
    $market = @("img1.png", "img56.png", "img62.png", "img68.png", "img78.png", "img5.png")
    $marketDest = Join-Path $dest "market"
    New-Item -ItemType Directory -Path $marketDest -Force | Out-Null
    foreach ($f in $market) {
        $from = Join-Path (Join-Path $src "market") $f
        if (Test-Path $from) {
            Copy-Item -Path $from -Destination (Join-Path $marketDest $f) -Force
            Write-Host "OK market/$f"
        } else { Write-Host "SKIP (missing) market/$f" }
    }

    # materials (детальная страница товара)
    $materials = @("m1.jpg", "m2.jpg", "m3.jpg", "m4.jpg", "m5.jpg")
    $materialsDest = Join-Path $dest "materials"
    New-Item -ItemType Directory -Path $materialsDest -Force | Out-Null
    foreach ($f in $materials) {
        $from = Join-Path (Join-Path $src "materials") $f
        if (Test-Path $from) {
            Copy-Item -Path $from -Destination (Join-Path $materialsDest $f) -Force
            Write-Host "OK materials/$f"
        } else { Write-Host "SKIP (missing) materials/$f" }
    }

    # p_calc (калькулятор: комнаты, флаги, select, слайдер)
    $srcAlt = if ($src -eq $srcPc -and (Test-Path $srcTemplate)) { $srcTemplate } else { $null }
    $pCalc = @("room_mat.jpg", "room_gl.jpg", "room_tk.jpg", "room_ur.jpg", "room_ft.jpg", "room_st.jpg", "1.png", "2.png", "3.png", "4.png", "5.png", "select.png", "sw2.png")
    $pCalcDest = Join-Path $dest "p_calc"
    New-Item -ItemType Directory -Path $pCalcDest -Force | Out-Null
    foreach ($f in $pCalc) {
        $to = Join-Path $pCalcDest $f
        $from1 = Join-Path (Join-Path $src "p_calc") $f
        $ok = Copy-IfExists $from1 $to
        if (-not $ok -and $srcAlt) { $from2 = Join-Path (Join-Path $srcAlt "p_calc") $f; $ok = Copy-IfExists $from2 $to }
        if ($ok) { Write-Host "OK p_calc/$f" } else { Write-Host "SKIP (missing) p_calc/$f" }
    }

    # akcii (страница скидок: a1–a4, badger_r, badger_l)
    $akcii = @("a1.jpg", "a2.jpg", "a3.jpg", "a4.jpg", "badger_r.png", "badger_l.png")
    $akciiDest = Join-Path $dest "akcii"
    New-Item -ItemType Directory -Path $akciiDest -Force | Out-Null
    foreach ($f in $akcii) {
        $to = Join-Path $akciiDest $f
        $from1 = Join-Path (Join-Path $src "akcii") $f
        $ok = Copy-IfExists $from1 $to
        if (-not $ok -and $srcAlt) { $from2 = Join-Path (Join-Path $srcAlt "akcii") $f; $ok = Copy-IfExists $from2 $to }
        if ($ok) { Write-Host "OK akcii/$f" } else { Write-Host "SKIP (missing) akcii/$f" }
    }

    # otz (аватар отзывов на странице о компании)
    $otz = @("otz.png")
    $otzDest = Join-Path $dest "otz"
    New-Item -ItemType Directory -Path $otzDest -Force | Out-Null
    foreach ($f in $otz) {
        $to = Join-Path $otzDest $f
        $from1 = Join-Path (Join-Path $src "otz") $f
        $ok = Copy-IfExists $from1 $to
        if (-not $ok -and $srcAlt) { $from2 = Join-Path (Join-Path $srcAlt "otz") $f; $ok = Copy-IfExists $from2 $to }
        if ($ok) { Write-Host "OK otz/$f" } else { Write-Host "SKIP (missing) otz/$f" }
    }

    # img (фото в отзывах на странице natyazhnyye-potolki-otzyvy)
    $imgOtz = @("__1.jpg", "3.jpg", "natyazhnoy-potolok-v-prihozhey-foto-185-10697.jpg", "satinovye-natyazhnye-potolki.jpg")
    $imgDest = Join-Path $dest "img"
    New-Item -ItemType Directory -Path $imgDest -Force | Out-Null
    foreach ($f in $imgOtz) {
        $to = Join-Path $imgDest $f
        $from1 = Join-Path (Join-Path $src "img") $f
        $ok = Copy-IfExists $from1 $to
        if (-not $ok -and $srcAlt) { $from2 = Join-Path (Join-Path $srcAlt "img") $f; $ok = Copy-IfExists $from2 $to }
        if ($ok) { Write-Host "OK img/$f" } else { Write-Host "SKIP (missing) img/$f" }
    }

    # potolki (страницы категорий и блоки о компании)
    $potolki = @("potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg")
    $potolkiDest = Join-Path $dest "potolki"
    New-Item -ItemType Directory -Path $potolkiDest -Force | Out-Null
    foreach ($f in $potolki) {
        $to = Join-Path $potolkiDest $f
        $from1 = Join-Path (Join-Path $src "potolki") $f
        $ok = Copy-IfExists $from1 $to
        if (-not $ok -and $srcAlt) { $from2 = Join-Path (Join-Path $srcAlt "potolki") $f; $ok = Copy-IfExists $from2 $to }
        if ($ok) { Write-Host "OK potolki/$f" } else { Write-Host "SKIP (missing) potolki/$f" }
    }
}

Write-Host "Done."
