# Download template images to public/images. Run from project root.
# Base URL: https://proffi-center.ru/template/globalTemplate/images/
$base = "https://proffi-center.ru/template/globalTemplate/images"
$dest = "c:\OSPanel\domains\react-proffi\public\images"

$files = @(
    "logo.png", "m_gerb.png", "mmenu.png", "m_close.png", "trubka.png",
    "index_banner.jpg", "l1.jpg", "l2.jpg", "l3.jpg", "l4.jpg", "l5.jpg", "l6.jpg",
    "cont.jpg", "par.jpg", "pk-5.jpg", "dv.jpg", "sp8.jpg",
    "potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg",
    "meter2.jpg", "opr.jpg", "f_star.png", "t_star.png", "digits.png", "inst.jpg",
    "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg",
    "separator.png", "i_act.png", "w.png", "i_zamer.png", "l_label.png", "rub5.png", "uzbg1.png", "tel2.png",
    "blue_btn.png", "red_btn.png", "yellow_btn.png", "yellow_btn2.png", "grey_btn.png", "name2.png",
    "grafic.png", "dark_sign.png", "c1.png", "c2.png", "c3.png", "c4.png", "c5.png", "c6.png",
    "y_sign.png", "s_grafic.png", "y.png", "s30_bg.jpg", "b_sign.png", "btn_blue3.png", "btn_blue.png", "red_lenta.png", "best1.png", "aktsiya.png",
    "rub.png", "rub2.png", "rub4.png", "fm1.jpg", "fm2.jpg", "fm3.jpg", "fm4.jpg", "s8_footer.jpg",
    "email2.png", "adressinput.png", "map-icon.png", "otz_all.png",
    "g_prev.png", "g_next.png", "prev2.png", "next2.png",
    "close.png", "m_arrow.png", "s30m_bg.jpg"
)
# to(1).jpg - special name
$to1 = "to(1).jpg"

foreach ($f in $files) {
    $url = "$base/$f"
    $out = Join-Path $dest $f
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
        Write-Host "OK $f"
    } catch {
        Write-Host "FAIL $f : $_"
    }
}
try {
    Invoke-WebRequest -Uri "$base/$to1" -OutFile (Join-Path $dest $to1) -UseBasicParsing -ErrorAction Stop
    Write-Host "OK $to1"
} catch { Write-Host "FAIL $to1" }

$subdirs = @(
    @{ sub = "otz"; file = "otz.png" },
    @{ sub = "potolki"; files = @("potolok2_1.jpg", "potolok2_2.jpg", "potolok2_3.jpg", "potolok2_4.jpg", "potolok2_5.jpg", "potolok2_6.jpg") },
    @{ sub = "cat_menu"; files = @("all_current.png", "mat.png", "gl.png", "tk.png", "ur.png", "foto.png", "stars.png") },
    @{ sub = "market"; files = @("img1.png", "img56.png", "img62.png", "img68.png", "img78.png", "img5.png") }
)
foreach ($s in $subdirs) {
    $subPath = Join-Path $dest $s.sub
    if ($s.file) {
        $url = "$base/$($s.sub)/$($s.file)"
        $out = Join-Path $subPath $s.file
        try {
            Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
            Write-Host "OK $($s.sub)/$($s.file)"
        } catch { Write-Host "FAIL $($s.sub)/$($s.file)" }
    }
    if ($s.files) {
        foreach ($f in $s.files) {
            $url = "$base/$($s.sub)/$f"
            $out = Join-Path $subPath $f
            try {
                Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
                Write-Host "OK $($s.sub)/$f"
            } catch { Write-Host "FAIL $($s.sub)/$f" }
        }
    }
}
Write-Host "Done."
