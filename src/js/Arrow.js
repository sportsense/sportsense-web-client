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
var Arrow = /** @class */ (function () {
    function Arrow(points, eventchain) {
        this.eventchain = eventchain;
        var p1 = DrawingArea.dbToCanvasCoordinates(points[0][0], points[0][1]);
        var p2 = DrawingArea.dbToCanvasCoordinates(points[1][0], points[1][1]);
        var coords = [parseFloat(p1[0]), parseFloat(p1[1]), parseFloat(p2[0]), parseFloat(p2[1])];
        this.line = new fabric.Line(coords, {
            strokeWidth: CONFIG.EC_STROKE_WIDTH,
            stroke: CONFIG.COLOR_STANDARD,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            fill: false,
            selectable: false,
            perPixelTargetFind: true
        });
        this.line.set("ec", this.eventchain);
        this.line.hasControls = this.line.hasBorders = false;
        this.line.lockMovementX = this.line.lockMovementY = true;
        // in order to draw an arrow head we first have to find the angle to point the arrow head in the right direction
        var alpha_radians = Math.atan2(coords[3] - coords[1], coords[2] - coords[0]); // atan2(p2.y - p1.y, p2.x - p1.x)
        var alpha_deg = alpha_radians * 180 / Math.PI;
        this.arrowhead = new fabric.Triangle({
            left: coords[2],
            top: coords[3],
            strokeWidth: 1,
            width: 8, height: 8,
            stroke: false,
            fill: CONFIG.COLOR_STANDARD,
            selectable: false,
            originX: 'center',
            originY: 'center',
            perPixelTargetFind: true
        });
        this.arrowhead.set("ec", this.eventchain);
        this.arrowhead.set('angle', alpha_deg + 90); // +90 is needed, otherwise the arrow heads would be sideways
        Arrow.addArrow(this);
        DrawingArea.field.add(this.line);
        DrawingArea.field.add(this.arrowhead);
        this.line.on('mousedown', function (e) {
            Arrow.mouseDown(e);
        });
        this.line.on("mouseover", function (e) {
            Arrow.mouseOver(e);
        });
        this.line.on("mouseout", function (e) {
            Arrow.mouseOut(e);
        });
        this.arrowhead.on('mousedown', function (e) {
            Arrow.mouseDown(e);
        });
        this.arrowhead.on("mouseover", function (e) {
            Arrow.mouseOver(e);
        });
        this.arrowhead.on("mouseout", function (e) {
            Arrow.mouseOut(e);
        });
    }
    Arrow.mouseDown = function (e) {
        var ec = e.target.ec;
        videoarea.setVideoTime(ec.video_time, ec.matchId);
        ec.changeActiveChain();
    };
    Arrow.mouseOver = function (e) {
        var ec = e.target.ec;
        if (ec != EventChain.active_chain) {
            ec.setChainColor(3);
        }
    };
    Arrow.mouseOut = function (e) {
        var ec = e.target.ec;
        if (ec != EventChain.active_chain) {
            ec.setChainColor(1);
        }
    };
    Arrow.prototype.changeActiveArrow = function () {
        if (Arrow.active_arrow == null) {
            Arrow.active_arrow = this;
        }
        else {
            Arrow.active_arrow.deactivateActive();
            Arrow.active_arrow = this;
        }
        this.changeColor(2);
    };
    Arrow.addArrow = function (arrow) {
        this.arrows.push(arrow);
    };
    Arrow.prototype.deactivateActive = function () {
        this.changeColor(1);
    };
    Arrow.prototype.changeColor = function (highlight) {
        if (highlight == 1) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', CONFIG.COLOR_STANDARD);
            this.arrowhead.set('fill', CONFIG.COLOR_STANDARD);
            DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.sendBackwards(this.line);
            DrawingArea.field.bringToFront(this.arrowhead);
            DrawingArea.field.sendBackwards(this.arrowhead);
        }
        else if (highlight == 2) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', CONFIG.COLOR_HIGHLIGHTED);
            this.arrowhead.set('fill', CONFIG.COLOR_HIGHLIGHTED);
            DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.bringToFront(this.arrowhead);
        }
        else if (highlight == 3) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', CONFIG.COLOR_HOVER);
            this.arrowhead.set('fill', CONFIG.COLOR_HOVER);
        }
        else if (highlight == 4) {
            this.line.set('fill', CONFIG.COLOR_INVISIBLE);
            this.line.set('stroke', CONFIG.COLOR_INVISIBLE);
            this.arrowhead.set('fill', CONFIG.COLOR_INVISIBLE);
        }
        else {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', CONFIG.COLOR_DEACTIVATED);
            this.arrowhead.set('fill', CONFIG.COLOR_DEACTIVATED);
        }
        DrawingArea.field.renderAll();
    };
    Arrow.deleteAllArrows = function () {
        Arrow.active_arrow = null;
        if (Arrow.arrows.length > 0) {
            for (var _i = 0, _a = Arrow.arrows; _i < _a.length; _i++) {
                var arrow = _a[_i];
                arrow.deleteArrow();
            }
        }
        Arrow.arrows = [];
    };
    Arrow.prototype.deleteArrow = function () {
        this.eventchain.removeArrow();
        DrawingArea.field.remove(this.arrowhead);
        DrawingArea.field.remove(this.line);
    };
    Arrow.arrows = [];
    Arrow.active_arrow = null;
    return Arrow;
}());
