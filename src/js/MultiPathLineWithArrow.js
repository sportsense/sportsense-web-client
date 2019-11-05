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
var MultiPathLineWithArrow = /** @class */ (function (_super) {
    __extends(MultiPathLineWithArrow, _super);
    function MultiPathLineWithArrow(points, time, videotime, id, eventtype, period, matchId, playerId) {
        var _this = _super.call(this, points, time, videotime, id, eventtype, period, matchId) || this;
        // setting up the differences to the normal MultiPathLine objects
        var firstChar = playerId.charAt(0);
        if (playerId == "BALL") {
            _this.color_standard = CONFIG.COLOR_BALL_STANDARD;
            _this.color_highlighted = CONFIG.COLOR_BALL_HIGHLIGHTED;
            _this.color_hover = CONFIG.COLOR_BALL_HOVER;
        }
        else if (firstChar == "A" || firstChar == "C") {
            _this.color_standard = CONFIG.COLOR_TEAM_A_STANDARD;
            _this.color_highlighted = CONFIG.COLOR_TEAM_A_HIGHLIGHTED;
            _this.color_hover = CONFIG.COLOR_TEAM_A_HOVER;
        }
        else if (firstChar == "B" || firstChar == "D") {
            _this.color_standard = CONFIG.COLOR_TEAM_B_STANDARD;
            _this.color_highlighted = CONFIG.COLOR_TEAM_B_HIGHLIGHTED;
            _this.color_hover = CONFIG.COLOR_TEAM_B_HOVER;
        }
        // update line color to newly set value
        _this.changeColor(1);
        return _this;
    }
    MultiPathLineWithArrow.prototype.build = function (points) {
        // build arrow head
        var length = points.length;
        if (length > 1) {
            var p1_1 = DrawingArea.dbToCanvasCoordinates(points[length - 2][0], points[length - 2][1]);
            var p2 = DrawingArea.dbToCanvasCoordinates(points[length - 1][0], points[length - 1][1]);
            var coords = [parseFloat(p1_1[0]), parseFloat(p1_1[1]), parseFloat(p2[0]), parseFloat(p2[1])];
            // in order to draw an arrow head we first have to find the angle to point the arrow head in the right direction
            var alpha_radians = Math.atan2(coords[3] - coords[1], coords[2] - coords[0]); // atan2(p2.y - p1.y, p2.x - p1.x)
            var alpha_deg = alpha_radians * 180 / Math.PI;
            this.arrowhead = new fabric.Triangle({
                left: coords[2],
                top: coords[3],
                strokeWidth: 1,
                width: 8, height: 8,
                stroke: false,
                fill: this.color_standard,
                selectable: false,
                originX: 'center',
                originY: 'center',
                perPixelTargetFind: true
            });
            this.arrowhead.set('angle', alpha_deg + 90); // +90 is needed, otherwise the arrow heads would be sideways
        }
        // build path
        var p1 = DrawingArea.dbToCanvasCoordinates(points[0][0], points[0][1]);
        var path = "M " + p1[0] + " " + p1[1];
        this.startPoint = p1;
        for (var i = 1; i < points.length; i++) {
            var p = DrawingArea.dbToCanvasCoordinates(points[i][0], points[i][1]);
            path = path + " L " + p[0] + " " + p[1];
            if (i == points.length - 1) {
                this.endPoint = p;
            }
        }
        this.line = new fabric.Path(path, {
            stroke: this.color_standard,
            strokeWidth: CONFIG.EC_STROKE_WIDTH,
            fill: false,
            selectable: false,
            perPixelTargetFind: true
        });
        this.line.set("mpl", this);
        this.line.on('mousedown', function (e) {
            var mpl = e.target.mpl;
            videoarea.setVideoTime(mpl.videotime, mpl.matchId);
            mpl.changeActiveLine();
        });
        this.line.on("mouseover", function (e) {
            var mpl = e.target.mpl;
            if (mpl != MultiPathLineWithArrow.active_line) {
                mpl.changeColor(3);
            }
        });
        this.line.on("mouseout", function (e) {
            var mpl = e.target.mpl;
            if (mpl != MultiPathLineWithArrow.active_line) {
                mpl.changeColor(1);
            }
        });
    };
    MultiPathLineWithArrow.prototype.register = function () {
        DrawingArea.field.add(this.line);
        DrawingArea.field.add(this.arrowhead);
        MultiPathLineWithArrow.paths.push(this);
    };
    MultiPathLineWithArrow.clearLines = function () {
        MultiPathLineWithArrow.active_line = null;
        for (var _i = 0, _a = MultiPathLineWithArrow.paths; _i < _a.length; _i++) {
            var path = _a[_i];
            DrawingArea.field.remove(path.line);
            DrawingArea.field.remove(path.arrowhead);
        }
        MultiPathLineWithArrow.paths = [];
    };
    MultiPathLineWithArrow.prototype.changeColor = function (highlight) {
        if (highlight == 1) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_standard);
            this.arrowhead.set('fill', this.color_standard);
            //DrawingArea.field.bringToFront(this.line);
            //DrawingArea.field.sendBackwards(this.line);
            DrawingArea.field.renderAll();
        }
        else if (highlight == 2) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_highlighted);
            this.arrowhead.set('fill', this.color_highlighted);
            //DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.renderAll();
        }
        else {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_hover);
            this.arrowhead.set('fill', this.color_hover);
            DrawingArea.field.renderAll();
        }
    };
    MultiPathLineWithArrow.getPathStartAndEndPoints = function () {
        var startPoints = [];
        var endPoints = [];
        for (var _i = 0, _a = MultiPathLineWithArrow.paths; _i < _a.length; _i++) {
            var path = _a[_i];
            startPoints.push(path.startPoint);
            endPoints.push(path.endPoint);
        }
        return [startPoints, endPoints];
    };
    // this.line is stored in the class MultiPathLine
    MultiPathLineWithArrow.paths = [];
    return MultiPathLineWithArrow;
}(MultiPathLine));
