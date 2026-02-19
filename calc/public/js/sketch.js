function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

var newCalculate,
    canvas1,
    png_img,
    png__img,
    sketch,
    elem_newLength,
    elem_window,
    elem_useLine,
    elem_input_n4,
    elem_input_n5,
    elem_input_n9,
    elem_preloader,
    elem_curve,
    elem_arc,
    elem_popup2,
    elem_popupCoordinates,
    elem_popupInnerCutout,
    elem_popupLevel,
    elem_popupCanvas,
    elem_popupCanvasColor,
    elem_popupBuild,
    elem_divColors,
    elem_selectFacture,
    elem_selectManufacturer,
    elem_textareaCoordinates,
    lines = [],
    lines_sort = [],
    arcs_arr = [],
    start_draw_point,
    moving_circle,
    move_curve_point,
    circles_for_draw = [],
    drawing_lines = [],
    drawing_curve_path,
    current_input_length,
    arc,
    draw_step = 0,
    line_arc_bottom,
    line_arc_height,
    last_point_in_circle,
    count_segments_curve_value,
    chert_close = false,
    text_points = [],
    g_points = [],
    diags = [],
    vh = 'v',
    code = 64,
    alfavit = 0,
    timer1,
    timer_mig,
    fix_point_dvig,
    distOfShift = 0,
    ready = false,
    borderLines = {},
    diag_sort = [],
    width_final,
    final_canvas_id,
    touchZoomObj = {touch1: undefined, touch2: undefined, rast_touch: 0, rast_touch2: 0},
    square_obrezkov = 0,
    angle_final,
    sq_polotna,
    cuts_json,
    p_usadki_final = 1,
    perimeter_shrink = 0,
    curvilinear_length = 0,
    inner_cutout_length = 0,
    arr_cancel = [],
    triangulate_rezhim = 0,
    begin_point_diag,
    end_point_diag,
    manual_diag,
    text_manual_diags = [],
    abstractLines,
    lines_length = [],
    seam = 0,
    calc_img, cut_img,
    seam_lines = [],
    polotna = [],
    points_poloten = [],
    koordinats_poloten = [],
    square_tkan,
    lines_tkan = [],
    stop_rek = false,
    first_click = false,
    g_layer,
    noty_nl,
    bool_noty_curve,
    triangulate_bool = false,
    button_reverse_arc,
    inner_cutout_bool = false,
    inner_cutouts = [],
    cut_pos_line1,
    cut_pos_line2,
    cut_length,
    cut_width,
    cutout_line,
    cutout_figure = 0,
    drawing_data,
    levelCeiling,
    ceilings = [],
    canvases,
    canvasColors = [],
    texture,
    color,
    manufacturer,
    altAngles = [],
    jobs_from_sketch = [],
    goods_from_sketch = [],
    lightingArr = [],
    chandelier = [],
    selectedLight = null,
    compPathLines;

function get_ya_browser() {
    var ua = navigator.userAgent;
    if (ua.search(/YaBrowser/) > 0) return 1;
    return 0;
}

jQuery(document).ready(function () {
    yaBrowser = get_ya_browser()


    paper.install(window);
    paper.setup("myCanvas");
    var tool = new Tool();
    g_layer = project.activeLayer;
    sketch = new Sketch();

    clicks();
    resize_canvas();
    jQuery(window).resize(function () {
        resize_canvas();
        sketch.alignCenter();
    });


    function selectTwoLevelCeiling() {
        new Noty({
            theme: 'relax',
            timeout: 2000,
            layout: 'topCenter',
            type: "warning",
            text: "Функция недоступна"
        }).show();
    }

    var build_chert_on_koordinats = function () {
        try {
            clearElems();
            elem_textareaCoordinates.value = elem_textareaCoordinates.value.replace(/[',']/g, '.');
            var arr1 = elem_textareaCoordinates.value.replace(/\s+/g, ' ').trim().split(' '),
                splited_str, splited_str2, name, x, y, chert_koordinats = [], line, pt;

            for (var i = arr1.length; i--;) {
                splited_str = arr1[i].split('(');
                name = splited_str[0];
                splited_str[1] = splited_str[1].replace(')', '');
                splited_str2 = splited_str[1].split(';');
                x = +splited_str2[0];
                y = +splited_str2[1];
                chert_koordinats.push({name: name, x: x + 100, y: y + 100});
            }

            var curveBool = false, innerCutoutBool = false;

            for (var i = chert_koordinats.length - 1; i--;) {
                line = new Path.Line(new Point(chert_koordinats[i + 1].x, chert_koordinats[i + 1].y),
                    new Point(chert_koordinats[i].x, chert_koordinats[i].y));
                line.strokeColor = 'green';
                line.strokeWidth = LINE_WIDTH;
                line.data.fixed = true;
                line.data.is_wall = true;
                lines.push(line);
                lines_sort.push(line);
                line.data.id = lines.length - 1;

                if (curveBool) {
                    line.data.curve = true;
                    line.strokeColor = 'Magenta';
                }
                if (innerCutoutBool) {
                    line.data.isInnerCutout = true;
                    line.dashArray = [10, 4];
                }

                if (chert_koordinats[i].name.match(/\}/gi)) {
                    chert_koordinats[i].name = chert_koordinats[i].name.replace('}', '');
                    if (curveBool) {
                        curveBool = false;
                    } else {
                        for (var j = lines.length; j--;) {
                            lines[j].data.curve = true;
                            lines[j].strokeColor = 'Magenta';
                        }
                    }
                }
                if (chert_koordinats[i].name.match(/\{/gi)) {
                    chert_koordinats[i].name = chert_koordinats[i].name.replace('{', '');
                    curveBool = true;
                }

                if (chert_koordinats[i].name.match(/\]/gi)) {
                    chert_koordinats[i].name = chert_koordinats[i].name.replace(']', '');
                    if (innerCutoutBool) {
                        innerCutoutBool = false;
                    } else {
                        for (var j = lines.length; j--;) {
                            lines[j].data.isInnerCutout = true;
                            lines[j].dashArray = [10, 4];
                        }
                    }
                }
                if (chert_koordinats[i].name.match(/\[/gi)) {
                    chert_koordinats[i].name = chert_koordinats[i].name.replace('[', '');
                    innerCutoutBool = true;
                }

                g_points.push(new Point(chert_koordinats[i].x, chert_koordinats[i].y));
                pt = new PointText({
                    point: new Point(chert_koordinats[i].x - DIST_TP_X, chert_koordinats[i].y - DIST_TP_Y),
                    content: chert_koordinats[i].name,
                    fillColor: 'blue',
                    justification: 'center',
                    fontFamily: 'lucida console',
                    fontWeight: 'bold',
                    fontSize: (14 / view.zoom).toFixed(2) - 0
                });
                text_points.push(pt);
            }

            var l = chert_koordinats.length - 1;
            line = new Path.Line(new Point(chert_koordinats[0].x, chert_koordinats[0].y),
                new Point(chert_koordinats[l].x, chert_koordinats[l].y));
            line.strokeColor = 'green';
            line.strokeWidth = LINE_WIDTH;
            line.data.fixed = true;
            line.data.is_wall = true;
            lines.push(line);
            lines_sort.push(line);
            line.data.id = lines.length - 1;

            if (chert_koordinats[l].name.match(/\}/gi)) {
                chert_koordinats[l].name = chert_koordinats[l].name.replace('}', '');
                curveBool = true;
            }
            if (chert_koordinats[l].name.match(/\{/gi)) {
                chert_koordinats[l].name = chert_koordinats[l].name.replace('{', '');
                if (curveBool) {
                    for (var j = lines.length; j--;) {
                        lines[j].data.curve = true;
                        lines[j].strokeColor = 'Magenta';
                    }
                }
            }

            if (curveBool) {
                line.data.curve = true;
                line.strokeColor = 'Magenta';
            }

            if (chert_koordinats[l].name.match(/\]/gi)) {
                chert_koordinats[l].name = chert_koordinats[l].name.replace(']', '');
                innerCutoutBool = true;
            }
            if (chert_koordinats[l].name.match(/\[/gi)) {
                chert_koordinats[l].name = chert_koordinats[l].name.replace('[', '');
                if (innerCutoutBool) {
                    for (var j = lines.length; j--;) {
                        lines[j].data.isInnerCutout = true;
                        lines[j].dashArray = [10, 4];
                    }
                }
            }

            if (innerCutoutBool) {
                line.data.isInnerCutout = true;
                lines.dashArray = [10, 4];
            }

            g_points.push(new Point(chert_koordinats[l].x, chert_koordinats[l].y));
            pt = new PointText({
                point: new Point(chert_koordinats[l].x - DIST_TP_X, chert_koordinats[l].y - DIST_TP_Y),
                content: chert_koordinats[l].name,
                fillColor: 'blue',
                justification: 'center',
                fontFamily: 'lucida console',
                fontWeight: 'bold',
                fontSize: (14 / view.zoom).toFixed(2) - 0
            });
            text_points.push(pt);

            var ptsr, id1, id2;

            for (var i = text_points.length; i--;) {
                ptsr = new Point(text_points[i].point.x + DIST_TP_X, text_points[i].point.y + DIST_TP_Y);
                for (var key = lines.length; key--;) {
                    for (var j in lines[key].segments) {
                        if (sketch.comparePoints(ptsr, lines[key].segments[j].point, HALF)) {
                            id1 = key;
                        }
                    }
                }
                for (var key = lines.length; key--;) {
                    if (key === id1) {
                        continue;
                    }
                    for (var j in lines[key].segments) {
                        if (sketch.comparePoints(ptsr, lines[key].segments[j].point, HALF)) {
                            id2 = key;
                        }
                    }
                }
                text_points[i].data.id_line1 = +id1;
                text_points[i].data.id_line2 = +id2;
            }

            sketch.drawLinesText(lines, 1, FONT_LINES, 0);
            chert_close = true;

            var vertices_count = g_points.length;

            elem_input_n9.value = sketch.getAngles(lines, inner_cutouts);
            elem_input_n5.value = sketch.getPerimeter(lines);

            triangulator();

            if (diags.length < vertices_count - 3) {
                for (var key = 3; key--;) {
                    pulemet();
                    ////console.log('pulemet');
                    if (diags.length === vertices_count - 3) {
                        break;
                    }
                }
            }
            if (diags.length < vertices_count - 3) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Ошибка в построении диагоналей"
                }).show();

                elem_preloader.style.display = 'none';
                return;
            }

            diag_sortirovka();

            for (var key = diag_sort.length; key--;) {
                diag_sort[key].data.fixed = true;
                diag_sort[key].strokeColor = 'green';
                sketch.addTextLine(diag_sort[key], 1, FONT_DIAGS, 1);
            }

            ready = true;
            triangulate_bool = true;

            elem_popupCoordinates.style.display = 'none';

            sketch.alignCenter();
            resize_canvas();
            sketch.zoomOut(borderLines, lines, changeTextAfterZoom);
            elem_input_n4.value = sketch.getArea(lines_sort, inner_cutouts);
            if (elem_input_n4.value < 0.1) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Слишком маленькая площадь!"
                }).show();
            }
            code = ((vertices_count % 26) + 90) - 26;
            alfavit = Math.floor(vertices_count / 26);
            ////console.log(code, alfavit);
            save_cancel();
        } catch (e) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Ошибка"
            }).show();
            //console.log(e);
        }
        document.getElementById('preloader').style.display = 'none';
    };


// var str_lines_lengths = "ab=90;bc=176;cd=98;ad=167;",
// 	str_diags_lengths = "ac=222";
// var str_lines_lengths = "ab=120;bc=294;cd=420;de=140;ef=246;fg=271;gh=45;hi=50;ij=45;jk=136;kl=305;la=308",
//  	str_diags_lengths = "bl=330.1;bi=211;bh=174.2;bf=232.4;cf=223.3;df=283.1;fh=274.7;ik=143.2;il=293.4";
// var str_lines_lengths = "ab=229;bc=49.6;cd=49.6;de=49.9;ef=49.6;fg=49.1;gh=49.2;hi=49.5;ij=49.7;jk=49.6;kl=49.7;la=285.7",
//   	str_diags_lengths = "ac=224.5;ad=242.3;ae=273.5;af=308.9;ag=331.1;ah=339.8;ai=332.3;aj=320;ak=304.1";
// var str_lines_lengths = "ab=100;bc=320;cd=320;ad=100",
//    	str_diags_lengths = "bd=150";
// var str_lines_lengths = "ab=152;bc=182;cd=220;de=122;ef=206;fg=137;gh=578;ah=441;",
//     str_diags_lengths = "ac=237.1;ce=251.6;ch=380;eg=247.4;eh=396.4;";
// var str_lines_lengths = "ab=121;bc=190;cd=80;de=88;ef=274;fg=128;gh=240;hi=420;ij=244;jk=193;kl=401;al=244",
//     str_diags_lengths = "bf=339;bj=284.6;bk=371.4;bl=272.4;ce=118.9;cf=213;fj=340.1;fi=466;fh=342.3;";
// var str_lines_lengths = "ab=135;bc=105;cd=157;de=120;ef=292;fa=225",
//     str_diags_lengths = "ca=171;cf=180;ce=197";
// var str_lines_lengths = "ab=121;bc=190;cd=41;de=28;ef=162;fa=218",
//     str_diags_lengths = "ca=225;cf=124;ce=49";
// var str_lines_lengths = "ab=100;bc=40;cd=100;de=100;ef=200;fa=60",
//     str_diags_lengths = "bd=107;be=116;bf=116";
// var str_lines_lengths = "ab=100;bc=40;cd=100;de=60;ef=200;fa=100",
//     str_diags_lengths = "ac=107;ce=116;cf=116";
// var str_lines_lengths = "ab=100;bc=80;cd=80;ad=100",
// 	str_diags_lengths = "ac=30";
// var str_lines_lengths = "ab=116;bc=157;cd=~247;de=~90;ef=387;fg=371;gh=579;hi=384;ij=120;jk=186;kl=203;al=74",
//     str_diags_lengths = "ah=346;ak=216;ag=284;bg=187;bf=284;cf=166;ce=263;ik=221;kh=231;";

//problem 1
// var str_lines_lengths = "AB=206;BC=114;CD=13;DE=25;EF=26;FG=51;GH=52;HI=52;IJ=51;JK=51;KL=52;LM=52;MN=23;NO=29;OP=52;PQ=52;QR=52;RS=52;ST=52;TU=51;UV=114;VW=61;WX=181;XY=200;YZ=118;ZA1=23;A1B1=32;B1C1=147;C1D1=238;D1E1=26;E1A=158",
// 	str_diags_lengths = "AC=235.44;CE1=210.65;CE=27.71;EE1=217.93;EB1=274.04;FB1=254.32;GZ=255.39;GB1=240.1;HY=259.15;HZ=256.94;IY=245.56;JY=228.2;KY=192.29;LY=158.99;MY=125.89;NY=124.18;NX=245.69;OX=232.67;PX=231.55;PW=151.6;QW=123.78;RW=109.83;SW=107.71;TW=115.6;UW=129.03;ZB1=39.41;B1E1=266.99;C1E1=239.42";

//problem 2
// var str_lines_lengths = "AB=57.56;BC=57.56;CD=178;DE=69.46;EF=57.56;FG=57.56;GH=57.56;HI=168;IJ=57.56;JK=57.56;KL=69.46;LM=69.46;MN=178;NO=56.56;OP=45.27;PQ=85.38;QR=98;RS=86.38;ST=18.29;TU=18.29;UV=86.38;VW=76;WX=86.38;XY=18.29;YZ=18.29;ZA1=86.38;A1B1=98;B1C1=86.38;C1D1=18.29;D1E1=18.29;E1F1=86.38;F1G1=76;G1H1=86.38;H1I1=18.29;I1J1=18.29;J1K1=45.27;K1L1=57.56;L1M1=57.56;M1N1=57.56;N1O1=168;O1P1=57.56;P1A=57.56",
//  	str_diags_lengths = "BD1=49;BC1=45.27;CC1=64.09;CB1=73.25;DB1=143.78;DA1=66.37;DZ=72.21;EZ=45.27;EY=49;EG=78.24;GY=61;GX=56.58;HX=73.84;HW=82.93;WI=140.16;VI=82.93;IU=73.84;JU=56.58;JT=61;JL=78.24;TL=49;SL=45.27;SM=72.21;RM=66.37;RN=154.87;QN=73.25;NP=63.09;K1I1=49;K1M1=69.3;I1M1=49;H1M1=45.27;H1N1=64.09;G1N1=73.25;O1G1=134.66;O1F1=73.25;E1O1=64.09;E1P1=45.27;D1P1=49;BP1=69.3";

    function parseLengths(str, type) {
        var regexp = /^\d+$/;
        var v1, v2, l, result = [], curve, temp;

        str = str.toUpperCase();
        str = str.replace(/[\s]+/g, '');
        if (str[str.length - 1] === ';') {
            str = str.slice(0, -1);
        }
        //console.log(str);
        result = str.split(';');
        for (var i = result.length; i--;) {
            if (regexp.test(result[i].substring(1, 2))) {
                v1 = result[i].substring(0, 2);
                if (regexp.test(result[i].substring(3, 4))) {
                    v2 = result[i].substring(2, 4);
                } else {
                    v2 = result[i].substring(2, 3);
                }
            } else {
                v1 = result[i].substring(0, 1);
                if (regexp.test(result[i].substring(2, 3))) {
                    v2 = result[i].substring(1, 3);
                } else {
                    v2 = result[i].substring(1, 2);
                }
            }
            curve = false;
            temp = result[i].indexOf('=') + 1;
            if (result[i].substring(temp, temp + 1) === '~') {
                curve = true;
                result[i] = result[i].replace('~', '');
            }
            l = +result[i].substring(temp);
            result[i] = {
                v1: v1,
                v2: v2,
                l: l,
                paint: false,
                type: type,
                bool_osnova: false,
                real_line: null,
                isCurve: curve
            };
        }
        return result;
    }

    var tempPath, namedPoints = [];

    var build_chert = function () {
        clearElems();
        var tempLinesLength = parseLengths(str_lines_lengths, 'line'),
            tempDiagsLength = parseLengths(str_diags_lengths, 'diag');

        if (tempLinesLength.length - 3 !== tempDiagsLength.length) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Не хватает диагоналей или введена лишняя линия!"
            }).show();
            return;
        }
        abstractLines = tempLinesLength.concat(tempDiagsLength);
        //console.log(abstractLines);

        var osnova, b1, b2, line, b1_line, b2_line, ov, currentLine, startPointA;
        for (var i = 0; i < abstractLines.length; i++) {
            if ((abstractLines[i].v1 === 'A' && abstractLines[i].v2 === 'B') ||
                (abstractLines[i].v1 === 'B' && abstractLines[i].v2 === 'A')) {
                osnova = abstractLines[i];
                line = new Path.Line(new Point(0, 0), new Point(0 + osnova.l, 0));
                startPointA = line.segments[0].point;
                line.segments[0].point.vertexName = 'A';
                line.segments[1].point.vertexName = 'B';
                namedPoints.push({point: line.segments[0].point, name: 'A'});
                namedPoints.push({point: line.segments[1].point, name: 'B'});
                if (abstractLines[i].isCurve) {
                    line.data.curve = true;
                    line.strokeColor = 'Magenta';
                } else {
                    line.strokeColor = 'green';
                }
                line.strokeWidth = LINE_WIDTH;
                line.data.fixed = true;
                line.data.is_wall = true;
                lines.push(line);
                line.data.id = lines.length - 1;
                currentLine = line;
                abstractLines[i].paint = true;
                abstractLines[i].real_line = line;
                break;
            }
        }

        tempPath = new CompoundPath({
            closed: true,
            fillColor: 'red',
            opacity: 0.2
        });

        var paint_count = 1, iter_count = 0;
        var a = abstractLines;
        while (paint_count < abstractLines.length) {
            for (var i = 0; i < a.length; i++) {
                if (a[i].paint) {
                    continue;
                }
                for (var j = i; j < a.length; j++) {
                    if (a[j].paint) {
                        continue
                    }
                    if (a[i] !== osnova && a[j] !== osnova && i !== j) {
                        ov = obshaya_vertex(a[i], osnova);
                        if (ov) {
                            if (obshaya_vertex(a[j], osnova, ov) &&
                                obshaya_vertex(a[i], a[j], ov)) {
                                try {
                                    draw2LinesToLine(a[i], a[j], currentLine);
                                    paint_count += 2;
                                    i = 0;
                                } catch (e) {
                                    if (e === 'Lines intersect with the drawing') {
                                        new Noty({
                                            theme: 'relax',
                                            timeout: 2000,
                                            layout: 'topCenter',
                                            type: "warning",
                                            text: "Ошибка! Обнаружено пересечение чертежа!"
                                        }).show();
                                        return;
                                    } else if (e === 'No intersections found') {
                                        new Noty({
                                            theme: 'relax',
                                            timeout: 2000,
                                            layout: 'topCenter',
                                            type: "warning",
                                            text: "Ошибка! Не найдены пересечения кругов для построения части чертежа!"
                                        }).show();
                                        return;
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            osnova.bool_osnova = true;
            for (var i = a.length; i--;) {
                if (a[i].paint && !a[i].bool_osnova) {
                    osnova = a[i];
                    currentLine = osnova.real_line;
                    break;
                }
            }

            if (iter_count > abstractLines.length) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Ошибка! Чертеж не достроен! Проверьте данные"
                }).show();
                return;
            }
            iter_count++;
        }

        for (var i = namedPoints.length, a, b, c, tempLine; i--;) {
            a = namedPoints[i];
            b = undefined;
            for (var j = namedPoints.length; j--;) {
                if (namedPoints[j].name.charCodeAt() === a.name.charCodeAt() + 1) {
                    b = namedPoints[j];
                    break;
                }
            }
            c = undefined;
            for (var j = namedPoints.length; j--;) {
                if (namedPoints[j].name.charCodeAt() === a.name.charCodeAt() + 2) {
                    c = namedPoints[j];
                    break;
                }
            }
            if (b !== undefined && c !== undefined) {
                tempLine = new Path.Line(a.point, c.point);
                if (tempPath.contains(tempLine.position)) {
                    var bool_intersect = false;
                    for (var j = lines.length; j--;) {
                        if (sketch.isIntersect(lines[j].segments[0].point, lines[j].segments[1].point,
                            tempLine.segments[0].point, tempLine.segments[1].point)) {
                            bool_intersect = true;
                            break;
                        }
                    }
                    if (bool_intersect) {
                        continue;
                    }
                    ////console.log(a, b, c);
                    ////console.log(sketch.isClockWise(a.point, b.point, c.point));
                    if (!sketch.isClockWise(a.point, b.point, c.point)) {
                        sketch.toMirror([lines, diags]);
                    }
                    tempLine.remove();
                    break;
                }
                tempLine.remove();
            }
        }

        tempPath.remove();

        namedPoints = sketch.quicksort(namedPoints, 0, namedPoints.length - 1, sketch.partitionVertexes);
        ////console.log(namedPoints);

        text_points = drawLabels(namedPoints);
        ////console.log(text_points);

        lines_sort = sketch.quicksort(lines, 0, lines.length - 1, sketch.partitionLinesByVertexNames);
        sketch.connectAllSegments(lines_sort, diags);
        diag_sortirovka();

        sketch.drawLinesText(lines_sort, 1, FONT_LINES, 0);
        sketch.drawLinesText(diag_sort, 1, FONT_DIAGS, 1);

        chert_close = true;
        ready = true;
        triangulate_bool = true;

        sketch.alignCenter();
        resize_canvas();
        sketch.zoomOut(borderLines, lines, changeTextAfterZoom);

        g_points = sketch.getPathsPointsBySort(lines_sort);
        var vertices_count = g_points.length;

        elem_input_n9.value = sketch.getAngles(lines, inner_cutouts);
        elem_input_n5.value = sketch.getPerimeter(lines);
        elem_input_n4.value = sketch.getArea(lines_sort, inner_cutouts);

        if (elem_input_n4.value < 0.1) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Слишком маленькая площадь!"
            }).show();
        }
        code = ((vertices_count % 26) + 90) - 26;
        alfavit = Math.floor(vertices_count / 26);
        ////console.log(code, alfavit);
        save_cancel();
    };

    function draw2LinesToLine(a, b, currentLine) {
        var pa, pb, newVertexName;
        if (currentLine.segments[0].point.vertexName === a.v1 || currentLine.segments[0].point.vertexName === a.v2) {
            pa = currentLine.segments[0].point;
            pb = currentLine.segments[1].point;
        } else {
            pa = currentLine.segments[1].point;
            pb = currentLine.segments[0].point;
        }
        newVertexName = obshaya_vertex(a, b);

        var intersects = sketch.getCirclesIntersections(pa.x, pa.y, a.l, pb.x, pb.y, b.l);
        if (!intersects) {
            console.error(a, b, currentLine);
            throw 'No intersections found';
        }

        var allLines = lines.concat(diags),
            tempChild;
        //for (var i = intersects.length; i--;) {
        for (var i = 0; i < intersects.length; i++) {
            ////console.log(isGoodTriag(allLines, intersects[i], currentLine, tempPath));
            if (isGoodTriag(allLines, intersects[i], currentLine, tempPath)) {
                tempChild = new Path({
                    segments: [pa, pb, intersects[i]],
                    closed: true
                });
                // if (tempPath.children.length > 0 && tempChild.contains(tempPath.children[0].position)) {
                // 	//console.log('tempChild.contains(tempPath.children[0]) ('+pa.vertexName+pb.vertexName+newVertexName+')');
                // 	continue;
                // }

                line = new Path.Line(pa, intersects[i]);
                line.segments[0].point.vertexName = pa.vertexName;
                line.segments[1].point.vertexName = newVertexName;
                line.data.fixed = true;
                if (a.type === 'line') {
                    line.strokeWidth = LINE_WIDTH;
                    lines.push(line);
                    line.data.id = lines.length - 1;
                    line.data.is_wall = true;
                    if (a.isCurve) {
                        line.data.curve = true;
                        line.strokeColor = 'Magenta';
                    } else {
                        line.strokeColor = 'green';
                    }
                } else {
                    line.strokeWidth = DIAG_WIDTH;
                    diags.push(line);
                    line.data.id = diags.length - 1;
                    line.strokeColor = 'green';
                }
                a.real_line = line;
                a.paint = true;

                line = new Path.Line(pb, intersects[i]);
                line.segments[0].point.vertexName = pb.vertexName;
                line.segments[1].point.vertexName = newVertexName;
                line.data.fixed = true;
                if (b.type === 'line') {
                    line.strokeWidth = LINE_WIDTH;
                    lines.push(line);
                    line.data.id = lines.length - 1;
                    line.data.is_wall = true;
                    if (b.isCurve) {
                        line.data.curve = true;
                        line.strokeColor = 'Magenta';
                    } else {
                        line.strokeColor = 'green';
                    }
                } else {
                    line.strokeWidth = DIAG_WIDTH;
                    diags.push(line);
                    line.data.id = diags.length - 1;
                    line.strokeColor = 'green';
                }
                b.real_line = line;
                b.paint = true;

                tempPath.addChild(tempChild);
                namedPoints.push({point: intersects[i], name: newVertexName});
                ////console.log(tempChild);
                break;
            }
        }
        if (!a.paint || !b.paint) {
            console.error(a, b, currentLine);
            throw 'Lines intersect with the drawing';
        }
    }

    function isGoodTriag(array, intersectPoint, currentLine, tempPath) {
        var cl_s0 = currentLine.segments[0].point,
            cl_s1 = currentLine.segments[1].point,
            tempLine1 = new Path.Line(cl_s0, intersectPoint),
            tempLine2 = new Path.Line(cl_s1, intersectPoint);
        for (var j = array.length, aj_s0, aj_s1; j--;) {
            aj_s0 = array[j].segments[0].point;
            aj_s1 = array[j].segments[1].point;
            if (sketch.isIntersect(aj_s0, aj_s1, cl_s0, intersectPoint) ||
                sketch.isIntersect(aj_s0, aj_s1, cl_s1, intersectPoint)) {
                return false;
            }
        }
        for (var j = tempPath.children.length; j--;) {
            if (tempPath.children[j].contains(tempLine1.position) ||
                tempPath.children[j].contains(tempLine2.position)) {
                return false;
            }
        }
        tempLine1.remove();
        tempLine2.remove();
        return true;
    }

    function obshaya_vertex(abstractLine1, abstractLine2, symbol = undefined) {
        if ((abstractLine1.v1 === abstractLine2.v1 || abstractLine1.v1 === abstractLine2.v2) &&
            abstractLine1.v1 !== symbol) {
            return abstractLine1.v1;
        }
        if ((abstractLine1.v2 === abstractLine2.v1 || abstractLine1.v2 === abstractLine2.v2) &&
            abstractLine1.v2 !== symbol) {
            return abstractLine1.v2;
        }
        return false;
    }


    g_layer.applyMatrix = false;
    jQuery('#myCanvas').css('resize', 'both');


    var close_sketch_click_bool = false;


    var close_sketch_click = function () {
        if (close_sketch_click_bool || !ready) {
            return;
        }

        close_sketch_click_bool = true;

        lines_length = sketch.getLengthOfLines(lines, diags, text_points);
        addLightsToLayer();
        canvas1 = document.getElementById("myCanvas");
        png__img = canvas1.toDataURL("image/png");
        // //console.log(png__img)
        if (texture == 25) {
            calc_img = sketch.generateSVG(1, text_points, lines, diag_sort, inner_cutouts, lightingArr);
        }

        sketch.toMirrorAll([lines, diags, inner_cutouts], lines_sort, diags, text_points, STANDART_SHRINK_PERCENT);

        var j_walls = [],
            j_diags = [],
            j_text_points = [],
            j_inner_cutouts = [],
            j_lightingArr = [];
        sketch.removeLinesText(lines);
        sketch.removeLinesText(diags);
        for (var key = lines_sort.length; key--;) {
            lines_sort[key].data.text = undefined;
            j_walls[key] = lines_sort[key].exportJSON({asString: false});
        }
        for (var key = diag_sort.length; key--;) {
            diag_sort[key].data.text = undefined;
            j_diags[key] = diag_sort[key].exportJSON({asString: false});
        }
        for (var key = text_points.length; key--;) {
            j_text_points[key] = text_points[key].exportJSON({asString: false});
        }
        for (var key = inner_cutouts.length; key--;) {
            j_inner_cutouts[key] = inner_cutouts[key].exportJSON({asString: false});
        }

        for (var key = lightingArr.length; key--;) {
            j_lightingArr[key] = lightingArr[key].exportJSON({asString: false});
        }

        drawing_data = {
            walls: j_walls,
            diags: j_diags,
            vertices: j_text_points,
            innerCutouts: j_inner_cutouts,
            lights: j_lightingArr
        };
        // //console.log(drawing_data);
        drawing_data = JSON.stringify(drawing_data);

        elem_input_n4.value = sketch.getArea(lines_sort, inner_cutouts);
        elem_input_n5.value = sketch.getPerimeter(lines);
        elem_input_n9.value = sketch.getAngles(lines, inner_cutouts);
        curvilinear_length = sketch.getCurvilinearLength(lines, inner_cutouts);
        inner_cutout_length = sketch.getInnerCutoutsLength(lines, inner_cutouts);

        if (texture == 25) {
            polotnoCloth();
        } else {
            polotno();
        }

        elem_preloader.style.display = 'none';
        //polotno_final(270, 22, 2, 0.917);
        //polotno_final(31, 20, 2, 0.91);
        ////console.log(sq_polotna, square_obrezkov, polotna);

        cuts_json = sketch.generateJSONCuts(polotna);
        ////console.log(cuts_json, p_usadki_final, sq_polotna, square_obrezkov);

        cut_img = sketch.generateSVG(2, text_points, lines, diag_sort, inner_cutouts);
        canvas1 = document.getElementById("myCanvas");
        png_img = canvas1.toDataURL("image/png");
////console.log(png_img)
        if (texture != 25) {

            seam_lines = sketch.drawSeams(polotna);
            sketch.rotateAll(angle_final);
            sketch.toMirrorAll([lines, diags, inner_cutouts, seam_lines], lines_sort, diags, text_points, 1);
            sketch.removeNonVerticesTextPoints(text_points);
            sketch.drawCutoutsText(inner_cutouts, 1, FONT_LINES, 0);
            addLightsToLayer();
            calc_img = sketch.generateSVG(1, text_points, lines, diag_sort, inner_cutouts, lightingArr);
        }

        if (koordinats_poloten.length > 1) {
            seam = 1;
        }

        perimeter_shrink = new Decimal(p_usadki_final).times(elem_input_n5.value - 0).toNumber();
        ////console.log(cuts_json, polotna[0].cuts, koordinats_poloten);
        ajax();
        // //console.log(p_usadki_final, square_obrezkov, sq_polotna, width_final);
        // //console.log(polotna, koordinats_poloten);
        close_sketch_click_bool = false;
    };

    function ajax() {
        btn_client = false;

        // Проверяем, что newClient инициализирован
        if (typeof newClient === 'undefined' || !Array.isArray(newClient)) {
            console.error('Ошибка: newClient не инициализирован или не является массивом');
            if (elem_preloader) {
                elem_preloader.style.display = 'none';
            }
            new Noty({
                theme: 'relax',
                timeout: 3000,
                layout: 'topCenter',
                type: "error",
                text: "Ошибка инициализации данных"
            }).show();
            return;
        }

        // ========== ОСНОВНЫЕ ПАРАМЕТРЫ КОМНАТЫ ==========
        var room_area = elem_input_n4.value - 0; // Площадь комнаты в квадратных метрах
        var perimeter = elem_input_n5.value - 0; // Периметр комнаты в метрах
        var angles_count = elem_input_n9.value - 0; // Количество углов в комнате

        // ========== ДАННЫЕ О МАТЕРИАЛЕ И ПОЛОТНАХ ==========
        var sq_polotna_val = sq_polotna || 0; // Площадь полотна в квадратных метрах
        var width_final_val = width_final || 0; // Финальная ширина материала в сантиметрах
        var square_obrezkov_val = square_obrezkov || 0; // Площадь обрезков в квадратных метрах
        var p_usadki_final_val = p_usadki_final || 1; // Процент усадки материала (коэффициент)
        var angle_final_val = angle_final || 0; // Финальный угол поворота в градусах

        // ========== ДЛИНЫ И РАЗМЕРЫ ==========
        var curvilinear_length_val = curvilinear_length || 0; // Длина криволинейных участков в метрах
        var inner_cutout_length_val = inner_cutout_length || 0; // Длина внутренних вырезов в метрах
        var perimeter_shrink_val = perimeter_shrink || 0; // Периметр с учетом усадки в метрах

        // ========== РАСЧЕТ ДЛИНЫ ШВОВ ==========
        var seamLength = 0; // Максимальная длина шва в метрах
        var seam_lines_count = seam_lines ? seam_lines.length : 0; // Количество швов
        var seam_lines_data = []; // Данные о всех швах

        if (seam_lines && seam_lines.length > 0) {
            seamLength = seam_lines[0].length;
            for (var i = seam_lines.length; i--;) {
                var currentLength = seam_lines[i].length || 0;
                if (currentLength > seamLength) {
                    seamLength = currentLength;
                }
                // Собираем данные о каждом шве
                if (seam_lines[i] && typeof seam_lines[i].exportJSON === 'function') {
                    try {
                        seam_lines_data.push({
                            index: i,
                            length: currentLength,
                            data: seam_lines[i].data || {}
                        });
                    } catch(e) {
                        seam_lines_data.push({
                            index: i,
                            length: currentLength,
                            data: null,
                            error: 'Не удалось экспортировать данные шва'
                        });
                    }
                }
            }
        }

        // Длина шва с учетом усадки
        var seamLengthShrunk = seamLength * p_usadki_final_val;
        if (seamLengthShrunk < 7) {
            seamLengthShrunk = 0;
        }

        // Корректировка площади комнаты для текстуры 25
        if (texture == 25) {
            room_area = sq_polotna_val;
        }

        // ========== ДАННЫЕ О ЛИНИЯХ И ГЕОМЕТРИИ ==========
        var lines_count = lines ? Object.keys(lines).length : 0; // Общее количество линий (стен)
        var lines_sort_count = lines_sort ? lines_sort.length : 0; // Количество отсортированных линий
        var diags_count = diags ? diags.length : 0; // Количество диагоналей
        var diag_sort_count = diag_sort ? diag_sort.length : 0; // Количество отсортированных диагоналей
        var text_points_count = text_points ? text_points.length : 0; // Количество текстовых точек (вершин)
        var inner_cutouts_count = inner_cutouts ? inner_cutouts.length : 0; // Количество внутренних вырезов
        var lines_length_data = lines_length || []; // Длины линий
        var lines_length_total = 0; // Общая длина всех линий

        if (Array.isArray(lines_length_data)) {
            for (var j = 0; j < lines_length_data.length; j++) {
                if (typeof lines_length_data[j] === 'number') {
                    lines_length_total += lines_length_data[j];
                }
            }
        }

        // ========== ДАННЫЕ О ПОЛОТНАХ ==========
        var polotna_count = polotna ? polotna.length : 0; // Количество полотен
        var polotna_data = []; // Оптимизированные данные о полотнах
        var koordinats_poloten_data = koordinats_poloten || []; // Координаты полотен
        var points_poloten_count = points_poloten ? points_poloten.length : 0; // Количество точек полотен

        // Собираем оптимизированные данные о полотнах
        if (polotna && Array.isArray(polotna)) {
            for (var k = 0; k < polotna.length; k++) {
                var polotno = polotna[k];
                if (polotno) {
                    polotna_data.push({
                        index: k,
                        cuts: polotno.cuts ? polotno.cuts.length : 0, // Количество разрезов
                        hasCuts: !!polotno.cuts,
                        // Добавляем только необходимые свойства для избежания циклических ссылок
                        id: polotno.data ? polotno.data.id : null,
                        length: polotno.length || 0,
                        area: polotno.area || 0
                    });
                }
            }
        }

        // ========== ДАННЫЕ ОБ ОСВЕЩЕНИИ ==========
        var lightingArr_count = lightingArr ? lightingArr.length : 0; // Количество элементов освещения
        var chandelier_count = chandelier ? chandelier.length : 0; // Количество люстр

        // ========== ТОВАРЫ И РАБОТЫ ==========
        var goods = [{id: final_canvas_id, count: sq_polotna_val}]; // Товары: Кусок полотна
        var jobs = [
            {id: 60, count: room_area}, // Работа 60: Стоимость работы по кв. м.
            {id: 65, count: perimeter_shrink_val} // Работа 65: Гарпун (периметр с усадкой)
        ];

        // Дополнительные работы для углов
        if (texture != 25) {
            if (angles_count > 4) {
                jobs.push({id: 59, count: angles_count - 4}); // Работа 59: Обработка доп. углов (>4) (себестоимость)
                if (angles_count > 6) {
                    jobs.push({id: 55, count: angles_count - 6}); // Работа 55: Обработка доп. углов (>6)
                }
            }
        }

        // Дополнительные работы для криволинейных участков
        if (curvilinear_length_val > 0) {
            jobs.push({id: 61, count: curvilinear_length_val}); // Работа 61: Криволинейный участок (себестоимость)
            jobs.push({id: 62, count: curvilinear_length_val}); // Работа 62: Криволинейный участок
        }

        // Дополнительные работы для внутренних вырезов
        if (inner_cutout_length_val > 0) {
            jobs.push({id: 63, count: inner_cutout_length_val}); // Работа 63: Внутренний вырез в цеху
            jobs.push({id: 64, count: inner_cutout_length_val}); // Работа 64: Внутренний вырез в цеху (себестоимость)
        }

        // ========== ДАННЫЕ О МАТЕРИАЛЕ ==========
        if (!calc_id) {
            calc_id = selectedCalculation ? selectedCalculation.id : null;
        }
        var temp_ = texturesmanafacture ? texturesmanafacture.find(item =>
            item.manufacturer_id == manufacturer &&
            item.texture_id == texture &&
            item.color == color &&
            item.width == width_final_val
        ) : null;

        // Оптимизированные данные о материале
        var material_data = temp_ ? {
            color_id: temp_.color || null,
            color: temp_.color || null,
            width: temp_.width || null,
            texture: temp_.texture || null,
            texture_id: temp_.texture_id || null,
            manufacturer: temp_.manufacturer || null,
            manufacturer_id: temp_.manufacturer_id || null,
            material_name: temp_.name || null,
            hex: temp_.hex || null,
            price: temp_.price || null,
            price_montage: temp_.price_montage || null
        } : null;

        // ========== ДАННЫЕ О ЧЕРТЕЖЕ (GEOMETRY) ==========
        var drawing_data_parsed = null; // Распарсенные данные чертежа
        var drawing_data_string = drawing_data || null; // JSON строка данных чертежа

        // Пытаемся распарсить drawing_data если это строка
        if (drawing_data_string && typeof drawing_data_string === 'string') {
            try {
                drawing_data_parsed = JSON.parse(drawing_data_string);
            } catch(e) {
                console.warn('Не удалось распарсить drawing_data:', e);
            }
        } else if (drawing_data_string && typeof drawing_data_string === 'object') {
            drawing_data_parsed = drawing_data_string;
        }

        // Оптимизированные данные геометрии
        var geometry_data = {
            walls_count: 0, // Количество стен
            diags_count: 0, // Количество диагоналей
            vertices_count: 0, // Количество вершин
            innerCutouts_count: 0, // Количество внутренних вырезов
            lights_count: 0 // Количество элементов освещения
        };

        if (drawing_data_parsed) {
            geometry_data.walls_count = drawing_data_parsed.walls ? drawing_data_parsed.walls.length : 0;
            geometry_data.diags_count = drawing_data_parsed.diags ? drawing_data_parsed.diags.length : 0;
            geometry_data.vertices_count = drawing_data_parsed.vertices ? drawing_data_parsed.vertices.length : 0;
            geometry_data.innerCutouts_count = drawing_data_parsed.innerCutouts ? drawing_data_parsed.innerCutouts.length : 0;
            geometry_data.lights_count = drawing_data_parsed.lights ? drawing_data_parsed.lights.length : 0;
        }

        // ========== ДАННЫЕ О РАЗРЕЗАХ ==========
        var cuts_json_data = cuts_json || null; // JSON данные о разрезах
        var cuts_count = 0; // Общее количество разрезов

        if (cuts_json_data) {
            if (typeof cuts_json_data === 'string') {
                try {
                    var cuts_parsed = JSON.parse(cuts_json_data);
                    cuts_count = Array.isArray(cuts_parsed) ? cuts_parsed.length : 0;
                } catch(e) {
                    console.warn('Не удалось распарсить cuts_json:', e);
                }
            } else if (Array.isArray(cuts_json_data)) {
                cuts_count = cuts_json_data.length;
            }
        }

        // ========== ДАННЫЕ ОБ ИЗОБРАЖЕНИЯХ ==========
        var has_cut_img = !!cut_img; // Наличие изображения для резки
        var has_calc_img = !!calc_img; // Наличие расчетного изображения
        var has_png_img = !!png_img; // Наличие PNG изображения
        var has_png__img = !!png__img; // Наличие альтернативного PNG изображения

        // ========== ДОПОЛНИТЕЛЬНЫЕ ПАРАМЕТРЫ ==========
        var seam_flag = seam || 0; // Флаг наличия шва (0 или 1)
        var texture_value = texture || null; // ID текстуры
        var color_value = color || null; // ID цвета
        var manufacturer_value = manufacturer || null; // ID производителя
        var final_canvas_id_val = final_canvas_id || null; // ID финального полотна
        var calc_id_val = calc_id || null; // ID расчета

        // ========== СОЗДАНИЕ ОПТИМИЗИРОВАННОГО ОБЪЕКТА ДАННЫХ ==========
        var optimized_drawing_data = {
            // Основные параметры комнаты
            room_parameters: {
                room_area: room_area, // Площадь комнаты в квадратных метрах
                perimeter: perimeter, // Периметр комнаты в метрах
                perimeter_shrink: perimeter_shrink_val, // Периметр с учетом усадки в метрах
                angles_count: angles_count, // Количество углов в комнате
                description: 'Основные геометрические параметры комнаты'
            },

            // Данные о материале и полотнах
            material_and_canvas: {
                sq_polotna: sq_polotna_val, // Площадь полотна в квадратных метрах
                width_final: width_final_val, // Финальная ширина материала в сантиметрах
                square_obrezkov: square_obrezkov_val, // Площадь обрезков в квадратных метрах
                p_usadki_final: p_usadki_final_val, // Процент усадки материала (коэффициент)
                angle_final: angle_final_val, // Финальный угол поворота в градусах
                material_data: material_data, // Полные данные о материале
                texture: texture_value, // ID текстуры
                color: color_value, // ID цвета
                manufacturer: manufacturer_value, // ID производителя
                final_canvas_id: final_canvas_id_val, // ID финального полотна
                description: 'Данные о используемом материале и полотнах'
            },

            // Длины и размеры
            lengths_and_sizes: {
                curvilinear_length: curvilinear_length_val, // Длина криволинейных участков в метрах
                inner_cutout_length: inner_cutout_length_val, // Длина внутренних вырезов в метрах
                lines_length_total: lines_length_total, // Общая длина всех линий в метрах
                lines_length_array: lines_length_data, // Массив длин всех линий
                description: 'Все длины и размеры элементов чертежа'
            },

            // Данные о швах
            seams_data: {
                seam_count: seam_lines_count, // Количество швов
                max_seam_length: seamLength, // Максимальная длина шва в метрах
                max_seam_length_shrunk: seamLengthShrunk, // Максимальная длина шва с учетом усадки в метрах
                seam_flag: seam_flag, // Флаг наличия шва (0 или 1)
                seams_details: seam_lines_data, // Детальные данные о каждом шве
                description: 'Данные о швах между полотнами'
            },

            // Геометрия чертежа
            geometry: {
                lines_count: lines_count, // Общее количество линий (стен)
                lines_sort_count: lines_sort_count, // Количество отсортированных линий
                diags_count: diags_count, // Количество диагоналей
                diag_sort_count: diag_sort_count, // Количество отсортированных диагоналей
                text_points_count: text_points_count, // Количество текстовых точек (вершин)
                inner_cutouts_count: inner_cutouts_count, // Количество внутренних вырезов
                geometry_from_drawing_data: geometry_data, // Данные из drawing_data
                description: 'Геометрические элементы чертежа'
            },

            // Данные о полотнах
            canvas_data: {
                polotna_count: polotna_count, // Количество полотен
                polotna_details: polotna_data, // Детальные данные о каждом полотне
                koordinats_poloten: koordinats_poloten_data, // Координаты полотен
                points_poloten_count: points_poloten_count, // Количество точек полотен
                cuts_count: cuts_count, // Общее количество разрезов
                description: 'Детальные данные о полотнах и их координатах'
            },

            // Освещение
            lighting: {
                lighting_count: lightingArr_count, // Количество элементов освещения
                chandelier_count: chandelier_count, // Количество люстр
                description: 'Данные об элементах освещения в чертеже'
            },

            // Товары и работы
            goods_and_jobs: {
                goods: goods, // Массив товаров с ID и количеством
                jobs: jobs, // Массив работ с ID и количеством
                goods_count: goods.length, // Количество типов товаров
                jobs_count: jobs.length, // Количество типов работ
                description: 'Список товаров и работ для расчета стоимости'
            },

            // Изображения
            images: {
                has_cut_img: has_cut_img, // Наличие изображения для резки
                has_calc_img: has_calc_img, // Наличие расчетного изображения
                has_png_img: has_png_img, // Наличие PNG изображения
                has_png__img: has_png__img, // Наличие альтернативного PNG изображения
                description: 'Флаги наличия различных изображений чертежа'
            },

            // Дополнительные данные
            additional_data: {
                calc_id: calc_id_val, // ID расчета
                drawing_data_available: !!drawing_data_parsed, // Доступность данных чертежа
                cuts_json_available: !!cuts_json_data, // Доступность данных о разрезах
                timestamp: new Date().toISOString(), // Временная метка сбора данных
                description: 'Дополнительные служебные данные'
            }
        };

        // ========== ВЫВОД В КОНСОЛЬ С ПОДРОБНЫМИ ПОЯСНЕНИЯМИ ==========
        console.log('%c═══════════════════════════════════════════════════════════════', 'background: #4CAF50; color: white; font-weight: bold; padding: 2px 5px;');
        console.log('%c📊 ОПТИМИЗИРОВАННЫЕ ДАННЫЕ ЧЕРТЕЖА', 'background: #2196F3; color: white; font-weight: bold; padding: 5px 10px; font-size: 14px;');
        console.log('%c═══════════════════════════════════════════════════════════════', 'background: #4CAF50; color: white; font-weight: bold; padding: 2px 5px;');

        // 1. Основные параметры комнаты
        console.group('%c1️⃣ ОСНОВНЫЕ ПАРАМЕТРЫ КОМНАТЫ', 'color: #2196F3; font-weight: bold;');
        console.log('%c📐 Площадь комнаты:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.room_parameters.room_area, 'м²');
        console.log('%c📏 Периметр комнаты:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.room_parameters.perimeter, 'м');
        console.log('%c📏 Периметр с учетом усадки:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.room_parameters.perimeter_shrink, 'м');
        console.log('%c🔷 Количество углов:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.room_parameters.angles_count);
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.room_parameters.description);
        console.groupEnd();

        // 2. Данные о материале и полотнах
        console.group('%c2️⃣ ДАННЫЕ О МАТЕРИАЛЕ И ПОЛОТНАХ', 'color: #2196F3; font-weight: bold;');
        console.log('%c📦 Площадь полотна:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.sq_polotna, 'м²');
        console.log('%c📐 Финальная ширина материала:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.width_final, 'см');
        console.log('%c✂️ Площадь обрезков:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.square_obrezkov, 'м²');
        console.log('%c📉 Процент усадки материала:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.p_usadki_final);
        console.log('%c🔄 Финальный угол поворота:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.angle_final, '°');
        console.log('%c🎨 ID текстуры:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.texture);
        console.log('%c🎨 ID цвета:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.color);
        console.log('%c🏭 ID производителя:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.manufacturer);
        console.log('%c🆔 ID финального полотна:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.material_and_canvas.final_canvas_id);
        if (optimized_drawing_data.material_and_canvas.material_data) {
            console.group('%c📋 Полные данные о материале:', 'color: #4CAF50; font-weight: bold;');
            console.log('Название материала:', optimized_drawing_data.material_and_canvas.material_data.material_name);
            console.log('Производитель:', optimized_drawing_data.material_and_canvas.material_data.manufacturer);
            console.log('Текстура:', optimized_drawing_data.material_and_canvas.material_data.texture);
            console.log('Цвет:', optimized_drawing_data.material_and_canvas.material_data.color);
            console.log('HEX цвет:', optimized_drawing_data.material_and_canvas.material_data.hex);
            console.log('Цена:', optimized_drawing_data.material_and_canvas.material_data.price);
            console.log('Цена монтажа:', optimized_drawing_data.material_and_canvas.material_data.price_montage);
            console.log('Ширина:', optimized_drawing_data.material_and_canvas.material_data.width);
            console.groupEnd();
        }
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.material_and_canvas.description);
        console.groupEnd();

        // 3. Длины и размеры
        console.group('%c3️⃣ ДЛИНЫ И РАЗМЕРЫ', 'color: #2196F3; font-weight: bold;');
        console.log('%c📐 Длина криволинейных участков:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.lengths_and_sizes.curvilinear_length, 'м');
        console.log('%c✂️ Длина внутренних вырезов:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.lengths_and_sizes.inner_cutout_length, 'м');
        console.log('%c📏 Общая длина всех линий:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.lengths_and_sizes.lines_length_total, 'м');
        console.log('%c📊 Массив длин линий:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.lengths_and_sizes.lines_length_array);
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.lengths_and_sizes.description);
        console.groupEnd();

        // 4. Данные о швах
        console.group('%c4️⃣ ДАННЫЕ О ШВАХ', 'color: #2196F3; font-weight: bold;');
        console.log('%c🔗 Количество швов:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.seams_data.seam_count);
        console.log('%c📏 Максимальная длина шва:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.seams_data.max_seam_length, 'м');
        console.log('%c📏 Максимальная длина шва с учетом усадки:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.seams_data.max_seam_length_shrunk, 'м');
        console.log('%c🚩 Флаг наличия шва:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.seams_data.seam_flag, optimized_drawing_data.seams_data.seam_flag ? '(есть швы)' : '(нет швов)');
        if (optimized_drawing_data.seams_data.seams_details.length > 0) {
            console.log('%c📋 Детальные данные о швах:', 'color: #4CAF50; font-weight: bold;', optimized_drawing_data.seams_data.seams_details);
        }
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.seams_data.description);
        console.groupEnd();

        // 5. Геометрия чертежа
        console.group('%c5️⃣ ГЕОМЕТРИЯ ЧЕРТЕЖА', 'color: #2196F3; font-weight: bold;');
        console.log('%c📐 Общее количество линий (стен):', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.geometry.lines_count);
        console.log('%c📐 Количество отсортированных линий:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.geometry.lines_sort_count);
        console.log('%c📊 Количество диагоналей:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.geometry.diags_count);
        console.log('%c📊 Количество отсортированных диагоналей:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.geometry.diag_sort_count);
        console.log('%c📍 Количество текстовых точек (вершин):', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.geometry.text_points_count);
        console.log('%c✂️ Количество внутренних вырезов:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.geometry.inner_cutouts_count);
        console.group('%c📋 Данные из drawing_data:', 'color: #4CAF50; font-weight: bold;');
        console.log('Стен из drawing_data:', optimized_drawing_data.geometry.geometry_from_drawing_data.walls_count);
        console.log('Диагоналей из drawing_data:', optimized_drawing_data.geometry.geometry_from_drawing_data.diags_count);
        console.log('Вершин из drawing_data:', optimized_drawing_data.geometry.geometry_from_drawing_data.vertices_count);
        console.log('Внутренних вырезов из drawing_data:', optimized_drawing_data.geometry.geometry_from_drawing_data.innerCutouts_count);
        console.log('Элементов освещения из drawing_data:', optimized_drawing_data.geometry.geometry_from_drawing_data.lights_count);
        console.groupEnd();
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.geometry.description);
        console.groupEnd();

        // 6. Данные о полотнах
        console.group('%c6️⃣ ДАННЫЕ О ПОЛОТНАХ', 'color: #2196F3; font-weight: bold;');
        console.log('%c📦 Количество полотен:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.canvas_data.polotna_count);
        console.log('%c📍 Количество точек полотен:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.canvas_data.points_poloten_count);
        console.log('%c✂️ Общее количество разрезов:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.canvas_data.cuts_count);
        console.log('%c📍 Координаты полотен:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.canvas_data.koordinats_poloten);
        if (optimized_drawing_data.canvas_data.polotna_details.length > 0) {
            console.group('%c📋 Детальные данные о полотнах:', 'color: #4CAF50; font-weight: bold;');
            optimized_drawing_data.canvas_data.polotna_details.forEach(function(polotno, index) {
                console.log('Полотно #' + (index + 1) + ':', {
                    'Количество разрезов': polotno.cuts,
                    'Есть разрезы': polotno.hasCuts,
                    'ID': polotno.id,
                    'Длина': polotno.length,
                    'Площадь': polotno.area
                });
            });
            console.groupEnd();
        }
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.canvas_data.description);
        console.groupEnd();

        // 7. Освещение
        console.group('%c7️⃣ ОСВЕЩЕНИЕ', 'color: #2196F3; font-weight: bold;');
        console.log('%c💡 Количество элементов освещения:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.lighting.lighting_count);
        console.log('%c🕯️ Количество люстр:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.lighting.chandelier_count);
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.lighting.description);
        console.groupEnd();

        // 8. Товары и работы
        console.group('%c8️⃣ ТОВАРЫ И РАБОТЫ', 'color: #2196F3; font-weight: bold;');
        console.log('%c📦 Количество типов товаров:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.goods_and_jobs.goods_count);
        console.log('%c📋 Товары:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.goods_and_jobs.goods);
        console.log('%c🔧 Количество типов работ:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.goods_and_jobs.jobs_count);
        console.log('%c📋 Работы:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.goods_and_jobs.jobs);
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.goods_and_jobs.description);
        console.groupEnd();

        // 9. Изображения
        console.group('%c9️⃣ ИЗОБРАЖЕНИЯ', 'color: #2196F3; font-weight: bold;');
        console.log('%c🖼️ Наличие изображения для резки:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.images.has_cut_img ? '✅ Да' : '❌ Нет');
        console.log('%c🖼️ Наличие расчетного изображения:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.images.has_calc_img ? '✅ Да' : '❌ Нет');
        console.log('%c🖼️ Наличие PNG изображения:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.images.has_png_img ? '✅ Да' : '❌ Нет');
        console.log('%c🖼️ Наличие альтернативного PNG изображения:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.images.has_png__img ? '✅ Да' : '❌ Нет');
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.images.description);
        console.groupEnd();

        // 10. Дополнительные данные
        console.group('%c🔟 ДОПОЛНИТЕЛЬНЫЕ ДАННЫЕ', 'color: #2196F3; font-weight: bold;');
        console.log('%c🆔 ID расчета:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.additional_data.calc_id);
        console.log('%c📊 Доступность данных чертежа:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.additional_data.drawing_data_available ? '✅ Да' : '❌ Нет');
        console.log('%c✂️ Доступность данных о разрезах:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.additional_data.cuts_json_available ? '✅ Да' : '❌ Нет');
        console.log('%c🕐 Временная метка сбора данных:', 'color: #FF9800; font-weight: bold;', optimized_drawing_data.additional_data.timestamp);
        console.log('%c📝 Описание:', 'color: #9E9E9E; font-style: italic;', optimized_drawing_data.additional_data.description);
        console.groupEnd();

        // Итоговый объект со всеми данными
        console.log('%c═══════════════════════════════════════════════════════════════', 'background: #4CAF50; color: white; font-weight: bold; padding: 2px 5px;');
        console.log('%c📦 ПОЛНЫЙ ОБЪЕКТ ОПТИМИЗИРОВАННЫХ ДАННЫХ', 'background: #2196F3; color: white; font-weight: bold; padding: 5px 10px; font-size: 14px;');
        console.log('%c═══════════════════════════════════════════════════════════════', 'background: #4CAF50; color: white; font-weight: bold; padding: 2px 5px;');
        console.log('optimized_drawing_data:', optimized_drawing_data);
        console.log('%c═══════════════════════════════════════════════════════════════', 'background: #4CAF50; color: white; font-weight: bold; padding: 2px 5px;');

        // Проверяем, что temp_ существует
        if (!temp_) {
            console.error('Ошибка: temp_ не найден. Не удалось найти материал с указанными параметрами.');
            if (elem_preloader) {
                elem_preloader.style.display = 'none';
            }
            new Noty({
                theme: 'relax',
                timeout: 3000,
                layout: 'topCenter',
                type: "error",
                text: "Ошибка: материал с указанными параметрами не найден"
            }).show();
            return;
        }

        if (updateCeiling == true){
            $idElem = newClient.findIndex(el => el.id === ceilingId);

            // Проверяем, что элемент найден
            if ($idElem === -1 || !newClient[$idElem]) {
                console.error('Ошибка: элемент с id ' + ceilingId + ' не найден в newClient');
                if (elem_preloader) {
                    elem_preloader.style.display = 'none';
                }
                new Noty({
                    theme: 'relax',
                    timeout: 3000,
                    layout: 'topCenter',
                    type: "error",
                    text: "Ошибка: элемент не найден в данных"
                }).show();
                return;
            }

            newClient[$idElem].color_id = temp_.color;
            newClient[$idElem].width = temp_.width;
            newClient[$idElem].color = temp_.color;
            newClient[$idElem].texture = temp_.texture
            newClient[$idElem].manufacturer = temp_.manufacturer
            newClient[$idElem].material = temp_.name
            newClient[$idElem].hex = temp_.hex
            newClient[$idElem].texture_id = temp_.texture_id
            newClient[$idElem].manufacturer_id = temp_.manufacturer_id
            newClient[$idElem].width_final = width_final_val
            newClient[$idElem].updateCeiling = true
            newClient[$idElem].price = temp_.price
            updateCeiling = false

            // Сохранение оптимизированных данных для дальнейшего использования
            newClient[$idElem].optimized_drawing_data = optimized_drawing_data;

            // Проверяем, что smeta существует перед фильтрацией
            if (newClient[$idElem].smeta && Array.isArray(newClient[$idElem].smeta)) {
                newClient[$idElem].smeta = newClient[$idElem].smeta.filter(function( obj ) {
                    return obj.id != 22;
                });
            }
        }else{
            $idElem = newClient.length - 1;

            // Проверяем, что элемент существует, если нет - создаем его
            if ($idElem < 0 || !newClient[$idElem]) {
                // Создаем новый объект, если его нет
                newClient.push({});
                $idElem = newClient.length - 1;
            }

            newClient[$idElem].color_id = temp_.color;
            newClient[$idElem].price_montage = temp_.price_montage;
            newClient[$idElem].width = temp_.width;
            newClient[$idElem].color = temp_.color;
            newClient[$idElem].texture = temp_.texture
            newClient[$idElem].manufacturer = temp_.manufacturer
            newClient[$idElem].price = temp_.price
            newClient[$idElem].material = temp_.name
            newClient[$idElem].hex = temp_.hex
            newClient[$idElem].lines_length = lines_length
            newClient[$idElem].koordinats_poloten = koordinats_poloten_data
            newClient[$idElem].room_area = room_area
            newClient[$idElem].perimeter = perimeter
            newClient[$idElem].angles_count = angles_count
            newClient[$idElem].perimeter_shrink = perimeter_shrink_val
            newClient[$idElem].curvilinear_length = curvilinear_length_val
            newClient[$idElem].inner_cutout_length = inner_cutout_length_val
            newClient[$idElem].texture_id = temp_.texture_id
            newClient[$idElem].manufacturer_id = temp_.manufacturer_id
            newClient[$idElem].width_final = width_final_val
            newClient[$idElem].square_obrezkov = square_obrezkov_val
            newClient[$idElem].drawing_data = drawing_data

            // Сохранение оптимизированных данных для дальнейшего использования
            newClient[$idElem].optimized_drawing_data = optimized_drawing_data;
            newClient[$idElem].smeta = [];
            newClient[$idElem].editprice = [];
            newClient[$idElem].days = days;
            newClient[$idElem].id = (maxId(newClient,'id')-0)+1;
            navShow('main-4')
        }





        // Проверяем, что элемент существует перед вызовом exitInSmeta
        if (newClient[$idElem] && newClient[$idElem].id) {
            exitInSmeta(newClient[$idElem].id);
        }
        saveStorage()

        // Скрываем прелоадер после завершения всех операций
        if (elem_preloader) {
            elem_preloader.style.display = 'none';
        }

    }

    function dvig_lines(napr) {
        const dist = 1;
        var approximatelyEqual = sketch.approximatelyEqual;
        switch (napr) {
            case 1:
                for (var i = g_layer.children.length; i--;) {
                    g_layer.children[i].position.y -= dist;
                }
                start_draw_point.y -= dist;
                if (drawing_lines.length === 2) {
                    if (approximatelyEqual(drawing_lines[0].segments[0].point.y, drawing_lines[0].segments[1].point.y, 1)) {
                        drawing_lines[1].segments[1].point.y += dist;
                    } else {
                        drawing_lines[1].position.y += dist;
                        drawing_lines[0].segments[1].point.y += dist;
                    }
                } else if (drawing_lines.length === 1) {
                    drawing_lines[0].segments[1].point.y += dist;
                }
                break;
            case 2:
                for (var i = g_layer.children.length; i--;) {
                    g_layer.children[i].position.y += dist;
                }
                start_draw_point.y += dist;
                if (drawing_lines.length === 2) {
                    if (approximatelyEqual(drawing_lines[0].segments[0].point.y, drawing_lines[0].segments[1].point.y, 1)) {
                        drawing_lines[1].segments[1].point.y -= dist;
                    } else {
                        drawing_lines[1].position.y -= dist;
                        drawing_lines[0].segments[1].point.y -= dist;
                    }
                } else if (drawing_lines.length === 1) {
                    drawing_lines[0].segments[1].point.y -= dist;
                }
                break;
            case 3:
                for (var i = g_layer.children.length; i--;) {
                    g_layer.children[i].position.x -= dist;
                }
                start_draw_point.x -= dist;
                if (drawing_lines.length === 2) {
                    if (approximatelyEqual(drawing_lines[0].segments[0].point.x, drawing_lines[0].segments[1].point.x, 1)) {
                        drawing_lines[1].segments[1].point.x += dist;
                    } else {
                        drawing_lines[1].position.x += dist;
                        drawing_lines[0].segments[1].point.x += dist;
                    }
                } else if (drawing_lines.length === 1) {
                    drawing_lines[0].segments[1].point.x += dist;
                }
                break;
            case 4:
                for (var i = g_layer.children.length; i--;) {
                    g_layer.children[i].position.x += dist;
                }
                start_draw_point.x += dist;
                if (drawing_lines.length === 2) {
                    if (approximatelyEqual(drawing_lines[0].segments[0].point.x, drawing_lines[0].segments[1].point.x, 1)) {
                        drawing_lines[1].segments[1].point.x -= dist;
                    } else {
                        drawing_lines[1].position.x -= dist;
                        drawing_lines[0].segments[1].point.x -= dist;
                    }
                } else if (drawing_lines.length === 1) {
                    drawing_lines[0].segments[1].point.x -= dist;
                }
                break;
        }
    }

    function drawingCurve(event_point) {
        if (move_curve_point === undefined) {
            drawing_curve_path = new Path({
                strokeColor: 'blue',
                strokeWidth: LINE_WIDTH,
            });
            drawing_curve_path.add(start_draw_point);
        }

        var bool_end = false, cir = getCircleUnderPoint(event_point);

        if (cir !== null && cir !== moving_circle) {
            move_curve_point = cir.position.clone();
            bool_end = true;
        } else {
            move_curve_point = event_point;
        }
        drawing_curve_path.add(move_curve_point);
        if (bool_end) {
            mouseUp(new MouseEvent('mouseup', undefined, move_curve_point));
        }
    }

    function endDrawingCurve() {
        if (drawing_curve_path.length < 20) {
            drawing_curve_path.remove();
            clearDraw();
            return;
        }

        var noty = new Noty({
            theme: 'relax',
            type: 'alert',
            layout: 'topCenter',
            text: 'Введите кол-во отрезков<br><input type="text" id="count_segments_curve">',
            modal: true,
            closeWith: [],
            callbacks: {
                onTemplate: function () {
                    /*this.barDom.getElementsByClassName('noty_body')[0].innerHTML += '<br><input type="text" id="count_segments_curve">';*/
                    this.barDom.getElementsByClassName('noty_body')[0].style.textAlign = 'center';
                    this.barDom.getElementsByClassName('noty_buttons')[0].style.textAlign = 'center';
                },
                onShow: function () {
                    bool_noty_curve = true;
                    document.getElementById('count_segments_curve').focus();
                    document.getElementById('count_segments_curve').onkeyup = function replaceBadChars(e) {
                        this.value = this.value.replace(/[^\d]/ig, '');
                        if (e.keyCode === 13) {
                            document.getElementById('btn_curve_ok').click();
                        }
                    };
                },
                onClose: function () {
                    bool_noty_curve = false;
                }
            },
            buttons: [
                Noty.button('Ок', 'btn btn-gm', function () {
                    var regexp = /[^\d]/ig, val = document.getElementById('count_segments_curve').value;
                    if (regexp.test(val)) {
                        new Noty({
                            theme: 'relax',
                            timeout: 2000,
                            layout: 'topCenter',
                            type: 'warning',
                            text: 'Недопустимые символы!'
                        }).show();
                        return;
                    }
                    if ((val - 0) < 2) {
                        new Noty({
                            theme: 'relax',
                            timeout: 2000,
                            layout: 'topCenter',
                            type: 'warning',
                            text: 'Мало отрезков! (MIN = 2)'
                        }).show();
                        return;
                    }
                    if ((drawing_curve_path.length / (val - 0)) < 6) {
                        new Noty({
                            theme: 'relax',
                            timeout: 2000,
                            layout: 'topCenter',
                            type: 'warning',
                            text: 'Много отрезков для данного участка!'
                        }).show();
                        return;
                    }
                    bool_noty_curve = false;
                    count_segments_curve_value = val - 0;
                    continueEndDrawingCurve();
                    noty.close();
                }, {id: 'btn_curve_ok', style: 'margin: 2px 2px;'}),
                Noty.button('Отмена', 'btn btn-gm', function () {
                    drawing_curve_path.remove();
                    clearDraw();
                    noty.close();
                }, {id: 'btn_curve_cancel', style: 'margin: 2px 2px;'})
            ]
        }).show();
    }

    function continueEndDrawingCurve() {
        var length_segment = drawing_curve_path.length / count_segments_curve_value,
            current_point = drawing_curve_path.getPointAt(0);

        for (var i = 1, p, dl_l; i <= count_segments_curve_value; i++) {
            p = drawing_curve_path.getPointAt(length_segment * i);
            if (p === null) {
                p = drawing_curve_path.getPointAt(drawing_curve_path.length);
            }

            drawing_lines.push(drawLine(current_point, p, 'blue', 2));
            dl_l = drawing_lines[drawing_lines.length - 1];
            dl_l.data.curve = true;
            if (dl_l.length < 6) {
                var dec_length = new Decimal(6), Dx, Dy, coef = new Decimal(sketch.getAngleCoef(dl_l));
                Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
                Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();
                if (dl_l.segments[0].point.x > dl_l.segments[1].point.x) {
                    Dx = new Decimal(-1).times(Dx).toNumber();
                }
                if (dl_l.segments[0].point.y > dl_l.segments[1].point.y) {
                    Dy = new Decimal(-1).times(Dy).toNumber();
                }
                p = new Point(new Decimal(dl_l.segments[1].point.x).plus(Dx).toNumber(), new Decimal(dl_l.segments[1].point.y).plus(Dy).toNumber());
                dl_l.removeSegments();
                dl_l.addSegments([current_point, p]);
            }
            current_point = p;
        }
        drawing_curve_path.remove();
        document.getElementById('curve').checked = false;
        document.getElementById('curve2').checked = false;

        mouseUp(new MouseEvent('mouseup', undefined, move_curve_point));
    }

    function drawingArc(event_point) {
        var bool_end = false, cir = getCircleUnderPoint(event_point), temp_line;

        if (arc !== undefined) {
            arc.remove();
            arc = undefined;
        }
        if (cir !== null && cir !== moving_circle) {
            event_point = cir.position.clone();
        } else if (sketch.getLengthBetweenPoints(start_draw_point, event_point) < 20) {
            last_point_in_circle = event_point;
            return;
        }
        temp_line = new Path.Line(last_point_in_circle, event_point);
        if (temp_line.contains(start_draw_point)) {
            temp_line.remove();
            return;
        }
        temp_line.remove();
        temp_line = new Path.Line(start_draw_point, event_point);
        if (temp_line.contains(last_point_in_circle)) {
            temp_line.remove();
            return;
        }
        temp_line.remove();
        try {
            arc = new Path.Arc(start_draw_point, last_point_in_circle, event_point)
            arc.strokeColor = 'blue';
            arc.strokeWidth = LINE_WIDTH;
        } catch (e) {
            return;
        }
    }

    function endDrawingArc() {
        line_arc_bottom = new Path.Line(arc.firstSegment.point, arc.lastSegment.point);
        line_arc_bottom.strokeWidth = DIAG_WIDTH;
        if (getCircleUnderPoint(arc.firstSegment.point) && getCircleUnderPoint(arc.lastSegment.point)) {
            line_arc_bottom.data.last_line = true;
        }

        elem_window.style.display = 'block';
        resize_canvas();
        elem_newLength.focus();
        elem_newLength.value = line_arc_bottom.length.toFixed(1);
        elem_newLength.select();
        first_click = false;
        if (line_arc_bottom.data.last_line && arcs_arr.length === 1 && draw_step === 1) {
            ok_enter_all();
        } else {
            line_arc_bottom.strokeColor = 'red';
            timer_mig = setInterval(migalka, 500, line_arc_bottom);
        }
        save_cancel();
    }

    function splitArc() {
        arc.flatten(2);
        for (var i = 0, l; i < arc.segments.length - 1; i++) {
            l = drawLine(arc.segments[i].point, arc.segments[i + 1].point, 'blue', 2);
            drawing_lines.push(l);
            l.data.arc = true;
            l.data.og_length = l.length;
            if (i === 0) {
                l.data.arc_edge_segment_num = 0;
            }
            if (i === arc.segments.length - 2) {
                l.data.arc_edge_segment_num = 1;
            }
        }
        arc.remove();
        arc = undefined;
        document.getElementById('arc').checked = false;
        document.getElementById('arc2').checked = false;
        mouseUp(new MouseEvent('mouseup', undefined, drawing_lines[drawing_lines.length - 1].segments[1].point));
        arcsArrGen();
    }

    function arcsArrGen() {
        arcs_arr = [];
        var temp_arr = [];
        for (var i = lines.length, j = 0, step = 0; i--;) {
            j = lines[i].data.draw_step;
            if (lines[i].data.arc) {
                if (step !== j) {
                    step = j;
                    if (temp_arr.length > 0) {
                        arcs_arr.push(temp_arr);
                    }
                    temp_arr = [];
                }
                temp_arr.push(lines[i]);
            }
            if (i === 0 && temp_arr.length > 0) {
                arcs_arr.push(temp_arr);
            }
        }
    }

    function drawLine(start_point, end_point, color, width) {
        var l1 = new Path({
            strokeColor: color,
            strokeWidth: width
        });
        l1.addSegments([start_point, end_point]);
        return l1;
    }

    function drawTwoLines(start_point, end_point, first_line_orientation, color, width) {
        var l1, l2, c_point;
        l1 = new Path({
            strokeColor: color,
            strokeWidth: width
        });
        l2 = new Path({
            strokeColor: color,
            strokeWidth: width
        });
        if (first_line_orientation === 'v') {
            c_point = new Point(start_point.x, end_point.y);
        } else if (first_line_orientation === 'h') {
            c_point = new Point(end_point.x, start_point.y);
        }
        l1.addSegments([start_point, c_point]);
        l2.addSegments([c_point, end_point]);
        return [l1, l2];
    }

    function getLightDistance(light, draft) {
        if (compPathLines) {
            compPathLines.children[0].segments[0].point.y = light.position.y;
            compPathLines.children[0].segments[1].point.y = light.position.y;
            compPathLines.children[1].segments[0].point.x = light.position.x;
            compPathLines.children[1].segments[1].point.x = light.position.x;

        } else {
            compPathLines = new CompoundPath({
                children: [
                    new Path({segments: [new Point(0, light.position.y), new Point(document.body.clientWidth, light.position.y)]}),
                    new Path({segments: [new Point(light.position.x, 0), new Point(light.position.x, document.body.clientHeight)]})
                ]
            });
        }

        var intersections = draft.getIntersections(compPathLines);
        for (var i = 0; i < intersections.length; i++) {
            if (intersections[i].point.x == light.position.x) {
                if (intersections[i].point.y > light.position.y) {
                    light.data.bottom.segments[1].point = intersections[i].point;
                } else {
                    light.data.top.segments[1].point = intersections[i].point;
                }
            }
            if ((intersections[i].point.y).toFixed(2) == (light.position.y).toFixed(2)) {
                if (intersections[i].point.x > light.position.x) {
                    light.data.right.segments[1].point = intersections[i].point;
                } else {
                    light.data.left.segments[1].point = intersections[i].point;
                }
            }
            /*var intersectionPath = new Path.Circle({
	        center: intersections[i].point,
	        radius: 4,
	        fillColor: 'red'
	    });*/
        }
        for (var i = 0; i < lightingArr.length; i++) {
            if (lightingArr[i] != selectedLight) {
                if (Math.abs(lightingArr[i].position.x - selectedLight.position.x) <= 10) {
                    selectedLight.position.x = lightingArr[i].position.x;
                    selectedLight.data.top.segments[0].point.x = lightingArr[i].position.x;
                    selectedLight.data.left.segments[0].point.x = lightingArr[i].position.x;
                    selectedLight.data.right.segments[0].point.x = lightingArr[i].position.x;
                    selectedLight.data.bottom.segments[0].point.x = lightingArr[i].position.x;

                    selectedLight.data.top.segments[1].point.x = lightingArr[i].position.x;
                    selectedLight.data.bottom.segments[1].point.x = lightingArr[i].position.x;
                    if (lightingArr[i].position.y > selectedLight.position.y) {
                        selectedLight.data.bottom.segments[1].point = lightingArr[i].position;
                        lightingArr[i].data.top.visible = false;
                        lightingArr[i].data.top.data.text.visible = false;
                    }
                    if (lightingArr[i].position.y < selectedLight.position.y) {
                        selectedLight.data.top.segments[1].point = lightingArr[i].position;
                        lightingArr[i].data.bottom.visible = false;
                        lightingArr[i].data.bottom.data.text.visible = false;
                    }
                } else {
                    checkLightsOnline(lightingArr[i], 2, draft);
                    lightingArr[i].data.bottom.visible = true;
                    lightingArr[i].data.top.visible = true;
                    lightingArr[i].data.top.data.text.visible = true;
                    lightingArr[i].data.bottom.data.text.visible = true;
                }
                if (Math.abs(lightingArr[i].position.y - selectedLight.position.y) <= 10) {
                    selectedLight.position.y = lightingArr[i].position.y;
                    selectedLight.data.top.segments[0].point.y = lightingArr[i].position.y;
                    selectedLight.data.left.segments[0].point.y = lightingArr[i].position.y;
                    selectedLight.data.right.segments[0].point.y = lightingArr[i].position.y;
                    selectedLight.data.bottom.segments[0].point.y = lightingArr[i].position.y;


                    selectedLight.data.left.segments[1].point.y = lightingArr[i].position.y;
                    selectedLight.data.right.segments[1].point.y = lightingArr[i].position.y;
                    if (lightingArr[i].position.x > selectedLight.position.x) {
                        selectedLight.data.right.segments[1].point = lightingArr[i].position;
                        lightingArr[i].data.left.visible = false;
                        lightingArr[i].data.left.data.text.visible = false;
                    } else {
                        selectedLight.data.left.segments[1].point = lightingArr[i].position;
                        lightingArr[i].data.right.visible = false;
                        lightingArr[i].data.right.data.text.visible = false;

                    }
                } else {
                    checkLightsOnline(lightingArr[i], 1, draft);
                    lightingArr[i].data.left.visible = true;
                    lightingArr[i].data.right.visible = true;
                    lightingArr[i].data.left.data.text.visible = true;
                    lightingArr[i].data.right.data.text.visible = true;

                }
            }
        }
        sketch.removeLinesText(selectedLight.data);
        sketch.addTextLine(selectedLight.data.top, 1, FONT_LINES, 0);
        sketch.addTextLine(selectedLight.data.right, 1, FONT_LINES, 0);
        sketch.addTextLine(selectedLight.data.bottom, 1, FONT_LINES, 0);
        sketch.addTextLine(selectedLight.data.left, 1, FONT_LINES, 0);
        sketch.drawLinesText(selectedLight.data, 1, FONT_LINES, 0);

    }


    function checkSizeLinePoint(lastPoint) {
        var result = false;
        for (var i = 0; i < lightingArr.length; i++) {
            if (lastPoint.x == lightingArr[i].position.x && lastPoint.y == lightingArr[i].position.y) {
                result = true;
                break;
            }
        }
        return result;
    }

    tool.onMouseDown = function (event) {
        if (newCalculate && !selectedCalculation) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: 'warning',
                text: 'Пожалуйста выберите просчет!'
            }).show();
            jQuery('#btn_info').trigger('click');
            return false;
        }
        vh = 'v';
        if (ready && lightingArr.length) {
            selectedLight = null;
            for (var i = 0; i < lightingArr.length; i++) {
                lightingArr[i].selected = false;
            }
            for (var i = 0; i < lightingArr.length; i++) {
                if (lightingArr[i].contains(event.point)) {
                    if (!Object.keys(lightingArr[i].data).length) {
                        lightingArr[i].data = {
                            top: new Path({
                                segments: [lightingArr[i].position, new Point(lightingArr[i].position.x, lightingArr[i].position.y - 30)],
                                strokeColor: 'black'
                            }),
                            right: new Path({
                                segments: [lightingArr[i].position, new Point(lightingArr[i].position.x + 30, lightingArr[i].position.y)],
                                strokeColor: 'black'
                            }),
                            bottom: new Path({
                                segments: [lightingArr[i].position, new Point(lightingArr[i].position.x, lightingArr[i].position.y + 30)],
                                strokeColor: 'black'
                            }),
                            left: new Path({
                                segments: [lightingArr[i].position, new Point(lightingArr[i].position.x - 30, lightingArr[i].position.y)],
                                strokeColor: 'black'
                            })

                        }
                    }
                    selectedLight = lightingArr[i];
                    lightingArr[i].selected = true;
                    selectedLight.data.top.visible = true;
                    selectedLight.data.right.visible = true;
                    selectedLight.data.bottom.visible = true;
                    selectedLight.data.left.visible = true;
                    break;
                }
            }
            if (selectedLight) {
                sketch.addTextLine(selectedLight.data.top, 1, FONT_LINES, 0);
                sketch.addTextLine(selectedLight.data.right, 1, FONT_LINES, 0);
                sketch.addTextLine(selectedLight.data.bottom, 1, FONT_LINES, 0);
                sketch.addTextLine(selectedLight.data.left, 1, FONT_LINES, 0);
                sketch.drawLinesText(selectedLight.data, 1, FONT_LINES, 0);
                return false;
            } else {
                if (jQuery('#btn_del_light').length) {
                    jQuery('#btn_del_light').attr('disabled', true);
                }
                if (jQuery('#btn_del_light2').length) {
                    jQuery('#btn_del_light2').attr('disabled', true);
                }
            }
        }


        if (lines.length > 0 || arc !== undefined) {
            var cir = getCircleUnderPoint(event.point);
            if (cir === null) {
                fix_point_dvig = event.point;
            } else {
                moving_circle = cir;
                start_draw_point = cir.position.clone();
            }

        } else {
            start_draw_point = event.point;
        }

    };

    tool.onMouseDrag = function (event) {
        var gPoints = sketch.getPathsPointsBySort(lines_sort),
            draft = new Path({segments: gPoints, closed: true});
        for (var i = inner_cutouts.length; i--;) {
            draft.remove();
            draft = draft.subtract(innerCutouts[i]);
        }
        if (draft.contains(event.point) && selectedLight) {//здесь крайнюю точку светильника получить и ее проверять
            selectedLight.position = event.point;
            selectedLight.data.top.segments[0].point = event.point;
            selectedLight.data.right.segments[0].point = event.point;
            selectedLight.data.bottom.segments[0].point = event.point;
            selectedLight.data.left.segments[0].point = event.point;
            getLightDistance(selectedLight, draft);
        }

        if (fix_point_dvig !== undefined) {
            var rast_x = Math.round(fix_point_dvig.x - event.point.x);
            var rast_y = Math.round(fix_point_dvig.y - event.point.y);
            for (var i = g_layer.children.length; i--;) {
                g_layer.children[i].position.x -= rast_x;
                g_layer.children[i].position.y -= rast_y;
            }
            if (begin_point_diag !== undefined) {
                begin_point_diag.x -= rast_x;
                begin_point_diag.y -= rast_y;
            }
            if (end_point_diag !== undefined) {
                end_point_diag.x -= rast_x;
                end_point_diag.y -= rast_y;
            }
            if (start_draw_point !== undefined) {
                start_draw_point.x -= rast_x;
                start_draw_point.y -= rast_y;
            }
            if (last_point_in_circle !== undefined) {
                last_point_in_circle.x -= rast_x;
                last_point_in_circle.y -= rast_y;
            }
            fix_point_dvig = event.point;
            distOfShift += Math.sqrt((rast_x * rast_x) + (rast_y * rast_y));
            return;
        }

        if (start_draw_point === undefined || bool_noty_curve || elem_window.style.display === 'block') {
            return;
        }

        if (elem_arc.checked) {
            drawingArc(event.point);
            return;
        }

        if (elem_curve.checked) {
            drawingCurve(event.point);
            return;
        }

        var move_point, cir = getCircleUnderPoint(event.point);

        if (cir !== null && cir !== moving_circle) {
            move_point = cir.position.clone();
        } else {
            move_point = event.point;
        }

        if (cir === null || cir === moving_circle || !sketch.comparePoints(move_point, cir.position, HALF)) {
            sketch.addBorder(borderLines);
            var to_up = (move_point.y < borderLines.top.position.y),
                to_down = (move_point.y > borderLines.bottom.position.y),
                to_left = (move_point.x < borderLines.left.position.x),
                to_right = (move_point.x > borderLines.right.position.x);
            if (to_down) {
                clearInterval(timer1);
                timer1 = setInterval(dvig_lines, 1, 1);
            } else if (to_up) {
                clearInterval(timer1);
                timer1 = setInterval(dvig_lines, 1, 2);
            }
            if (to_right) {
                clearInterval(timer1);
                timer1 = setInterval(dvig_lines, 1, 3);
            } else if (to_left) {
                clearInterval(timer1);
                timer1 = setInterval(dvig_lines, 1, 4);
            }
            if (!to_up && !to_down && !to_left && !to_right) {
                clearInterval(timer1);
            }
            sketch.clearBorder(borderLines);
        } else {
            clearInterval(timer1);
        }

        for (var i = drawing_lines.length; i--;) {
            drawing_lines[i].remove();
        }

        if (elem_useLine.checked) {
            drawing_lines = drawTwoLines(start_draw_point, move_point, vh, 'blue', 2);
            if (drawing_lines[0].length < 20 && drawing_lines[1].length < 20) {
                var angle = sketch.getAngle(start_draw_point, move_point);
                if ((angle > 45 && angle < 135) || (angle > 225 && angle < 315)) {
                    vh = 'h';
                } else {
                    vh = 'v';
                }
            }

            if (cir !== null && cir !== moving_circle && sketch.comparePoints(move_point, cir.position, HALF)) {
                for (var i = drawing_lines.length; i--;) {
                    if ((drawing_lines[i].length < 10 && !isExtendsLine(drawing_lines[i], lines)) || !checkDrawing(event.point)) {
                        redrawReverse();
                        break;
                    }
                }
                for (var i = drawing_lines.length; i--;) {
                    if ((drawing_lines[i].length < 10 && !isExtendsLine(drawing_lines[i], lines)) || !checkDrawing(event.point)) {
                        drawing_lines[0].remove();
                        drawing_lines[1].remove();
                        drawing_lines = [drawLine(start_draw_point, move_point, 'blue', 2)];
                        break;
                    }
                }
            } else {
                if (drawing_lines[0].length < 15) {
                    redrawReverse();
                }
                if (drawing_lines[1].length < 15) {
                    drawing_lines[1].remove();
                    drawing_lines.splice(1, 1);
                    if (drawing_lines[0].length < 15) {
                        drawing_lines[0].remove();
                        drawing_lines.splice(0, 1);
                    }
                }
            }

            if (!checkDrawing(event.point)) {
                redrawReverse();
                if (!checkDrawing(event.point)) {
                    redrawReverse();
                    for (var i = drawing_lines.length; i--;) {
                        drawing_lines[i].strokeColor = 'red';
                    }
                }
            }
        } else {
            drawing_lines = [drawLine(start_draw_point, move_point, 'blue', 2)];
            if (drawing_lines[0].length < 15) {
                drawing_lines[0].remove();
                drawing_lines.splice(0, 1);
            } else if (!checkDrawing(event.point)) {
                for (var i = drawing_lines.length; i--;) {
                    drawing_lines[i].strokeColor = 'red';
                }
            }
        }

        for (var key = lines.length; key--;) {
            lines[key].strokeColor = 'black';
        }

        if (checkDrawing(event.point)) {
            for (var i = circles_for_draw.length; i--;) {
                if (circles_for_draw[i] !== moving_circle && sketch.comparePoints(move_point, circles_for_draw[i].position, HALF)) {
                    for (var key = lines.length; key--;) {
                        lines[key].strokeColor = 'darkorange';
                    }
                    for (var key = drawing_lines.length; key--;) {
                        drawing_lines[key].strokeColor = 'darkorange';
                    }
                }
            }
        }
    };

    function redrawReverse() {
        if (drawing_lines.length !== 2) {
            return;
        }
        var a = drawing_lines[0].segments[0].point.clone(),
            b = drawing_lines[1].segments[1].point.clone(),
            new_point = new Point(a.x, b.y);
        if (sketch.comparePoints(new_point, drawing_lines[0].segments[1].point, HALF)) {
            new_point = new Point(b.x, a.y);
        }
        drawing_lines[0].removeSegments();
        drawing_lines[1].removeSegments();
        drawing_lines[0].addSegments([a, new_point]);
        drawing_lines[1].addSegments([new_point, b]);
    }

    function checkDrawing(event_point) {
        if (drawing_lines.length === 0) {
            return false;
        }
        if (lines.length === 0) {
            return true;
        }

        for (var i = lines.length; i--;) {
            for (var j = drawing_lines.length; j--;) {
                if (sketch.isIntersect(lines[i].segments[0].point, lines[i].segments[1].point,
                    drawing_lines[j].segments[0].point, drawing_lines[j].segments[1].point)) {
                    return false;
                }
            }
        }

        var move_point, cir = getCircleUnderPoint(event_point);

        if (cir !== null && cir !== moving_circle) {
            move_point = cir.position.clone();
        } else {
            move_point = event_point;
        }

        if (cir === null || cir === moving_circle || !sketch.comparePoints(move_point, cir.position, HALF)) {
            var o_p;
            for (var i = lines.length; i--;) {
                if (i !== 0 && (o_p = sketch.commonPoint(lines[i], lines[i - 1])) !== null &&
                    sketch.nearestLines(drawing_lines, o_p, 5) > 0) {
                    return false;
                } else if (sketch.nearestLines(drawing_lines, lines[i].segments[0].point, 5) > 0 ||
                    sketch.nearestLines(drawing_lines, lines[i].segments[1].point, 5) > 0) {
                    if (sketch.comparePoints(lines[i].segments[0].point, start_draw_point, HALF) ||
                        sketch.comparePoints(lines[i].segments[1].point, start_draw_point, HALF)) {
                        continue;
                    }
                    return false;
                }
            }
            for (var i = drawing_lines.length; i--;) {
                if (sketch.nearestLines(lines, drawing_lines[i].segments[1].point, 5) > 0) {
                    return false;
                }
            }
        } else {
            for (var i = lines.length, l_i_s0, l_i_s1; i--;) {
                l_i_s0 = lines[i].segments[0].point;
                l_i_s1 = lines[i].segments[1].point;
                if (sketch.comparePoints(l_i_s0, start_draw_point, HALF) ||
                    sketch.comparePoints(l_i_s1, start_draw_point, HALF) ||
                    sketch.comparePoints(l_i_s0, move_point, HALF) ||
                    sketch.comparePoints(l_i_s1, move_point, HALF)) {
                    continue;
                }
                if (sketch.nearestLines(drawing_lines, l_i_s0, 5) > 0 ||
                    sketch.nearestLines(drawing_lines, l_i_s1, 5) > 0) {
                    return false;
                }
            }
            for (var i = drawing_lines.length, dl_i_s0, dl_i_s1; i--;) {
                dl_i_s0 = drawing_lines[i].segments[0].point;
                dl_i_s1 = drawing_lines[i].segments[1].point;
                if (sketch.comparePoints(dl_i_s0, start_draw_point, HALF) ||
                    sketch.comparePoints(dl_i_s1, start_draw_point, HALF) ||
                    sketch.comparePoints(dl_i_s0, move_point, HALF) ||
                    sketch.comparePoints(dl_i_s1, move_point, HALF)) {
                    continue;
                }
                if (sketch.nearestLines(lines, dl_i_s0, 5) > 0 ||
                    sketch.nearestLines(lines, dl_i_s1, 5) > 0) {
                    return false;
                }
            }
            for (var i = drawing_lines.length - 1, o_p; i--;) {
                o_p = sketch.commonPoint(drawing_lines[i], drawing_lines[i + 1])
                if (sketch.nearestLines(lines, o_p, 5) > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    function checkDrawingCurve(event_point) {
        if (drawing_lines.length === 0) {
            return false;
        }
        for (var i = drawing_lines.length, dl_i; i--;) {
            dl_i = drawing_lines[i];
            for (var j = drawing_lines.length, dl_j; j--;) {
                dl_j = drawing_lines[j];
                if (dl_i === dl_j) {
                    continue;
                }
                if (sketch.isIntersect(dl_i.segments[0].point, dl_i.segments[1].point,
                    dl_j.segments[0].point, dl_j.segments[1].point)) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: 'warning',
                        text: 'Обнаружено пересечение отрезков!'
                    }).show();
                    return false;
                }
            }
        }

        var move_point, cir = getCircleUnderPoint(event_point);

        if (cir !== null && cir !== moving_circle) {
            move_point = cir.position.clone();
        } else {
            move_point = event_point;
        }
        if (cir === null || cir === moving_circle || !sketch.comparePoints(move_point, cir.position, HALF)) {
            if (drawing_lines[drawing_lines.length - 1].data.curve &&
                sketch.nearestLines(drawing_lines, drawing_lines[drawing_lines.length - 1].segments[1].point, 5) > 1) {
                drawing_lines[drawing_lines.length - 1].remove();
                drawing_lines.splice(-1, 1);
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: 'warning',
                    text: 'Последний отрезок был удален!'
                }).show();
            }
            if (drawing_lines[0].data.curve &&
                sketch.nearestLines(drawing_lines, drawing_lines[0].segments[0].point, 5) > 1) {
                drawing_lines[0].remove();
                drawing_lines.splice(0, 1);
                start_draw_point = drawing_lines[0].segments[0].point;
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: 'warning',
                    text: 'Первый отрезок был удален!'
                }).show();
            }
        }
        return true;
    }

    tool.onMouseUp = mouseUp;

    function mouseUp(event) {
        if (bool_noty_curve) {
            return;
        }
        if (distOfShift < 10 && elem_popup2.style.display !== 'block' && !close_sketch_click_bool) {
            var hitResults = project.hitTestAll(event.point, {class: Path, fill: true, stroke: true, tolerance: 4});
            for (var key = hitResults.length; key--;) {
                for (var key2 = hitResults.length; key2--;) {
                    if (hitResults[key2].item.segments.length !== 2 && chert_close) {
                        return;
                    }
                }
                if (hitResults[key].item.segments.length === 2) {
                    if (!triangulate_bool && triangulate_rezhim === 2) {
                        for (var i = 0; i < diags.length; i++) {
                            if (diags[i] == hitResults[key].item && !selectedLight) {
                                elem_window.style.display = 'block';
                                resize_canvas();
                                elem_newLength.focus();
                                elem_newLength.value = diags[i].length.toFixed(1);
                                elem_newLength.select();
                                first_click = false;
                                manual_diag = diags[i];
                                manual_diag.strokeColor = 'red';
                                diags.splice(i, 1);
                                for (var j = text_manual_diags.length; j--;) {
                                    text_manual_diags[j].remove();
                                }
                                text_manual_diags = [];
                                for (var j = diags.length; j--;) {
                                    addTextUnfixedLengthDiag(j);
                                }
                                save_cancel();
                            }
                        }
                        return;
                    }
                    if (hitResults[key].item.data.fixed) {
                        if (inner_cutout_bool && (hitResults[key].item.data.is_wall) && cutout_line === undefined) {
                            for (var i = lines.length; i--;) {
                                lines[i].strokeColor = 'green';
                            }
                            selectLineForInnerCutout(hitResults[key].item);
                            return;
                        }
                        if (inner_cutout_bool || inner_cutouts.length > 0) {
                            return false;
                        }
                        if (!selectedLight) {
                            click_on_fixed(hitResults[key].item);
                            return;
                        }
                    }
                }
            }
        }
        distOfShift = 0;
        touchZoomObj.touch1 = undefined;
        touchZoomObj.touch2 = undefined;
        fix_point_dvig = undefined;
        clearInterval(timer1);

        if (elem_window.style.display === 'block') {
            return;
        }

        if (elem_arc.checked && arc !== undefined) {
            endDrawingArc();
            return;
        }

        if (elem_curve.checked && drawing_curve_path !== undefined) {
            endDrawingCurve();
            return;
        }
        if (start_draw_point !== undefined && checkDrawing(event.point) &&
            checkDrawingCurve(event.point) && drawing_lines.length > 0) {
            var end_draw_point = drawing_lines[drawing_lines.length - 1].segments[1].point;
            if (lines.length > 0) {
                moving_circle.position = end_draw_point;
            } else {
                circles_for_draw[0] = new Path.Circle(start_draw_point, 20);
                circles_for_draw[0].strokeColor = 'green';
                circles_for_draw[1] = new Path.Circle(end_draw_point, 20);
                circles_for_draw[1].strokeColor = 'green';
            }
            for (var i = drawing_lines.length; i--;) {
                drawing_lines[i].strokeColor = 'black';
                drawing_lines[i].data.is_wall = true;
                drawing_lines[i].data.draw_step = draw_step;
                lines.push(drawing_lines[i]);
                lines[lines.length - 1].data.id = lines.length - 1;
            }
            clearDraw();
            draw_step++;
            if (sketch.comparePoints(circles_for_draw[0].position, circles_for_draw[1].position, HALF)) {
                circles_for_draw[0].remove();
                circles_for_draw[1].remove();
                circles_for_draw = [];
                for (var key = lines.length; key--;) {
                    lines[key].strokeColor = 'black';
                }
                lines_sort = [];
                unionLinesAfterDraw();
                chert_close = true;

                sketch.drawLinesText(lines, 1, FONT_LINES, 0);
                g_points = sketch.getPathsPoints(lines);
                text_points = drawLabels(createVertexNames());
                sort_sten();
                arcsArrGen();
                resize_wall_begin();
            }
            if (!elem_useLine.checked) {
                elem_useLine.checked = true;
            }
            save_cancel();
        } else {
            for (var i = drawing_lines.length; i--;) {
                drawing_lines[i].remove();
            }
        }
        clearDraw();
        if (selectedLight) {
            /*	selectedLight.selected = false;
		selectedLight = null;*/
            if (jQuery('#btn_del_light').length) {
                jQuery('#btn_del_light').removeProp('disabled');
            }
            if (jQuery('#btn_del_light2').length) {
                jQuery('#btn_del_light2').removeProp('disabled');
            }
        }
    };

    function clearDraw() {
        moving_circle = undefined;
        start_draw_point = undefined;
        drawing_lines = [];
        move_curve_point = undefined;
        drawing_curve_path = undefined;
    }

    function clicks_pt() {
        for (var i = text_points.length; i--;) {
            if (text_points[i].data.circle !== undefined) {
                text_points[i].data.circle.onMouseEnter = function (event) {
                    if (manual_diag === undefined) {
                        var l = 0, lf = 0;
                        for (var i = lines.length; i--;) {
                            l++;
                            if (lines[i].data.fixed) {
                                lf++;
                            }
                        }
                        if (l === lf && triangulate_rezhim === 2 && !this.data.selected) {
                            this.fillColor = 'purple';
                            this.data.mouseEnter = true;
                        }
                    }
                };

                text_points[i].data.circle.onMouseLeave = function (event) {
                    if (manual_diag === undefined) {
                        var l = 0, lf = 0;
                        for (var i = lines.length; i--;) {
                            l++;
                            if (lines[i].data.fixed) {
                                lf++;
                            }
                        }
                        if (this.data.mouseEnter === true && !this.data.selected) {
                            this.fillColor = 'blue';
                            this.data.mouseEnter = false;
                        }
                    }
                };

                text_points[i].data.circle.onMouseDown = function (event) {
                    if (manual_diag === undefined) {
                        var l = 0, lf = 0;
                        for (var i = lines.length; i--;) {
                            l++;
                            if (lines[i].data.fixed) {
                                lf++;
                            }
                        }
                        if (l === lf && triangulate_rezhim === 2) {
                            draw_diag(this);
                            return;
                        }
                    }
                }
            }
        }
    }

    function draw_diag(cir) {
        if (begin_point_diag === undefined) {
            begin_point_diag = cir.position;
            cir.fillColor = 'Maroon';
            cir.data.selected = true;
        } else if (end_point_diag === undefined && !cir.data.selected) {
            for (var i = text_points.length; i--;) {
                if (text_points[i].data.circle.data.selected) {
                    text_points[i].data.circle.fillColor = 'blue';
                    text_points[i].data.circle.data.selected = false;

                    end_point_diag = cir.position;
                    var newdiag = new Path.Line(begin_point_diag, end_point_diag);
                    newdiag.strokeWidth = DIAG_WIDTH;
                    newdiag.strokeColor = 'black';
                    if (good_diag(newdiag)) {
                        elem_window.style.display = 'block';
                        resize_canvas();
                        elem_newLength.focus();
                        elem_newLength.value = new Decimal(newdiag.length).toFixed(1);
                        elem_newLength.select();
                        first_click = false;
                        manual_diag = newdiag;
                        manual_diag.strokeColor = 'red';
                        cir.fillColor = 'blue';
                        save_cancel();
                    } else {
                        newdiag.remove();
                        new Noty({
                            theme: 'relax',
                            timeout: 2000,
                            layout: 'topCenter',
                            type: 'warning',
                            text: 'Диагональ пересекается или находится снаружи чертежа!'
                        }).show();
                    }
                    begin_point_diag = undefined;
                    end_point_diag = undefined;
                    break;
                }
            }
            begin_point_diag = undefined;
            end_point_diag = undefined;
        }
    }

    function isExtendsLine(line, lines) {
        for (var i = lines.length; i--;) {
            if (sketch.commonPoint(lines[i], line) !== null && sketch.isParallel(lines[i], line)) {
                return true;
            }
        }
        return false;
    }

    function getCircleUnderPoint(point) {
        var result = null;
        for (var i = circles_for_draw.length; i--;) {
            if (circles_for_draw[i].contains(point)) {
                result = circles_for_draw[i];
            }
        }
        return result;
    }

    function addTextUnfixedLengthDiag(index) {
        if (text_manual_diags[index] === undefined) {
            text_manual_diags[index] = new PointText();
        }
        var td_i = text_manual_diags[index], d_i = diags[index], d_i_s0 = d_i.segments[0].point,
            d_i_s1 = d_i.segments[1].point;
        td_i.fontFamily = 'times';
        td_i.fontWeight = 'bold';
        td_i.fillColor = 'black';
        td_i.rotation = 0;
        td_i.fontSize = (14 / view.zoom).toFixed(2) - 0;
        td_i.content = d_i.data.unfixed_length;
        var angle = (Math.atan((d_i_s1.y - d_i_s0.y) / (d_i_s1.x - d_i_s0.x)) * 180) / Math.PI;
        td_i.rotate(angle);
        td_i.position = new Point(d_i.position.x, d_i.position.y);
        td_i.bringToFront();
    }

    function unionLinesAfterDraw() {
        const LIM = 2;
        var o_p, approximatelyEqual = sketch.approximatelyEqual;
        for (var i = 0; i < lines.length - 1; i++) {
            if (lines[i].data.curve || lines[i].data.arc) {
                continue;
            }
            for (var j = i + 1; j < lines.length; j++) {
                if (lines[j].data.curve || lines[j].data.arc) {
                    continue;
                }
                var l_i_s0 = lines[i].segments[0].point,
                    l_i_s1 = lines[i].segments[1].point,
                    l_j_s0 = lines[j].segments[0].point,
                    l_j_s1 = lines[j].segments[1].point,
                    temp_arr = [l_i_s0.clone(), l_i_s1.clone(), l_j_s0.clone(), l_j_s1.clone()];
                o_p = sketch.commonPoint(lines[i], lines[j]);
                if (o_p !== null &&
                    ((approximatelyEqual(l_i_s0.x, l_i_s1.x, LIM) &&
                        approximatelyEqual(l_i_s0.x, l_j_s0.x, LIM) &&
                        approximatelyEqual(l_i_s0.x, l_j_s1.x, LIM)) ||
                        (approximatelyEqual(l_i_s0.y, l_i_s1.y, LIM) &&
                            approximatelyEqual(l_i_s0.y, l_j_s0.y, LIM) &&
                            approximatelyEqual(l_i_s0.y, l_j_s1.y, LIM)))) {
                    lines[i].removeSegments();
                    lines[j].removeSegments();
                    for (var k = temp_arr.length; k--;) {
                        if (!sketch.comparePoints(o_p, temp_arr[k], HALF)) {
                            lines[i].add(temp_arr[k]);
                        }
                    }
                    lines.splice(j, 1);
                    for (var k = j; k < lines.length; k++) {
                        lines[k].data.id--;
                    }
                    j = 1;
                    i = 0;
                }
            }
        }
    }

    function cancelLastAction() {
        if (arr_cancel.length > 1) {
            arr_cancel.splice(arr_cancel.length - 1);
        }

        g_layer.removeChildren();

        clearInterval(timer_mig);

        var arr_cancel_last_elem = arr_cancel[arr_cancel.length - 1];

        elem_window.style.display = arr_cancel_last_elem.elem_window_style_display;
        resize_canvas();
        elem_newLength.value = arr_cancel_last_elem.elem_newLength_value;
        document.getElementById('comma').disabled = arr_cancel_last_elem.elem_comma_disabled;
        document.getElementById('comma2').disabled = arr_cancel_last_elem.elem_comma_disabled;
        if (elem_window.style.display === "block") {
            first_click = false;
            elem_newLength.focus();
            elem_newLength.select();
        }

        triangulate_bool = arr_cancel_last_elem.triangulate_bool;
        vh = arr_cancel_last_elem.vh;
        chert_close = arr_cancel_last_elem.chert_close;
        draw_step = arr_cancel_last_elem.draw_step;

        view.zoom = arr_cancel_last_elem.zoom;

        code = arr_cancel_last_elem.code;
        alfavit = arr_cancel_last_elem.alfavit;

        ready = arr_cancel_last_elem.ready;
        close_sketch_click_bool = arr_cancel_last_elem.close_sketch_click_bool;

        triangulate_rezhim = arr_cancel_last_elem.triangulate_rezhim;

        manual_diag = undefined;
        if (arr_cancel_last_elem.manual_diag !== undefined) {
            manual_diag = arr_cancel_last_elem.manual_diag.clone();
            g_layer.addChild(manual_diag);
        }

        if (arr_cancel_last_elem.circles_for_draw !== undefined
            && arr_cancel_last_elem.circles_for_draw.length !== 0) {
            for (var key = arr_cancel_last_elem.circles_for_draw.length; key--;) {
                circles_for_draw[key] = arr_cancel_last_elem.circles_for_draw[key].clone();
            }
        } else {
            for (var key = circles_for_draw.length; key--;) {
                circles_for_draw[key].remove();
            }
            circles_for_draw = [];
        }

        start_draw_point = undefined;
        last_point_in_circle = undefined;
        if (arr_cancel_last_elem.start_draw_point !== undefined) {
            start_draw_point = arr_cancel_last_elem.start_draw_point.clone();
        }
        if (arr_cancel_last_elem.last_point_in_circle !== undefined) {
            last_point_in_circle = arr_cancel_last_elem.last_point_in_circle.clone();
        }

        if (start_draw_point !== undefined) {
            moving_circle = getCircleUnderPoint(start_draw_point);
        }

        lines_sort = [];
        lines = [];

        if (arr_cancel_last_elem.lines_sort !== undefined && arr_cancel_last_elem.lines_sort.length !== 0) {
            for (var key = arr_cancel_last_elem.lines_sort.length; key--;) {
                lines_sort[key] = arr_cancel_last_elem.lines_sort[key].clone();
                lines[lines_sort[key].data.id] = lines_sort[key];
                if (chert_close) {
                    sketch.addTextLine(lines_sort[key], 1, FONT_LINES, 0);
                }
            }
        } else if (arr_cancel_last_elem.lines !== undefined) {
            lines = [];
            for (var key in arr_cancel_last_elem.lines) {
                lines[arr_cancel_last_elem.lines[key].data.id] = arr_cancel_last_elem.lines[key].clone();
                if (chert_close) {
                    sketch.addTextLine(lines_sort[key], 1, FONT_LINES, 0);
                }
            }
        }

        arcsArrGen();

        diag_sort = [];
        diags = [];

        if (triangulate_bool) {
            if (arr_cancel_last_elem.diag_sort !== undefined
                && arr_cancel_last_elem.diag_sort.length !== 0) {
                for (var key = arr_cancel_last_elem.diag_sort.length; key--;) {
                    diag_sort[key] = arr_cancel_last_elem.diag_sort[key].clone();
                    diags[key] = diag_sort[key];
                    sketch.addTextLine(diags[key], 1, FONT_DIAGS, 1);
                }
            } else if (arr_cancel_last_elem.diag !== undefined) {
                diags = [];
                for (var key in arr_cancel_last_elem.diag) {
                    diags[key] = arr_cancel_last_elem.diag[key].clone();
                    sketch.addTextLine(diags[key], 1, FONT_DIAGS, 1);
                }
            }
        } else if (triangulate_rezhim === 2) {
            diags = [];
            for (var key in arr_cancel_last_elem.diag) {
                diags[key] = arr_cancel_last_elem.diag[key].clone();
            }
            text_manual_diags = [];
            for (var key in arr_cancel_last_elem.text_manual_diags) {
                text_manual_diags[key] = arr_cancel_last_elem.text_manual_diags[key].clone();
            }
        }

        text_points = [];
        for (var key in arr_cancel_last_elem.text_points) {
            text_points[key] = arr_cancel_last_elem.text_points[key].clone();
            if (arr_cancel_last_elem.text_points[key].data.circle !== undefined) {
                text_points[key].data.circle = arr_cancel_last_elem.text_points[key].data.circle.clone();
            }
        }

        g_points = [];
        for (var key in arr_cancel_last_elem.g_points) {
            g_points[key] = arr_cancel_last_elem.g_points[key].clone();
        }

        elem_input_n4.value = arr_cancel_last_elem.elem_input_n4_value;
        elem_input_n5.value = arr_cancel_last_elem.elem_input_n5_value;
        elem_input_n9.value = arr_cancel_last_elem.elem_input_n9_value;

        g_layer.addChildren(lines);
        g_layer.addChildren(diags);
        g_layer.addChildren(text_manual_diags);
        g_layer.addChildren(text_points);
        g_layer.addChildren(circles_for_draw);

        sketch.bringToFrontLinesText(lines);

        arc = undefined;
        if (arr_cancel_last_elem.arc !== undefined) {
            arc = arr_cancel_last_elem.arc.clone();
            g_layer.addChild(arc);
        }

        line_arc_bottom = undefined;
        if (arr_cancel_last_elem.line_arc_bottom !== undefined) {
            line_arc_bottom = arr_cancel_last_elem.line_arc_bottom.clone();
            g_layer.addChild(line_arc_bottom);
        }

        line_arc_height = undefined;
        if (arr_cancel_last_elem.line_arc_height !== undefined) {
            line_arc_height = arr_cancel_last_elem.line_arc_height.clone();
            g_layer.addChild(line_arc_height);
        }

        button_reverse_arc = undefined;
        if (arr_cancel_last_elem.button_reverse_arc !== undefined) {
            button_reverse_arc = arr_cancel_last_elem.button_reverse_arc.clone();
            g_layer.addChild(button_reverse_arc);
            eventsButtonReverseArc();
        }

        cut_width = undefined;
        if (arr_cancel_last_elem.cut_width !== undefined) {
            cut_width = arr_cancel_last_elem.cut_width.clone();
            g_layer.addChild(cut_width);
        }

        cut_length = undefined;
        if (arr_cancel_last_elem.cut_length !== undefined) {
            cut_length = arr_cancel_last_elem.cut_length.clone();
            g_layer.addChild(cut_length);
        }

        cut_pos_line1 = undefined;
        if (arr_cancel_last_elem.cut_pos_line1 !== undefined) {
            cut_pos_line1 = arr_cancel_last_elem.cut_pos_line1.clone();
            g_layer.addChild(cut_pos_line1);
        }

        cut_pos_line2 = undefined;
        if (arr_cancel_last_elem.cut_pos_line2 !== undefined) {
            cut_pos_line2 = arr_cancel_last_elem.cut_pos_line2.clone();
            g_layer.addChild(cut_pos_line2);
        }

        inner_cutout_bool = arr_cancel_last_elem.inner_cutout_bool;

        inner_cutouts = [];
        for (var i = arr_cancel_last_elem.inner_cutouts.length; i--;) {
            inner_cutouts[i] = arr_cancel_last_elem.inner_cutouts[i].clone();
            g_layer.addChild(inner_cutouts[i]);
        }
        sketch.drawCutoutsText(inner_cutouts, 1, FONT_LINES, 0);

        cutout_line = undefined;
        for (var i = lines.length; i--;) {
            if (lines[i].data.cutout_line) {
                cutout_line = lines[i];
            }
        }

        for (var i = text_points.length; i--;) {
            if (text_points[i].data.circle !== undefined) {
                g_layer.addChild(text_points[i].data.circle);
            }
        }

        clicks_pt();
        elem_popup2.style.display = 'none';
        elem_popupCoordinates.style.display = 'none';
        elem_popupInnerCutout.style.display = 'none';
        elem_popupLevel.style.display = 'none';
        elem_popupCanvas.style.display = 'none';
        elem_popupCanvasColor.style.display = 'none';
        elem_popupBuild.style.display = 'none';
    }

    function save_cancel() {
        g_layer.removeChildren();

        var obj = {};

        obj.elem_window_style_display = elem_window.style.display;
        obj.elem_newLength_value = elem_newLength.value;
        obj.triangulate_rezhim = triangulate_rezhim;
        obj.elem_comma_disabled = document.getElementById('comma').disabled;

        if (manual_diag !== undefined) {
            obj.manual_diag = manual_diag.clone();
            g_layer.addChild(manual_diag);
        }

        obj.circles_for_draw = [];
        for (var i = circles_for_draw.length; i--;) {
            obj.circles_for_draw[i] = circles_for_draw[i].clone();
        }

        if (lines_sort !== undefined && lines_sort.length !== 0) {
            obj.lines_sort = [];
            for (var key = lines_sort.length; key--;) {
                obj.lines_sort[key] = lines_sort[key].clone();
                if (lines_sort[key].data.text !== undefined) {
                    g_layer.addChild(lines_sort[key].data.text);
                }
            }
        } else if (lines !== undefined) {
            obj.lines = [];
            for (var key = lines.length; key--;) {
                obj.lines[key] = lines[key].clone();
                if (lines[key].data.text !== undefined) {
                    g_layer.addChild(lines[key].data.text);
                }
            }
        }

        if (diag_sort !== undefined && diag_sort.length !== 0) {
            obj.diag_sort = [];
            for (var key = diag_sort.length; key--;) {
                obj.diag_sort[key] = diag_sort[key].clone();
                if (diag_sort[key].data.text !== undefined) {
                    g_layer.addChild(diag_sort[key].data.text);
                }
            }
        } else if (diags !== undefined) {
            obj.diag = [];
            for (var key in diags) {
                obj.diag[key] = diags[key].clone();
                if (diags[key].data.text !== undefined) {
                    g_layer.addChild(diags[key].data.text);
                }
            }
        }

        obj.text_points = [];
        for (var key in text_points) {
            obj.text_points[key] = text_points[key].clone();
            if (text_points[key].data.circle !== undefined) {
                obj.text_points[key].data.circle = text_points[key].data.circle.clone();
            }
        }

        obj.text_manual_diags = [];
        for (var key in text_manual_diags) {
            obj.text_manual_diags[key] = text_manual_diags[key].clone();
        }

        obj.code = code;
        obj.alfavit = alfavit;

        obj.g_points = [];
        for (var key in g_points) {
            obj.g_points[key] = g_points[key].clone();
        }

        if (start_draw_point !== undefined) {
            obj.start_draw_point = start_draw_point.clone();
        }
        if (last_point_in_circle !== undefined) {
            obj.last_point_in_circle = last_point_in_circle.clone();
        }

        obj.triangulate_bool = triangulate_bool;
        obj.vh = vh;
        obj.chert_close = chert_close;
        obj.draw_step = draw_step;

        obj.ready = ready;
        obj.close_sketch_click_bool = close_sketch_click_bool;
        obj.elem_input_n4_value = elem_input_n4.value;
        obj.elem_input_n5_value = elem_input_n5.value;
        obj.elem_input_n9_value = elem_input_n9.value;

        obj.zoom = view.zoom;

        arr_cancel.push(obj);

        g_layer.addChildren(lines);
        g_layer.addChildren(diags);
        g_layer.addChildren(text_manual_diags);
        g_layer.addChildren(text_points);
        g_layer.addChildren(circles_for_draw);

        sketch.bringToFrontLinesText(lines);

        if (arc !== undefined) {
            obj.arc = arc.clone();
            g_layer.addChild(arc);
        }

        if (line_arc_bottom !== undefined) {
            obj.line_arc_bottom = line_arc_bottom.clone();
            g_layer.addChild(line_arc_bottom);
        }

        if (line_arc_height !== undefined) {
            obj.line_arc_height = line_arc_height.clone();
            g_layer.addChild(line_arc_height);
        }

        if (button_reverse_arc !== undefined) {
            obj.button_reverse_arc = button_reverse_arc.clone();
            g_layer.addChild(button_reverse_arc);
        }

        obj.inner_cutouts = [];
        for (var i = inner_cutouts.length; i--;) {
            obj.inner_cutouts[i] = inner_cutouts[i].clone();
            g_layer.addChild(inner_cutouts[i]);
        }
        sketch.drawCutoutsText(inner_cutouts, 1, FONT_LINES, 0);

        if (cut_width !== undefined) {
            obj.cut_width = cut_width.clone();
            g_layer.addChild(cut_width);
        }

        if (cut_length !== undefined) {
            obj.cut_length = cut_length.clone();
            g_layer.addChild(cut_length);
        }

        if (cut_pos_line1 !== undefined) {
            obj.cut_pos_line1 = cut_pos_line1.clone();
            g_layer.addChild(cut_pos_line1);
        }

        if (cut_pos_line2 !== undefined) {
            obj.cut_pos_line2 = cut_pos_line2.clone();
            g_layer.addChild(cut_pos_line2);
        }

        obj.inner_cutout_bool = inner_cutout_bool;

        for (var i = text_points.length; i--;) {
            if (text_points[i].data.circle !== undefined) {
                g_layer.addChild(text_points[i].data.circle);
            }
        }
    }


    function resize_wall_begin() {
        document.getElementById('comma').disabled = true;
        document.getElementById('comma2').disabled = true;
        var count_fix = 0;
        for (var i = lines_sort.length; i--;) {
            if (lines_sort[i].data.arc) {
                lines_sort[i].data.fixed = true;
                count_fix++;
            } else {
                break;
            }
        }
        var all_walls_arcs = true;
        for (var key = 0, l_k; key < lines_sort.length; key++) {
            l_k = lines_sort[key];
            if (!l_k.data.fixed) {
                if (l_k.data.arc) {
                    sketch.connectAllSegments(lines_sort, diags);
                    l_k.strokeColor = 'green';
                    change_length(l_k, l_k.data.og_length, key);
                    count_fix++;
                    continue;
                }
                if (arcs_arr.length === 1 && draw_step === 2 && count_fix === lines_sort.length - 1) {
                    l_k.data.fixed = true;
                    l_k.strokeColor = 'green';
                    break;
                }
                all_walls_arcs = false;
                elem_window.style.display = 'block';
                resize_canvas();
                elem_newLength.focus();
                current_input_length = new Decimal(l_k.length).toFixed(1) - 0; /*Math.round(l_k.length);*/
                elem_newLength.value = current_input_length;
                elem_newLength.select();
                first_click = false;
                l_k.strokeColor = 'red';
                l_k.data.text.fillColor = 'Maroon';
                timer_mig = setInterval(migalka, 500, l_k);
                return;
            }
        }
        if (all_walls_arcs) {
            ok_enter_all();
        }
    }

    function change_length(line, length, text_point_index) {
        var rez_lines = sketch.linesOnLine(line, lines),
            oldLength = line.length, length = length - 0,
            Dx, Dy, coef, smez_wall0, smez_wall1, line2, line3, cp1, cp2, point_s, point_sn, point_s2, point_s3,
            newPoint,
            point_s_old, point_s2_old, smes, lx, ly;

        for (var key in rez_lines) {
            if (sketch.comparePoints(line.segments[0].point, rez_lines[key].segments[0].point, HALF)
                || sketch.comparePoints(line.segments[0].point, rez_lines[key].segments[1].point, HALF)) {
                smez_wall0 = rez_lines[key];
            }
            if (sketch.comparePoints(line.segments[1].point, rez_lines[key].segments[0].point, HALF)
                || sketch.comparePoints(line.segments[1].point, rez_lines[key].segments[1].point, HALF)) {
                smez_wall1 = rez_lines[key];
            }
        }
        if (!smez_wall0.data.fixed && !smez_wall1.data.fixed) {
            if (line.segments[0].point.x > line.segments[1].point.x) {
                line2 = smez_wall0;
                point_s = line.segments[0].point;
                point_sn = line.segments[1].point;
            } else {
                line2 = smez_wall1;
                point_s = line.segments[1].point;
                point_sn = line.segments[0].point;
            }
        } else if (!smez_wall0.data.fixed) {
            line2 = smez_wall0;
            point_s = line.segments[0].point;
            point_sn = line.segments[1].point;
        } else if (!smez_wall1.data.fixed) {
            line2 = smez_wall1;
            point_s = line.segments[1].point;
            point_sn = line.segments[0].point;
        } else {
            //треугольник

            line2 = smez_wall0;
            point_s = line.segments[0].point;
            cp1 = line.segments[1].point;

            for (var i in line2.segments) {
                if (!sketch.comparePoints(line2.segments[i].point, point_s, HALF)) {
                    cp2 = line2.segments[i].point;
                }
            }

            var intersections = sketch.getCirclesIntersections(cp1.x, cp1.y, length, cp2.x, cp2.y, line2.length);

            if (!intersections || line2.data.arc) {
                line2 = smez_wall1;
                point_s = line.segments[1].point;
                cp1 = line.segments[0].point;

                for (var i = line2.segments.length; i--;) {
                    if (!sketch.comparePoints(line2.segments[i].point, point_s, HALF)) {
                        cp2 = line2.segments[i].point;
                    }
                }

                intersections = sketch.getCirclesIntersections(cp1.x, cp1.y, length, cp2.x, cp2.y, line2.length);
                if (!intersections || line2.data.arc) {
                    if (lines_sort.length < 4) {
                        new Noty(noty_nl).show();
                        return false;
                    }

                    var start_index, o_p, len, rotate_lines = [], old_angle, new_angle;

                    for (var i = lines_sort.length; i--;) {
                        if (lines_sort[i] === line) {
                            start_index = i;
                            if (i - 1 < 0) {
                                line2 = lines_sort[lines_sort.length - 1];
                            } else {
                                line2 = lines_sort[i - 1];
                            }
                            if (sketch.comparePoints(line.segments[0].point, line2.segments[0].point, HALF) ||
                                sketch.comparePoints(line.segments[0].point, line2.segments[1].point, HALF)) {
                                point_s = line.segments[0].point;
                                cp1 = line.segments[1].point;
                            } else {
                                point_s = line.segments[1].point;
                                cp1 = line.segments[0].point;
                            }
                            for (var j = line2.segments.length; j--;) {
                                if (!sketch.comparePoints(line2.segments[j].point, point_s, HALF)) {
                                    cp2 = line2.segments[j].point;
                                }
                            }
                            break;
                        }
                    }

                    for (var i = start_index - 1, ls_i, ls_next; true; i--) {
                        if (i < 0) {
                            i = lines_sort.length - 1;
                        }
                        if (i === start_index) {
                            break;
                        }
                        ls_i = lines_sort[i];
                        if (i > 0) {
                            ls_next = lines_sort[i - 1];
                        } else {
                            ls_next = lines_sort[lines_sort.length - 1];
                        }
                        if (ls_i.data.arc && ls_next.data.arc && ls_i.data.draw_step === ls_next.data.draw_step) {
                            rotate_lines.push(ls_i);
                            continue;
                        }
                        o_p = sketch.commonPoint(ls_i, ls_next);
                        len = sketch.getLengthBetweenPoints(o_p, point_s);
                        intersections = sketch.getCirclesIntersections(o_p.x, o_p.y, len, cp1.x, cp1.y, length);
                        rotate_lines.push(ls_i);
                        if (intersections) {
                            old_angle = sketch.getAngle(o_p, point_s);
                            new_angle = sketch.getAngle(o_p, sketch.getNearestDistancePoint(point_s, intersections));
                            for (var j = rotate_lines.length; j--;) {
                                rotate_lines[j].rotate(new_angle - old_angle, o_p);
                            }
                            break;
                        }
                    }
                    rotate_lines = [];
                    sketch.drawLinesText(lines, 1, FONT_LINES, 0);
                    sketch.moveVertexNamesLinesSort(lines_sort, text_points);
                    if (!intersections) {
                        new Noty(noty_nl).show();
                        return false;
                    }
                }
            }

            newPoint = sketch.getNearestDistancePoint(point_s, intersections);

            sketch.moveVertexName(line, line2, newPoint, text_points);

            line.removeSegments();
            line.addSegments([cp1, newPoint]);
            line2.removeSegments();
            line2.addSegments([newPoint, cp2]);

            line.data.fixed = true;
            sketch.addTextLine(line, 1, FONT_LINES, 0);
            sketch.addTextLine(line2, 1, FONT_LINES, 0);

            return true;
        }

        rez_lines = sketch.linesOnLine(line2, lines);
        for (var key in rez_lines) {
            if ((sketch.comparePoints(line2.segments[0].point, rez_lines[key].segments[0].point, HALF)
                || sketch.comparePoints(line2.segments[0].point, rez_lines[key].segments[1].point, HALF))
                && !sketch.comparePoints(line2.segments[0].point, point_s, HALF)) {
                line3 = rez_lines[key];
                point_s2 = line2.segments[0].point;
            }
            if ((sketch.comparePoints(line2.segments[1].point, rez_lines[key].segments[0].point, HALF)
                || sketch.comparePoints(line2.segments[1].point, rez_lines[key].segments[1].point, HALF))
                && !sketch.comparePoints(line2.segments[1].point, point_s, HALF)) {
                line3 = rez_lines[key];
                point_s2 = line2.segments[1].point;
            }
        }

        if (!sketch.comparePoints(line3.segments[0].point, point_s2, HALF)) {
            point_s3 = line3.segments[0].point;
        } else if (!sketch.comparePoints(line3.segments[1].point, point_s2, HALF)) {
            point_s3 = line3.segments[1].point;
        }

        point_s_old = point_s;
        point_s2_old = point_s2;

        //косая

        if (sketch.getLineOrientation(line) === null) {
            if (!sketch.comparePoints(point_s, line.segments[0].point, HALF)) {
                cp1 = line.segments[0].point;
            }
            if (!sketch.comparePoints(point_s, line.segments[1].point, HALF)) {
                cp1 = line.segments[1].point;
            }
            if (!sketch.comparePoints(point_s, line2.segments[0].point, HALF)) {
                cp2 = line2.segments[0].point;
            }
            if (!sketch.comparePoints(point_s, line2.segments[1].point, HALF)) {
                cp2 = line2.segments[1].point;
            }

            coef = line.data.coef_wall_kos;

            if (coef === undefined) {
                line.data.razv_wall_kos = {p1: cp1.clone(), p2: point_s.clone()};
                var chis = new Decimal(new Decimal(line.segments[1].point.y).minus(line.segments[0].point.y)),
                    znam = new Decimal(new Decimal(line.segments[1].point.x).minus(line.segments[0].point.x));
                coef = chis.dividedBy(znam);
            }

            var dec_length = new Decimal(length);

            Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
            Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();

            if (line.data.razv_wall_kos.p1.x > line.data.razv_wall_kos.p2.x) {
                Dx = new Decimal(-1).times(Dx).toNumber();
            }
            if (line.data.razv_wall_kos.p1.y > line.data.razv_wall_kos.p2.y) {
                Dy = new Decimal(-1).times(Dy).toNumber();
            }

            newPoint = new Point(new Decimal(cp1.x).plus(Dx).toNumber(), new Decimal(cp1.y).plus(Dy).toNumber());

            if (sketch.getLineOrientation(line2) === 'v' && !line3.data.fixed) {
                if (sketch.getLineOrientation(line3) === null) {
                    var chis = new Decimal(new Decimal(line3.segments[1].point.y).minus(line3.segments[0].point.y)),
                        znam = new Decimal(new Decimal(line3.segments[1].point.x).minus(line3.segments[0].point.x));
                    line3.data.coef_wall_kos = chis.dividedBy(znam);
                    if (sketch.comparePoints(cp2, line3.segments[0].point, HALF)) {
                        line3.data.razv_wall_kos = {
                            p1: line3.segments[0].point.clone(),
                            p2: line3.segments[1].point.clone()
                        };
                    } else {
                        line3.data.razv_wall_kos = {
                            p1: line3.segments[1].point.clone(),
                            p2: line3.segments[0].point.clone()
                        };
                    }
                }
                cp2 = new Point(newPoint.x, cp2.y);
            } else if (sketch.getLineOrientation(line2) === 'h' && !line3.data.fixed) {
                if (sketch.getLineOrientation(line3) === null) {
                    var chis = new Decimal(new Decimal(line3.segments[1].point.y).minus(line3.segments[0].point.y)),
                        znam = new Decimal(new Decimal(line3.segments[1].point.x).minus(line3.segments[0].point.x));
                    line3.data.coef_wall_kos = chis.dividedBy(znam);
                    if (sketch.comparePoints(cp2, line3.segments[0].point, HALF)) {
                        line3.data.razv_wall_kos = {
                            p1: line3.segments[0].point.clone(),
                            p2: line3.segments[1].point.clone()
                        };
                    } else {
                        line3.data.razv_wall_kos = {
                            p1: line3.segments[1].point.clone(),
                            p2: line3.segments[0].point.clone()
                        };
                    }
                }
                cp2 = new Point(cp2.x, newPoint.y);
            } else {
                var chis = new Decimal(new Decimal(line2.segments[1].point.y).minus(line2.segments[0].point.y)),
                    znam = new Decimal(new Decimal(line2.segments[1].point.x).minus(line2.segments[0].point.x));
                line2.data.coef_wall_kos = chis.dividedBy(znam);
                line2.data.razv_wall_kos = {p1: point_s.clone(), p2: cp2.clone()};
            }

            if (cp2.x > point_s.x && cp2.x < newPoint.x
                || cp2.y > point_s.y && cp2.y < newPoint.y
                || cp2.x < point_s.x && cp2.x > newPoint.x
                || cp2.y < point_s.y && cp2.y > newPoint.y) {
                line2.data.razv_wall = true;
            }
            if (cp2.x > point_s3.x && point_s2_old.x < point_s3.x
                || cp2.y > point_s3.y && point_s2_old.y < point_s3.y
                || cp2.x < point_s3.x && point_s2_old.x > point_s3.x
                || cp2.y < point_s3.y && point_s2_old.y > point_s3.y) {
                line3.data.razv_wall = true;
            }

            line.removeSegments();
            line.addSegments([cp1, newPoint]);
            line2.removeSegments();
            line2.addSegments([newPoint, cp2]);

            line.data.fixed = true;
            sketch.addTextLine(line, 1, FONT_LINES, 0);
            sketch.addTextLine(line2, 1, FONT_LINES, 0);
            sketch.moveVertexName(line, line2, newPoint, text_points);
            if (sketch.getLineOrientation(line2) !== null && !line3.data.fixed) {
                line3.removeSegments();
                line3.addSegments([cp2, point_s3]);
                sketch.addTextLine(line3, 1, FONT_LINES, 0);
                sketch.moveVertexName(line2, line3, cp2, text_points);
            }
            return true;
        }


        var chis = new Decimal(new Decimal(line.segments[1].point.y).minus(line.segments[0].point.y)),
            znam = new Decimal(new Decimal(line.segments[1].point.x).minus(line.segments[0].point.x));
        coef = chis.dividedBy(znam);

        var dec_length = new Decimal(length).minus(line.length);

        Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
        Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();


        if (point_s.y < point_sn.y || point_s.x < point_sn.x) {
            smes = '<';
        } else if (point_s.y > point_sn.y || point_s.x > point_sn.x) {
            smes = '>';
        }

        lx = 0;
        ly = 0;
        if (line.data.razv_wall) {
            if (point_sn.x === point_s.x) {
                ly = line.length;
                lx = 0;
            } else if (point_sn.y === point_s.y) {
                lx = line.length;
                ly = 0;
            }
            dec_length = new Decimal(length);

            Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
            Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();
            if (smes === '<') {
                smes = '>';
            } else if (smes === '>') {
                smes = '<';
            }
        }

        if (smes === '>') {
            point_s = new Point(new Decimal(point_s.x).plus(Dx).plus(lx).toNumber(), new Decimal(point_s.y).plus(Dy).plus(ly).toNumber());
            point_s2 = new Point(new Decimal(point_s2.x).plus(Dx).plus(lx).toNumber(), new Decimal(point_s2.y).plus(Dy).plus(ly).toNumber());
        } else if (smes === '<') {
            point_s = new Point(new Decimal(point_s.x).minus(Dx).minus(lx).toNumber(), new Decimal(point_s.y).minus(Dy).minus(ly).toNumber());
            point_s2 = new Point(new Decimal(point_s2.x).minus(Dx).minus(lx).toNumber(), new Decimal(point_s2.y).minus(Dy).minus(ly).toNumber());
        }

        if (point_s2.x > point_s3.x && point_s2_old.x < point_s3.x
            || point_s2.y > point_s3.y && point_s2_old.y < point_s3.y
            || point_s2.x < point_s3.x && point_s2_old.x > point_s3.x
            || point_s2.y < point_s3.y && point_s2_old.y > point_s3.y) {
            line3.data.razv_wall = true;
        }

        line.removeSegments();
        line.addSegments([point_sn, point_s]);
        if (!line3.data.fixed && sketch.getLineOrientation(line2) !== null) {
            line2.removeSegments();
            line2.addSegments([point_s, point_s2]);

            var chis = new Decimal(new Decimal(line3.segments[1].point.y).minus(line3.segments[0].point.y)),
                znam = new Decimal(new Decimal(line3.segments[1].point.x).minus(line3.segments[0].point.x));
            line3.data.coef_wall_kos = chis.dividedBy(znam);
            line3.data.razv_wall_kos = {p1: point_s2_old.clone(), p2: point_s3.clone()};

            line3.removeSegments();
            line3.addSegments([point_s2, point_s3]);
            sketch.addTextLine(line3, 1, FONT_LINES, 0);
            sketch.moveVertexName(line2, line3, point_s2, text_points);
        } else {
            if (line2.data.coef_wall_kos === undefined) {
                var chis = new Decimal(new Decimal(line2.segments[1].point.y).minus(line2.segments[0].point.y)),
                    znam = new Decimal(new Decimal(line2.segments[1].point.x).minus(line2.segments[0].point.x));
                line2.data.coef_wall_kos = chis.dividedBy(znam);
                line2.data.razv_wall_kos = {p1: point_s_old.clone(), p2: point_s2_old.clone()};
            }
            line2.removeSegments();
            line2.addSegments([point_s, point_s2_old]);
        }
        line.data.fixed = true;
        sketch.addTextLine(line, 1, FONT_LINES, 0);
        sketch.addTextLine(line2, 1, FONT_LINES, 0);
        sketch.moveVertexName(line, line2, point_s, text_points);
        return true;
    }

    function triangulator() {
        for (var i = diags.length; i--;) {
            diags[i].remove();
        }
        diags = [];
        diag_sort = [];
        g_points = sketch.getPathsPointsBySort(lines_sort);

        var ctx1, ctx2, ctx3, d, vertices = [], triangles_points,
            chertezh = new Path({
                segments: g_points,
                closed: true
            });

        vertices[0] = [];

        for (var key = lines_sort.length, ls_k, ls_next, op, step; key--;) {
            ls_k = lines_sort[key];
            if (key === 0) {
                ls_next = lines_sort[lines_sort.length - 1];
            } else {
                ls_next = lines_sort[key - 1];
            }
            op = sketch.commonPoint(ls_k, ls_next);
            vertices[0].push([op.x, op.y]);
            if (ls_k.data.draw_step !== ls_next.data.draw_step && ls_k.data.arc && ls_next.data.arc) {
                if (vertices[ls_k.data.draw_step + 1] === undefined) {
                    vertices[ls_k.data.draw_step + 1] = [];
                }
                vertices[ls_k.data.draw_step + 1].push([op.x, op.y]);
                if (vertices[ls_next.data.draw_step + 1] === undefined) {
                    vertices[ls_next.data.draw_step + 1] = [];
                }
                vertices[ls_next.data.draw_step + 1].push([op.x, op.y]);
            } else if (ls_k.data.arc || ls_next.data.arc) {
                if (ls_k.data.arc) {
                    step = ls_k.data.draw_step + 1;
                } else {
                    step = ls_next.data.draw_step + 1;
                }
                if (vertices[step] === undefined) {
                    vertices[step] = [];
                }
                vertices[step].push([op.x, op.y]);
            }
        }

        vertices = vertices.filter(function (n) {
            return n != undefined;
        });

        for (var key = vertices.length, v_k; key--;) {
            v_k = vertices[key];
            triangles_points = Delaunay.triangulate(v_k);

            for (var i = triangles_points.length; i;) {
                --i;
                ctx1 = new Point(v_k[triangles_points[i]][0], v_k[triangles_points[i]][1]);
                --i;
                ctx2 = new Point(v_k[triangles_points[i]][0], v_k[triangles_points[i]][1]);
                --i;
                ctx3 = new Point(v_k[triangles_points[i]][0], v_k[triangles_points[i]][1]);
                d = Path.Line(ctx1, ctx2);
                if (key !== 0) {
                    d.strokeColor = 'green';
                    d.data.fixed = true;
                } else {
                    d.strokeColor = 'black';
                }
                d.strokeWidth = DIAG_WIDTH;
                diags.push(d);

                d = Path.Line(ctx2, ctx3);
                if (key !== 0) {
                    d.strokeColor = 'green';
                    d.data.fixed = true;
                } else {
                    d.strokeColor = 'black';
                }
                d.strokeWidth = DIAG_WIDTH;
                diags.push(d);

                d = Path.Line(ctx1, ctx3);
                if (key !== 0) {
                    d.strokeColor = 'green';
                    d.data.fixed = true;
                } else {
                    d.strokeColor = 'black';
                }
                d.strokeWidth = DIAG_WIDTH;
                diags.push(d);
            }
        }

        chertezh.remove();

        for (var i = diags.length; i--;) {
            if (!good_diag(diags[i])) {
                diags[i].remove();
                diags.splice(i, 1);
            }
        }
    }

    function pulemet() {
        var count = 0, op, d;
        for (var i = diags.length; i--;) {
            var hitResults0 = project.hitTestAll(diags[i].segments[0].point, {
                class: Path,
                segments: true,
                tolerance: 2
            });
            var hitResults1 = project.hitTestAll(diags[i].segments[1].point, {
                class: Path,
                segments: true,
                tolerance: 2
            });
            count = 0;
            for (var key0 = hitResults0.length; key0--;) {
                if (sketch.compareLines(hitResults0[key0].item, diags[i]) || hitResults0[key0].item.segments.length !== 2) {
                    continue;
                }
                for (var key1 = hitResults1.length; key1--;) {
                    if (!sketch.compareLines(hitResults1[key1].item, diags[i]) && hitResults1[key1].item.segments.length === 2) {
                        op = sketch.commonPoint(hitResults0[key0].item, hitResults1[key1].item);
                        if (op !== null) {
                            count++;
                        }
                    }
                }
            }

            if (count !== 2) {
                for (var key = g_points.length; key--;) {
                    if (!sketch.comparePoints(diags[i].segments[0].point, g_points[key], HALF) && !sketch.comparePoints(diags[i].segments[1].point, g_points[key], HALF)) {
                        d = Path.Line(diags[i].segments[0].point, g_points[key]);
                        if (good_diag(d)) {
                            d.strokeColor = 'black';
                            d.strokeWidth = DIAG_WIDTH;
                            diags.push(d);
                            break;
                        } else {
                            d.remove();
                            d = Path.Line(diags[i].segments[1].point, g_points[key]);
                            if (good_diag(d)) {
                                d.strokeColor = 'black';
                                d.strokeWidth = DIAG_WIDTH;
                                diags.push(d);
                                break;
                            } else {
                                d.remove();
                            }
                        }
                    }
                }
            }
        }
    }

    function good_diag(diag_i) {
        var diag_i_seg0 = diag_i.segments[0].point,
            diag_i_seg1 = diag_i.segments[1].point;
        g_points = sketch.getPathsPointsBySort(lines_sort);

        var chertezh = new Path();
        for (var key = g_points.length; key--;) {
            chertezh.add(g_points[key]);
        }

        chertezh.closed = true;

        if (!chertezh.contains(diag_i.position)) {
            chertezh.remove();
            g_layer.addChildren(lines_sort);
            sketch.bringToFrontLinesText(lines);

            for (var key in text_points) {
                text_points[key].bringToFront();
                if (text_points[key].data.circle !== undefined) {
                    text_points[key].data.circle.bringToFront();
                }
            }
            return false;
        }

        chertezh.remove();
        g_layer.addChildren(lines_sort);

        sketch.bringToFrontLinesText(lines);

        for (var key in text_points) {
            text_points[key].bringToFront();
            if (text_points[key].data.circle !== undefined) {
                text_points[key].data.circle.bringToFront();
            }
        }

        for (var key = lines_sort.length, ls_k, ls_k_s0, ls_k_s1; key--;) {
            ls_k = lines_sort[key];
            ls_k_s0 = ls_k.segments[0].point;
            ls_k_s1 = ls_k.segments[1].point;

            if (sketch.isIntersect(diag_i_seg0, diag_i_seg1, ls_k_s0, ls_k_s1)) {
                return false;
            }
            if (diag_i.contains(ls_k_s0) && diag_i.contains(ls_k_s1)) {
                return false;
            }
            if (ls_k.contains(diag_i_seg0) && ls_k.contains(diag_i_seg1)) {
                return false;
            }
            if (sketch.comparePoints(ls_k_s0, diag_i_seg0, HALF)
                && sketch.comparePoints(ls_k_s1, diag_i_seg1, HALF)
                || sketch.comparePoints(ls_k_s0, diag_i_seg1, HALF)
                && sketch.comparePoints(ls_k_s1, diag_i_seg0, HALF)) {
                return false;
            }
        }

        for (var key = diags.length, d_k, d_k_s0, d_k_s1; key--;) {
            d_k = diags[key];
            d_k_s0 = d_k.segments[0].point;
            d_k_s1 = d_k.segments[1].point;
            if (diag_i === d_k) {
                continue;
            }
            if (sketch.isIntersect(diag_i_seg0, diag_i_seg1, d_k_s0, d_k_s1)) {
                return false;
            }
            if (diag_i.contains(d_k_s0) && diag_i.contains(d_k_s1)) {
                return false;
            }
            if (d_k.contains(diag_i_seg0) && d_k.contains(diag_i_seg1)) {
                return false;
            }
            if (sketch.comparePoints(d_k_s0, diag_i_seg0, HALF)
                && sketch.comparePoints(d_k_s1, diag_i_seg1, HALF)
                || sketch.comparePoints(d_k_s0, diag_i_seg1, HALF)
                && sketch.comparePoints(d_k_s1, diag_i_seg0, HALF)) {
                return false;
            }
        }

        return true;
    }


    function polotno_final(gradus_f, j_f, kolvo_poloten, p_usadki) {
        g_layer.addChildren(lines_sort);
        g_layer.addChildren(diag_sort);
        for (var i = lines_sort.length, l_i; i--;) {
            l_i = lines_sort[i];
            l_i.rotate(gradus_f, view.center);
        }
        for (var i = diag_sort.length, d_i; i--;) {
            d_i = diag_sort[i];
            d_i.rotate(gradus_f, view.center);
        }
        for (var i = inner_cutouts.length; i--;) {
            inner_cutouts[i].rotate(gradus_f, view.center);
        }
        sketch.connectAllSegments(lines_sort, diags);
        g_points = sketch.getPathsPointsBySort(lines_sort);
        angle_final = -gradus_f;

        var draft = new Path({segments: g_points, closed: true});
        for (var i = inner_cutouts.length; i--;) {
            draft.remove();
            draft = draft.subtract(inner_cutouts[i]);
        }

        sketch.toCut(widthsOfCanvases[j_f].width, p_usadki, draft, draft.bounds.bottom, polotna, inner_cutouts);

        draft.remove();

        sketch.drawLinesText(lines_sort, p_usadki, FONT_LINES, 1);
        sketch.drawLinesText(diag_sort, p_usadki, FONT_DIAGS, 1);
        sketch.drawCutoutsText(inner_cutouts, p_usadki, FONT_LINES, 1);

        sketch.moveVertexNamesLinesSort(lines_sort, text_points);

        ////console.log((new Decimal(1).minus(p_usadki)).times(100).toNumber(), '%');

        koordinats_poloten = sketch.getCoordinatesCanvases(p_usadki, polotna, text_points, code, alfavit);

        var sq_obr = 0, sq_polo = 0;
        for (var key = polotna.length, p_k, p_k_pol, p_k_par, p_k_cut; key--;) {
            p_k = polotna[key];
            p_k_pol = p_k.material;
            p_k_par = p_k.parts;
            p_k_cut = p_k.cuts;

            p_k_pol.strokeColor = 'red';
            p_k_pol.fillColor = null;
            p_k_pol.dashArray = [10, 4];
            p_k_pol.opacity = 1;

            g_layer.addChild(p_k_par);
            p_k_par.strokeColor = null;
            p_k_par.fillColor = 'green';
            p_k_par.dashArray = [];
            p_k_par.opacity = 0.3;

            p_k_cut.strokeColor = null;
            p_k_cut.fillColor = 'red';
            p_k_cut.dashArray = [];
            p_k_cut.opacity = 0.2;

            if (p_k_cut.children !== undefined) {
                for (var key2 = p_k_cut.children.length; key2--;) {
                    sq_obr = new Decimal(Math.abs(p_k_cut.children[key2].area)).plus(sq_obr).toNumber();
                }
            } else {
                sq_obr = new Decimal(Math.abs(p_k_cut.area)).plus(sq_obr).toNumber();
            }

            sq_polo = new Decimal(Math.abs(p_k_pol.area)).plus(sq_polo).toNumber();
        }

        sq_obr = new Decimal(sq_obr).times(p_usadki).times(p_usadki).toNumber();
        sq_polo = new Decimal(sq_polo).times(p_usadki).times(p_usadki).toNumber();
        sq_obr = new Decimal(sq_obr).dividedBy(ONE_M_SQ).toNumber();
        sq_polo = new Decimal(sq_polo).dividedBy(ONE_M_SQ).toNumber();

        width_final = widthsOfCanvases[j_f].width;
        final_canvas_id = widthsOfCanvases[j_f].id;
        sq_polotna = sq_polo;
        p_usadki_final = p_usadki;
        square_obrezkov = sq_obr;
    }

    var polotnoCloth = function () {
        var draft, draftBounds, sourceDraft, points_m, j_f,
            sq_material, temp_price, price_min, gradus_f;

        price_min = Number.MAX_SAFE_INTEGER;
        g_points = sketch.getPathsPointsBySort(lines_sort);
        sourceDraft = new Path({segments: g_points, closed: true});

        for (var angle_rotate = 0; angle_rotate < 360; angle_rotate++) {
            sourceDraftBounds = sourceDraft.bounds;
            draft = new Path({
                segments: [
                    new Point(new Decimal(sourceDraftBounds.left).minus(15).toNumber(),
                        new Decimal(sourceDraftBounds.top).minus(15).toNumber()),
                    new Point(new Decimal(sourceDraftBounds.right).plus(15).toNumber(),
                        new Decimal(sourceDraftBounds.top).minus(15).toNumber()),
                    new Point(new Decimal(sourceDraftBounds.right).plus(15).toNumber(),
                        new Decimal(sourceDraftBounds.bottom).plus(15).toNumber()),
                    new Point(new Decimal(sourceDraftBounds.left).minus(15).toNumber(),
                        new Decimal(sourceDraftBounds.bottom).plus(15).toNumber())
                ],
                closed: true
            });
            g_layer.addChild(draft);

            for (var j = widthsOfCanvases.length; j--;) {
                stripsCount = sketch.toCut(widthsOfCanvases[j].width, 1, draft, draft.bounds.bottom, polotna, []);
                if (stripsCount === 1) {
                    sq_material = 0;
                    for (var key = polotna.length; key--;) {
                        sq_material = new Decimal(sq_material).plus(polotna[key].material.area).toNumber();
                    }
                    temp_price = new Decimal(widthsOfCanvases[j].price).times(sq_material).toNumber();
                    if (temp_price < price_min) {
                        price_min = temp_price;
                        gradus_f = angle_rotate;
                        j_f = j;
                    }
                }
            }
            draft.remove();
            sourceDraft.rotate(1, view.center);
        }

        if (gradus_f === undefined || j_f === undefined) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Для потолка нет необходимых полотен!"
            }).show();
            return;
        }

        sourceDraft.rotate(gradus_f, view.center);
        sourceDraftBounds = sourceDraft.bounds;
        draft = new Path({
            segments: [
                new Point(new Decimal(sourceDraftBounds.left).minus(15).toNumber(),
                    new Decimal(sourceDraftBounds.top).minus(15).toNumber()),
                new Point(new Decimal(sourceDraftBounds.right).plus(15).toNumber(),
                    new Decimal(sourceDraftBounds.top).minus(15).toNumber()),
                new Point(new Decimal(sourceDraftBounds.right).plus(15).toNumber(),
                    new Decimal(sourceDraftBounds.bottom).plus(15).toNumber()),
                new Point(new Decimal(sourceDraftBounds.left).minus(15).toNumber(),
                    new Decimal(sourceDraftBounds.bottom).plus(15).toNumber())
            ],
            closed: true
        });

        g_layer.addChild(draft);
        angle_final = -gradus_f;

        sketch.toCut(widthsOfCanvases[j_f].width, 1, draft, draft.bounds.bottom, polotna, []);

        var kx, ky, tempTextPoints = [];
        koordinats_poloten = [];
        koordinats_poloten[0] = [];
        for (var i = 0; i < 4; i++) {
            tempTextPoints.push(new PointText({
                point: new Point(draft.segments[i].point.x - DIST_TP_X, draft.segments[i].point.y - DIST_TP_Y),
                content: String.fromCharCode(i + 65),
                fillColor: 'blue',
                justification: 'center',
                fontFamily: 'lucida console',
                fontWeight: 'bold',
                fontSize: 14
            }));
            kx = new Decimal(draft.segments[i].point.x).minus(polotna[0].material.bounds.left).toNumber();
            ky = new Decimal(polotna[0].material.bounds.bottom).minus(draft.segments[i].point.y).toNumber();
            if (kx < 0) {
                kx = 0;
            }
            if (ky < 0) {
                ky = 0;
            }
            kx = kx.toFixed(1) - 0;
            ky = ky.toFixed(1) - 0;
            koordinats_poloten[0].push({name: String.fromCharCode(i + 65), koordinats: '(' + kx + '; ' + ky + ')'});
        }

        var sq_obr = 0, sq_polo = 0;
        for (var key = polotna.length, p_k, p_k_pol, p_k_par, p_k_cut; key--;) {
            p_k = polotna[key];
            p_k_pol = p_k.material;
            p_k_par = p_k.parts;
            p_k_cut = p_k.cuts;

            p_k_pol.strokeColor = 'red';
            p_k_pol.fillColor = null;
            p_k_pol.dashArray = [10, 4];
            p_k_pol.opacity = 1;

            g_layer.addChild(p_k_par);
            p_k_par.strokeColor = null;
            p_k_par.fillColor = 'green';
            p_k_par.dashArray = [];
            p_k_par.opacity = 0.3;

            p_k_cut.strokeColor = null;
            p_k_cut.fillColor = 'red';
            p_k_cut.dashArray = [];
            p_k_cut.opacity = 0.2;

            if (p_k_cut.children !== undefined) {
                for (var key2 = p_k_cut.children.length; key2--;) {
                    sq_obr = new Decimal(Math.abs(p_k_cut.children[key2].area)).plus(sq_obr).toNumber();
                }
            } else {
                sq_obr = new Decimal(Math.abs(p_k_cut.area)).plus(sq_obr).toNumber();
            }
            sq_polo = new Decimal(Math.abs(p_k_pol.area)).plus(sq_polo).toNumber();
        }

        sq_obr = new Decimal(sq_obr).toNumber();
        sq_polo = new Decimal(sq_polo).toNumber();
        sq_obr = new Decimal(sq_obr).dividedBy(ONE_M_SQ).toNumber();
        sq_polo = new Decimal(sq_polo).dividedBy(ONE_M_SQ).toNumber();

        width_final = widthsOfCanvases[j_f].width;
        final_canvas_id = widthsOfCanvases[j_f].id;
        sq_polotna = sq_polo;
        p_usadki_final = 1;
        square_obrezkov = sq_obr;

        draft.strokeColor = 'green';
        draft.strokeWidth = LINE_WIDTH;
        sourceDraft.strokeColor = 'gray';
        sourceDraft.strokeWidth = LINE_WIDTH;
        for (var i = text_points.length; i--;) {
            text_points[i].remove();
        }
        for (var i = lines_sort.length; i--;) {
            //lines_sort[i].strokeColor = 'gray';
            //lines_sort[i].strokeWidth = 1;
            lines_sort[i].remove();
        }
        for (var i = diag_sort.length; i--;) {
            diag_sort[i].remove();
        }
    };

    var polotno = function () {
        var time_end, time_start = performance.now();
        var gradus_f, j_f, break_bool = false, kolvo_poloten = 1, height_chert, j_n, p_usadki, h, hp;
        var sq_material, temp_price, price_min, usadka_final;
        var view_center = view.center, minY, maxY, stripsCount;

        g_points = sketch.getPathsPointsBySort(lines_sort);
        g_layer.removeChildren();
        var draft = new Path({segments: g_points, closed: true});
        for (var i = inner_cutouts.length; i--;) {
            g_layer.addChild(inner_cutouts[i]);
        }
        for (var i = inner_cutouts.length; i--;) {
            draft.remove();
            draft = draft.subtract(inner_cutouts[i]);
        }
        g_layer.addChild(draft);

        var draftSegments;
        if (draft.children !== undefined) {
            var maxArea = draft.children[0].area;
            draftSegments = draft.children[0].segments;
            for (var i = draft.children.length; i--;) {
                if (draft.children[i].area > maxArea) {
                    maxArea = draft.children[i].area;
                    draftSegments = draft.children[i].segments;
                }
            }
        } else {
            draftSegments = draft.segments;
        }

        while (true) {
            price_min = Number.MAX_SAFE_INTEGER;
            usadka_final = 0;
            altAngles = [];
            for (var angle_rotate = 0; angle_rotate < 360; angle_rotate = new Decimal(angle_rotate).plus(0.2).toNumber()) {
                minY = draft.bounds.top;
                maxY = draft.bounds.bottom;
                h = maxY - minY;
                height_chert = (h * STANDART_SHRINK_PERCENT) / kolvo_poloten;
                j_n = widthsOfCanvases.length - 1;
                for (var j = 0; j < widthsOfCanvases.length; j++) {
                    if (widthsOfCanvases[j].width < height_chert) {
                        j_n = j;
                        break;
                    }
                }

                for (var j = j_n + 1; j--;) {
                    hp = new Decimal(kolvo_poloten).times(widthsOfCanvases[j].width);
                    p_usadki = new Decimal(h).minus(hp);
                    p_usadki = p_usadki.times(100);
                    p_usadki = p_usadki.dividedBy(h);
                    p_usadki = p_usadki.times(10).toNumber();
                    p_usadki = Math.ceil(p_usadki);
                    p_usadki = new Decimal(p_usadki).dividedBy(10);
                    p_usadki = new Decimal(100).minus(p_usadki);
                    p_usadki = p_usadki.dividedBy(100);
                    p_usadki = p_usadki.minus(0.001).toNumber();
                    if (p_usadki > STANDART_SHRINK_PERCENT) {
                        p_usadki = STANDART_SHRINK_PERCENT;
                    } else if (p_usadki < 0.91) {
                        continue;
                    }

                    ////console.log(kolvo_poloten, widthsOfCanvases[j].width, angle_rotate);
                    stripsCount = sketch.toCut(widthsOfCanvases[j].width, p_usadki, draft, maxY, polotna, inner_cutouts);

                    if (stripsCount === kolvo_poloten) {
                        sq_material = 0;
                        for (var key = polotna.length; key--;) {
                            sq_material = new Decimal(sq_material).plus(polotna[key].material.area).toNumber();
                        }
                        sq_material = new Decimal(sq_material).times(p_usadki).times(p_usadki).toNumber();
                        sq_material = new Decimal(sq_material).dividedBy(ONE_M_SQ).toNumber();
                        temp_price = new Decimal(widthsOfCanvases[j].price).times(sq_material).toNumber();
                        ////console.log(kolvo_poloten, angle_rotate, widthsOfCanvases[j], sq_material, temp_price);
                        if (temp_price < price_min) {
                            price_min = temp_price;
                            gradus_f = angle_rotate;
                            j_f = j;
                            usadka_final = p_usadki;
                            break_bool = true;
                            ////console.log(kolvo_poloten, angle_rotate, usadka_final, price_min, widthsOfCanvases[j], sq_material);
                        }
                        var len = draftSegments.length;
                        for (var l = len, s_ly, s_l1y; l--;) {
                            s_ly = draftSegments[l % len].point.y;
                            s_l1y = draftSegments[(l + 1) % len].point.y;
                            if (sketch.approximatelyEqual(maxY, s_ly, 1.5) &&
                                sketch.approximatelyEqual(maxY, s_l1y, 1.5)) {
                                altAngles.push({
                                    angle: angle_rotate,
                                    price: temp_price,
                                    num_width: j,
                                    shrinkage: p_usadki
                                });
                            }
                        }
                        /*sq_obr = 0;
					for (var key = polotna.length, p_k_cut; key--;) {
						p_k_cut = polotna[key].cuts;
						if (p_k_cut.children !== undefined) {
							for (var key2 = p_k_cut.children.length; key2--;) {
								sq_obr = new Decimal(Math.abs(p_k_cut.children[key2].area)).plus(sq_obr).toNumber();
							}
						} else {
							sq_obr = new Decimal(Math.abs(p_k_cut.area)).plus(sq_obr).toNumber();
						}
					}
					////console.log(sq_obr, angle_rotate);
					if ((widthsOfCanvases[j].price < price_min) || (widthsOfCanvases[j].price === price_min && sq_obr < sq_min)) {
						price_min = widthsOfCanvases[j].price;
						sq_min = sq_obr;
						gradus_f = angle_rotate;
						j_f = j;
						usadka_final = p_usadki;
						break_bool = true;
						////console.log(kolvo_poloten, price_min, sq_min, usadka_final, widthsOfCanvases[j].width, angle_rotate);
					}*/

                        if (polotna[polotna.length - 1].material.bounds.top < minY) {
                            break;
                        }
                    }
                }

                draft.rotate(0.2, view_center);
                for (var i = inner_cutouts.length; i--;) {
                    inner_cutouts[i].rotate(1, view_center);
                }
            }

            if (break_bool) {
                break;
            }
            kolvo_poloten++;
        }

        draft.remove();
        sketch.connectAllSegments(lines_sort, diags);
        ////console.log(gradus_f, inner_cutouts);

        ////console.log(price_min, gradus_f, altAngles);
        for (var i = altAngles.length; i--;) {
            if (altAngles[i].price < price_min + PRICE_TOLERANCE) {
                ////console.log(i, altAngles[i]);
                price_min = altAngles[i].price - PRICE_TOLERANCE;
                gradus_f = altAngles[i].angle;
                j_f = altAngles[i].num_width;
                usadka_final = altAngles[i].shrinkage;
            }
        }
        ////console.log(price_min, gradus_f);
        polotno_final(gradus_f, j_f, kolvo_poloten, usadka_final);
        ////console.log(square_obrezkov);
        time_end = performance.now() - time_start;
        ////console.log(time_end, 'polotno_time');
    };

    function change_length_diag_4angle(index, newLength) {
        var Dx, Dy;

        var pd0 = diag_sort[index].segments[0].point.clone();
        var pd1 = diag_sort[index].segments[1].point.clone();
        var a1, b1, a2, b2, c, temp, intersections, coef;
        var line_arr = [];
        var newPoint, newObshayaPoint1, newObshayaPoint2, oldObshayaPoint1, oldObshayaPoint2;
        c = diag_sort[index];

        for (var i in lines) {
            for (var j in lines) {
                if (sketch.commonPoint(lines[i], lines[j]) !== null && lines[i] !== lines[j]) {
                    if (!sketch.comparePoints(sketch.commonPoint(lines[i], lines[j]), pd0, HALF) && !sketch.comparePoints(sketch.commonPoint(lines[i], lines[j]), pd1, HALF)) {
                        line_arr = [];
                        for (var key in lines) {
                            line_arr.push(lines[key]);
                        }
                        a1 = lines[i];
                        b1 = lines[j];
                        line_arr.splice(line_arr.indexOf(a1), 1);
                        line_arr.splice(line_arr.indexOf(b1), 1);
                    }
                }
            }
        }
        a2 = line_arr[0];
        b2 = line_arr[1];

        line_arr = [];
        if (sketch.comparePoints(a1.segments[0].point, pd0, HALF) || sketch.comparePoints(a1.segments[1].point, pd0, HALF)) {
            temp = a1;
            a1 = b1;
            b1 = temp;
        }
        if (sketch.comparePoints(a2.segments[0].point, pd0, HALF) || sketch.comparePoints(a2.segments[1].point, pd0, HALF)) {
            temp = a2;
            a2 = b2;
            b2 = temp;
        }

        var chis = new Decimal(new Decimal(c.segments[1].point.y).minus(c.segments[0].point.y)),
            znam = new Decimal(new Decimal(c.segments[1].point.x).minus(c.segments[0].point.x));
        coef = chis.dividedBy(znam);

        var dec_length = new Decimal(newLength);

        Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
        Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();

        if (pd1.x > pd0.x) {
            Dx = -Dx;
        }
        if (pd1.y > pd0.y) {
            Dy = -Dy;
        }
        newPoint = new Point(pd1.x + Dx, pd1.y + Dy);

        //1 треугольник

        intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b1.length, pd1.x, pd1.y, a1.length);

        if (!intersections || a1.length + b1.length <= +newLength) {
            new Noty(noty_nl).show();
            return;
        }

        oldObshayaPoint1 = sketch.commonPoint(a1, b1).clone();
        var len_0 = Path.Line(oldObshayaPoint1, intersections[0]);
        var len_1 = Path.Line(oldObshayaPoint1, intersections[1]);
        if (len_0.length < len_1.length) {
            newObshayaPoint1 = intersections[0];
        } else {
            newObshayaPoint1 = intersections[1];
        }
        len_0.remove();
        len_1.remove();

        //2 треугольник

        intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b2.length, pd1.x, pd1.y, a2.length);

        if (!intersections || a2.length + b2.length <= +newLength) {
            new Noty(noty_nl).show();
            return;
        }

        oldObshayaPoint2 = sketch.commonPoint(a2, b2).clone();
        var len_0 = Path.Line(oldObshayaPoint2, intersections[0]);
        var len_1 = Path.Line(oldObshayaPoint2, intersections[1]);
        if (len_0.length < len_1.length) {
            newObshayaPoint2 = intersections[0];
        } else {
            newObshayaPoint2 = intersections[1];
        }
        len_0.remove();
        len_1.remove();

        a1.removeSegments();
        a1.addSegments([pd1, newObshayaPoint1]);
        b1.removeSegments();
        b1.addSegments([newObshayaPoint1, newPoint]);
        sketch.addTextLine(a1, 1, FONT_LINES, 0);
        sketch.addTextLine(b1, 1, FONT_LINES, 0);

        sketch.moveVertexName(a1, b1, newObshayaPoint1, text_points);

        a2.removeSegments();
        a2.addSegments([pd1, newObshayaPoint2]);
        b2.removeSegments();
        b2.addSegments([newObshayaPoint2, newPoint]);
        sketch.addTextLine(a2, 1, FONT_LINES, 0);
        sketch.addTextLine(b2, 1, FONT_LINES, 0);

        sketch.moveVertexName(a2, b2, newObshayaPoint2, text_points);

        c.removeSegments();
        c.addSegments([newPoint, pd1]);
        sketch.addTextLine(diag_sort[index], 1, FONT_DIAGS, 1);
        sketch.moveVertexName(b1, b2, newPoint, text_points);
        diag_sort[index].data.fixed = true;
    }

    function click_on_fixed(line) {
        for (var key = lines_sort.length, l_k; key--;) {
            l_k = lines_sort[key];
            l_k.data.fixed = true;
            l_k.strokeColor = 'green';
            l_k.data.text.fillColor = 'black';
        }
        for (var key = diag_sort.length; key--;) {
            diag_sort[key].data.fixed = true;
            diag_sort[key].strokeColor = 'green';
            diag_sort[key].data.text.fillColor = 'black';
        }
        triangulate_bool = true;
        line.data.fixed = false;
        clearInterval(timer_mig);
        for (var key = 0, l_k; key < lines_sort.length; key++) {
            l_k = lines_sort[key];
            if (!l_k.data.fixed) {
                l_k.strokeColor = 'black';
                l_k.data.text.fillColor = 'black';
            }
        }

        for (var key = 0; key < diag_sort.length; key++) {
            if (!diag_sort[key].data.fixed) {
                diag_sort[key].strokeColor = 'black';
                diag_sort[key].data.text.fillColor = 'black';
            }
        }

        ready = false;
        elem_window.style.display = 'block';
        resize_canvas();

        if (line.data.is_wall) {
            for (var key = 0; key < diag_sort.length; key++) {
                diag_sort[key].remove();
                diag_sort[key].data.text.remove();
            }
            diags = [];
            diag_sort = [];
            triangulate_bool = false;
            triangulate_rezhim = 0;

            for (var key = 0; key < lines_sort.length, l_k; key++) {
                l_k = lines_sort[key];
                if (!l_k.data.fixed) {
                    elem_preloader.style.display = 'none';
                    l_k.strokeColor = 'red';
                    l_k.data.text.fillColor = 'Maroon';
                    timer_mig = setInterval(migalka, 500, l_k);
                    elem_newLength.focus();
                    elem_newLength.value = Math.round(l_k.length);
                    elem_newLength.select();
                    first_click = false;
                    save_cancel();
                    return;
                }
            }
        } else {
            for (var key = 0; key < diag_sort.length; key++) {
                if (!diag_sort[key].data.fixed) {
                    elem_preloader.style.display = 'none';
                    diag_sort[key].strokeColor = 'red';
                    diag_sort[key].data.text.fillColor = 'Maroon';
                    timer_mig = setInterval(migalka, 500, diag_sort[key]);
                    elem_newLength.focus();
                    elem_newLength.value = new Decimal(diag_sort[key].length).toFixed(1);
                    elem_newLength.select();
                    first_click = false;
                    save_cancel();
                    return;
                }
            }
        }
    }

    var change_length_all_diags = function () {
        try {
            for (var key = text_manual_diags.length; key--;) {
                text_manual_diags[key].remove();
                text_manual_diags[key] = undefined;
            }
            text_manual_diags = [];
            diag_sortirovka();
            triangulate_bool = true;
            for (var key = text_points.length; key--;) {
                text_points[key].data.circle.remove();
                text_points[key].data.circle = undefined;
            }
            for (var key = 0; key < diag_sort.length; key++) {
                if (lines.length > 4) {
                    change_length_diag(key, diag_sort[key].data.unfixed_length, false);
                } else {
                    change_length_diag_4angle(key, diag_sort[key].data.unfixed_length, false);
                }
            }
            triangulate_rezhim = 0;
            elem_input_n4.value = sketch.getArea(lines_sort, inner_cutouts);
            if (elem_input_n4.value < 0.1) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Слишком маленькая площадь!"
                }).show();
            }
            ready = true;
            sketch.alignCenter();
            sketch.zoomOut(borderLines, lines, changeTextAfterZoom);
            elem_preloader.style.display = 'none';
        } catch (e) {
            elem_preloader.style.display = 'none';
            cancelLastAction();
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Ошибка"
            }).show();
        }
    };

    function validationLength(initial_length, min, max) {
        var regexp = /^[\d]+[\.]{0,1}[\d]*$/;
        if (!regexp.test(elem_newLength.value)) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "warning",
                text: "Невозможно преобразовать в число"
            }).show();
            elem_newLength.focus();
            elem_newLength.value = new Decimal(initial_length).toFixed(1);
            elem_newLength.select();
            first_click = false;
            return false;
        }
        if (elem_newLength.value < min) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: 'warning',
                text: 'Слишком маленькая длина! (MIN = ' + min + ')'
            }).show();
            elem_newLength.focus();
            elem_newLength.value = new Decimal(initial_length).toFixed(1);
            elem_newLength.select();
            first_click = false;
            return false;
        }
        if (elem_newLength.value > max) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: 'warning',
                text: 'Слишком большая длина! (MAX = ' + max + ')'
            }).show();
            elem_newLength.focus();
            elem_newLength.value = new Decimal(initial_length).toFixed(1);
            elem_newLength.select();
            first_click = false;
            return false;
        }
        return true;
    }

    function eventsButtonReverseArc() {
        button_reverse_arc.onMouseDown = function () {
            line_arc_height.rotate(180, line_arc_bottom.position);
            last_point_in_circle = line_arc_height.segments[1].point.clone();
            arc.remove();
            arc = new Path.Arc(line_arc_bottom.segments[0].point, last_point_in_circle, line_arc_bottom.segments[1].point);
            arc.strokeColor = 'blue';
            arc.strokeWidth = LINE_WIDTH;
            button_reverse_arc.position = line_arc_height.position;
        };
        button_reverse_arc.onMouseEnter = function () {
            button_reverse_arc.fillColor = 'darkgrey';
        };
        button_reverse_arc.onMouseLeave = function () {
            button_reverse_arc.fillColor = 'grey';
        };
    }

    function change_length_last_arc(op, p1, new_length) {
        var current_draw_step, bool_op = false, rotate_lines = [], p2, intersections, new_op, cir;
        for (var i = lines.length; i--;) {
            l_i = lines[i];
            if (current_draw_step !== l_i.data.draw_step) {
                if (bool_op) {
                    break;
                } else {
                    rotate_lines = [];
                }
            }
            current_draw_step = l_i.data.draw_step;
            rotate_lines.push(l_i);
            if (sketch.comparePoints(op, l_i.segments[0].point, HALF) || sketch.comparePoints(op, l_i.segments[1].point, HALF)) {
                if (l_i.data.arc) {
                    bool_op = true;
                } else {
                    rotate_lines = [l_i];
                    if (sketch.comparePoints(op, l_i.segments[0].point, HALF)) {
                        p2 = l_i.segments[1].point;
                    } else {
                        p2 = l_i.segments[0].point;
                    }
                    break;
                }
            } else if (l_i.data.arc_edge_segment_num !== undefined) {
                p2 = l_i.segments[l_i.data.arc_edge_segment_num].point;
            }
        }

        intersections = sketch.getCirclesIntersections(p1.x, p1.y, new_length, p2.x, p2.y, sketch.getLengthBetweenPoints(op, p2));
        if (!intersections) {
            return false;
        }
        new_op = sketch.getNearestDistancePoint(op, intersections);
        for (var i = rotate_lines.length; i--;) {
            rotate_lines[i].rotate(new Decimal(sketch.getAngle(p2, new_op)).minus(sketch.getAngle(p2, op)).toNumber(), p2);
        }
        cir = getCircleUnderPoint(op);
        cir.position = new_op;
        return new_op;
    }

    function ok_enter_all() {
        if (manual_diag !== undefined) {
            if (!validationLength(manual_diag.length, 2, 8000)) {
                return;
            }
            var lengthValue = parseFloat(elem_newLength.value) || 0;
            if (isNaN(lengthValue)) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "error",
                    text: "Невозможно преобразовать в число"
                }).show();
                return;
            }
            manual_diag.data.unfixed_length = lengthValue;
            manual_diag.strokeColor = 'green';
            diags.push(manual_diag);
            addTextUnfixedLengthDiag(diags.length - 1);
            manual_diag = undefined;
            elem_window.style.display = 'none';
            resize_canvas();
            if (diags.length === lines.length - 3) {
                elem_preloader.style.display = 'block';
                setTimeout(change_length_all_diags, 20);
                ready = true;
            }
            save_cancel();
            return;
        }
        if (line_arc_height !== undefined && !line_arc_height.data.fixed) {
            if (!validationLength(line_arc_height.length, 5, 8000)) {
                return;
            }
            clearInterval(timer_mig);
            button_reverse_arc.remove();
            button_reverse_arc = undefined;
            var lengthValue = parseFloat(elem_newLength.value) || 0;
            if (isNaN(lengthValue)) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "error",
                    text: "Невозможно преобразовать в число"
                }).show();
                return;
            }
            var dec_length = new Decimal(lengthValue), Dx, Dy,
                coef = new Decimal(sketch.getAngleCoef(line_arc_height)),
                p_s1 = line_arc_height.segments[1].point,
                p_s0 = line_arc_height.segments[0].point;

            Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
            Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();
            if (p_s0.x > p_s1.x) {
                Dx = new Decimal(-1).times(Dx).toNumber();
            }
            if (p_s0.y > p_s1.y) {
                Dy = new Decimal(-1).times(Dy).toNumber();
            }
            p_s1 = new Point(new Decimal(p_s0.x).plus(Dx).toNumber(),
                new Decimal(p_s0.y).plus(Dy).toNumber());
            line_arc_height.removeSegments();
            line_arc_height.addSegments([p_s0, p_s1]);
            line_arc_height.data.fixed = true;
            line_arc_height.strokeColor = 'black';

            arc.remove();
            arc = new Path.Arc(arc.firstSegment.point, p_s1, arc.lastSegment.point);
            arc.strokeColor = 'blue';
            arc.strokeWidth = LINE_WIDTH;
            line_arc_bottom.remove();
            line_arc_height.remove();
            line_arc_bottom = undefined;
            line_arc_height = undefined;
            elem_window.style.display = 'none';
            resize_canvas();
            splitArc();
            return;
        }
        if (line_arc_bottom !== undefined && !line_arc_bottom.data.fixed) {
            if (!validationLength(line_arc_bottom.length, 20, 8000)) {
                return;
            }
            clearInterval(timer_mig);
            last_point_in_circle = arc.getPointAt(arc.length / 2);

            var lengthValue = parseFloat(elem_newLength.value) || 0;
            if (isNaN(lengthValue)) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "error",
                    text: "Невозможно преобразовать в число"
                }).show();
                return;
            }
            var dec_length = new Decimal(lengthValue), Dx, Dy,
                coef = new Decimal(sketch.getAngleCoef(line_arc_bottom)),
                p_s1 = line_arc_bottom.segments[1].point,
                p_s0 = line_arc_bottom.segments[0].point,
                old_length = line_arc_bottom.length, new_op, intersections,
                coef_size = new Decimal(elem_newLength.value - 0).dividedBy(old_length).toNumber(),
                length_chorda = sketch.getLengthBetweenPoints(p_s0, last_point_in_circle) * coef_size,
                length_height = sketch.getLengthBetweenPoints(line_arc_bottom.position, last_point_in_circle) * coef_size;

            if (line_arc_bottom.data.last_line && arcs_arr.length > 0) {
                if (arcs_arr.length !== 1 || draw_step !== 1) {
                    if (new_op = change_length_last_arc(p_s0, p_s1, elem_newLength.value - 0)) {
                        p_s0 = new_op;
                        start_draw_point = p_s0;
                    } else if (new_op = change_length_last_arc(p_s1, p_s0, elem_newLength.value - 0)) {
                        p_s1 = new_op;
                    } else {
                        new Noty(noty_nl).show();
                        elem_newLength.focus();
                        elem_newLength.value = line_arc_bottom.length.toFixed(1);
                        elem_newLength.select();
                        first_click = false;
                        return;
                    }
                }
            } else {
                Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
                Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();
                if (p_s0.x > p_s1.x) {
                    Dx = new Decimal(-1).times(Dx).toNumber();
                }
                if (p_s0.y > p_s1.y) {
                    Dy = new Decimal(-1).times(Dy).toNumber();
                }
                p_s1 = new Point(new Decimal(p_s0.x).plus(Dx).toNumber(),
                    new Decimal(p_s0.y).plus(Dy).toNumber());
            }
            line_arc_bottom.removeSegments();
            line_arc_bottom.addSegments([p_s0, p_s1]);
            line_arc_bottom.data.fixed = true;
            line_arc_bottom.strokeColor = 'black';

            intersections = sketch.getCirclesIntersections(line_arc_bottom.position.x, line_arc_bottom.position.y, length_height,
                p_s0.x, p_s0.y, length_chorda);
            if (sketch.getLengthBetweenPoints(intersections[0], last_point_in_circle) < sketch.getLengthBetweenPoints(intersections[1], last_point_in_circle)) {
                last_point_in_circle = intersections[0];
            } else {
                last_point_in_circle = intersections[1];
            }

            arc.remove();
            arc = new Path.Arc(p_s0, last_point_in_circle, p_s1);
            arc.strokeColor = 'blue';
            arc.strokeWidth = LINE_WIDTH;

            line_arc_height = new Path.Line(line_arc_bottom.position, arc.getPointAt(arc.length / 2));
            line_arc_height.strokeWidth = DIAG_WIDTH;
            line_arc_height.strokeColor = 'red';

            button_reverse_arc = new Path.Circle(line_arc_height.position, 5);
            button_reverse_arc.fillColor = 'grey';
            eventsButtonReverseArc();
            ///////////////////////////////////////////////////
            if (arcs_arr.length === 0) {
                var chertezh = new CompoundPath();
                var arr_circles_lines = [];
                for (var i = lines.length, cir; i--;) {
                    chertezh.addChild(lines[i]);
                    cir = getCircleUnderPoint(lines[i].segments[0].point);
                    if (cir !== null && sketch.comparePoints(cir.position, lines[i].segments[0].point, HALF)) {
                        arr_circles_lines.push({point: lines[i].segments[0].point, circle: cir});
                        //continue;
                    }
                    cir = getCircleUnderPoint(lines[i].segments[1].point);
                    if (cir !== null && sketch.comparePoints(cir.position, lines[i].segments[1].point, HALF)) {
                        arr_circles_lines.push({point: lines[i].segments[1].point, circle: cir});
                        //continue;
                    }
                }
                chertezh.scale(coef_size, p_s0);
                g_layer.addChildren(lines);
                chertezh.remove();

                for (var i = arr_circles_lines.length; i--;) {
                    arr_circles_lines[i].circle.position = arr_circles_lines[i].point;
                }
            }
            ///////////////////////////////////////////

            elem_newLength.focus();
            elem_newLength.value = line_arc_height.length.toFixed(1);
            elem_newLength.select();
            first_click = false;
            timer_mig = setInterval(migalka, 500, line_arc_height);
            save_cancel();
            return;
        }

        if (cut_pos_line1 !== undefined && !cut_pos_line1.data.fixed) {
            if (!validationLength(cut_pos_line1.length, 20, 1500)) {
                return;
            }
            clearInterval(timer_mig);

            var l_s0 = cutout_line.segments[0].point, l_s1 = cutout_line.segments[1].point,
                len = elem_newLength.value - 0, len2 = len, cutout = inner_cutouts[inner_cutouts.length - 1];

            if (len < cut_pos_line1.length) {
                len2 = cut_pos_line1.length + (cut_pos_line1.length - len);
            }
            var intersections = sketch.getCirclesIntersections(l_s0.x, l_s0.y, len, l_s1.x, l_s1.y, len2);

            if (!intersections) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Недопустимая длина!"
                }).show();
                return;
            }

            if (sketch.getLengthBetweenPoints(cutout.position, intersections[0]) < sketch.getLengthBetweenPoints(cutout.position, intersections[1])) {
                pos = intersections[0];
            } else {
                pos = intersections[1];
            }

            cut_pos_line1.remove();
            cut_pos_line2.remove();

            cut_pos_line1 = new Path.Line({
                segments: [l_s0, pos],
                strokeWidth: DIAG_WIDTH,
                strokeColor: 'black'
            });

            cut_pos_line2 = new Path.Line({
                segments: [l_s1, pos],
                strokeWidth: DIAG_WIDTH,
                strokeColor: 'black'
            });

            cutout.position = pos;
            cut_length.position = pos;
            cut_width.position = pos;

            cut_pos_line1.data.fixed = true;

            resize_canvas();
            elem_newLength.focus();
            current_input_length = new Decimal(cut_pos_line2.length).toFixed(1) - 0;
            elem_newLength.value = current_input_length;
            elem_newLength.select();
            first_click = false;
            cut_pos_line2.strokeColor = 'red';
            timer_mig = setInterval(migalka, 500, cut_pos_line2);
            save_cancel();
            return;
        }

        if (cut_pos_line2 !== undefined && !cut_pos_line2.data.fixed) {
            if (!validationLength(cut_pos_line2.length, 20, 1500)) {
                return;
            }
            clearInterval(timer_mig);

            var l_s0 = cutout_line.segments[0].point, l_s1 = cutout_line.segments[1].point,
                len = elem_newLength.value - 0, cutout = inner_cutouts[inner_cutouts.length - 1],
                intersections = sketch.getCirclesIntersections(l_s0.x, l_s0.y, cut_pos_line1.length, l_s1.x, l_s1.y, len);

            if (!intersections) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Недопустимая длина!"
                }).show();
                return;
            }

            if (sketch.getLengthBetweenPoints(cutout.position, intersections[0]) < sketch.getLengthBetweenPoints(cutout.position, intersections[1])) {
                pos = intersections[0];
            } else {
                pos = intersections[1];
            }

            cut_pos_line1.remove();
            cut_pos_line2.remove();

            cutout.position = pos;

            cut_length.remove();
            cut_width.remove();

            cut_pos_line1 = undefined;
            cut_pos_line2 = undefined;
            cut_length = undefined;
            cut_width = undefined;

            resize_canvas();
            elem_window.style.display = 'none';
            resize_canvas();
            cutout_line.strokeColor = 'green';
            cutout.strokeColor = 'DarkGreen';
            cutout_line.data.cutout_line = false;
            cutout_line = undefined;
            inner_cutout_bool = false;

            g_points = sketch.getPathsPointsBySort(lines_sort);
            var chertezh = new Path({
                segments: g_points,
                closed: true
            });

            if (!chertezh.contains(cutout.position)) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Недопустимое расположение!"
                }).show();
                cancelLastAction();
                return;
            }

            for (var i = lines_sort.length; i--;) {
                if (lines_sort[i].intersects(cutout)) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Недопустимое расположение!"
                    }).show();
                    cancelLastAction();
                    return;
                }
            }

            for (var i = inner_cutouts.length; i--;) {
                if (inner_cutouts[i] === cutout) {
                    continue;
                }
                if (inner_cutouts[i].intersects(cutout) || inner_cutouts[i].contains(cutout.position)) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Недопустимое расположение!"
                    }).show();
                    cancelLastAction();
                    return;
                }
            }
            chertezh.remove();
            cutout.flatten(2);
            elem_input_n4.value = sketch.getArea(lines_sort, inner_cutouts);

            ////console.log(inner_cutouts);
            save_cancel();
            return;
        }

        if (cut_length !== undefined && !cut_length.data.fixed) {
            if (!validationLength(cut_length.length, 20, 1500)) {
                return;
            }
            clearInterval(timer_mig);
            inner_cutouts[inner_cutouts.length - 1].remove();
            inner_cutouts.splice(inner_cutouts.length - 1, 1);
            inner_cutouts.push(drawInnerCutoutFigureToCenter(cutout_line, 40, elem_newLength.value - 0));
            cut_length.data.fixed = true;

            resize_canvas();
            elem_newLength.focus();
            current_input_length = new Decimal(cut_width.length).toFixed(1) - 0;
            elem_newLength.value = current_input_length;
            elem_newLength.select();
            first_click = false;
            cut_width.strokeColor = 'red';
            timer_mig = setInterval(migalka, 500, cut_width);
            save_cancel();
            return;
        }

        if (cut_width !== undefined && !cut_width.data.fixed) {
            if (!validationLength(cut_width.length, 20, 1500)) {
                return;
            }
            clearInterval(timer_mig);
            inner_cutouts[inner_cutouts.length - 1].remove();
            inner_cutouts.splice(inner_cutouts.length - 1, 1);
            var cutout = drawInnerCutoutFigureToCenter(cutout_line, elem_newLength.value - 0, cut_length.length);
            inner_cutouts.push(cutout);
            cut_width.data.fixed = true;

            var l_s0 = cutout_line.segments[0].point, l_s1 = cutout_line.segments[1].point,
                pos = cutout.position;

            cut_pos_line1 = new Path.Line({
                segments: [l_s0, pos],
                strokeWidth: DIAG_WIDTH,
                strokeColor: 'black'
            });

            cut_pos_line2 = new Path.Line({
                segments: [l_s1, pos],
                strokeWidth: DIAG_WIDTH,
                strokeColor: 'black'
            });

            resize_canvas();
            elem_newLength.focus();
            current_input_length = new Decimal(cut_pos_line1.length).toFixed(1) - 0;
            elem_newLength.value = current_input_length;
            elem_newLength.select();
            first_click = false;
            cut_pos_line1.strokeColor = 'red';
            timer_mig = setInterval(migalka, 500, cut_pos_line1);
            save_cancel();
            return;
        }

        var kol_fix = 0;
        for (var key = lines_sort.length; key--;) {
            if (lines_sort[key].data.fixed) {
                kol_fix++;
            }
        }
        if ((kol_fix === lines_sort.length || kol_fix === lines_sort.length - 1) &&
            !triangulate_bool && triangulate_rezhim === 1) {
            elem_preloader.style.display = 'block';
            setTimeout(ok_enter, 20);
        } else {
            ok_enter();
        }
        if (elem_popup2.style.display === 'block') {
            setTimeout(function () {
                document.getElementById('triangulate_auto').focus();
            }, 200);
        }
    }

    var ok_enter = function () {
        if (ready) {
            return;
        }
        ready = false;
        var k, str_length;
        
        // Если elem_newLength.value пустое, но есть current_input_length, используем его
        if (!elem_newLength.value || elem_newLength.value.trim() === '') {
            if (current_input_length !== undefined) {
                str_length = current_input_length;
                elem_newLength.value = current_input_length;
            } else if (triangulate_bool && diag_sort && diag_sort.length > 0) {
                // Пытаемся получить значение из первой незафиксированной диагонали
                for (var i = 0; i < diag_sort.length; i++) {
                    if (!diag_sort[i].data.fixed) {
                        str_length = new Decimal(diag_sort[i].length).toFixed(1) - 0;
                        current_input_length = str_length;
                        elem_newLength.value = str_length;
                        break;
                    }
                }
                if (str_length === undefined) {
                    str_length = 0;
                }
            } else {
                str_length = 0;
            }
        } else {
            str_length = parseFloat(elem_newLength.value) || 0;
        }
        
        if (isNaN(str_length) || str_length === 0) {
            new Noty({
                theme: 'relax',
                timeout: 2000,
                layout: 'topCenter',
                type: "error",
                text: "Невозможно преобразовать в число"
            }).show();
            return;
        }
        if (!validationLength(current_input_length, 2, 8000)) {
            return;
        }
        clearInterval(timer_mig);
        if (triangulate_bool) {
            for (var key = 0; key < diag_sort.length; key++) {
                if (!diag_sort[key].data.fixed) {
                    k = text_points.length;
                    if (k !== 4) {
                        change_length_diag(key, str_length, false);
                    } else {
                        change_length_diag_4angle(key, str_length, false);
                    }
                    break;
                }
            }
            for (var key = 0; key < diag_sort.length; key++) {
                if (diag_sort[key].data.fixed) {
                    diag_sort[key].strokeColor = 'green';
                } else {
                    elem_preloader.style.display = 'none';
                    diag_sort[key].strokeColor = 'red';
                    diag_sort[key].data.text.fillColor = 'Maroon';
                    timer_mig = setInterval(migalka, 500, diag_sort[key]);
                    elem_newLength.focus();
                    current_input_length = new Decimal(diag_sort[key].length).toFixed(1) - 0;
                    elem_newLength.value = current_input_length;
                    elem_newLength.select();
                    first_click = false;
                    sketch.alignCenter();
                    sketch.zoomOut(borderLines, lines, changeTextAfterZoom);
                    save_cancel();
                    return;
                }
            }
            elem_input_n4.value = sketch.getArea(lines_sort, inner_cutouts);
            if (elem_input_n4.value < 0.1) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Слишком маленькая площадь!"
                }).show();
            }
            elem_window.style.display = 'none';
            resize_canvas();

            ready = true;
            save_cancel();
        } else {
            sketch.connectAllSegments(lines_sort, diags);
            var good_change = false;
            for (var key = 0; key < lines_sort.length; key++) {
                if (!lines_sort[key].data.fixed) {
                    good_change = change_length(lines_sort[key], str_length, key);
                    break;
                }
            }
            for (var key = 0, l_k; key < lines_sort.length; key++) {
                l_k = lines_sort[key];
                if (l_k.data.fixed) {
                    l_k.strokeColor = 'green';
                } else {
                    if (l_k.data.arc) {
                        l_k.strokeColor = 'green';
                        change_length(l_k, l_k.data.og_length, key);
                        continue;
                    }
                    elem_preloader.style.display = 'none';
                    l_k.strokeColor = 'red';
                    l_k.data.text.fillColor = 'Maroon';
                    timer_mig = setInterval(migalka, 500, l_k);
                    elem_newLength.focus();
                    current_input_length = new Decimal(l_k.length).toFixed(1) - 0; /*Math.round(l_k.length);*/
                    elem_newLength.value = current_input_length;
                    elem_newLength.select();
                    first_click = false;
                    sketch.alignCenter();
                    sketch.zoomOut(borderLines, lines, changeTextAfterZoom);
                    if (good_change) {
                        save_cancel();
                    }
                    return;
                }
            }

            g_points = sketch.getPathsPointsBySort(lines_sort);
            var vertices_count = g_points.length;

            elem_input_n9.value = sketch.getAngles(lines, inner_cutouts);
            elem_input_n5.value = sketch.getPerimeter(lines);

            document.getElementById('comma').disabled = false;
            document.getElementById('comma2').disabled = false;

            if (sketch.getArea(lines_sort, inner_cutouts) < 0.1) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Слишком маленькая площадь!"
                }).show();
            }

            if (lines_sort.length === 3) {
                triangulate_rezhim = 1;
            }

            if (triangulate_rezhim === 0) {
                for (var i = diags.length; i--;) {
                    diags[i].remove();
                    if (diags[i].data.text !== undefined) {
                        diags[i].data.text.remove();
                    }
                }
                diags = [];
                diag_sort = [];
                elem_popup2.style.display = 'block';
                elem_window.style.display = 'none';
                resize_canvas();
                return;
            } else if (triangulate_rezhim === 1) {
                var count_fixed_lines = 0,
                    count_lines = lines.length;
                for (var key = lines.length; key--;) {
                    if (lines[key].data.fixed) {
                        count_fixed_lines++;
                    }
                }

                if (count_lines === count_fixed_lines) {
                    triangulator();
                    if (diags.length < vertices_count - 3) {
                        for (var key = lines.length; key--;) {
                            pulemet();
                            ////console.log('pulemet');
                            if (diags.length === vertices_count - 3) {
                                break;
                            }
                        }
                    }
                    if (diags.length !== vertices_count - 3) {
                        new Noty({
                            theme: 'relax',
                            timeout: 2000,
                            layout: 'topCenter',
                            type: "warning",
                            text: "Ошибка в построении диагоналей"
                        }).show();

                        elem_preloader.style.display = 'none';
                        //cancelLastAction();
                        return;
                    }
                } else {
                    elem_preloader.style.display = 'none';
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Ошибка"
                    }).show();
                    return;
                }
                diag_sortirovka();

                sketch.alignCenter();
                sketch.zoomOut(borderLines, lines, changeTextAfterZoom);
                sketch.connectAllSegments(lines_sort, diags);

                for (var i = 0, find_first_change = false; i < diag_sort.length; i++) {
                    sketch.addTextLine(diag_sort[i], 1, FONT_DIAGS, 1);
                    if (!find_first_change && !diag_sort[i].data.fixed) {
                        find_first_change = true;
                        diag_sort[i].strokeColor = 'red';
                        diag_sort[i].data.text.fillColor = 'Maroon';
                        timer_mig = setInterval(migalka, 500, diag_sort[i]);
                        current_input_length = new Decimal(diag_sort[i].length).toFixed(1) - 0;
                    }
                }
                if (lines_sort.length > 3) {
                    triangulate_bool = true;
                    if (current_input_length === undefined) {
                        // Устанавливаем значение первой незафиксированной диагонали в elem_newLength
                        for (var i = 0; i < diag_sort.length; i++) {
                            if (!diag_sort[i].data.fixed) {
                                current_input_length = new Decimal(diag_sort[i].length).toFixed(1) - 0;
                                elem_newLength.value = current_input_length;
                                elem_newLength.focus();
                                elem_newLength.select();
                                break;
                            }
                        }
                        ok_enter_all();
                        return;
                    }
                    elem_newLength.focus();
                    elem_newLength.value = current_input_length;
                    elem_newLength.select();
                    first_click = false;
                } else {
                    var a = 0, b = 0, c = 0, p = 0, s = 0;
                    a = lines_sort[0].length;
                    b = lines_sort[1].length;
                    c = lines_sort[2].length;
                    p = (a + b + c) / 2;
                    s = Math.sqrt(p * (p - a) * (p - b) * (p - c));
                    s = s / ONE_M_SQ;
                    elem_input_n4.value = s.toFixed(2);
                    elem_window.style.display = 'none';
                    resize_canvas();
                    ready = true;
                }
                save_cancel();
            } else {
                elem_window.style.display = 'none';
                resize_canvas();
            }
        }

        elem_preloader.style.display = 'none';
    };

    function diag_sortirovka() {
        var p1, p2;
        for (var i = diags.length; i--;) {
            diags[i].data.countNearWalls = countWallsNearDiag(diags[i]);
            diags[i].data.countNearDiags = countDiagsNearDiag(diags[i]);
        }
        for (var i = 0; i < text_points.length - 2; i++) {
            p1 = new Point(text_points[i].point.x + DIST_TP_X, text_points[i].point.y + DIST_TP_Y);
            for (var j = i + 2; j < text_points.length; j++) {
                p2 = new Point(text_points[j].point.x + DIST_TP_X, text_points[j].point.y + DIST_TP_Y);
                for (var k = diags.length; k--;) {
                    if ((sketch.comparePoints(diags[k].segments[0].point, p1, HALF) || sketch.comparePoints(diags[k].segments[1].point, p1, HALF)) &&
                        (sketch.comparePoints(diags[k].segments[0].point, p2, HALF) || sketch.comparePoints(diags[k].segments[1].point, p2, HALF))) {
                        diag_sort.push(diags[k]);
                        break;
                    }
                }
            }
        }
    }

    function countWallsNearDiag(diag) {
        var count = 0, op;
        var hitResults0 = project.hitTestAll(diag.segments[0].point, {class: Path, segments: true, tolerance: 2});
        var hitResults1 = project.hitTestAll(diag.segments[1].point, {class: Path, segments: true, tolerance: 2});
        for (var key0 = hitResults0.length; key0--;) {
            if (sketch.compareLines(hitResults0[key0].item, diag) || hitResults0[key0].item.segments.length !== 2) {
                continue;
            }
            for (var key1 = hitResults1.length; key1--;) {
                if (!sketch.compareLines(hitResults1[key1].item, diag) && hitResults1[key1].item.segments.length === 2) {
                    op = sketch.commonPoint(hitResults0[key0].item, hitResults1[key1].item);
                    if (op !== null) {
                        if (hitResults0[key0].item.data.is_wall) {
                            count++;
                        }
                        if (hitResults1[key1].item.data.is_wall) {
                            count++;
                        }
                    }
                }
            }
        }
        return count;
    }

    function countDiagsNearDiag(diag) {
        var count = 0, op;
        var hitResults0 = project.hitTestAll(diag.segments[0].point, {class: Path, segments: true, tolerance: 2});
        var hitResults1 = project.hitTestAll(diag.segments[1].point, {class: Path, segments: true, tolerance: 2});
        for (var key0 = hitResults0.length; key0--;) {
            if (sketch.compareLines(hitResults0[key0].item, diag) || hitResults0[key0].item.segments.length !== 2) {
                continue;
            }
            for (var key1 = hitResults1.length; key1--;) {
                if (!sketch.compareLines(hitResults1[key1].item, diag) && hitResults1[key1].item.segments.length === 2) {
                    op = sketch.commonPoint(hitResults0[key0].item, hitResults1[key1].item);
                    if (op !== null) {
                        for (var j = 0; j < diag_sort.length; j++) {
                            if (hitResults0[key0].item.id === diag_sort[j].id) {
                                count++;
                            }
                            if (hitResults1[key1].item.id === diag_sort[j].id) {
                                count++;
                            }
                        }

                    }
                }
            }
        }
        return count;
    }

    function change_length_diag(index, length, rek) {
        var pd0, pd1, pd2, a1, b1, a2, b2, temp, intersections, op, diag_f,
            line_arr = [], points_m, c = diag_sort[index], c_s0 = c.segments[0].point, c_s1 = c.segments[1].point,
            newPoint, newObshayaPoint1, newObshayaPoint2, oldObshayaPoint1, oldObshayaPoint2,
            angle_new1, angle_old1, angle_rotate1, angle_new2, angle_old2, angle_rotate2,
            angle_new3, angle_old3, angle_rotate3, angle_new4, angle_old4, angle_rotate4, angle_new, angle_old,
            angle_rotate,
            part_chert, mass_w, mass_d, mass_w2, mass_d2, mass_w3, mass_d3, mass_w4, mass_d4,
            hitResults0 = project.hitTestAll(c_s0, {class: Path, segments: true, tolerance: 1}),
            hitResults1 = project.hitTestAll(c_s1, {class: Path, segments: true, tolerance: 1});

        if (c.data.countNearWalls === 3) {
            if (hitResults0.length === 3) {
                pd0 = c_s0.clone();
                pd1 = c_s1.clone();
            } else {
                pd0 = c_s1.clone();
                pd1 = c_s0.clone();
            }

            for (var i = lines.length, l_i, l_i_s0, l_i_s1; i--;) {
                l_i = lines[i];
                l_i_s0 = l_i.segments[0].point;
                l_i_s1 = l_i.segments[1].point;
                for (var j = lines.length, l_j, l_j_s0, l_j_s1; j--;) {
                    l_j = lines[j];
                    l_j_s0 = l_j.segments[0].point;
                    l_j_s1 = l_j.segments[1].point;
                    if (sketch.commonPoint(l_i, l_j) !== null && l_i !== l_j) {
                        if (!sketch.comparePoints(sketch.commonPoint(l_i, l_j), pd0, HALF) && !sketch.comparePoints(sketch.commonPoint(l_i, l_j), pd1, HALF)) {
                            if ((sketch.comparePoints(l_i_s0, pd0, HALF) || sketch.comparePoints(l_i_s1, pd0, HALF)
                                || sketch.comparePoints(l_i_s0, pd1, HALF) || sketch.comparePoints(l_i_s1, pd1, HALF))
                                && (sketch.comparePoints(l_j_s0, pd0, HALF) || sketch.comparePoints(l_j_s1, pd0, HALF)
                                    || sketch.comparePoints(l_j_s0, pd1, HALF) || sketch.comparePoints(l_j_s1, pd1, HALF))) {
                                a1 = l_i;
                                b1 = l_j;
                                i = 0;
                                break;
                            }
                        }
                    }
                }
            }

            if (sketch.comparePoints(a1.segments[0].point, pd0, HALF) || sketch.comparePoints(a1.segments[1].point, pd0, HALF)) {
                temp = a1;
                a1 = b1;
                b1 = temp;
            }

            for (var key = lines.length; key--;) {
                if (lines[key] !== a1 && lines[key] !== b1 && sketch.commonPoint(lines[key], b1) !== null) {
                    b2 = lines[key];
                    break;
                }
            }

            for (var key = 0; key < diag_sort.length; key++) {
                if (diag_sort[key] !== c && sketch.commonPoint(diag_sort[key], a1) !== null && sketch.commonPoint(diag_sort[key], b2) !== null) {
                    a2 = diag_sort[key];
                    pd2 = sketch.commonPoint(a2, b2);
                    break;
                }
            }

            newPoint = getNewPointOfDiag(length, pd0, pd1);

            //1 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b1.length, pd1.x, pd1.y, a1.length);

            if (!intersections || a1.length + b1.length <= +length) {
                new Noty(noty_nl).show();
                return;
            }

            oldObshayaPoint1 = sketch.commonPoint(a1, b1).clone();
            newObshayaPoint1 = sketch.getNearestDistancePoint(oldObshayaPoint1, intersections);


            intersections = sketch.getCirclesIntersections(pd2.x, pd2.y, b2.length, pd1.x, pd1.y, +length);

            if (!intersections) {
                new Noty(noty_nl).show();
                return;
            }

            newObshayaPoint2 = sketch.getNearestDistancePoint(pd0, intersections);

            angle_old = sketch.getAngle(newPoint, pd1);
            angle_new = sketch.getAngle(newObshayaPoint2, pd1);
            angle_rotate = new Decimal(angle_old).minus(angle_new).toNumber();

            a1.removeSegments();
            a1.addSegments([pd1, newObshayaPoint1]);
            b1.removeSegments();
            b1.addSegments([newObshayaPoint1, newPoint]);

            c.removeSegments();
            c.addSegments([newObshayaPoint2, pd1]);

            b2.removeSegments();
            b2.addSegments([pd2, newObshayaPoint2]);

            a1.rotate(-angle_rotate, pd1);
            b1.rotate(-angle_rotate, pd1);

            c.data.fixed = true;

        } else if (c.data.countNearWalls === 2 && (hitResults0.length === 3 || hitResults1.length === 3)) {
            line_arr = getLinesOfTrianglesAroundDiag(c);

            for (var i = line_arr.length; i--;) {
                for (var j = line_arr.length; j--;) {
                    if (line_arr[i] !== line_arr[j] && sketch.commonPoint(line_arr[i], line_arr[j]) !== null
                        && line_arr[i].data.is_wall && line_arr[j].data.is_wall) {
                        if (sketch.comparePoints(sketch.commonPoint(line_arr[i], line_arr[j]), c_s0, HALF)) {
                            pd0 = c_s0.clone();
                            pd1 = c_s1.clone();
                            i = 0;
                            break;
                        } else if (sketch.comparePoints(sketch.commonPoint(line_arr[i], line_arr[j]), c_s1, HALF)) {
                            pd0 = c_s1.clone();
                            pd1 = c_s0.clone();
                            i = 0;
                            break;
                        }
                    }
                }
            }

            for (var i = line_arr.length; i--;) {
                for (var j = line_arr.length; j--;) {
                    if (line_arr[i] !== line_arr[j] && line_arr[i].data.is_wall && line_arr[j].data.is_wall
                        && sketch.commonPoint(line_arr[i], line_arr[j]) !== null) {
                        if (sketch.comparePoints(sketch.commonPoint(line_arr[i], line_arr[j]), pd0, HALF)) {
                            b1 = line_arr[j];
                            b2 = line_arr[i];
                            line_arr.splice(line_arr.indexOf(b1), 1);
                            line_arr.splice(line_arr.indexOf(b2), 1);
                            i = 0;
                            break;
                        }
                    }
                }
            }

            for (var i = line_arr.length; i--;) {
                if (sketch.commonPoint(line_arr[i], b1) !== null) {
                    a1 = line_arr[i];
                }
                if (sketch.commonPoint(line_arr[i], b2) !== null) {
                    a2 = line_arr[i];
                }
            }

            newPoint = getNewPointOfDiag(length, pd0, pd1);

            //1 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b1.length, pd1.x, pd1.y, a1.length);

            oldObshayaPoint1 = sketch.commonPoint(a1, b1).clone();

            if (!intersections || a1.length + b1.length <= +length) {
                if (!a1.data.fixed) {
                    var napr, dop_length;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint1 = sketch.getNearestDistancePoint(oldObshayaPoint1, intersections);

            //2 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b2.length, pd1.x, pd1.y, a2.length);

            oldObshayaPoint2 = sketch.commonPoint(a2, b2).clone();

            if (!intersections || a2.length + b2.length <= +length) {
                if (!a2.data.fixed) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint2 = sketch.getNearestDistancePoint(oldObshayaPoint2, intersections);


            if (sketch.comparePoints(a1.segments[0].point, pd1, HALF)) {
                op = a1.segments[1].point.clone();
            } else {
                op = a1.segments[0].point.clone();
            }

            angle_old = sketch.getAngle(op, pd1);

            part_chert = findPartChertByDiag(a1, index);
            mass_w = part_chert.mass_w;
            mass_d = part_chert.mass_d;


            if (sketch.comparePoints(a2.segments[0].point, pd1, HALF)) {
                op = a2.segments[1].point.clone();
            } else {
                op = a2.segments[0].point.clone();
            }

            angle_old2 = sketch.getAngle(op, pd1);


            part_chert = findPartChertByDiag(a2, index);
            mass_w2 = part_chert.mass_w;
            mass_d2 = part_chert.mass_d;

            angle_new = sketch.getAngle(newObshayaPoint1, pd1);
            angle_rotate = new Decimal(angle_old).minus(angle_new).toNumber();

            angle_new2 = sketch.getAngle(newObshayaPoint2, pd1);
            angle_rotate2 = new Decimal(angle_old2).minus(angle_new2).toNumber();


            for (var key = mass_w.length; key--;) {
                mass_w[key].rotate(-angle_rotate, pd1);
            }
            for (var key = mass_d.length; key--;) {
                mass_d[key].rotate(-angle_rotate, pd1);
            }


            for (var key = mass_w2.length; key--;) {
                mass_w2[key].rotate(-angle_rotate2, pd1);
            }
            for (var key = mass_d2.length; key--;) {
                mass_d2[key].rotate(-angle_rotate2, pd1);
            }

            c.removeSegments();
            c.addSegments([pd1, newPoint]);

            a1.removeSegments();
            a1.addSegments([pd1, newObshayaPoint1]);
            b1.removeSegments();
            b1.addSegments([newObshayaPoint1, newPoint]);

            a2.removeSegments();
            a2.addSegments([pd1, newObshayaPoint2]);
            b2.removeSegments();
            b2.addSegments([newObshayaPoint2, newPoint]);

        } else if (c.data.countNearWalls === 2) {
            line_arr = getLinesOfTrianglesAroundDiag(c);

            g_points = sketch.getPathsPointsBySort(lines_sort);
            points_m = sketch.findMinAndMaxCordinate(g_points);
            var min_point = new Point(points_m.minX, points_m.minY);
            var max_point = new Point(points_m.maxX, points_m.maxY);
            var center_line = Path.Line(min_point, max_point);
            var center_point = center_line.position.clone();
            center_line.remove();

            pd0 = c_s0.clone();
            pd1 = c_s1.clone();

            var rast0 = Math.sqrt(Math.pow(pd0.x - center_point.x, 2) + Math.pow(pd0.y - center_point.y, 2));
            var rast1 = Math.sqrt(Math.pow(pd1.x - center_point.x, 2) + Math.pow(pd1.y - center_point.y, 2));
            if (rast0 < rast1) {
                pd0 = c_s1.clone();
                pd1 = c_s0.clone();
            }

            var break_bool = false;
            for (var i = line_arr.length; i--;) {
                for (var j = line_arr.length; j--;) {
                    if (line_arr[i] !== line_arr[j] && sketch.commonPoint(line_arr[i], line_arr[j]) !== null) {
                        if (sketch.comparePoints(sketch.commonPoint(line_arr[i], line_arr[j]), pd0, HALF)) {
                            if (line_arr[i].data.is_wall) {
                                b1 = line_arr[i];
                                b2 = line_arr[j];
                            } else {
                                b1 = line_arr[j];
                                b2 = line_arr[i];
                            }
                            line_arr.splice(line_arr.indexOf(b1), 1);
                            line_arr.splice(line_arr.indexOf(b2), 1);
                            i = 0;
                            break;
                        }
                    }
                }
            }

            for (var i = line_arr.length; i--;) {
                if (sketch.commonPoint(line_arr[i], b1) !== null) {
                    a1 = line_arr[i];
                }
                if (sketch.commonPoint(line_arr[i], b2) !== null) {
                    a2 = line_arr[i];
                }
            }

            newPoint = getNewPointOfDiag(length, pd0, pd1);

            //1 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b1.length, pd1.x, pd1.y, a1.length);

            oldObshayaPoint1 = sketch.commonPoint(a1, b1).clone();

            if (!intersections || a1.length + b1.length <= +length) {
                if (!a1.data.fixed && a1.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else if (!b1.data.fixed && b1.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd0, pd1);
                    var angle_nefixed_diag = sketch.getAngle(pd0, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + a1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - a1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === b1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint1 = sketch.getNearestDistancePoint(oldObshayaPoint1, intersections);


            //2 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b2.length, pd1.x, pd1.y, a2.length);

            oldObshayaPoint2 = sketch.commonPoint(a2, b2).clone();

            if (!intersections || a2.length + b2.length <= +length) {
                if (!a2.data.fixed && a2.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else if (!b2.data.fixed && b2.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd0, pd1);
                    var angle_nefixed_diag = sketch.getAngle(pd0, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + a2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - a2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === b2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint2 = sketch.getNearestDistancePoint(oldObshayaPoint2, intersections);


            if (a1.strokeWidth === DIAG_WIDTH) {
                if (sketch.comparePoints(a1.segments[0].point, pd1, HALF)) {
                    op = a1.segments[1].point.clone();
                } else {
                    op = a1.segments[0].point.clone();
                }
                diag_f = a1;
            } else {
                if (sketch.comparePoints(a2.segments[0].point, pd1, HALF)) {
                    op = a2.segments[1].point.clone();
                } else {
                    op = a2.segments[0].point.clone();
                }
                diag_f = a2;
            }

            angle_old = sketch.getAngle(op, pd1);

            part_chert = findPartChertByDiag(diag_f, index);
            mass_w = part_chert.mass_w;
            mass_d = part_chert.mass_d;


            if (sketch.comparePoints(a2.segments[0].point, pd1, HALF)) {
                op2 = a2.segments[1].point.clone();
            } else {
                op2 = a2.segments[0].point.clone();
            }


            angle_old2 = sketch.getAngle(op2, pd0);


            part_chert = findPartChertByDiag(b2, index);
            mass_w2 = part_chert.mass_w;
            mass_d2 = part_chert.mass_d;


            if (a1.strokeWidth === DIAG_WIDTH) {
                angle_new = sketch.getAngle(newObshayaPoint1, pd1);
            } else {
                angle_new = sketch.getAngle(newObshayaPoint2, pd1);
            }

            angle_rotate = new Decimal(angle_old).minus(angle_new).toNumber();


            angle_new2 = sketch.getAngle(newObshayaPoint2, newPoint);
            angle_rotate2 = new Decimal(angle_old2).minus(angle_new2).toNumber();


            for (var key = mass_w.length; key--;) {
                mass_w[key].rotate(-angle_rotate, pd1);
            }
            for (var key = mass_d.length; key--;) {
                mass_d[key].rotate(-angle_rotate, pd1);
            }


            var rast_sdvig_x = new Decimal(newPoint.x).minus(pd0.x).toNumber();
            var rast_sdvig_y = new Decimal(newPoint.y).minus(pd0.y).toNumber();

            for (var key = mass_w2.length; key--;) {
                mass_w2[key].position.x = new Decimal(mass_w2[key].position.x).plus(rast_sdvig_x);
                mass_w2[key].position.y = new Decimal(mass_w2[key].position.y).plus(rast_sdvig_y);
                mass_w2[key].rotate(-angle_rotate2, newPoint);
            }
            for (var key = mass_d2.length; key--;) {
                mass_d2[key].position.x = new Decimal(mass_d2[key].position.x).plus(rast_sdvig_x);
                mass_d2[key].position.y = new Decimal(mass_d2[key].position.y).plus(rast_sdvig_y);
                mass_d2[key].rotate(-angle_rotate2, newPoint);
            }

            c.removeSegments();
            c.addSegments([pd1, newPoint]);

            a1.removeSegments();
            a1.addSegments([pd1, newObshayaPoint1]);
            b1.removeSegments();
            b1.addSegments([newObshayaPoint1, newPoint]);

            a2.removeSegments();
            a2.addSegments([pd1, newObshayaPoint2]);
            b2.removeSegments();
            b2.addSegments([newObshayaPoint2, newPoint]);

        } else if (c.data.countNearWalls === 1) {
            line_arr = getLinesOfTrianglesAroundDiag(c);

            for (var i = line_arr.length; i--;) {
                if (line_arr[i].data.is_wall) {
                    if (sketch.comparePoints(sketch.commonPoint(line_arr[i], c), c_s0, HALF)) {
                        pd0 = c_s0.clone();
                        pd1 = c_s1.clone();
                    } else if (sketch.comparePoints(sketch.commonPoint(line_arr[i], c), c_s1, HALF)) {
                        pd0 = c_s1.clone();
                        pd1 = c_s0.clone();
                    }
                    break;
                }
            }

            for (var i = line_arr.length; i--;) {
                for (var j = line_arr.length; j--;) {
                    if (line_arr[i] !== line_arr[j] && sketch.commonPoint(line_arr[i], line_arr[j]) !== null) {
                        if (sketch.comparePoints(sketch.commonPoint(line_arr[i], line_arr[j]), pd0, HALF)) {
                            if (line_arr[i].data.is_wall) {
                                b1 = line_arr[i];
                                b2 = line_arr[j];
                            } else {
                                b1 = line_arr[j];
                                b2 = line_arr[i];
                            }
                            line_arr.splice(line_arr.indexOf(b1), 1);
                            line_arr.splice(line_arr.indexOf(b2), 1);
                            i = 0;
                            break;
                        }
                    }
                }
            }

            for (var i = line_arr.length; i--;) {
                if (sketch.commonPoint(line_arr[i], b1) !== null) {
                    a1 = line_arr[i];
                }
                if (sketch.commonPoint(line_arr[i], b2) !== null) {
                    a2 = line_arr[i];
                }
            }

            newPoint = getNewPointOfDiag(length, pd0, pd1);

            //1 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b1.length, pd1.x, pd1.y, a1.length);

            oldObshayaPoint1 = sketch.commonPoint(a1, b1).clone();

            if (!intersections || a1.length + b1.length <= +length) {
                if (!a1.data.fixed && a1.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else if (!b1.data.fixed && b1.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd0, pd1);
                    var angle_nefixed_diag = sketch.getAngle(pd0, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + a1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - a1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === b1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint1 = sketch.getNearestDistancePoint(oldObshayaPoint1, intersections);

            //2 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b2.length, pd1.x, pd1.y, a2.length);

            oldObshayaPoint2 = sketch.commonPoint(a2, b2).clone();

            if (!intersections || a2.length + b2.length <= +length) {
                if (!a2.data.fixed && a2.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else if (!b2.data.fixed && b2.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd0, pd1);
                    var angle_nefixed_diag = sketch.getAngle(pd0, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + a2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - a2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === b2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint2 = sketch.getNearestDistancePoint(oldObshayaPoint2, intersections);


            if (sketch.comparePoints(a1.segments[0].point, pd1, HALF)) {
                op = a1.segments[1].point.clone();
            } else {
                op = a1.segments[0].point.clone();
            }

            angle_old1 = sketch.getAngle(op, pd1);


            part_chert = findPartChertByDiag(a1, index);
            mass_w1 = part_chert.mass_w;
            mass_d1 = part_chert.mass_d;

            angle_new1 = sketch.getAngle(newObshayaPoint1, pd1);

            angle_rotate1 = new Decimal(angle_old1).minus(angle_new1).toNumber();


            if (sketch.comparePoints(a2.segments[0].point, pd1, HALF)) {
                op = a2.segments[1].point.clone();
            } else {
                op = a2.segments[0].point.clone();
            }

            angle_old2 = sketch.getAngle(op, pd1);


            part_chert = findPartChertByDiag(a2, index);
            mass_w2 = part_chert.mass_w;
            mass_d2 = part_chert.mass_d;

            angle_new2 = sketch.getAngle(newObshayaPoint2, pd1);

            angle_rotate2 = new Decimal(angle_old2).minus(angle_new2).toNumber();


            angle_old3 = sketch.getAngle(op, pd0);


            var part_chert = findPartChertByDiag(b2, index);
            var mass_w3 = part_chert.mass_w;
            var mass_d3 = part_chert.mass_d;

            angle_new3 = sketch.getAngle(newObshayaPoint2, newPoint);

            angle_rotate3 = new Decimal(angle_old3).minus(angle_new3).toNumber();


            for (var key = mass_w1.length; key--;) {
                mass_w1[key].rotate(-angle_rotate1, pd1);
            }
            for (var key = mass_d1.length; key--;) {
                mass_d1[key].rotate(-angle_rotate1, pd1);
            }

            for (var key = mass_w2.length; key--;) {
                mass_w2[key].rotate(-angle_rotate2, pd1);
            }
            for (var key = mass_d2.length; key--;) {
                mass_d2[key].rotate(-angle_rotate2, pd1);
            }

            var rast_sdvig_x = new Decimal(newPoint.x).minus(pd0.x).toNumber();
            var rast_sdvig_y = new Decimal(newPoint.y).minus(pd0.y).toNumber();

            for (var key = mass_w3.length; key--;) {
                mass_w3[key].position.x = new Decimal(mass_w3[key].position.x).plus(rast_sdvig_x);
                mass_w3[key].position.y = new Decimal(mass_w3[key].position.y).plus(rast_sdvig_y);
                mass_w3[key].rotate(-angle_rotate3, newPoint);
            }
            for (var key = mass_d3.length; key--;) {
                mass_d3[key].position.x = new Decimal(mass_d3[key].position.x).plus(rast_sdvig_x);
                mass_d3[key].position.y = new Decimal(mass_d3[key].position.y).plus(rast_sdvig_y);
                mass_d3[key].rotate(-angle_rotate3, newPoint);
            }

            c.removeSegments();
            c.addSegments([pd1, newPoint]);

            a1.removeSegments();
            a1.addSegments([pd1, newObshayaPoint1]);
            b1.removeSegments();
            b1.addSegments([newObshayaPoint1, newPoint]);

            a2.removeSegments();
            a2.addSegments([pd1, newObshayaPoint2]);
            b2.removeSegments();
            b2.addSegments([newObshayaPoint2, newPoint]);

        } else if (c.data.countNearWalls === 0) {
            line_arr = getLinesOfTrianglesAroundDiag(c);

            g_points = sketch.getPathsPointsBySort(lines_sort);
            points_m = sketch.findMinAndMaxCordinate(g_points);
            var min_point = new Point(points_m.minX, points_m.minY);
            var max_point = new Point(points_m.maxX, points_m.maxY);
            var center_line = Path.Line(min_point, max_point);
            var center_point = center_line.position.clone();
            center_line.remove();

            pd0 = c_s0.clone();
            pd1 = c_s1.clone();

            var rast0 = Math.sqrt(Math.pow(pd0.x - center_point.x, 2) + Math.pow(pd0.y - center_point.y, 2));
            var rast1 = Math.sqrt(Math.pow(pd1.x - center_point.x, 2) + Math.pow(pd1.y - center_point.y, 2));
            if (rast0 < rast1) {
                pd0 = c_s1.clone();
                pd1 = c_s0.clone();
            }

            for (var i = line_arr.length; i--;) {
                for (var j = line_arr.length; j--;) {
                    if (line_arr[i] !== line_arr[j] && sketch.commonPoint(line_arr[i], line_arr[j]) !== null) {
                        if (sketch.comparePoints(sketch.commonPoint(line_arr[i], line_arr[j]), pd0, HALF)) {
                            b1 = line_arr[i];
                            b2 = line_arr[j];
                            line_arr.splice(line_arr.indexOf(b1), 1);
                            line_arr.splice(line_arr.indexOf(b2), 1);
                            i = 0;
                            break;
                        }
                    }
                }
            }

            for (var i = line_arr.length; i--;) {
                if (sketch.commonPoint(line_arr[i], b1) !== null) {
                    a1 = line_arr[i];
                }
                if (sketch.commonPoint(line_arr[i], b2) !== null) {
                    a2 = line_arr[i];
                }
            }

            newPoint = getNewPointOfDiag(length, pd0, pd1);

            //1 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b1.length, pd1.x, pd1.y, a1.length);

            oldObshayaPoint1 = sketch.commonPoint(a1, b1).clone();

            if (!intersections || a1.length + b1.length <= +length) {
                if (!a1.data.fixed && a1.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else if (!b1.data.fixed && b1.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd0, pd1);
                    var angle_nefixed_diag = sketch.getAngle(pd0, oldObshayaPoint1);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + a1.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - a1.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === b1.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint1 = sketch.getNearestDistancePoint(oldObshayaPoint1, intersections);

            //2 треугольник

            intersections = sketch.getCirclesIntersections(newPoint.x, newPoint.y, b2.length, pd1.x, pd1.y, a2.length);

            oldObshayaPoint2 = sketch.commonPoint(a2, b2).clone();

            if (!intersections || a2.length + b2.length <= +length) {
                if (!a2.data.fixed && a2.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd1, pd0);
                    var angle_nefixed_diag = sketch.getAngle(pd1, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + b2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - b2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === a2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else if (!b2.data.fixed && b2.strokeWidth === DIAG_WIDTH) {
                    var dop_length, napr;
                    var angle_ch_diag = sketch.getAngle(pd0, pd1);
                    var angle_nefixed_diag = sketch.getAngle(pd0, oldObshayaPoint2);
                    var angle_dd = Decimal.abs(new Decimal(angle_ch_diag).minus(angle_nefixed_diag)).toNumber();
                    if (angle_dd > 180) {
                        angle_dd = new Decimal(360).minus(angle_dd).toNumber();
                    }

                    if (+length < c.length && angle_dd < 90 || +length > c.length && angle_dd >= 90) {
                        napr = '<';
                        dop_length = +length + a2.length - 3;
                    } else {
                        napr = '>';
                        dop_length = Math.abs(+length - a2.length) + 3;
                    }

                    for (var key = diag_sort.length; key--;) {
                        if (diag_sort[key].id === b2.id) {
                            stop_rek = false;
                            superChangeDiag(index, +length, key, napr, dop_length, rek);
                            return;
                        }
                    }
                } else {
                    stop_rek = true;
                    if (!rek) {
                        new Noty(noty_nl).show();
                    }
                }
                return;
            }

            newObshayaPoint2 = sketch.getNearestDistancePoint(oldObshayaPoint2, intersections);


            if (sketch.comparePoints(a1.segments[0].point, pd1, HALF)) {
                op = a1.segments[1].point.clone();
            } else {
                op = a1.segments[0].point.clone();
            }

            angle_old1 = sketch.getAngle(op, pd1);
            angle_new1 = sketch.getAngle(newObshayaPoint1, pd1);
            angle_rotate1 = new Decimal(angle_old1).minus(angle_new1).toNumber();

            angle_old4 = sketch.getAngle(op, pd0);
            angle_new4 = sketch.getAngle(newObshayaPoint1, newPoint);
            angle_rotate4 = new Decimal(angle_old4).minus(angle_new4).toNumber();

            if (sketch.comparePoints(a2.segments[0].point, pd1, HALF)) {
                op = a2.segments[1].point.clone();
            } else {
                op = a2.segments[0].point.clone();
            }

            angle_old2 = sketch.getAngle(op, pd1);
            angle_new2 = sketch.getAngle(newObshayaPoint2, pd1);
            angle_rotate2 = new Decimal(angle_old2).minus(angle_new2).toNumber();

            angle_old3 = sketch.getAngle(op, pd0);
            angle_new3 = sketch.getAngle(newObshayaPoint2, newPoint);
            angle_rotate3 = new Decimal(angle_old3).minus(angle_new3).toNumber();


            part_chert = findPartChertByDiag(a1, index);
            mass_w1 = part_chert.mass_w;
            mass_d1 = part_chert.mass_d;

            part_chert = findPartChertByDiag(a2, index);
            mass_w2 = part_chert.mass_w;
            mass_d2 = part_chert.mass_d;

            part_chert = findPartChertByDiag(b2, index);
            mass_w3 = part_chert.mass_w;
            mass_d3 = part_chert.mass_d;

            part_chert = findPartChertByDiag(b1, index);
            mass_w4 = part_chert.mass_w;
            mass_d4 = part_chert.mass_d;


            for (var key = mass_w1.length; key--;) {
                mass_w1[key].rotate(-angle_rotate1, pd1);
            }
            for (var key = mass_d1.length; key--;) {
                mass_d1[key].rotate(-angle_rotate1, pd1);
            }

            for (var key = mass_w2.length; key--;) {
                mass_w2[key].rotate(-angle_rotate2, pd1);
            }
            for (var key = mass_d2.length; key--;) {
                mass_d2[key].rotate(-angle_rotate2, pd1);
            }

            var rast_sdvig_x = new Decimal(newPoint.x).minus(pd0.x).toNumber();
            var rast_sdvig_y = new Decimal(newPoint.y).minus(pd0.y).toNumber();

            for (var key = mass_w3.length; key--;) {
                mass_w3[key].position.x = new Decimal(mass_w3[key].position.x).plus(rast_sdvig_x);
                mass_w3[key].position.y = new Decimal(mass_w3[key].position.y).plus(rast_sdvig_y);
                mass_w3[key].rotate(-angle_rotate3, newPoint);
            }
            for (var key = mass_d3.length; key--;) {
                mass_d3[key].position.x = new Decimal(mass_d3[key].position.x).plus(rast_sdvig_x);
                mass_d3[key].position.y = new Decimal(mass_d3[key].position.y).plus(rast_sdvig_y);
                mass_d3[key].rotate(-angle_rotate3, newPoint);
            }


            for (var key = mass_w4.length; key--;) {
                mass_w4[key].position.x = new Decimal(mass_w4[key].position.x).plus(rast_sdvig_x);
                mass_w4[key].position.y = new Decimal(mass_w4[key].position.y).plus(rast_sdvig_y);
                mass_w4[key].rotate(-angle_rotate4, newPoint);
            }
            for (var key = mass_d4.length; key--;) {
                mass_d4[key].position.x = new Decimal(mass_d4[key].position.x).plus(rast_sdvig_x);
                mass_d4[key].position.y = new Decimal(mass_d4[key].position.y).plus(rast_sdvig_y);
                mass_d4[key].rotate(-angle_rotate4, newPoint);
            }

            c.removeSegments();
            c.addSegments([pd1, newPoint]);

            a1.removeSegments();
            a1.addSegments([pd1, newObshayaPoint1]);
            b1.removeSegments();
            b1.addSegments([newObshayaPoint1, newPoint]);

            a2.removeSegments();
            a2.addSegments([pd1, newObshayaPoint2]);
            b2.removeSegments();
            b2.addSegments([newObshayaPoint2, newPoint]);
        }

        sketch.drawLinesText(lines, 1, FONT_LINES, 0);
        sketch.drawLinesText(diag_sort, 1, FONT_DIAGS, 1);
        sketch.moveVertexNamesLinesSort(lines_sort, text_points);

        if (!rek) {
            c.data.fixed = true;
        }

        sketch.connectAllSegments(lines_sort, diags);
    }

    function getNewPointOfDiag(length, pd0, pd1) {
        var chis = new Decimal(new Decimal(pd1.y).minus(pd0.y)),
            znam = new Decimal(new Decimal(pd1.x).minus(pd0.x)),
            coef = chis.dividedBy(znam),
            dec_length = new Decimal(length), Dx, Dy, newPoint;

        Dx = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(coef.pow(2))))).toNumber();
        Dy = dec_length.times(Decimal.sqrt(new Decimal(1).dividedBy(new Decimal(1).plus(new Decimal(1).dividedBy(coef.pow(2)))))).toNumber();

        if (pd1.x > pd0.x) {
            Dx = new Decimal(-1).times(Dx).toNumber();
        }
        if (pd1.y > pd0.y) {
            Dy = new Decimal(-1).times(Dy).toNumber();
        }
        newPoint = new Point(new Decimal(pd1.x).plus(Dx).toNumber(), new Decimal(pd1.y).plus(Dy).toNumber());
        return newPoint;
    }

    function superChangeDiag(main_diag_index, newLength, nefixed_diag_index, napr, dop_length, rek) {
        ////console.log('superChangeDiag', newLength);
        dop_length = Math.round(dop_length);
        var ch_length = Math.round(diag_sort[nefixed_diag_index].length);
        while ((ch_length < dop_length - 2 || ch_length > dop_length + 2) && !stop_rek) {
            if (napr === '<') {
                ch_length -= 2;
            } else if (napr === '>') {
                ch_length += 2;
            }
            change_length_diag(nefixed_diag_index, ch_length, true);
        }
        if (stop_rek) {
            new Noty(noty_nl).show();
            cancelLastAction();
        } else {
            change_length_diag(main_diag_index, newLength, true);
            if (rek === false) {
                diag_sort[main_diag_index].data.fixed = true;
            }
        }
    }

    function getLinesOfTrianglesAroundDiag(diag_i) {
        var line_arr = [];
        var hitResults0 = project.hitTestAll(diag_i.segments[0].point, {class: Path, segments: true, tolerance: 2});
        var hitResults1 = project.hitTestAll(diag_i.segments[1].point, {class: Path, segments: true, tolerance: 2});
        var op;
        for (var key0 = hitResults0.length; key0--;) {
            if (sketch.compareLines(hitResults0[key0].item, diag_i) || hitResults0[key0].item.segments.length !== 2) {
                continue;
            }
            for (var key1 = hitResults1.length; key1--;) {
                if (!sketch.compareLines(hitResults1[key1].item, diag_i) && hitResults1[key1].item.segments.length === 2) {
                    op = sketch.commonPoint(hitResults0[key0].item, hitResults1[key1].item);
                    if (op !== null) {
                        line_arr.push(hitResults0[key0].item);
                        line_arr.push(hitResults1[key1].item);
                    }
                }
            }
        }
        return line_arr;
    }

    function findPartChertByDiag(diag_f, index) {
        var mass_w1 = [], mass_w2 = [], mass_w, mass_d = [], part_chert, first_mass = true,
            bool_switch = false, df_s0 = diag_f.segments[0].point, df_s1 = diag_f.segments[1].point,
            path1 = new Path(), path2 = new Path(), o_p1, o_p2;

        for (var i = lines_sort.length, ls_i, ls_i_s0, ls_i_s1, ls_next; i--;) {
            ls_i = lines_sort[i];
            if (i > 0) {
                ls_next = lines_sort[i - 1];
            } else {
                ls_next = lines_sort[lines_sort.length - 1];
            }
            ls_i_s0 = ls_i.segments[0].point;
            ls_i_s1 = ls_i.segments[1].point;
            if (first_mass) {
                mass_w1.push(ls_i);
                path1.add(ls_i_s0);
                path1.add(ls_i_s1);
            } else {
                mass_w2.push(ls_i);
                path2.add(ls_i_s0);
                path2.add(ls_i_s1);
            }
            if (!bool_switch) {
                o_p1 = sketch.commonPoint(ls_i, diag_f);
                o_p2 = sketch.commonPoint(ls_next, diag_f);
                if (o_p1 && o_p2 && sketch.comparePoints(o_p1, o_p2, HALF)) {
                    if (first_mass) {
                        first_mass = false;
                    } else {
                        first_mass = true;
                    }
                    bool_switch = true;
                }
            } else {
                bool_switch = false;
            }
        }
        path1.closed = true;
        path2.closed = true;
        if (path1.contains(diag_sort[index].position)) {
            mass_w = mass_w2;
            part_chert = path2;
        } else {
            mass_w = mass_w1;
            part_chert = path1;
        }
        for (var i = diag_sort.length; i--;) {
            if (part_chert.contains(diag_sort[i].position)) {
                mass_d.push(diag_sort[i]);
            }
        }
        path1.remove();
        path2.remove();

        return {mass_w: mass_w, mass_d: mass_d};
    }

    function drawInnerCutoutFigureToCenter(line, width, length) {
        g_points = sketch.getPathsPointsBySort(lines_sort);
        var l_s0 = line.segments[0].point, l_s1 = line.segments[1].point, angle = sketch.getAngle(l_s0, l_s1), pos,
            len = Math.sqrt(Math.pow((line.length / 2), 2) + Math.pow((width / 2) + 5, 2)),
            intersections = sketch.getCirclesIntersections(l_s0.x, l_s0.y, len, l_s1.x, l_s1.y, len),
            chertezh = new Path({
                segments: g_points,
                closed: true
            }), cutout;
        if (chertezh.contains(intersections[0])) {
            pos = intersections[0];
        } else {
            pos = intersections[1];
        }
        chertezh.remove();

        switch (cutout_figure) {
            case 1:
                cutout = new Path.Ellipse({
                    position: pos,
                    size: [width, length],
                    strokeColor: 'blue',
                    strokeWidth: LINE_WIDTH
                });
                cutout.data.curvilinear = true;
                break;
            case 2:
                cutout = new Path.Rectangle({
                    position: pos,
                    size: [width, length],
                    strokeColor: 'blue',
                    strokeWidth: LINE_WIDTH
                });
                cutout.data.curvilinear = false;
                break;
            case 3:
                var l_pos = new Decimal(pos.x).minus(new Decimal(width).dividedBy(2)).toNumber(),
                    r_pos = new Decimal(pos.x).plus(new Decimal(width).dividedBy(2)).toNumber(),
                    u_pos = new Decimal(pos.y).minus(new Decimal(length).dividedBy(2)).toNumber(),
                    d_pos = new Decimal(pos.y).plus(new Decimal(length).dividedBy(2)).toNumber();
                cutout = new Path({
                    position: pos,
                    segments: [
                        new Point(l_pos, pos.y),
                        new Point(pos.x, u_pos),
                        new Point(r_pos, pos.y),
                        new Point(pos.x, d_pos)
                    ],
                    closed: true,
                    strokeColor: 'blue',
                    strokeWidth: LINE_WIDTH
                });
                cutout.data.curvilinear = false;
                break;
        }

        if (cut_length !== undefined) {
            cut_length.remove();
        }
        if (cut_width !== undefined) {
            cut_width.remove();
        }
        cut_length = new Path.Line({
            segments: [cutout.bounds.topCenter, cutout.bounds.bottomCenter],
            strokeWidth: DIAG_WIDTH,
            strokeColor: 'black'
        });
        cut_width = new Path.Line({
            segments: [cutout.bounds.leftCenter, cutout.bounds.rightCenter],
            strokeWidth: DIAG_WIDTH,
            strokeColor: 'black'
        });
        cutout.rotation = angle;
        cut_length.rotation = angle;
        cut_width.rotation = angle;
        return cutout;
    }

    function selectLineForInnerCutout(line) {
        line.strokeColor = 'blue';
        var cutout;
        if ([1, 2, 3].includes(cutout_figure)) {
            cutout = drawInnerCutoutFigureToCenter(line, 40, 80);
        }

        inner_cutouts.push(cutout);

        elem_window.style.display = 'block';
        resize_canvas();
        elem_newLength.focus();
        current_input_length = new Decimal(cut_length.length).toFixed(1) - 0;
        elem_newLength.value = current_input_length;
        elem_newLength.select();
        first_click = false;
        cut_length.strokeColor = 'red';
        timer_mig = setInterval(migalka, 500, cut_length);
        cutout_line = line;
        cutout_line.data.cutout_line = true;
        save_cancel();
    }

    function selectEllipse() {
        cutout_figure = 1;
        innerCutoutBegin();
    }

    function selectRectangle() {
        cutout_figure = 2;
        innerCutoutBegin();
    }

    function selectRhomb() {
        cutout_figure = 3;
        innerCutoutBegin();
    }

    function innerCutoutBegin() {
        if (!ready) {
            cutout_figure = 0;
            return;
        }
        inner_cutout_bool = true;
        for (var i = lines.length; i--;) {
            lines[i].strokeColor = 'purple';
        }
        elem_popupInnerCutout.style.display = 'none';
        new Noty({
            theme: 'relax',
            timeout: 2000,
            layout: 'topCenter',
            type: "success",
            text: "Нажмите на стену, относительно которой будет располагаться внутренний вырез."
        }).show();
    }

    function getColorsFromCanvases(canvases) {
        var canvasColors = [],
            colorsIds = [];
        for (var i = canvases.length, c_i; i--;) {
            c_i = canvases[i];
            if (c_i.color !== null && colorsIds.indexOf(c_i.color - 0) === -1) {
                colorsIds.push(c_i.color - 0);
                canvasColors.push({
                    color: c_i.color,
                    hex: c_i.hex
                });
            }
        }
        return canvasColors;
    }

    function getWidthsFromCanvases(canvases) {
        var widthsOfCanvases = [];
        for (var i = canvases.length; i--;) {
            widthsOfCanvases.push({width: canvases[i].width - 0, price: canvases[i].price - 0, id: canvases[i].id - 0});
        }
        widthsOfCanvases = sortByWidth(widthsOfCanvases);
        return widthsOfCanvases;
    }

    function getWidthsFromCanvasesByColor(canvases, colorId) {
        var widthsOfCanvases = [];
        for (var i = canvases.length; i--;) {
            if (canvases[i].color - 0 === colorId) {
                widthsOfCanvases.push({
                    width: canvases[i].width - 0,
                    price: canvases[i].price - 0,
                    id: canvases[i].id - 0
                });
            }
        }
        widthsOfCanvases = sortByWidth(widthsOfCanvases);
        return widthsOfCanvases;
    }

    function sortByWidth(array) {
        array.sort(function (a, b) {
            if (a.width < b.width) {
                return 1;
            }
            if (a.width > b.width) {
                return -1;
            }
            return 0;
        });
        return array;
    }

    function clicks() {
        var audio = new Audio();
        try {
            audio.src = '/sounds/click.mp3';
            // Предзагрузка аудио для предотвращения ошибок
            audio.load();
        } catch (e) {
            // Если звук недоступен, создаем заглушку
            audio = {
                play: function() {},
                pause: function() {},
                currentTime: 0
            };
        }

        document.getElementById('cancelLastAction').onclick = cancelLastAction;
        document.getElementById('cancelLastAction2').onclick = cancelLastAction;
        document.getElementById('reset').onclick = clearElems;
        document.getElementById('reset2').onclick = clearElems;
        if (document.getElementById('back')) {
            document.getElementById('back').onclick = go_back;
        }
        if (document.getElementById('back2')) {
            document.getElementById('back2').onclick = go_back;
        }

        function go_back() {
            window.location = url;
        }

        elem_popup2 = document.getElementById('popup2');
        elem_popupCoordinates = document.getElementById('popup_coordinates');
        elem_popupInnerCutout = document.getElementById('popup_innerCutout');
        elem_popupLevel = document.getElementById('popup_level');
        elem_popupCanvas = document.getElementById('popup_canvas');
        elem_popupCanvasColor = document.getElementById('popup_canvasColor');
        elem_popupBuild = document.getElementById('popup_build');
        elem_divColors = document.getElementById('container_colors');
        elem_selectFacture = document.getElementById('select_facture');
        elem_selectManufacturer = document.getElementById('select_manufacturer');
        elem_textareaCoordinates = document.getElementById('textarea_coordinates');

        document.getElementById('btn_paste_coordinates').onclick = openPopupCoordinates;
        document.getElementById('btn_paste_coordinates2').onclick = openPopupCoordinates;

        function openPopupCoordinates() {
            elem_popupCoordinates.style.display = 'block';

            document.getElementById('coordinates_cancel').onclick = function () {
                elem_popupCoordinates.style.display = 'none';
            };

            document.getElementById('coordinates_ok').onclick = function () {
                document.getElementById('preloader').style.display = 'block';
                setTimeout(build_chert_on_koordinats, 200);
            };
        }

        document.getElementById('btn_okSelectCanvas').onclick = function () {
            texture = elem_selectFacture.value;
            manufacturer = elem_selectManufacturer.value;
            var objcsnvases = []
            for (key in texturesmanafacture) {


                if (texturesmanafacture[key].texture_id === texture) {
                    if (texturesmanafacture[key].manufacturer_id === manufacturer) {
                        objcsnvases.push(texturesmanafacture[key]);

                    }

                }
            }

            canvases = objcsnvases
            canvasColors = getColorsFromCanvases(canvases);
            if (canvasColors.length > 0) {
                elem_popupCanvas.style.display = 'none';
                elem_popupCanvasColor.style.display = 'block';
                elem_divColors.innerHTML = '';

                for (var i = canvasColors.length, btn; i--;) {
                    btn = document.createElement("BUTTON");
                    btn.setAttribute('class', 'btn-color');
                    if (canvasColors[i].color == color_id) {
                        btn.setAttribute('data-color', canvasColors[i].color);
                        btn.setAttribute('style', 'border:3px solid red');
                    } else {
                        btn.setAttribute('data-color', canvasColors[i].color);
                    }


                    btn.innerHTML = '<img style="background: #' + canvasColors[i].hex + ';">' +
                        '<div class="color_title1">' + canvasColors[i].color + '</div>' +
                        '<div class="color_title2">' + canvasColors[i].color + '</div>';


                    elem_divColors.appendChild(btn);
                    btn.onclick = function () {

                        var colorId = this.getAttribute('data-color') - 0;
                        color = colorId;
                        widthsOfCanvases = getWidthsFromCanvasesByColor(canvases, colorId);
                        elem_popupCanvasColor.style.display = 'none';
                        elem_preloader.style.display = 'block';
                        setTimeout(close_sketch_click, 20);

                    };
                }
            } else {
                widthsOfCanvases = getWidthsFromCanvases(canvases);
                elem_popupCanvas.style.display = 'none';
                elem_preloader.style.display = 'block';
                setTimeout(close_sketch_click, 20);
            }
        };

        document.getElementById('btn_okSelectColor').onclick = function () {
            if (canvasColors.length === 1) {
                ////console.log(canvasColors[0]);
                var colorId = canvasColors[0].color - 0;
                color = colorId;
                widthsOfCanvases = getWidthsFromCanvasesByColor(canvases, colorId);
                elem_popupCanvasColor.style.display = 'none';
                elem_preloader.style.display = 'block';
                setTimeout(close_sketch_click, 20);
            } else {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Пожалуйста, выберите цвет!"
                }).show();
            }
        }

        document.getElementById('btn_cancelSelectCanvas').onclick = function () {
            elem_popupCanvas.style.display = 'none';
        };

        document.getElementById('btn_cancelSelectColor').onclick = function () {
            elem_popupCanvasColor.style.display = 'none';
            elem_popupCanvas.style.display = 'block';
        };

        document.getElementById('btn_build_cancel').onclick = function () {
            elem_popupBuild.style.display = 'none';
        };

        var elem_tbodyBuildWalls = document.getElementById('tbody_build_walls'),
            elem_tbodyBuildDiags = document.getElementById('tbody_build_diags'),
            arrWallsInputs, arrDiagsInputs;

        document.getElementById('input_walls_count').onkeyup = function () {
            var walls_count = this.value - 0, charCode = 65, char, nextChar, alphNum = 0,
                tr, td, label, inputText, inputCheck, obj, node;
            elem_tbodyBuildWalls.innerHTML = '';
            elem_tbodyBuildDiags.innerHTML = '';
            arrWallsInputs = [];
            arrDiagsInputs = [];
            if (isNaN(walls_count) || walls_count < 4) {
                jQuery('.table-build').css('display', 'none');
                return;
            }
            jQuery('.table-build').css('display', 'table');
            for (var i = walls_count; i--;) {
                char = String.fromCharCode(charCode);
                if (alphNum > 0) {
                    char += alphNum;
                }
                if (i > 0) {
                    if (charCode === 90) {
                        alphNum++;
                        charCode = 64;
                    }
                    nextChar = String.fromCharCode(charCode + 1);
                    if (alphNum > 0) {
                        nextChar += alphNum;
                    }
                } else {
                    nextChar = String.fromCharCode(65);
                }
                tr = elem_tbodyBuildWalls.insertRow();
                td = tr.insertCell();
                label = document.createElement('label');
                node = document.createTextNode(char + nextChar);
                label.style.marginBottom = '0px';
                label.appendChild(node);
                td.appendChild(label);

                td = tr.insertCell();
                inputText = document.createElement('input');
                inputText.setAttribute('type', 'text');
                inputText.setAttribute('class', 'form-control');
                inputText.setAttribute('maxlength', '6');
                td.appendChild(inputText);

                td = tr.insertCell();
                inputCheck = document.createElement('input');
                inputCheck.setAttribute('type', 'checkbox');
                td.appendChild(inputCheck);

                arrWallsInputs.push({elemName: label, elemLength: inputText, elemCurve: inputCheck});
                charCode++;
            }
            for (var i = walls_count - 3; i--;) {
                tr = elem_tbodyBuildDiags.insertRow();
                td = tr.insertCell();
                label = document.createElement('input');
                label.setAttribute('type', 'text');
                label.setAttribute('class', 'form-control');
                label.setAttribute('maxlength', '6');
                td.appendChild(label);

                td = tr.insertCell();
                inputText = document.createElement('input');
                inputText.setAttribute('type', 'text');
                inputText.setAttribute('class', 'form-control');
                inputText.setAttribute('maxlength', '6');
                td.appendChild(inputText);

                arrDiagsInputs.push({elemName: label, elemLength: inputText});
            }
            ////console.log(arrWallsInputs, arrDiagsInputs);
        };

        document.getElementById('btn_build_ok').onclick = function () {
            str_lines_lengths = '';
            str_diags_lengths = '';
            for (var i = 0, a_i; i < arrWallsInputs.length; i++) {
                a_i = arrWallsInputs[i];
                a_i.elemLength.value = a_i.elemLength.value.replace(',', '.');
                if (a_i.elemName.innerText.length < 2 || isNaN(a_i.elemLength.value - 0) || a_i.elemLength.value - 0 < 2) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Недопустимые данные!"
                    }).show();
                    return;
                }
                str_lines_lengths += a_i.elemName.innerText + '=';
                if (a_i.elemCurve.checked) {
                    str_lines_lengths += '~';
                }
                str_lines_lengths += a_i.elemLength.value + ';';
            }

            for (var i = 0, a_i; i < arrDiagsInputs.length; i++) {
                a_i = arrDiagsInputs[i];
                a_i.elemLength.value = a_i.elemLength.value.replace(',', '.');
                if (a_i.elemName.value.length < 2 || isNaN(a_i.elemLength.value - 0) || a_i.elemLength.value - 0 < 2) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Недопустимые данные!"
                    }).show();
                    return;
                }
                str_diags_lengths += a_i.elemName.value + '=' + a_i.elemLength.value + ';';
            }
            build_chert();
            elem_popupBuild.style.display = 'none';
        };

        document.getElementById('ok').onclick = elem_button_ok_onclick;
        document.getElementById('ok2').onclick = elem_button_ok_onclick;
        document.getElementById('btn_inner_cutout').onclick = open_popup_innerCutout;
        document.getElementById('btn_inner_cutout2').onclick = open_popup_innerCutout;

        function open_popup_innerCutout() {
            if (!ready) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Чертеж не достроен!"
                }).show();
                return;
            }
            elem_popupInnerCutout.style.display = 'block';
        };
        document.getElementById('btn_figure_cancel').onclick = function () {
            elem_popupInnerCutout.style.display = 'none';
        };
        document.getElementById('ellipse').onclick = selectEllipse;
        document.getElementById('rectangle').onclick = selectRectangle;
        document.getElementById('rhomb').onclick = selectRhomb;

        document.getElementById('btn_level1').onclick = selectOneLevelCeiling;
        document.getElementById('btn_level2').onclick = selectTwoLevelCeiling;

        document.getElementById('btn_build_by_lengths').onclick = btnBuildClick;
        document.getElementById('btn_build_by_lengths2').onclick = btnBuildClick;

        function btnBuildClick() {
            clearElems();
            elem_popupBuild.style.display = 'block';
        }

        if (window.innerWidth > window.innerHeight) { //для мониторов
            elem_newLength = document.getElementById('newLength2');
            elem_useLine = document.getElementById('useLine2');
            elem_curve = document.getElementById('curve2');
            elem_arc = document.getElementById('arc2');
        } else { //для мобильных
            elem_newLength = document.getElementById('newLength');
            elem_useLine = document.getElementById('useLine');
            elem_curve = document.getElementById('curve');
            elem_arc = document.getElementById('arc');
        }

        jQuery('#hamburger').click(function () {
            if (jQuery('#menu').css('left') === '0px') {
                jQuery('#menu').animate({'left': '-100%'}, 400);
            } else {
                jQuery('#menu').animate({'left': '0px'}, 400);
            }
        });

        noty_nl = {
            theme: 'relax',
            timeout: 2000,
            layout: 'topCenter',
            type: "warning",
            text: "Недопустимая длина"
        };

        function elem_button_ok_onclick() {
            try {
                if (audio && typeof audio.pause === 'function') {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.play().catch(function(e) {
                        // Игнорируем ошибки воспроизведения звука
                        console.warn('Не удалось воспроизвести звук:', e);
                    });
                }
            } catch (e) {
                console.warn('Ошибка при работе со звуком:', e);
            }
            ok_enter_all();
            if (ready) {
                close_sketch_click_all();
            }
            addLightsToLayer();
        }

        document.onwheel = function (e) {
            sketch.wheelZoom(e, [resize_canvas, changeTextAfterZoom]);
        };
        touchZoom = function (e) {
            touchZoomObj = sketch.touchZoom(e, touchZoomObj, [resize_canvas, changeTextAfterZoom]);
        }
        document.getElementById('myCanvas').addEventListener('touchmove', touchZoom, false)

        if (newCalculate) {
            alert('6556')
            document.getElementById('close_sketch').onclick = function () {
                if (user.guest) {
                    prepareLogin();
                } else {
                    if (newCalculate) {
                        jQuery.each(cart.calculations, function (calcId, elem) {
                            if (elem.jobs.findIndex(function (j) {
                                return j.id == 26
                            }) == -1) {
                                let calculation = calculations.find(function (c) {
                                    return c.id == elem.calculation_id
                                });
                                elem.jobs.push({id: 26, count: calculation.n5});
                            }
                            calculate(elem);
                        });
                    }
                    if (user.dealer_type == 2) {
                        location.href = '/index.php?option=com_gm_ceiling&view=project&type=client&id=' + project_id;
                    } else {
                        location.href = '/index.php?option=com_gm_ceiling&view=project&type=calculator&subtype=precalc&id=' + project_id;
                    }
                }
            };
            document.getElementById('close_sketch2').onclick = function () {

                if (user.guest) {
                    prepareLogin();
                } else {
                    if (newCalculate) {
                        jQuery.each(cart.calculations, function (calcId, elem) {
                            if (elem.jobs.findIndex(function (j) {
                                return j.id == 26
                            }) == -1) {
                                let calculation = calculations.find(function (c) {
                                    return c.id == elem.calculation_id
                                });
                                elem.jobs.push({id: 26, count: calculation.n5});
                            }
                            calculate(elem);
                        });
                    }
                    if (user.dealer_type == 2) {
                        location.href = '/index.php?option=com_gm_ceiling&view=project&type=client&id=' + project_id;
                    } else {
                        location.href = '/index.php?option=com_gm_ceiling&view=project&type=calculator&subtype=precalc&id=' + project_id;
                    }
                }
            };
        } else {
            document.getElementById('close_sketch').onclick = close_sketch_click_all;
            document.getElementById('close_sketch2').onclick = close_sketch_click_all;
        }
        elem_input_n4 = document.getElementById('input_n4');
        elem_input_n5 = document.getElementById('input_n5');
        elem_input_n9 = document.getElementById('input_n9');
        elem_window = document.getElementById('window');
        elem_preloader = document.getElementById('preloader');

        document.getElementById('num0').onclick = elem_num_onclick;
        document.getElementById('num02').onclick = elem_num_onclick;
        document.getElementById('num1').onclick = elem_num_onclick;
        document.getElementById('num12').onclick = elem_num_onclick;
        document.getElementById('num2').onclick = elem_num_onclick;
        document.getElementById('num22').onclick = elem_num_onclick;
        document.getElementById('num3').onclick = elem_num_onclick;
        document.getElementById('num32').onclick = elem_num_onclick;
        document.getElementById('num4').onclick = elem_num_onclick;
        document.getElementById('num42').onclick = elem_num_onclick;
        document.getElementById('num5').onclick = elem_num_onclick;
        document.getElementById('num52').onclick = elem_num_onclick;
        document.getElementById('num6').onclick = elem_num_onclick;
        document.getElementById('num62').onclick = elem_num_onclick;
        document.getElementById('num7').onclick = elem_num_onclick;
        document.getElementById('num72').onclick = elem_num_onclick;
        document.getElementById('num8').onclick = elem_num_onclick;
        document.getElementById('num82').onclick = elem_num_onclick;
        document.getElementById('num9').onclick = elem_num_onclick;
        document.getElementById('num92').onclick = elem_num_onclick;
        document.getElementById('comma').onclick = elem_num_onclick;
        document.getElementById('comma2').onclick = elem_num_onclick;

        function elem_num_onclick() {
            audio.pause();
            audio.currentTime = 0;
            audio.play();
            if (!first_click) {
                elem_newLength.value = "";
                first_click = true;
            }
            elem_newLength.value += this.innerHTML;
        };

        document.getElementById('numback').onclick = elem_numback_onclick;
        document.getElementById('numback2').onclick = elem_numback_onclick;

        function save_lights_position() {
            sketch.toMirrorAll([lines, diags, inner_cutouts, seam_lines], lines_sort, diags, text_points, 1);
            sketch.removeNonVerticesTextPoints(text_points);
            sketch.drawCutoutsText(inner_cutouts, 1, FONT_LINES, 0);

            var j_walls = [],
                j_diags = [],
                j_text_points = [],
                j_inner_cutouts = [],
                j_lightingArr = [];
            for (var key = lines_sort.length; key--;) {
                lines_sort[key].data.text = undefined;
                j_walls[key] = lines_sort[key].exportJSON({asString: false});
            }
            for (var key = diag_sort.length; key--;) {
                diag_sort[key].data.text = undefined;
                j_diags[key] = diag_sort[key].exportJSON({asString: false});
            }
            for (var key = text_points.length; key--;) {
                j_text_points[key] = text_points[key].exportJSON({asString: false});
            }
            for (var key = inner_cutouts.length; key--;) {
                j_inner_cutouts[key] = inner_cutouts[key].exportJSON({asString: false});
            }

            for (var key = lightingArr.length; key--;) {
                j_lightingArr[key] = lightingArr[key].exportJSON({asString: false});
            }

            drawing_data = {
                walls: j_walls,
                diags: j_diags,
                vertices: j_text_points,
                innerCutouts: j_inner_cutouts,
                lights: j_lightingArr
            };
            //console.log(drawing_data);
            drawing_data = JSON.stringify(drawing_data);
            sketch.toMirrorAll([lines, diags, inner_cutouts, seam_lines], lines_sort, diags, text_points, 1);
            addLightsToLayer();
            calc_img = sketch.generateSVG(1, text_points, lines, diag_sort, inner_cutouts, lightingArr);
            // jQuery.ajax({
            // 	url: "/index.php?option=com_gm_ceiling&task=sketch.save_data_from_sketch",
            // 	async: false,
            // 	data: {
            // 		calc_id: selectedCalculation.id,
            // 		calc_img: btoa(calc_img),
            // 		drawing_data: drawing_data
            // 	},
            // 	type:"post",
            // 	success: function(data) {
            // 		new Noty({
            // 			theme: 'relax',
            // 			timeout: 2000,
            // 			layout: 'topCenter',
            // 			type: "success",
            // 			text: "Сохранено!"
            // 		}).show();
            // 	},
            // 	error: function(data) {
            // 		new Noty({
            // 			theme: 'relax',
            // 			timeout: 2000,
            // 			layout: 'topCenter',
            // 			type: "warning",
            // 			text: "Ошибка передачи данных"
            // 		}).show();
            // 	}
            // });
        }

        function elem_numback_onclick() {
            audio.pause();
            audio.currentTime = 0;
            audio.play();
            if (!first_click) {
                elem_newLength.value = "";
                first_click = true;
            }
            elem_newLength.value = elem_newLength.value.slice(0, -1);
        };

        document.onkeydown = function (e) {
            //~
            if (e.keyCode === 192) {
                if (!ready || inner_cutout_bool) {
                    new Noty({
                        theme: 'relax',
                        timeout: 2000,
                        layout: 'topCenter',
                        type: "warning",
                        text: "Чертеж не достроен!"
                    }).show();
                    return;
                }
                elem_preloader.style.display = 'block';
                setTimeout(close_sketch_click, 20);
            }

            if (elem_window.style.display === "" || elem_window.style.display === "none") {
                return;
            }

            if (e.keyCode === 13) {
                ok_enter_all();
                if (ready) {
                    close_sketch_click_all();
                }
            } else if (!first_click) {
                elem_newLength.value = "";
                first_click = true;
            }

            switch (e.keyCode) {
                case 48:
                    elem_newLength.value += "0";
                    break;
                case 49:
                    elem_newLength.value += "1";
                    break;
                case 50:
                    elem_newLength.value += "2";
                    break;
                case 51:
                    elem_newLength.value += "3";
                    break;
                case 52:
                    elem_newLength.value += "4";
                    break;
                case 53:
                    elem_newLength.value += "5";
                    break;
                case 54:
                    elem_newLength.value += "6";
                    break;
                case 55:
                    elem_newLength.value += "7";
                    break;
                case 56:
                    elem_newLength.value += "8";
                    break;
                case 57:
                    elem_newLength.value += "9";
                    break;
                case 46:
                    elem_newLength.value = "";
                    break;
                case 8:
                    elem_newLength.value = elem_newLength.value.slice(0, -1);
                    break;
                case 96:
                    elem_newLength.value += "0";
                    break;
                case 97:
                    elem_newLength.value += "1";
                    break;
                case 98:
                    elem_newLength.value += "2";
                    break;
                case 99:
                    elem_newLength.value += "3";
                    break;
                case 100:
                    elem_newLength.value += "4";
                    break;
                case 101:
                    elem_newLength.value += "5";
                    break;
                case 102:
                    elem_newLength.value += "6";
                    break;
                case 103:
                    elem_newLength.value += "7";
                    break;
                case 104:
                    elem_newLength.value += "8";
                    break;
                case 105:
                    elem_newLength.value += "9";
                    break;
                case 188:
                    elem_newLength.value += ".";
                    break;
                case 190:
                    elem_newLength.value += ".";
                    break;
                case 110:
                    elem_newLength.value += ".";
                    break;
            }
        };
        document.getElementById('myCanvas').oncontextmenu = function () {
            if (elem_useLine.checked) {
                elem_useLine.checked = false;
            }
            return false;
        };
        document.getElementById('triangulate_auto').onclick = function () {
            triangulate_rezhim = 1;
            elem_popup2.style.display = 'none';
            elem_window.style.display = 'block';
            resize_canvas();
            ok_enter_all();
        };
        document.getElementById('triangulate_manual').onclick = function () {
            triangulate_rezhim = 2;
            elem_popup2.style.display = 'none';
            elem_window.style.display = 'none';
            resize_canvas();

            var cir, op;
            for (var i = text_points.length; i--;) {
                op = sketch.commonPoint(lines[text_points[i].data.id_line1], lines[text_points[i].data.id_line2]);
                cir = new Path.Circle(op, 5);
                cir.fillColor = 'blue';
                text_points[i].data.circle = cir;
            }

            clicks_pt();
            save_cancel();
        };

        if (jQuery('#btn_place').length) {
            jQuery('#btn_place').click(function () {

                for (var i = 0; i < lightingArr.length; i++) {
                    [i].selected = false;

                }

                selectedLight = null;
                if (ready) {

                    var circle = new Path.Circle(new Point(g_layer.position.x + 20, g_layer.position.y + 20), 9);
                    circle.strokeColor = 'black';
                    lightingArr.push(circle);
                    jQuery('#btn_save_lights').removeAttr('disabled');
                    //console.log(circle)
                    //console.log(lightingArr)
                } else {
                    alert('Не достроен');
                }
            });
        }
        if (jQuery('#btn_placel').length) {
            jQuery('#btn_placel').click(function () {

                for (var i = 0; i < chandelier.length; i++) {
                    [i].selected = false;

                }

                selectedLight = null;
                if (ready) {

                    var circle = new Path.Circle(new Point(g_layer.position.x + 20, g_layer.position.y + 20), 20);
                    circle.strokeColor = 'black';
                    chandelier.push(circle);
                    jQuery('#btn_save_lights').removeAttr('disabled');
                    //console.log(circle)
                    //console.log(lightingArr)
                } else {
                    alert('Не достроен');
                }
            });
        }
        if (jQuery('#btn_place2').length) {
            jQuery('#btn_place2').click(function () {
                for (var i = 0; i < lightingArr.length; i++) {
                    lightingArr[i].selected = false;

                }
                selectedLight = null;
                if (ready) {
                    var circle = new Path.Circle(new Point(g_layer.position.x + 20, g_layer.position.y + 20), 9);
                    circle.strokeColor = 'black';
                    lightingArr.push(circle);
                    jQuery('#btn_save_lights2').removeAttr('disabled');
                } else {
                    alert('Не достроен');
                }

            });
        }
        if (jQuery('#btn_save_lights').length) {
            jQuery('#btn_save_lights').click(function () {
                save_lights_position();
            });

        }
        if (jQuery('#btn_save_lights2').length) {
            jQuery('#btn_save_lights2').click(function () {
                save_lights_position();
            });
        }
    }

    function save_lights_position() {
        sketch.toMirrorAll([lines, diags, inner_cutouts, seam_lines], lines_sort, diags, text_points, 1);
        sketch.removeNonVerticesTextPoints(text_points);
        sketch.drawCutoutsText(inner_cutouts, 1, FONT_LINES, 0);

        var j_walls = [],
            j_diags = [],
            j_text_points = [],
            j_inner_cutouts = [],
            j_lightingArr = [];
        for (var key = lines_sort.length; key--;) {
            lines_sort[key].data.text = undefined;
            j_walls[key] = lines_sort[key].exportJSON({asString: false});
        }
        for (var key = diag_sort.length; key--;) {
            diag_sort[key].data.text = undefined;
            j_diags[key] = diag_sort[key].exportJSON({asString: false});
        }
        for (var key = text_points.length; key--;) {
            j_text_points[key] = text_points[key].exportJSON({asString: false});
        }
        for (var key = inner_cutouts.length; key--;) {
            j_inner_cutouts[key] = inner_cutouts[key].exportJSON({asString: false});
        }

        for (var key = lightingArr.length; key--;) {
            j_lightingArr[key] = lightingArr[key].exportJSON({asString: false});
        }

        drawing_data = {
            walls: j_walls,
            diags: j_diags,
            vertices: j_text_points,
            innerCutouts: j_inner_cutouts,
            lights: j_lightingArr
        };
        //console.log(drawing_data);
        drawing_data = JSON.stringify(drawing_data);
        sketch.toMirrorAll([lines, diags, inner_cutouts, seam_lines], lines_sort, diags, text_points, 1);
        addLightsToLayer();
        calc_img = sketch.generateSVG(1, text_points, lines, diag_sort, inner_cutouts, lightingArr);
        jQuery.ajax({
            url: "/index.php?option=com_gm_ceiling&task=sketch.save_data_from_sketch",
            async: false,
            data: {
                calc_id: selectedCalculation.id,
                calc_img: btoa(calc_img),
                drawing_data: drawing_data
            },
            type: "post",
            success: function (data) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "success",
                    text: "Сохранено!"
                }).show();
            },
            error: function (data) {
                new Noty({
                    theme: 'relax',
                    timeout: 2000,
                    layout: 'topCenter',
                    type: "warning",
                    text: "Ошибка передачи данных"
                }).show();
            }
        });
    }

    function sort_sten() {
        lines_sort = [];
        g_points = sketch.getPathsPoints(lines);
        g_points = changePointsOrderForNaming(g_points, lines);
        var j;
        for (var i = 0; i < g_points.length; i++) {
            if (i === g_points.length - 1) {
                j = 0;
            } else {
                j = i + 1;
            }
            for (var key = lines.length; key--;) {
                if (sketch.comparePoints(lines[key].segments[0].point, g_points[i], HALF) && sketch.comparePoints(lines[key].segments[1].point, g_points[j], HALF)
                    || sketch.comparePoints(lines[key].segments[1].point, g_points[i], HALF) && sketch.comparePoints(lines[key].segments[0].point, g_points[j], HALF)) {
                    lines_sort.push(lines[key]);
                    break;
                }
            }
        }
    }

    function drawLabels(namedPoints) {
        var textPoints = [], pt, id1, id2;
        for (var i = 0; i < namedPoints.length; i++) {
            if (namedPoints[i].point) {
                pt = new PointText({
                    point: new Point(namedPoints[i].point.x - DIST_TP_X, namedPoints[i].point.y - DIST_TP_Y),
                    content: namedPoints[i].name,
                    fillColor: 'blue',
                    justification: 'center',
                    fontFamily: 'lucida console',
                    fontWeight: 'bold',
                    fontSize: (14 / view.zoom).toFixed(2) - 0
                });
                textPoints.push(pt);
                for (var key = lines.length; key--;) {
                    for (var j in lines[key].segments) {
                        if (sketch.comparePoints(namedPoints[i].point, lines[key].segments[j].point, HALF)) {
                            id1 = key;
                        }
                    }
                }
                for (var key = lines.length; key--;) {
                    if (key === id1) {
                        continue;
                    }
                    for (var j in lines[key].segments) {
                        if (sketch.comparePoints(namedPoints[i].point, lines[key].segments[j].point, HALF)) {
                            id2 = key;
                        }
                    }
                }
                pt.data.id_line1 = +id1;
                pt.data.id_line2 = +id2;
            }
        }
        return textPoints;
    }

    function createVertexNames() {
        var namedPoints = [];
        var allpoints = changePointsOrderForNaming(sketch.getPathsPoints(lines), lines);
        if (allpoints !== undefined) {
            for (var i = 0; i < allpoints.length; i++) {
                if (code === 90) {
                    code = 64;
                    alfavit++;
                }
                code++;
                if (alfavit === 0) {
                    namedPoints.push({point: allpoints[i], name: String.fromCharCode(code)});
                } else {
                    namedPoints.push({point: allpoints[i], name: String.fromCharCode(code) + alfavit});
                }
            }
        }
        return namedPoints;
    }

    function findWallsByPoint(points, point, flag, lines) {
        var temp_point = [];
        var j = 0, min_y, rez_point;
        if (flag === 1) {
            for (var j in lines) {
                if (sketch.comparePoints(lines[j].getFirstSegment().point, point, HALF) || sketch.comparePoints(lines[j].getLastSegment().point, point, HALF)) {
                    if (!sketch.comparePoints(lines[j].getFirstSegment().point, point, HALF) && lines[j].getFirstSegment().point.x >= point.x) {
                        temp_point.push(lines[j].getFirstSegment().point.clone());
                    }
                    if (!sketch.comparePoints(lines[j].getLastSegment().point, point, HALF) && lines[j].getLastSegment().point.x >= point.x) {
                        temp_point.push(lines[j].getLastSegment().point.clone());
                    }
                }
            }
            min_y = temp_point[0].y;
            rez_point = temp_point[0];
            for (var key = temp_point.length; key--;) {
                if (temp_point[key].y < min_y) {
                    min_y = temp_point[key].y;
                    rez_point = temp_point[key];
                }
            }
            return rez_point;
        }

        if (flag === 2) {
            for (var j in lines) {
                if (sketch.comparePoints(lines[j].getFirstSegment().point, point, HALF) || sketch.comparePoints(lines[j].getLastSegment().point, point, HALF)) {
                    if (!alreadyExist(points, lines[j].getFirstSegment().point)) {
                        return lines[j].getFirstSegment().point.clone();
                    }
                    if (!alreadyExist(points, lines[j].getLastSegment().point)) {
                        return lines[j].getLastSegment().point.clone();
                    }
                }
            }
        }
    }

    function changePointsOrderForNaming(points, lines) {
        var points_m, minX, minY;

        points_m = sketch.findMinAndMaxCordinate(points);

        if (points_m !== undefined) {
            minX = points_m.minX;
            minY = points_m.minY;
        }

        if ((minX !== undefined) && (minY !== undefined)) {
            var min_y, min_q, point, result = [];

            min_y = points_m.maxY;
            min_q = 0;

            for (var q in points) {
                if (points[q].x > minX - 0.5 && points[q].x < minX + 0.5 && points[q].y <= min_y) {
                    min_y = points[q].y;
                    min_q = q;
                }
            }
            point = points[min_q].clone();
            points.splice(min_q, 1);
            result.push(point);

            while (points.length !== 0) {
                if (result.length === 1) {
                    point = findWallsByPoint(result, result[result.length - 1], 1, lines);
                    points.splice(points.indexOf(point), 1);
                    result.push(point);
                } else {
                    point = findWallsByPoint(result, result[result.length - 1], 2, lines);
                    points.splice(points.indexOf(point), 1);
                    result.push(point);
                }

            }
            return result;
        }
    }

    function alreadyExist(arr, value) {
        var result = false;
        for (var i = 0; i < arr.length; i++) {
            if (sketch.comparePoints(arr[i], value, HALF)) {
                result = true;
            }
        }
        return result;
    }

    function migalka(path) {
        if (path.strokeColor.red === 1) {
            path.strokeColor = 'blue';
        } else {
            path.strokeColor = 'red';
        }
    }



    function drawing_data_rec_(sketch, drawing_data_rec) {
        clearElems();
        var restoredDrawingData = sketch.restoreDrawing(drawing_data_rec);
        lines = restoredDrawingData.lines;
        lines_sort = restoredDrawingData.sortedLines;
        diags = restoredDrawingData.diags;
        text_points = restoredDrawingData.textPoints;
        inner_cutouts = restoredDrawingData.innerCutouts;
        code = restoredDrawingData.charCode;
        alfavit = restoredDrawingData.alphabetNumber;
        lightingArr = restoredDrawingData.lights ? restoredDrawingData.lights : [];
        resize_canvas();
        sketch.toMirrorAll([lines, diags, inner_cutouts], lines_sort, diags, text_points, 1);
        diag_sortirovka();
        sketch.zoomOut(borderLines, lines, changeTextAfterZoom);
        ready = true;
        triangulate_bool = true;
        chert_close = true;
        svgImage = sketch.generateSVG(1, text_points, lines, diags, inner_cutouts, lightingArr)

        return svgImage;
    }



    save_cancel();
    if (lightingArr.length) {
        addLightsToLayer();
    }
//build_chert();

    $(document).on('change','#img_hidden',function(e) {
        getImgCanvas(drawing_data_rec_(sketch, JSON.parse($(this).val())));

    });



});

/*вынесены чтобы были глобальными*/
function addLightsToLayer() {
    if (lightingArr.length) {
        for (var i = 0; i < lightingArr.length; i++) {
            g_layer.addChild(lightingArr[i]);
            lightingArr[i].bringToFront();
            if (lightingArr[i].data.top.visible) {
                g_layer.addChild(lightingArr[i].data.top);
                g_layer.addChild(lightingArr[i].data.top.data.text);
            }
            if (lightingArr[i].data.right.visible) {
                g_layer.addChild(lightingArr[i].data.right);
                g_layer.addChild(lightingArr[i].data.right.data.text);
            }
            if (lightingArr[i].data.bottom.visible) {
                g_layer.addChild(lightingArr[i].data.bottom);
                g_layer.addChild(lightingArr[i].data.bottom.data.text);
            }
            if (lightingArr[i].data.left.visible) {
                g_layer.addChild(lightingArr[i].data.left);
                g_layer.addChild(lightingArr[i].data.left.data.text);
            }
        }
    }
}

function resize_canvas() {
    var nl_value;
    if (window.innerWidth > window.innerHeight) { //для мониторов
        jQuery("#myCanvas").css("height", document.body.clientHeight);
        jQuery("#sketch_editor2").css("width", 180);
        jQuery(".div_canvas").css("width", "calc(100% - 190px)");
        jQuery("#myCanvas").css("width", document.body.clientWidth - 200);
        view.viewSize = new Size(document.body.clientWidth - 200, document.body.clientHeight);
        nl_value = elem_newLength.value;
        elem_newLength = document.getElementById('newLength2');
        elem_newLength.value = nl_value;
        elem_useLine = document.getElementById('useLine2');
        elem_curve = document.getElementById('curve2');
        elem_arc = document.getElementById('arc2');
    } else { //для мобильных
        jQuery(".div_canvas").css("width", "100%");
        jQuery("#myCanvas").css("width", document.body.clientWidth);
        if (elem_window.style.display === "none" || elem_window.style.display === "") {

            jQuery("#menu").css("height", document.body.clientHeight - 120);
            if (yaBrowser) {

                jQuery('.div_canvas').css('height', document.body.clientHeight - 165);
                jQuery("#myCanvas").css("height", document.body.clientHeight - 181);
                view.viewSize = new Size(document.body.clientWidth, document.body.clientHeight - 181);
            } else {

                jQuery("#myCanvas").css("height", document.body.clientHeight - 116);
                view.viewSize = new Size(document.body.clientWidth, document.body.clientHeight - 116);
            }


        } else {

            jQuery("#menu").css("height", document.body.clientHeight - 204);
            if (yaBrowser) {

                jQuery('.div_canvas').css('height', document.body.clientHeight - 225);
                jQuery("#myCanvas").css("height", document.body.clientHeight - 246);
                jQuery('#window').attr('style', function (i, s) {
                    return (s || '') + 'bottom: 45px !important;'
                });
                view.viewSize = new Size(document.body.clientWidth, document.body.clientHeight - 246);
            } else {

                jQuery("#myCanvas").css("height", document.body.clientHeight - 200);
                view.viewSize = new Size(document.body.clientWidth, document.body.clientHeight - 200);
            }
        }
        nl_value = elem_newLength.value;
        elem_newLength = document.getElementById('newLength');
        elem_newLength.value = nl_value;
        elem_useLine = document.getElementById('useLine');
        elem_curve = document.getElementById('curve');
        elem_arc = document.getElementById('arc');
    }

    view.center = new Point(Math.round(view.viewSize.width / 2), Math.round(view.viewSize.height / 2));
}

function changeTextAfterZoom() {
    var z = (14 / view.zoom).toFixed(2) - 0;
    for (var key = text_points.length; key--;) {
        text_points[key].fontSize = z;
    }
    for (var key = text_manual_diags.length; key--;) {
        text_manual_diags[key].fontSize = z;
    }

    for (var key = lines.length, l_k; key--;) {
        l_k = lines[key];
        if (l_k.data.text !== undefined) {
            l_k.data.text.fontSize = z;
            l_k.data.text.position = l_k.position;
            l_k.data.text.bringToFront();
        }
    }
    for (var key = diag_sort.length; key--;) {
        if (diag_sort[key].data.text !== undefined) {
            diag_sort[key].data.text.fontSize = z;
            diag_sort[key].data.text.position = diag_sort[key].position;
            diag_sort[key].data.text.bringToFront();
        }
    }
    for (var key = diags.length; key--;) {
        if (text_manual_diags[key] !== undefined) {
            text_manual_diags[key].position = diags[key].position;
        }
    }
    for (var i = inner_cutouts.length; i--;) {
        for (var j = inner_cutouts[i].data.lines.length; j--;) {
            inner_cutouts[i].data.lines[j].data.text.remove();
        }
    }
    sketch.drawCutoutsText(inner_cutouts, 1, FONT_LINES, 0);
}

function clearElems() {
    g_layer.removeChildren();
    view.zoom = 1;
    elem_window.style.display = 'none';
    code = 64;
    alfavit = 0;
    lines = [];
    lines_sort = [];
    lightingArr = [];
    selectedLight = null;
    g_points = [];
    triangulate_bool = false;
    vh = 'v';
    chert_close = false;
    circles_for_draw = [];
    drawing_lines = [];
    drawing_curve_path = undefined;
    arc = undefined;
    line_arc_bottom = undefined;
    line_arc_height = undefined;
    start_draw_point = undefined;
    last_point_in_circle = undefined;

    inner_cutouts = [];
    cut_pos_line1 = undefined;
    cut_pos_line2 = undefined;
    cut_length = undefined;
    cut_width = undefined;
    cutout_line = undefined;
    inner_cutout_bool = false;

    text_points = [];
    diags = [];
    diag_sort = [];
    arcs_arr = [];

    manual_diag = undefined;
    text_manual_diags = [];
    triangulate_rezhim = 0;
    elem_input_n4.value = '';
    elem_input_n5.value = '';
    elem_input_n9.value = '';
    ready = false;
    close_sketch_click_bool = false;
    resize_canvas();
    elem_popup2.style.display = 'none';
    elem_popupCanvas.style.display = 'none';
    elem_popupCanvasColor.style.display = 'none';
    elem_popupLevel.style.display = 'none';
    elem_popupInnerCutout.style.display = 'none';
    draw_step = 0;
    current_input_length = undefined;
    button_reverse_arc = undefined;
    namedPoints = [];
    altAngles = [];
    jobs_from_sketch = [];
    goods_from_sketch = [];
}

function prepareLogin() {
    jQuery.ajax({
        url: "index.php?option=com_gm_ceiling&task=city.getData",
        data: {},
        type: "POST",
        dataType: 'json',
        async: false,
        success: function (data) {
            jQuery.each(data, function (index, elem) {
                jQuery("#select_city").append('<option value="' + elem.id + '">' + elem.name + ' (' + elem.region_name + ')</option>')
            });
        },
        error: function (data) {
            new Noty({
                theme: 'relax',
                layout: 'center',
                maxVisible: 5,
                type: "error",
                text: "Ошибка при получении списка городов!"
            });
        }
    });
    jQuery("#select_city").chosen();
    jQuery('#select_city_chosen').css("width", "100%");
    var SEND_PERIOD = 300000; // 5 минут в миллисекундах

    var sendTime = localStorage.getItem('sendTime'),
        date = new Date(),
        currentTime = date.getTime(),
        phone = localStorage.getItem('phone'),
        fio = localStorage.getItem('fio');

    if (!empty(sendTime)) {
        var leftTime = currentTime - sendTime;
        //console.log(leftTime);
        if (leftTime > SEND_PERIOD) {
            localStorage.removeItem('sendTime');
            localStorage.removeItem('phone');
            localStorage.removeItem('fio');
        } else {
            jQuery("#fio").val(fio);
            jQuery("#phone_client").val(phone);
            jQuery('#pass_block').show();
            jQuery('#getCode').prop('disabled', true);
            countDown(300 - (leftTime * 0.001).toFixed(0));
        }
    }

    jQuery("#mw_container").show();
    jQuery('#mw_auth').show('slow');

    window.intlTelInput(document.querySelector("#phone_client"), {
        initialCountry: "auto",
        separateDialCode: true,
        geoIpLookup: function (callback) {
            jQuery.get('https://ipinfo.io', function () {
            }, "jsonp").always(function (resp) {
                var countryCode = (resp && resp.country) ? resp.country : "ru";
                callback(countryCode);
            });
        },
        utilsScript: "template/js/utils.js"
    });

    jQuery("#phone_client").focusin(function () {
        var pl = jQuery(this).attr('placeholder');
        pl = pl.replace(new RegExp("[0-9]", "g"), "9")
        jQuery(this).mask(pl);
        //console.log(pl);
    });

}

function close_sketch_click_all() {
    if (elem_popup2.style.display === 'block' ||
        elem_popupCoordinates.style.display === 'block' ||
        elem_popupInnerCutout.style.display === 'block' ||
        elem_popupLevel.style.display === 'block' ||
        elem_popupCanvas.style.display === 'block' ||
        elem_popupCanvasColor.style.display === 'block' ||
        elem_popupBuild.style.display === 'block') {
        return;
    }
    if (!ready || inner_cutout_bool) {
        new Noty({
            theme: 'relax',
            timeout: 2000,
            layout: 'topCenter',
            type: "warning",
            text: "Чертеж не достроен!"
        }).show();
        return;
    }
    selectOneLevelCeiling();
    //elem_popupLevel.style.display = 'block';
}

function selectOneLevelCeiling() {
    var option;
    levelCeiling = 1;
    g_points = sketch.getPathsPointsBySort(lines_sort);

    var draft = new Path({segments: g_points, closed: true});
    for (var i = inner_cutouts.length; i--;) {
        draft.remove();
        draft = draft.subtract(inner_cutouts[i]);
    }
    ceilings = [draft];

    elem_selectFacture.innerHTML = '';

    for (var i = 0; i < texturesData.length; i++) {
        option = document.createElement('option');
        option.text = texturesData[i].texture.title;
        option.setAttribute('value', texturesData[i].texture.id);

        if (texturesData[i].texture.id == texture_id) {
            option.setAttribute('selected', true);
        }
        // option.setAttribute('selected',true);
        elem_selectFacture.add(option);
    }

    var textureId = elem_selectFacture.value;
    selectManufacturers(textureId);

    elem_selectFacture.onchange = function (e) {
        var textureId = this.value;
        selectManufacturers(textureId);
    }

    function selectManufacturers(textureId) {

        var option, manufacturers;
        elem_selectManufacturer.innerHTML = '';
        for (var i = 0; i < texturesData.length; i++) {
            if (texturesData[i].texture.id == textureId) {
                manufacturers = texturesData[i].manufacturers;
                for (var j = 0; j < manufacturers.length; j++) {
                    option = document.createElement('option');
                    option.text = manufacturers[j].name;
                    option.setAttribute('value', manufacturers[j].id);
                    if (manufacturers[j].name == manufacturer) {
                        option.setAttribute('selected', true);
                    }
                    ////console.log(manufacturers[j].name)
                    elem_selectManufacturer.add(option);
                }
                break;
            }
        }
    }

////console.log(option)
    elem_popupLevel.style.display = 'none';
    elem_popupCanvas.style.display = 'block';
}

function checkSizeLines() {
    for (var deltaX, deltaY, currentLight, i = 0; i < lightingArr.length; i++) {
        currentLight = lightingArr[i];
        deltaX = currentLight.position.x - currentLight.data.top.segments[0].point.x;
        deltaY = currentLight.position.y - currentLight.data.right.segments[0].point.y;
        currentLight.data.top.segments[0].point = currentLight.position;
        currentLight.data.right.segments[0].point = currentLight.position;
        currentLight.data.bottom.segments[0].point = currentLight.position;
        currentLight.data.left.segments[0].point = currentLight.position;
        currentLight.data.top.segments[1].point.x += deltaX;
        currentLight.data.top.segments[1].point.y += deltaY;
        currentLight.data.right.segments[1].point.x += deltaX;
        currentLight.data.right.segments[1].point.y += deltaY;
        currentLight.data.bottom.segments[1].point.x += deltaX;
        currentLight.data.bottom.segments[1].point.y += deltaY;
        currentLight.data.left.segments[1].point.x += deltaX;
        currentLight.data.left.segments[1].point.y += deltaY;

        currentLight.data.top.data.text.position = currentLight.data.top.position;
        currentLight.data.right.data.text.position = currentLight.data.right.position;
        currentLight.data.bottom.data.text.position = currentLight.data.bottom.position;
        currentLight.data.left.data.text.position = currentLight.data.left.position;
    }
}

function checkLightsOnline(light, type, draft) {
    /*
		type == 1 по горизинтали
		type == 2 по вертикали
	*/
    var tempPath1,
        tempPath2,
        closestLight1 = null,//верхний или левый
        closestLight2 = null;//нижний или правый

    if (type == 1) {
        for (var i = 0; i < lightingArr.length; i++) {

            if (lightingArr[i].id != light.id && lightingArr[i].position.y == light.position.y) {
                if (lightingArr[i].position.x - light.position.x < 0) {
                    if (!closestLight1) {
                        closestLight1 = lightingArr[i];
                    } else {
                        if (closestLight1.position.x - light.position.x < lightingArr[i].position.x - light.position.x) {
                            closestLight1 = lightingArr[i];
                        }
                    }
                }
                if (lightingArr[i].position.x - light.position.x > 0) {
                    if (!closestLight2) {
                        closestLight2 = lightingArr[i];
                    } else {
                        if (closestLight1.position.x - light.position.x > lightingArr[i].position.x - light.position.x) {
                            closestLight2 = lightingArr[i];
                        }
                    }
                }
            }
        }
        if (closestLight1) {
            light.data.left.segments[1].point = closestLight1.position;
            if (closestLight1.data.right.visible && light.data.left.visible && checkSizeLinePoint(closestLight1.data.right.segments[1].point)) {
                closestLight1.data.right.visible = false;
                closestLight1.data.right.data.text.visible = false;
            } else {
                if (!closestLight1.data.right.visible || !light.data.left.visible) {
                    light.data.left.visible = true;
                    light.data.left.data.text.visible = true;
                    if (checkSizeLinePoint(closestLight1.data.right.segments[1].point)) {
                        closestLight1.data.right.visible = false;
                        closestLight1.data.right.data.text.visible = false;
                    }
                }
            }

        }
        if (closestLight2) {
            light.data.right.segments[1].point = closestLight2.position;
            if (closestLight2.data.left.visible && light.data.right.visible && checkSizeLinePoint(closestLight2.data.left.segments[1].point)) {
                closestLight2.data.left.visible = false;
                closestLight2.data.left.data.text.visible = false;
            } else {
                if (!closestLight2.data.left.visible || !light.data.right.visible) {
                    light.data.right.visible = true;
                    light.data.right.data.text.visible = true;
                    if (checkSizeLinePoint(closestLight2.data.left.segments[1].point)) {
                        closestLight2.data.left.visible = false;
                        closestLight2.data.left.data.text.visible = false;
                    }
                }
            }

        }
        if (!closestLight1 && !closestLight2) {
            tempPath1 = new Path(new Point(0, light.position.y), new Point(light.position.x, light.position.y));
            light.data.left.segments[1].point = draft.getIntersections(tempPath1)[0].point;
            light.data.left.data.text.visible = true;
            light.data.left.visible = true;
            tempPath2 = new Path(new Point(light.position.x, light.position.y), new Point(document.body.clientWidth, light.position.y));
            light.data.right.segments[1].point = draft.getIntersections(tempPath2)[0].point;
            light.data.right.data.text.visible = true;
            light.data.right.visible = true;

            tempPath1.remove();
            tempPath2.remove();
        }


    }
    if (type == 2) {
        for (var i = 0; i < lightingArr.length; i++) {
            if (lightingArr[i] != light && lightingArr[i].position.x == light.position.x) {
                if (lightingArr[i].position.y - light.position.y < 0) {
                    if (!closestLight1) {
                        closestLight1 = lightingArr[i];
                    } else {
                        if (closestLight1.position.y - light.position.y < lightingArr[i].position.y - light.position.y) {
                            closestLight1 = lightingArr[i];
                        }
                    }
                }
                if (lightingArr[i].position.y - light.position.y > 0) {
                    if (!closestLight2) {
                        closestLight2 = lightingArr[i];
                    } else {
                        if (closestLight1.position.y - light.position.y > lightingArr[i].position.y - light.position.y) {
                            closestLight2 = lightingArr[i];
                        }
                    }
                }
            }
        }
        if (closestLight1) {
            light.data.top.segments[1].point = closestLight1.position;
            if (closestLight1.data.bottom.visible && light.data.top.visible && checkSizeLinePoint(closestLight1.data.bottom.segments[1].point)) {
                closestLight1.data.bottom.visible = false;
                closestLight1.data.bottom.data.text.visible = false;
            } else {
                if (!closestLight1.data.bottom.visible || !light.data.top.visible) {
                    light.data.top.visible = true;
                    light.data.top.data.text.visible = true;
                    if (checkSizeLinePoint(closestLight1.data.bottom.segments[1].point)) {
                        closestLight1.data.bottom.visible = false;
                        closestLight1.data.bottom.data.text.visible = false;
                    }
                }
            }
            /*closestLight1.data.bottom.visible = false;
			closestLight1.data.bottom.data.text.visible = false;*/
        }
        if (closestLight2) {
            light.data.bottom.segments[1].point = closestLight2.position;
            /*closestLight2.data.top.visible = false;
			closestLight2.data.top.data.text.visible = false;*/
            if (closestLight2.data.top.visible && light.data.bottom.visible && checkSizeLinePoint(closestLight2.data.top.segments[1].point)) {
                closestLight2.data.top.visible = false;
                closestLight2.data.top.data.text.visible = false;
            } else {
                if (!closestLight2.data.top.visible || !light.data.bottom.visible) {
                    light.data.bottom.visible = true;
                    light.data.bottom.data.text.visible = true;
                    if (checkSizeLinePoint(closestLight2.data.top.segments[1].point)) {
                        closestLight2.data.top.visible = false;
                        closestLight2.data.top.data.text.visible = false;
                    }
                }
            }
        }
        if (!closestLight1 && !closestLight2) {
            tempPath1 = new Path(new Point(light.position.x, 0), new Point(light.position.x, light.position.y));
            light.data.top.segments[1].point = draft.getIntersections(tempPath1)[0].point;
            light.data.top.data.text.visible = true;
            light.data.top.visible = true;
            tempPath2 = new Path(new Point(light.position.x, light.position.y), new Point(light.position.x, document.body.clientHeight));
            light.data.bottom.segments[1].point = draft.getIntersections(tempPath2)[0].point;
            light.data.bottom.data.text.visible = true;
            light.data.bottom.visible = true;
            tempPath1.remove();
            tempPath2.remove();
        }
        closestLight1 = null;
        closestLight2 = null;

    }
    sketch.removeLinesText(light.data);
    sketch.addTextLine(light.data.top, 1, FONT_LINES, 0);
    sketch.addTextLine(light.data.right, 1, FONT_LINES, 0);
    sketch.addTextLine(light.data.bottom, 1, FONT_LINES, 0);
    sketch.addTextLine(light.data.left, 1, FONT_LINES, 0);

}

function getcurrentDrawing() {



}