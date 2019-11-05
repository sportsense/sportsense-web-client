/*
* SportSense
* Copyright (C) 2019  University of Basel
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
/*!Do only edit the TypeScript but not the Javascript file!*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Polygon = /** @class */ (function (_super) {
    __extends(Polygon, _super);
    function Polygon(num) {
        var _this = _super.call(this, "polygon") || this;
        _this.object_num = num;
        _this.nvert = 0;
        return _this;
    }
    /**
     * This function removes the polygon.
     */
    Polygon.prototype.remove = function () {
        this.poly.remove();
    };
    Polygon.prototype.getSelection = function () {
        var polygon = this.poly;
        var matrix = polygon.calcTransformMatrix();
        var transformedPoints = polygon.get("points").map(function (p) {
            return new fabric.Point(p.x - polygon.minX - polygon.width / 2, p.y - polygon.minY - polygon.height / 2);
        }).map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });
        var ret = [];
        ret.push(this.type);
        for (var i = 0; i < this.poly.points.length; i++) {
            var point = transformedPoints[i];
            ret.push(point.x);
            ret.push(point.y);
        }
        return ret;
    };
    /**
     * This function returns true if a point is contained within the polygon.
     * Taken from: https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
     */
    Polygon.prototype.contained = function (testx, testy) {
        var polygon = this.poly;
        var matrix = polygon.calcTransformMatrix();
        var transformedPoints = polygon.get("points").map(function (p) {
            return new fabric.Point(p.x - polygon.minX - polygon.width / 2, p.y - polygon.minY - polygon.height / 2);
        }).map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });
        var c = false;
        for (var i = 0, j = this.nvert - 1; i < this.nvert; j = i++) {
            if (((transformedPoints[i].y > testy) != (transformedPoints[j].y > testy)) &&
                (testx < (transformedPoints[j].x - transformedPoints[i].x) * (testy - transformedPoints[i].y) / (transformedPoints[j].y - transformedPoints[i].y) + transformedPoints[i].x)) {
                c = !c;
            }
        }
        return c;
    };
    /**
     * enables the selection of this object
     */
    Polygon.prototype.enableSelection = function () {
        if (this.poly != null) {
            this.poly.selectable = true;
        }
    };
    /**
     * disables the selection of this object
     */
    Polygon.prototype.disableSelection = function () {
        if (this.poly != null) {
            this.poly.selectable = false;
        }
    };
    Polygon.prototype.finishPolygon = function (lineArray) {
        var points = new Array();
        $.each(lineArray, function (index, line) {
            points.push({
                x: line.getCoords()[0].x,
                y: line.getCoords()[0].y
            });
            DrawingArea.field.remove(line);
        });
        this.nvert = lineArray.length;
        var polygon = new fabric.Polygon(points, {
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            opacity: 1,
            hasRotatingPoint: false,
            hasControls: false,
            object_ref: this
        });
        this.poly = polygon;
        DrawingArea.field.add(this.poly);
    };
    /**
     * The polygon is the only DrawingObject that is drawn in a different way.
     * The user will not drag the object to the wished size, the side points will be generated along the mouse path.
     * After releasing the left mouse button the polygon will be finished (last point connects with starting point).
     * THIS IS AN EXCEPTION: THIS FUNCTION JUST TRIGGERS THE END OF THE DRAWING PROCESS!
     */
    Polygon.prototype.resize = function () {
        this.finishPolygon(DrawingArea.polygon_lines);
    };
    Polygon.prototype.setObjectNum = function (x) {
        this.object_num = x;
    };
    return Polygon;
}(DrawingObject));
