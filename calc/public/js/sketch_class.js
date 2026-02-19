const DIST_TP_X = 6, DIST_TP_Y = 3, ONE_M = 100, ONE_M_SQ = 10000,
	FONT_LINES = 'arial', FONT_DIAGS = 'times', HALF = 0.5,
	MIN_ZOOM = 0.2, MAX_ZOOM = 10, STANDART_SHRINK_PERCENT = 0.93,
	PRICE_TOLERANCE = 50, LINE_WIDTH = 2, DIAG_WIDTH = 1;

function Sketch() {
	this.gLayer = project.activeLayer;
}

Sketch.prototype.alignCenter = function() {
	var gLayer = this.gLayer, draft = new CompoundPath();

	draft.addChildren(gLayer.children);
	gLayer.removeChildren();
	
	draft.position = view.center;

	gLayer.addChildren(draft.children);
	draft.remove();
};

Sketch.prototype.toMirror = function(objectsArrays) {
	var gLayer = this.gLayer, draft = new CompoundPath();

	for (var key in objectsArrays) {
		draft.addChildren(objectsArrays[key]);
	}

	draft.scale(-1, 1);

	gLayer.removeChildren();

	for (var key in objectsArrays) {
		gLayer.addChildren(objectsArrays[key]);
	}

	draft.remove();
};

Sketch.prototype.toMirrorAll = function(objectsArrays, sortedLines, diags, textPoints, shrinkPercent) {
	this.toMirror(objectsArrays);
	this.connectAllSegments(sortedLines, diags);
	if (shrinkPercent === 1) {
		this.drawLinesText(sortedLines, 1, FONT_LINES, 0);
		this.drawLinesText(diags, 1, FONT_DIAGS, 1);
	} else {
		this.drawLinesText(sortedLines, STANDART_SHRINK_PERCENT, FONT_LINES, 1);
		this.drawLinesText(diags, STANDART_SHRINK_PERCENT, FONT_DIAGS, 1);
	}
	this.moveVertexNamesLinesSort(sortedLines, textPoints);
};

Sketch.prototype.rotateAll = function(angle) {
	var gLayer = this.gLayer;
	for (var i = gLayer.children.length; i--;) {
		if (gLayer.children[i].segments !== undefined) {
			gLayer.children[i].rotate(angle, view.center);
		}
	}
};

Sketch.prototype.removeNonVerticesTextPoints = function(textPoints) {
	var del_bool = true;
	for (var i = textPoints.length; i--;) {
		if (textPoints[i].data.id_line1 === undefined || textPoints[i].data.id_line2 === undefined) {
			textPoints[i].remove();
		}
	}
};

Sketch.prototype.drawSeams = function(canvases) {
	var gLayer = this.gLayer, line, seamsLines = [];

	for (var i = canvases.length, c_i; i--;) {
		if (i === 0) {
			break;
		}
		c_i = canvases[i];
		line = new Path.Line(c_i.material.bounds.bottomLeft.clone(), c_i.material.bounds.bottomRight.clone());
		gLayer.addChild(line);
		line.strokeWidth = 2;
		line.strokeColor = 'red';
		c_i.material.remove();
		c_i.parts.remove();
		c_i.cuts.remove();
		seamsLines.push(line);
	}
	return seamsLines;
};

Sketch.prototype.connectAllSegments = function(sortedLines, diags) {
	for (var i = sortedLines.length, ls_i_s0, ls_i_s1; i--;) {
		ls_i_s0 = sortedLines[i].segments[0].point;
		ls_i_s1 = sortedLines[i].segments[1].point;
		ls_i_s0.x = ls_i_s0.x.toFixed(2)-0;
		ls_i_s0.y = ls_i_s0.y.toFixed(2)-0;
		ls_i_s1.x = ls_i_s1.x.toFixed(2)-0;
		ls_i_s1.y = ls_i_s1.y.toFixed(2)-0;
	}
	for (var i = diags.length, d_i_s0, d_i_s1; i--;) {
		d_i_s0 = diags[i].segments[0].point;
		d_i_s1 = diags[i].segments[1].point;
		d_i_s0.x = d_i_s0.x.toFixed(2)-0;
		d_i_s0.y = d_i_s0.y.toFixed(2)-0;
		d_i_s1.x = d_i_s1.x.toFixed(2)-0;
		d_i_s1.y = d_i_s1.y.toFixed(2)-0;
	}
	var j = 0, p1, p2, rast;
	for (var i = sortedLines.length, l_i, l_j, min_rast; i--;) {
		l_i = sortedLines[i];
		if (i === 0) {
			j = sortedLines.length - 1;
		} else {
			j = i - 1;
		}
		l_j = sortedLines[j];
		min_rast = 40000;
		for (var ii = l_i.segments.length, ls_ii; ii--;) {
			ls_ii = l_i.segments[ii].point;
			for (var jj = l_j.segments.length, ls_jj; jj--;) {
				ls_jj = l_j.segments[jj].point;
				rast = Math.sqrt(Math.pow(ls_ii.x - ls_jj.x, 2) + Math.pow(ls_ii.y - ls_jj.y, 2));
				if (min_rast > rast) {
					min_rast = rast;
					p1 = ii;
					p2 = jj;
				}
			}
		}
		l_i.segments[p1].remove();
		l_i.add(l_j.segments[p2].point);
	}
	
	var gPoints = this.getPathsPointsBySort(sortedLines);

	for (var i = diags.length, d_i, min_rast_s0, min_rast_s1; i--;) {
		d_i = diags[i];
		min_rast_s0 = 40000;
		min_rast_s1 = 40000;
		for (var j = gPoints.length, gp_j, ds; j--;) {
			gp_j = gPoints[j];
			ds = d_i.segments[0].point;
			rast = Math.sqrt(Math.pow(ds.x - gp_j.x, 2) + Math.pow(ds.y - gp_j.y, 2));
			if (min_rast_s0 > rast) {
				min_rast_s0 = rast;
				p1 = gp_j;
			}
			ds = d_i.segments[1].point;
			rast = Math.sqrt(Math.pow(ds.x - gp_j.x, 2) + Math.pow(ds.y - gp_j.y, 2));
			if (min_rast_s1 > rast) {
				min_rast_s1 = rast;
				p2 = gp_j;
			}
		}
		d_i.removeSegments();
		d_i.addSegments([p1, p2]);
	}
};

Sketch.prototype.getPathsPoints = function(lines) {
	var allpoints = [];
    for (var j = lines.length; j--;) {
        for (var k = 0; k < lines[j].segments.length; k++) {
            allpoints.push(lines[j].segments[k].point.clone());
        }
    }
    return this.unique(allpoints);
};

Sketch.prototype.unique = function(arr) {
    var result = [], str;
    nextInput:
        for (var i = 0; i < arr.length; i++) {
            str = arr[i].clone();
            for (var j = 0; j < result.length; j++) {
                if (this.comparePoints(result[j], str, HALF)) continue nextInput;
            }
            result.push(str);
        }

    return result;
};

Sketch.prototype.getPathsPointsBySort = function(sortedLines) {
	var allpoints = [];
	for (var j = 0, bj; j < sortedLines.length; j++) {
		if (j === 0) {
			bj = sortedLines.length - 1;
		} else {
			bj = j - 1;
		}
		allpoints.push(this.commonPoint(sortedLines[j], sortedLines[bj]));
	}
	return allpoints;
};

Sketch.prototype.findMinAndMaxCordinate = function(points) {
    if (points.length > 0) {
        var minX = points[0].x;
        var maxX = points[0].x;
        var minY = points[0].y;
        var maxY = points[0].y;
        for (var i = 1; i < points.length; i++) {
            if (points[i].x < minX) {
                minX = points[i].x;
            }
            if (points[i].x > maxX) {
                maxX = points[i].x;
            }
            if (points[i].y < minY) {
                minY = points[i].y;
            }
            if (points[i].y > maxY) {
                maxY = points[i].y;
            }
        }
        return { minX:minX, maxX:maxX, minY:minY, maxY:maxY };
    }
};

Sketch.prototype.moveVertexNamesLinesSort = function(sortedLines, textPoints) {
	for (var i = 0, ls_i, ls_j, len = sortedLines.length; i < len; i++) {
    	ls_i = sortedLines[i];
    	if (i !== 0) {
    		ls_j = sortedLines[i - 1];
    	} else {
    		ls_j = sortedLines[len - 1];
    	}
    	if (ls_i !== ls_j && this.commonPoint(ls_i, ls_j) !== null) {
    		this.moveVertexName(ls_i, ls_j, this.commonPoint(ls_i, ls_j), textPoints);
    	}
    }
};

Sketch.prototype.moveVertexName = function(line1, line2, newPoint, textPoints) {
	var pt_id;
	for (var key = textPoints.length, tp_k; key--;) {
		tp_k = textPoints[key];
		if (tp_k.data.id_line1 === line1.data.id && tp_k.data.id_line2 === line2.data.id
			|| tp_k.data.id_line2 === line1.data.id && tp_k.data.id_line1 === line2.data.id) {
			tp_k.point = new Point(newPoint.x - DIST_TP_X, newPoint.y - DIST_TP_Y);
			this.gLayer.addChild(tp_k);
			break;
		}
	}
};

Sketch.prototype.getLineOrientation = function(line) {
	if (line.firstSegment.point.x === line.lastSegment.point.x) {
		return 'v';
	} else if (line.firstSegment.point.y === line.lastSegment.point.y) {
		return 'h';
	}
	return null;
};

Sketch.prototype.linesOnLine = function(item, lines) {
	var ret_rez = [];
	for (var key = lines.length; key--;) {
		if (lines[key].intersects(item)) {
			ret_rez.push(lines[key]);	
		}
	}
	return ret_rez;
};

Sketch.prototype.getAngleCoef = function(line) {
	var delta_y = new Decimal(line.segments[1].point.y).minus(line.segments[0].point.y), 
		delta_x = new Decimal(line.segments[1].point.x).minus(line.segments[0].point.x),
		coef = delta_y.dividedBy(delta_x).toNumber();
	return (coef === -Infinity) ? Infinity : coef;
};

Sketch.prototype.isClockWise = function(a, b, c) {
	var result = 0;
	result = b.x * c.y - b.y * c.x - a.x * c.y + a.x * b.y + a.y * c.x - a.y * b.x;
	//console.log(a.x, a.y, b.x, b.y, c.x, c.y);
	//console.log(result);
	if (result === 0) {
		return null;
	}
	if (result > 0) {
		return true;
	}
	return false;
};

Sketch.prototype.getLengthBetweenPoints = function(point1, point2) {
	var delta_y = new Decimal(point1.y).minus(point2.y), 
		delta_x = new Decimal(point1.x).minus(point2.x),
		length = Decimal.sqrt(Decimal.pow(delta_y, 2).plus(Decimal.pow(delta_x, 2))).toNumber();
	return length;
};

Sketch.prototype.isParallel = function(line1, line2) {
	if (this.getAngleCoef(line1) === this.getAngleCoef(line2)) {
		return true;
	}
	return false;
};

Sketch.prototype.compareLines = function(line1, line2) {
	var line1_s0_p = line1.firstSegment.point,
		line1_s1_p = line1.lastSegment.point,
		line2_s0_p = line2.firstSegment.point,
		line2_s1_p = line2.lastSegment.point;
	if ((line1_s0_p.x === line2_s0_p.x 
		&& line1_s0_p.y === line2_s0_p.y
		&& line1_s1_p.x === line2_s1_p.x
		&& line1_s1_p.y === line2_s1_p.y) 
		|| (line1_s0_p.x === line2_s1_p.x 
		&& line1_s0_p.y === line2_s1_p.y
		&& line1_s1_p.x === line2_s0_p.x
		&& line1_s1_p.y === line2_s0_p.y)) {
		return true;
	}
	return false;
};

Sketch.prototype.nearestLines = function(arr, point, limit) {
	var cir = new Path.Circle(point, limit), result = 0;
	for (var i = arr.length; i--;) {
		if (arr[i].intersects(cir) && !this.comparePoints(point,arr[i].segments[0].point,HALF) && !this.comparePoints(point,arr[i].segments[1].point,HALF)) {
			result++;
		}
	}
	cir.remove();
	return result;
};

Sketch.prototype.getNearestDistancePoint = function(point, arr_points) {
	var result_point = arr_points[0], min_length = this.getLengthBetweenPoints(point, result_point), len;
	for (var i = arr_points.length; i--;) {
		len = this.getLengthBetweenPoints(point, arr_points[i]);
		if (len < min_length) {
			min_length = len;
			result_point = arr_points[i];
		}
	}
	return result_point;
};

Sketch.prototype.comparePoints = function(point1, point2, limit) {
	if (point1.x > point2.x - limit && point1.x < point2.x + limit &&
		point1.y > point2.y - limit && point1.y < point2.y + limit) {
		return true;
	}
	return false;
};

Sketch.prototype.commonPoint = function(line1, line2) {
	const LIMIT = 0.5;
	var l1s = line1.segments[0].point,
		l2s0 = line2.segments[0].point,
		l2s1 = line2.segments[1].point;
	if (this.comparePoints(l1s, l2s0, LIMIT) || this.comparePoints(l1s, l2s1, LIMIT)) {
		return l1s.clone();
	}
	l1s = line1.segments[1].point;
	if (this.comparePoints(l1s, l2s0, LIMIT) || this.comparePoints(l1s, l2s1, LIMIT)) {
		return l1s.clone();
	}
	return null;
};

Sketch.prototype.isIntersect = function(point1, point2, point3, point4) {
    if (point1 && point2 && point3 && point4) {
        var ax1 = point1.x,
            ay1 = point1.y,
            ax2 = point2.x,
            ay2 = point2.y,
            bx1 = point3.x,
            by1 = point3.y,
            bx2 = point4.x,
            by2 = point4.y,
            v1, v2, v3, v4, result;
        v1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
        v2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1);
        v3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1);
        v4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);

        result = (v1 * v2 < -0.1) && (v3 * v4 < -0.1);
        return result;
    }
};

Sketch.prototype.getCirclesIntersections = function(xp1_o, yp1_o, r1, xp2_o, yp2_o, r2) {
	if (xp1_o === xp2_o && yp1_o === yp2_o) {
		return false;
	}
	var xp1 = 0, yp1 = 0;
	var xp2 = new Decimal(xp2_o).minus(xp1_o).toNumber();
	var yp2 = new Decimal(yp2_o).minus(yp1_o).toNumber();
	var c_chis_dec = Decimal.pow(r2, 2).minus(Decimal.pow(xp2, 2)).minus(Decimal.pow(yp2, 2)).minus(Decimal.pow(r1, 2));
	var c = c_chis_dec.dividedBy(-2).toNumber();

	if (xp2 !== 0) {
		var a = Decimal.pow(yp2, 2).plus(Decimal.pow(xp2, 2)).toNumber();
		var b = new Decimal(-2).times(yp2).times(c).toNumber();
		var e = Decimal.pow(c, 2).minus(Decimal.pow(r1, 2).times(Decimal.pow(xp2, 2))).toNumber();
		var d = Decimal.pow(b, 2).minus(new Decimal(4).times(a).times(e)).toNumber();
		if (d <= 0) {
			return false;
		} else {
			var y1 = new Decimal(new Decimal(-b).plus(Decimal.sqrt(d))).dividedBy(new Decimal(2).times(a)).toNumber();
			var y2 = new Decimal(new Decimal(-b).minus(Decimal.sqrt(d))).dividedBy(new Decimal(2).times(a)).toNumber();
			var x1 = new Decimal(new Decimal(c).minus(new Decimal(y1).times(yp2))).dividedBy(xp2).toNumber();
			var x2 = new Decimal(new Decimal(c).minus(new Decimal(y2).times(yp2))).dividedBy(xp2).toNumber();
		}
	} else {
		var y1 = new Decimal(c).dividedBy(yp2).toNumber();
		var y2 = y1;
		var x1 = Decimal.sqrt(Decimal.pow(r1, 2).minus(Decimal.pow(c, 2).dividedBy(Decimal.pow(yp2, 2)))).toNumber();
		var x2 = -Decimal.sqrt(Decimal.pow(r1, 2).minus(Decimal.pow(c, 2).dividedBy(Decimal.pow(yp2, 2)))).toNumber();
	}
	x1 = (new Decimal(x1).plus(xp1_o).toNumber()).toFixed(2)-0;
	x2 = (new Decimal(x2).plus(xp1_o).toNumber()).toFixed(2)-0;
	y1 = (new Decimal(y1).plus(yp1_o).toNumber()).toFixed(2)-0;
	y2 = (new Decimal(y2).plus(yp1_o).toNumber()).toFixed(2)-0;

	return [new Point(x1, y1), new Point(x2, y2)];
};

Sketch.prototype.getAngle = function(center, point) {
    var x = new Decimal(point.x).minus(center.x).toNumber();
    var y = new Decimal(point.y).minus(center.y).toNumber();
    if (x === 0) {
		return (y > 0) ? 180 : 0;
	}
    var a = Decimal.atan(new Decimal(y).dividedBy(x)).times(180).dividedBy(Decimal.acos(-1));
    a = (x > 0) ? a.plus(90).toNumber() : a.plus(270).toNumber();
    return a;
};

Sketch.prototype.addTextLine = function(line, shrinkPercent, fontFamily, decimalPlaces) {
	var gLayer = this.gLayer;
	if (line.data.text === undefined) {
		line.data.text = new PointText();
	} else {
		gLayer.addChild(line.data.text);
	}
	var t_l = line.data.text, l_s0 = line.segments[0].point, l_s1 = line.segments[1].point;
	t_l.fontFamily = fontFamily;
	t_l.fontWeight = 'bold';
	t_l.fillColor = 'black';
	t_l.justification = 'center';
	t_l.fontSize = (14 / view.zoom).toFixed(2)-0;
	if (decimalPlaces === 0) {
		t_l.content = Math.round(line.length);
	} else {
		t_l.content = new Decimal(line.length).times(shrinkPercent).toNumber().toFixed(1);
	}
	t_l.rotation = 0;
	var angle = (Math.atan((l_s1.y - l_s0.y) / (l_s1.x - l_s0.x)) * 180) / Math.PI;
    t_l.rotate(angle);
    t_l.position = line.position;
    t_l.bringToFront();
};

Sketch.prototype.drawLinesText = function(lines, shrinkPercent, fontFamily, decimalPlaces) {
	for (var key = lines.length; key--;) {
		this.addTextLine(lines[key], shrinkPercent, fontFamily, decimalPlaces);
	}
};

Sketch.prototype.removeLinesText = function(lines) {
	for (var key = lines.length; key--;) {
		if (lines[key].data.text !== undefined) {
			lines[key].data.text.remove();
		}
	}
};

Sketch.prototype.bringToFrontLinesText = function(lines) {
	for (var key = lines.length; key--;) {
		if (lines[key].data.text !== undefined) {
			lines[key].data.text.bringToFront();
		}
	}
};

Sketch.prototype.drawCutoutsText = function(innerCutouts, shrinkPercent, fontFamily, decimalPlaces) {
	var tempLine, pNext, cutout;
	for (var k = innerCutouts.length; k--;) {
		cutout = innerCutouts[k];
		if (cutout.data.lines !== undefined) {
			for (var j = cutout.data.lines.length; j--;) {
				cutout.data.lines[j].data.text.remove();
				cutout.data.lines[j].remove();
			}
		}
		cutout.data.lines = [];
		for (var i = cutout.segments.length; i--;) {
			if (i === 0) {
				pNext = cutout.segments[cutout.segments.length - 1].point;
			} else {
				pNext = cutout.segments[i - 1].point;
			}
			tempLine = new Path.Line(
				cutout.segments[i].point,
				pNext
			);
			cutout.data.lines.push(tempLine);
		}
		this.drawLinesText(cutout.data.lines, shrinkPercent, fontFamily, decimalPlaces);
		for (var i = cutout.data.lines.length; i--;) {
			cutout.data.lines[i].remove();
		}
	}
};

Sketch.prototype.wheelZoom = function(e, functions) {
	if (e.target.tagName !== 'CANVAS') {
		return false;
	}
	if (e.wheelDelta < 0 && view.zoom > MIN_ZOOM) {
		view.zoom = new Decimal(view.zoom).minus(0.05).toNumber();
	} else if (e.wheelDelta > 0 && view.zoom < MAX_ZOOM) {
		view.zoom = new Decimal(view.zoom).plus(0.05).toNumber();
	}
	for (var i = functions.length; i--;) {
		functions[i]();
	}
};

Sketch.prototype.touchZoom = function(e, touchZoomObj, functions) {
	if (e.touches.length > 1) {
		var et0 = e.touches[0], et1 = e.touches[1];

		if (touchZoomObj.touch1 === undefined || touchZoomObj.touch2 === undefined) {
			touchZoomObj.touch1 = new Point(et0.pageX, et0.pageY);
			touchZoomObj.touch2 = new Point(et1.pageX, et1.pageY);
			touchZoomObj.dist1 = Math.sqrt(Math.pow(touchZoomObj.touch2.x - touchZoomObj.touch1.x, 2) 
											+ Math.pow(touchZoomObj.touch2.y - touchZoomObj.touch1.y, 2));
		} else {
			touchZoomObj.dist2 = Math.sqrt(Math.pow(et1.pageX - et0.pageX, 2) + Math.pow(et1.pageY - et0.pageY, 2));
			if (touchZoomObj.dist2 < touchZoomObj.dist1 && view.zoom > MIN_ZOOM) {
				view.zoom = new Decimal(view.zoom).minus(0.05).toNumber();
			} else if (touchZoomObj.dist2 > touchZoomObj.dist1 && view.zoom < MAX_ZOOM) {
				view.zoom = new Decimal(view.zoom).plus(0.05).toNumber();
			}

			for (var i = functions.length; i--;) {
				functions[i]();
			}
			
			touchZoomObj.dist1 = Math.sqrt(Math.pow(et1.pageX - et0.pageX, 2) + Math.pow(et1.pageY - et0.pageY, 2));
		}
	}
	return touchZoomObj;
};

Sketch.prototype.generateSVG = function(flag, textPoints, lines, diags, innerCutouts) {
	var gLayer = this.gLayer,
		allTexts = [];
	for (var i = gLayer.children.length; i--;) {
		if (gLayer.children[i].className === 'Path' || gLayer.children[i].className === 'CompoundPath') {
			gLayer.children[i].fillColor = new Color(0, 0, 0, 0);
		}
	}
	view.zoom = 1;

	for (var i = textPoints.length; i--;) {
		textPoints[i].fontSize = 14;
		textPoints[i].bringToFront();
		allTexts.push(textPoints[i]);
		for (var j = textPoints.length; j--;) {
			if (textPoints[i] !== textPoints[j] && textPoints[i].intersects(textPoints[j])) {
				textPoints[i].fontSize = 12;
				textPoints[j].fontSize = 12;
				break;
			}
		}
	}

	if (flag === 1) {
		for (var i = diags.length, td_i, d_l; i--;) {
			td_i = diags[i].data.text;
			if (td_i === undefined) {
				continue;
			}
			d_l = diags[i].length;
			td_i.fontSize = 12;
			if (d_l < 40) {
				td_i.fontSize -= 1;
				if (d_l < 30) {
					td_i.fontSize -= 1;
					if (d_l < 20) {
						td_i.fontSize -= 1;
					}
				}
			}
			if (d_l < 10) {
				td_i.remove();
			} else {
				td_i.position = diags[i].position;
				td_i.bringToFront();
				allTexts.push(td_i);
			}
		}
	} else {
		this.removeLinesText(diags);
	}
	
	for (var i = lines.length, l_i, tl; i--;) {
		l_i = lines[i];
		tl = l_i.data.text;
		if (tl === undefined) {
			continue;
		}
		tl.fontSize = 14;
		if (l_i.length < 40) {
			tl.fontSize -= 1;
			if (l_i.length < 30) {
				tl.fontSize -= 1;
				if (l_i.length < 20) {
					tl.fontSize -= 1;
				}
			}
		}
		if (l_i.length < 10) {
			tl.remove();
		} else {
			tl.position = l_i.position;
			tl.bringToFront();
			allTexts.push(tl);
		}
	}

	for (var i = innerCutouts.length; i--;) {
		for (var j = innerCutouts[i].data.lines.length; j--;) {
			l_i = innerCutouts[i].data.lines[j];
			tl = l_i.data.text;
			if (tl === undefined) {
				continue;
			}
			tl.fontSize = 14;
			if (l_i.length < 40) {
				tl.fontSize -= 1;
				if (l_i.length < 30) {
					tl.fontSize -= 1;
					if (l_i.length < 20) {
						tl.fontSize -= 1;
					}
				}
			}
			if (l_i.length < 10) {
				tl.remove();
			} else {
				tl.position = l_i.position;
				tl.bringToFront();
				allTexts.push(tl);
			}
		}
	}

	if (flag === 1) {
		for (var i = diags.length, td_i, d_l; i--;) {
			td_i = diags[i].data.text;
			if (td_i === undefined) {
				continue;
			}
			for (var j = allTexts.length; j--;) {
				if (td_i.parent !== null &&
					allTexts[j].parent !== null &&
					td_i !== allTexts[j] &&
					td_i.intersects(allTexts[j])) {
					td_i.remove();
					break;
				}
			}
		}
	}
	for (var i = innerCutouts.length; i--;) {
		for (var j = innerCutouts[i].data.lines.length; j--;) {
			tl = innerCutouts[i].data.lines[j].data.text;
			if (tl === undefined) {
				continue;
			}
			for (var k = allTexts.length; k--;) {
				if (tl.parent !== null &&
					allTexts[k].parent !== null &&
					tl !== allTexts[k] &&
					tl.intersects(allTexts[k])) {
					tl.remove();
					break;
				}
			}
		}
	}
	for (var i = lines.length, l_i, tl; i--;) {
		tl = lines[i].data.text;
		if (tl === undefined) {
			continue;
		}
		for (var j = allTexts.length; j--;) {
			if (tl.parent !== null &&
				allTexts[j].parent !== null &&
				tl !== allTexts[j] &&
				tl.intersects(allTexts[j])) {
				tl.remove();
				break;
			}
		}
	}

	view.update();

	var bounds = gLayer.bounds.clone();
	gLayer.bounds = new Rectangle({
		from: [0, 0], 
		to: [bounds.bottomRight.x - bounds.topLeft.x, bounds.bottomRight.y - bounds.topLeft.y]
	});
	var rec = new Rectangle({from: bounds.topLeft, to: bounds.bottomRight});
	var svg = gLayer.exportSVG();
	svg = '<?xml version="1.0" ?><svg height="'+rec.height.toFixed(0)+'px" width="'+rec.width.toFixed(0)+'px" xmlns="http://www.w3.org/2000/svg">'+svg.outerHTML+'</svg>';

	gLayer.bounds = bounds;

	return svg;
};

Sketch.prototype.getLengthOfLines = function(lines, diags, textPoints) {
	var l1, l2, lc, linesLength = {walls:[],diags:[]};
	for (var i = 0, ls_i, ls_i_s0, ls_i_s1; i < lines.length; i++) {
		ls_i = lines[i];
		ls_i_s0 = ls_i.segments[0].point;
		ls_i_s1 = ls_i.segments[1].point;
		l1 = '';
		l2 = '';
		for (var j = textPoints.length, tp_j; j--;) {
			tp_j = textPoints[j];
			if (this.comparePoints(new Point(ls_i_s0.x - DIST_TP_X, ls_i_s0.y - DIST_TP_Y), tp_j.point, HALF)) {
				l1 = tp_j.content;
			}
			if (this.comparePoints(new Point(ls_i_s1.x - DIST_TP_X, ls_i_s1.y - DIST_TP_Y), tp_j.point, HALF)) {
				l2 = tp_j.content;
			}
		}
		if (l1 > l2) {
			lc = l1;
			l1 = l2;
			l2 = lc;
		}
		linesLength.walls.push({name: l1+l2, length: ls_i.length.toFixed(1)});
	}

	for (var i = 0, d_i, d_i_s0, d_i_s1; i < diags.length; i++) {
		d_i = diags[i];
		d_i_s0 = d_i.segments[0].point;
		d_i_s1 = d_i.segments[1].point;
		l1 = '';
		l2 = '';
		for (var j = textPoints.length, tp_j; j--;) {
			tp_j = textPoints[j];
			if (this.comparePoints(new Point(d_i_s0.x - DIST_TP_X, d_i_s0.y - DIST_TP_Y), tp_j.point, HALF)) {
				l1 = tp_j.content;
			}
			if (this.comparePoints(new Point(d_i_s1.x - DIST_TP_X, d_i_s1.y - DIST_TP_Y), tp_j.point, HALF)) {
				l2 = tp_j.content;
			}
		}
		if (l1 > l2) {
			lc = l1;
			l1 = l2;
			l2 = lc;
		}
		linesLength.diags.push({name: l1+l2, length: d_i.length.toFixed(1)});
	}

	return linesLength;
};

Sketch.prototype.generateJSONCuts = function(canvases) {
	result = [];
	for (var i = canvases.length; i--;) {
		if (canvases[i].cuts.children === undefined) {
			if (canvases[i].cuts.area > ONE_M_SQ) {
				result.push(canvases[i].cuts.exportJSON({asString: false}));
			}
		} else {
			for (var j = canvases[i].cuts.children.length; j--;) {
				if (canvases[i].cuts.children[j].area > ONE_M_SQ) {
					result.push(canvases[i].cuts.children[j].exportJSON({asString: false}));
				}
			}
		}
	}
	return JSON.stringify(result);
};

Sketch.prototype.zoomOut = function(borderLines, lines, textResizeFunction) {
	if (lines.length === 0) {
		return;
	}

	gPoints = this.getPathsPoints(lines);
	var extremePoints = this.findMinAndMaxCordinate(gPoints);
	this.addBorder(borderLines);

	if ((extremePoints.maxY >= borderLines.bottom.position.y - 20
		&& extremePoints.minY <= borderLines.top.position.y + 20)
		|| (extremePoints.maxX >= borderLines.right.position.x - 20
		&& extremePoints.minX <= borderLines.left.position.x + 20)) {
		while ((extremePoints.maxY >= borderLines.bottom.position.y
				|| extremePoints.minY <= borderLines.top.position.y)
				|| (extremePoints.maxX >= borderLines.right.position.x
				|| extremePoints.minX <= borderLines.left.position.x)) {
			if (view.zoom > MIN_ZOOM) {
				view.zoom = new Decimal(view.zoom).minus(0.05).toNumber();
				this.clearBorder(borderLines);
				this.alignCenter();
				this.addBorder(borderLines);
				textResizeFunction();
				extremePoints = this.findMinAndMaxCordinate(gPoints);
			} else {
				this.clearBorder(borderLines);
				return;
			}
		}
	}
	this.clearBorder(borderLines);
};

Sketch.prototype.zoomIn = function(borderLines, lines, textResizeFunction) {
	if (lines.length === 0) {
		return;
	}

	gPoints = this.getPathsPoints(lines);
	var extremePoints = this.findMinAndMaxCordinate(gPoints);
	this.addBorder(borderLines);

	while ((extremePoints.maxY <= borderLines.bottom.position.y
			|| extremePoints.minY >= borderLines.top.position.y)
			|| (extremePoints.maxX <= borderLines.right.position.x
			|| extremePoints.minX >= borderLines.left.position.x)) {
		if (view.zoom < MAX_ZOOM) {
			view.zoom = new Decimal(view.zoom).plus(0.05).toNumber();
			this.clearBorder(borderLines);
			this.alignCenter();
			this.addBorder(borderLines);
			textResizeFunction();
			extremePoints = this.findMinAndMaxCordinate(gPoints);
		} else {
			this.clearBorder(borderLines);
			return;
		}
	}
	this.clearBorder(borderLines);
};

Sketch.prototype.addBorder = function(borderLines) {
	var vw = view.viewSize.width,
		vh = view.viewSize.height,
		vwz = new Decimal(vw).dividedBy(view.zoom),
		vhz = new Decimal(vh).dividedBy(view.zoom),
		border = new Path.Rectangle(0, 0, vwz.minus(80 / view.zoom).toNumber(), vhz.minus(80 / view.zoom).toNumber());
	border.position = view.center;

	borderLines.top = new Path.Line(border.bounds.topLeft, border.bounds.topRight);
	borderLines.bottom = new Path.Line(border.bounds.bottomLeft, border.bounds.bottomRight);
	borderLines.left = new Path.Line(border.bounds.topLeft, border.bounds.bottomLeft);
	borderLines.right = new Path.Line(border.bounds.topRight, border.bounds.bottomRight);
	border.remove();
};

Sketch.prototype.clearBorder = function(borderLines) {
	if (borderLines.top !== undefined && borderLines.bottom !== undefined
		&& borderLines.left !== undefined && borderLines.right !== undefined) {
		borderLines.top.remove();
		borderLines.bottom.remove();
		borderLines.left.remove();
		borderLines.right.remove();
	}
};

Sketch.prototype.approximatelyEqual = function(a, b, limit) {
	if (a < b + limit && a > b - limit) {
		return true;
	}
	return false;
};

Sketch.prototype.getCoordinatesCanvases = function(shrinkPercent, canvases, textPoints, charCode, alphabetNumber) {
	var coordinatesCanvases = [], temp = { charCode: charCode, alphabetNumber: alphabetNumber };
	for (var i = 0; i < canvases.length; i++) {
		coordinatesCanvases[i] = [];
		if (canvases[i].parts.children !== undefined) {
			for (var j = canvases[i].parts.children.length; j--;) {
				for (var k = canvases[i].parts.children[j].segments.length; k--;) {
					temp = this.pushCoordinate(canvases[i].parts.children[j].segments[k].point, canvases[i],
						coordinatesCanvases[i], shrinkPercent, textPoints, temp.charCode, temp.alphabetNumber);
				}
			}
		} else {
			for (var k = canvases[i].parts.segments.length; k--;) {
				temp = this.pushCoordinate(canvases[i].parts.segments[k].point, canvases[i],
					coordinatesCanvases[i], shrinkPercent, textPoints, temp.charCode, temp.alphabetNumber);
			}
		}
	}
	var bool_del;
	for (var i = textPoints.length; i--;) {
		bool_del = true;
		for (var j = coordinatesCanvases.length; j--;) {
			if (this.pointNameInCoordinates(textPoints[i].content, coordinatesCanvases[j])) {
				bool_del = false;
			}
		}
		if (bool_del) {
			textPoints[i].remove();
		}
	}
	return this.sortCoordinats(coordinatesCanvases);
};

Sketch.prototype.pushCoordinate = function(point, canvas, coordinatesCanvas, shrinkPercent, textPoints, charCode, alphabetNumber) {
	var name, kx, ky, pt, break_bool = false;
	for (var l = textPoints.length; l--;) {
		if (this.comparePoints(new Point(point.x - DIST_TP_X, point.y - DIST_TP_Y), textPoints[l].point, HALF)) {
			name = textPoints[l].content;
			break_bool = true;
			if (this.pointNameInCoordinates(name, coordinatesCanvas)) {
				return { charCode: charCode, alphabetNumber: alphabetNumber };
			}
			break;
		}
	}
	if (!break_bool) {
		if (charCode === 90) {
    		charCode = 64;
    		alphabetNumber++;
    	}
    	charCode++;
    	if (alphabetNumber === 0) {
            name = String.fromCharCode(charCode);
        } else {
        	name = String.fromCharCode(charCode) + alphabetNumber;
        }
		pt = new PointText({
            point: new Point(point.x - DIST_TP_X, point.y - DIST_TP_Y),
            content: name,
            fillColor: 'blue',
            justification: 'center',
            fontFamily: 'lucida console',
            fontWeight: 'bold',
            fontSize: textPoints[0].fontSize
        });
    	textPoints.push(pt);
	}
	kx = new Decimal(point.x).minus(canvas.material.bounds.left).toNumber();
	ky = new Decimal(canvas.material.bounds.bottom).minus(point.y).toNumber();
	kx = new Decimal(kx).times(shrinkPercent).toNumber();
	ky = new Decimal(ky).times(shrinkPercent).toNumber();
	if (kx < 0) {
		kx = 0;
	}
	if (ky < 0) {
		ky = 0;
	}
	kx = kx.toFixed(1)-0;
	ky = ky.toFixed(1)-0;
	coordinatesCanvas.push({name: name, koordinats: "(" + kx + "; " + ky + ")"});
	return { charCode: charCode, alphabetNumber: alphabetNumber };
};

Sketch.prototype.pointNameInCoordinates = function(name, coordinatesCanvas) {
	for (var i = coordinatesCanvas.length; i--;) {
		if (coordinatesCanvas[i].name == name) {
			return true;
		}
	}
	return false;
};

Sketch.prototype.sortCoordinats = function(array) {
	for (var i = array.length; i--;) {
		array[i] = this.quicksort(array[i], 0, array[i].length - 1, this.partitionVertexes);
	}
	return array;
};

Sketch.prototype.quicksort = function(a, lo, hi, partition) {
	var p;
    if (lo < hi) {
        p = partition(a, lo, hi);
        a = this.quicksort(a, lo, p - 1, partition);
        a = this.quicksort(a, p + 1, hi, partition);
    }
    return a;
};

Sketch.prototype.partitionVertexes = function(a, lo, hi) {
    var pivot = a[hi];
    var i = lo;
    var ob;

    for (var j = lo; j < hi; j++) {
        if (a[j].name.length < pivot.name.length || (a[j].name.length === pivot.name.length && a[j].name < pivot.name)) {
            ob = a[i];
            a[i] = a[j];
            a[j] = ob;
            i = i + 1;
        }
    }
    ob = a[i];
    a[i] = a[hi];
    a[hi] = ob;
    return i;
};

Sketch.prototype.partitionLinesByVertexNames = function(a, lo, hi) {
    var pivot = a[hi], i = lo, ob,
    	pvn0 = pivot.segments[0].point.vertexName,
    	pvn1 = pivot.segments[1].point.vertexName,
    	pvn0_code = 0, pvn1_code = 0;
	for (var k = pvn0.length; k--;) {
		pvn0_code += pvn0[k].charCodeAt();
	}
	for (var k = pvn1.length; k--;) {
		pvn1_code += pvn1[k].charCodeAt();
	}

    for (var j = lo, avn0, avn1, avn0_code, avn1_code; j < hi; j++) {
    	avn0 = a[j].segments[0].point.vertexName;
    	avn1 = a[j].segments[1].point.vertexName;
    	avn0_code = 0;
    	avn1_code = 0;
    	for (var k = avn0.length; k--;) {
    		avn0_code += avn0[k].charCodeAt();
    	}
    	for (var k = avn1.length; k--;) {
    		avn1_code += avn1[k].charCodeAt();
    	}
        if (Math.max(avn0_code, avn1_code) < Math.max(pvn0_code, pvn1_code)) {
            ob = a[i];
            a[i] = a[j];
            a[j] = ob;
            i = i + 1;
        } else if (Math.max(avn0_code, avn1_code) == Math.max(pvn0_code, pvn1_code) &&
        	Math.min(avn0_code, avn1_code) > Math.min(pvn0_code, pvn1_code)) {
        	ob = a[i];
            a[i] = a[j];
            a[j] = ob;
            i = i + 1;
        }
    }
    ob = a[i];
    a[i] = a[hi];
    a[hi] = ob;
    return i;
};

Sketch.prototype.toCut = function(canvasWidth, shrinkPercent, draft, downY, canvases, innerCutouts) {
	for (var key = canvases.length, p_k; key--;) {
		p_k = canvases[key];
		p_k.parts.remove();
		p_k.material.remove();
		p_k.cuts.remove();
	}
	canvases.splice(0, canvases.length);

	canvasWidth = new Decimal(canvasWidth).dividedBy(shrinkPercent).toNumber();
	
	var stripsCount = 0,
		minX = draft.bounds.left,
		maxX = draft.bounds.right,
		minY = draft.bounds.top,
		maxY = draft.bounds.bottom,
		upY = downY,
		material, parts, rect, cuts, strip, rect_left_g, rect_right_g,
		obj_material, obj_parts, obj_cuts;

	while (upY > minY) {
		stripsCount++;
		upY = new Decimal(downY).minus(canvasWidth).toNumber();

		strip = new Path({
			segments: [	new Point(minX, downY),
						new Point(minX, upY),
						new Point(maxX, upY),
						new Point(maxX, downY)],
			closed: true
		});

		parts = strip.intersect(draft);

		strip.remove();

		if (parts.children === undefined) {
			rect = parts.bounds;
			rect_left_g = new Decimal(rect.left).plus(0.1).toNumber();
			rect_right_g = new Decimal(rect.right).minus(1).toNumber();
			material = new Path({
				segments: [	new Point(rect_left_g, downY), 
							new Point(rect_left_g, upY), 
							new Point(rect_right_g, upY), 
							new Point(rect_right_g, downY)],
			    closed: true
			});
			cuts = material.subtract(parts);
			if (cuts.children !== undefined) {
				for (var j = cuts.children.length; j--;) {
					if (cuts.children[j].area < 100) {
						cuts.children[j].remove();
					}
				}
			}
			canvases.push({parts: parts, material: material, cuts: cuts});
		} else {
			for (var i = parts.children.length, pc_i; i--;) {
				pc_i = parts.children[i];

				if (pc_i.area < 0) {
					pc_i.remove();
					continue;
				}

				for (var j = innerCutouts.length; j--;) {
					if (pc_i.contains(innerCutouts[j].position)) {
						pc_i.remove();
						pc_i = pc_i.subtract(innerCutouts[j]);
					}
				}

				rect = pc_i.bounds;
				rect_left_g = new Decimal(rect.left).plus(0.1).toNumber();
				rect_right_g = new Decimal(rect.right).minus(1).toNumber();
				material = new Path({
					segments: [	new Point(rect_left_g, downY), 
								new Point(rect_left_g, upY), 
								new Point(rect_right_g, upY), 
								new Point(rect_right_g, downY)],
				    closed: true
				});
				cuts = material.subtract(pc_i);
				if (cuts.children !== undefined) {
					for (var j = cuts.children.length; j--;) {
						if (cuts.children[j].area < 100) {
							cuts.children[j].remove();
						}
					}
				}
				obj_parts = pc_i;
				canvases.push({parts: obj_parts, material: material, cuts: cuts});
			}
			parts.remove();
		}

		downY = upY;
	}

	for (var i = canvases.length, p_i; i--;) {
		p_i = canvases[i];
		for (var j = canvases.length, p_j; j--;) {
			p_j = canvases[j];
			if (p_i != p_j &&
				p_i.material.position.y + 1 > p_j.material.position.y &&
				p_i.material.position.y - 1 < p_j.material.position.y &&
				p_i.material.intersects(p_j.material)) {
				this.gLayer.addChild(p_i.parts);
				this.gLayer.addChild(p_j.parts);
				obj_parts = p_i.parts.unite(p_j.parts);
				obj_material = p_i.material.unite(p_j.material);
				obj_cuts = obj_material.subtract(obj_parts);

				p_i.parts.remove();
				p_i.cuts.remove();
				p_i.material.remove();

				p_j.parts.remove();
				p_j.cuts.remove();
				p_j.material.remove();

				p_i.parts = obj_parts;
				p_i.cuts = obj_cuts;
				p_i.material = obj_material;
				
				canvases.splice(j, 1);
				if (j < i) {
					i--;
				}
			}
		}
	}

	return stripsCount;
};

Sketch.prototype.getArea = function(sortedLines, innerCutouts) {
	var gPoints = this.getPathsPointsBySort(sortedLines),
		draft = new Path({segments: gPoints, closed: true}), result;
	for (var i = innerCutouts.length; i--;) {
		draft.remove();
		draft = draft.subtract(innerCutouts[i]);
	}
	result = Decimal.abs(new Decimal(draft.area).dividedBy(ONE_M_SQ)).toNumber().toFixed(2);
	draft.remove();
	return result;
};

Sketch.prototype.getPerimeter = function(lines) {
	var perimeter = 0;
	for (var key in lines) {
		perimeter += lines[key].length;
	}
	perimeter = new Decimal(perimeter).dividedBy(ONE_M).toNumber().toFixed(2);
	return perimeter;
};

Sketch.prototype.getAngles = function(lines, innerCutouts) {
	var angles = 0;
	for (var j = 0, bj; j < lines.length; j++) {
		if (j > 0) {
			bj = j - 1;
		} else {
			bj = lines.length - 1;
		}
		if ((lines[j].data.curve || lines[j].data.arc) && (lines[bj].data.curve || lines[bj].data.arc)) {
			continue;
		}
		angles++;
	}
	for (var i = innerCutouts.length; i--;) {
		if (!innerCutouts[i].data.curvilinear) {
			angles += innerCutouts[i].segments.length;
		}
	}
	return angles;
};

Sketch.prototype.getCurvilinearLength = function(lines, innerCutouts) {
	var length = 0;
	for (var i = lines.length; i--;) {
		if (lines[i].data.curve || lines[i].data.arc) {
			length += lines[i].length;
		}
	}
	for (var i = innerCutouts.length; i--;) {
		if (innerCutouts[i].data.curvilinear) {
			length += innerCutouts[i].length;
		}
	}
	length = new Decimal(length).dividedBy(ONE_M).toNumber().toFixed(2);
	return length;
};

Sketch.prototype.getInnerCutoutsLength = function(lines, innerCutouts) {
	var length = 0;
	for (var i = innerCutouts.length; i--;) {
		length += innerCutouts[i].length;
	}
	for (var i = lines.length; i--;) {
		if (lines[i].data.isInnerCutout) {
			length += lines[i].length;
		}
	}
	length = new Decimal(length).dividedBy(ONE_M).toNumber().toFixed(2);
	return length;
};

Sketch.prototype.restoreDrawing = function(data) {
	var sortedLines = [], lines = [], diags = [], textPoints = [], innerCutouts = [], charCode = 64, alphabetNumber = 0,
		obj, pointTextName;
	for (var i = data.walls.length; i--;) {
		obj = new Path().importJSON(data.walls[i]);
		sortedLines.push(obj);
		lines[obj.data.id] = obj;
	}
	for (var i = data.diags.length; i--;) {
		obj = new Path().importJSON(data.diags[i]);
		diags.push(obj);
	}
	if (data.innerCutouts !== undefined) {
		for (var i = data.innerCutouts.length; i--;) {
			obj = new Path().importJSON(data.innerCutouts[i]);
			innerCutouts.push(obj);
		}
	}
	
	for (var i = 0; i < data.vertices.length; i++) {
		if (charCode === 90) {
    		charCode = 64;
    		alphabetNumber++;
    	}
    	charCode++;
    	if (alphabetNumber === 0) {
            pointTextName = String.fromCharCode(charCode);
        } else {
        	pointTextName = String.fromCharCode(charCode) + alphabetNumber;
        }
		obj = new PointText().importJSON(data.vertices[i]);
		textPoints.push(obj);
	}
	this.alignCenter();

	return {
		lines: lines,
		sortedLines: sortedLines,
		diags: diags,
		textPoints: textPoints,
		innerCutouts: innerCutouts,
		charCode: charCode,
		alphabetNumber: alphabetNumber
	};
};
