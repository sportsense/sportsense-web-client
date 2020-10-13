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
var MultiPathLine = /** @class */ (function () {
    function MultiPathLine(points, time, videotime, id, eventtype, period, matchId) {
        this.eventmarker = null;
        this.color_standard = CONFIG.COLOR_STANDARD;
        this.color_highlighted = CONFIG.COLOR_HIGHLIGHTED;
        this.color_hover = CONFIG.COLOR_HOVER;
        this.time = time;
        this.video_time = videotime;
        this.id = id;
        this.elem_id = "";
        this.matchId = matchId;
        this.eventtype = eventtype;
        this.build(points);
    }
    MultiPathLine.prototype.build = function (points) {
        var p1 = DrawingArea.dbToCanvasCoordinates(points[0][0], points[0][1]);
        var path = "M " + p1[0] + " " + p1[1];
        for (var i = 1; i < points.length; i++) {
            var p = DrawingArea.dbToCanvasCoordinates(points[i][0], points[i][1]);
            path = path + " L " + p[0] + " " + p[1];
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
            videoarea.setVideoTime(mpl.video_time, mpl.matchId);
            mpl.changeActiveLine();
            //ResultList.set_active(mpl.elem_id);
        });
        this.line.on("mouseover", function (e) {
            var mpl = e.target.mpl;
            if (mpl != MultiPathLine.active_line) {
                mpl.changeColor(3);
                //var $list = $("#" + mpl.elem_id);
                //$list.trigger('hover');
            }
            //ResultList.hover(mpl.elem_id);
        });
        this.line.on("mouseout", function (e) {
            var mpl = e.target.mpl;
            if (mpl != MultiPathLine.active_line) {
                mpl.changeColor(1);
                //var $list = $("#" + mpl.elem_id);
                //$list.mouseout();
            }
            //ResultList.deactivate_hover(mpl.elem_id);
        });
    };
    MultiPathLine.prototype.register = function () {
        DrawingArea.field.add(this.line);
        ResultList.addResult(new Result(this.id.toString(), this.time, this.video_time, location[0], location[1], this.eventtype, [], this));
        MultiPathLine.addLine(this);
    };
    MultiPathLine.addLine = function (line) {
        MultiPathLine.lines.push(line);
    };
    MultiPathLine.clearLines = function () {
        MultiPathLine.active_line = null;
        for (var _i = 0, _a = MultiPathLine.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            line.deleteLine();
        }
    };
    MultiPathLine.prototype.deleteLine = function () {
        DrawingArea.field.remove(this.line);
    };
    MultiPathLine.prototype.unhighlight = function () {
        this.line;
    };
    MultiPathLine.prototype.changeActiveLine = function () {
        if (MultiPathLine.active_line == null) {
            MultiPathLine.active_line = this;
        }
        else {
            MultiPathLine.active_line.deactivateActive();
            MultiPathLine.active_line = this;
        }
        this.changeColor(2);
    };
    MultiPathLine.prototype.changeColor = function (highlight) {
        if (highlight == 1) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_standard);
            DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.sendBackwards(this.line);
            DrawingArea.field.renderAll();
            Timeline.stopHover(this.elem_id.split("_")[1]);
        }
        else if (highlight == 2) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_highlighted);
            DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.renderAll();
            Timeline.stopHover(this.elem_id.split("_")[1]);
            Timeline.setActive(this.elem_id.split("_")[1]);
        }
        else {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_hover);
            DrawingArea.field.renderAll();
            Timeline.hover(this.elem_id.split("_")[1]);
        }
    };
    MultiPathLine.prototype.deactivateActive = function () {
        this.changeColor(1);
    };
    MultiPathLine.prototype.setElemID = function (elem_id) {
        this.elem_id = elem_id;
    };
    MultiPathLine.deleteAllLines = function () {
        MultiPathLine.active_line = null;
        if (MultiPathLine.lines.length > 0) {
            for (var _i = 0, _a = MultiPathLine.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                line.deleteLine();
            }
        }
    };
    MultiPathLine.lines = [];
    MultiPathLine.active_line = null;
    return MultiPathLine;
}());
