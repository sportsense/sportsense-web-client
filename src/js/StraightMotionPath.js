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
var StraightMotionPath = /** @class */ (function (_super) {
    __extends(StraightMotionPath, _super);
    /**
     * the constructor creates a new fabric.js object and adds it to the rink
     */
    function StraightMotionPath(x, y, width, num) {
        var _this = _super.call(this, "straight_motion_path") || this;
        _this.object_num = num;
        _this.radius = width / 2;
        _this.circle1 = new fabric.Circle({
            left: x - _this.radius,
            top: y - _this.radius,
            radius: _this.radius,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasBorders: true,
            hasControls: false,
            object_ref: _this,
            startAngle: 0,
            endAngle: Math.PI
        });
        _this.circle2 = new fabric.Circle({
            left: x - _this.radius,
            top: y - _this.radius,
            radius: _this.radius,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasBorders: true,
            hasControls: false,
            object_ref: _this,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI
        });
        _this.line1 = new fabric.Line([x, y - (width / 2), x, y - (width / 2)], {
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            class: 'line',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
        });
        _this.line2 = new fabric.Line([x, y + (width / 2), x, y + (width / 2)], {
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            class: 'line',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
        });
        DrawingArea.field.add(_this.circle1);
        DrawingArea.field.add(_this.circle2);
        DrawingArea.field.add(_this.line1);
        DrawingArea.field.add(_this.line2);
        return _this;
        //this.object = new fabric.Group([circle1,circle2,line1,line2]);
    }
    /**
     * This function changes the value of object_num
     * (if a object on the DrawingArea has been removed the object_num needs to be updated).
     */
    StraightMotionPath.prototype.setObjectNum = function (x) {
        this.object_num = x;
    };
    /**
     * disables the selection of this object
     *
     * TODO: this function is disabled/the object is not selectable as long as the group selection doesn't work properly
     */
    StraightMotionPath.prototype.disableSelection = function () {
        return;
        /*
         this.circle1.selectable = false;
         this.circle2.selectable = false;
         this.line1.selectable = false;
         this.line2.selectable = false;
         */
    };
    /**
     * enables the selection of this object
     *
     * TODO: this function is disabled/the object is not selectable as long as the group selection doesn't work properly
     */
    StraightMotionPath.prototype.enableSelection = function () {
        return;
        /*
         this.circle1.selectable = true;
         this.circle2.selectable = true;
         this.line1.selectable = true;
         this.line2.selectable = true;
         */
    };
    /**
     * This function is used by an fabric.js event listener.
     * If DrawingArea is in "drawing mode" this function is called after every mouse:move event.
     * The active_object will scale with the mouse position.
     *
     * TODO: while resizing pressing the right mouse button will lead to another motion path drawing on top
     */
    StraightMotionPath.prototype.resize = function (pointer, origX, origY) {
        var opposite = Math.sqrt(Math.pow(pointer.y - origY, 2));
        var hypotenuse = Math.sqrt(Math.pow(pointer.x - origX, 2) + Math.pow(pointer.y - origY, 2));
        var alpha = Math.asin(opposite / hypotenuse);
        // formulas: x = Cx+(r*cos(alpha)), y = Cy+(r*sin(alpha))
        // alpha has to be rotated by 90 degrees (1.5708 radiant) either clockwise or counterclockwise
        var posneg;
        if ((pointer.x > origX && pointer.y < origY) || (pointer.x < origX && pointer.y > origY)) {
            posneg = -1.0;
        }
        else {
            posneg = 1.0;
        }
        // additionally the stroke width has to be added in order to align circle and line perfectly
        this.line1.set("x1", origX + (this.radius * Math.cos(posneg * alpha + StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line1.set("y1", origY + (this.radius * Math.sin(posneg * alpha + StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line2.set("x1", origX + (this.radius * Math.cos(posneg * alpha - StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line2.set("y1", origY + (this.radius * Math.sin(posneg * alpha - StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line1.set("x2", pointer.x + (this.radius * Math.cos(posneg * alpha + StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line1.set("y2", pointer.y + (this.radius * Math.sin(posneg * alpha + StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line2.set("x2", pointer.x + (this.radius * Math.cos(posneg * alpha - StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        this.line2.set("y2", pointer.y + (this.radius * Math.sin(posneg * alpha - StraightMotionPath.offset)) + CONFIG.SELECTION_STROKE_WIDTH / 2);
        // the half circles have to be regenerated every time because the startAngle and endAngle value are not dynamically changeable
        DrawingArea.field.remove(this.circle1);
        DrawingArea.field.remove(this.circle2);
        // to correct the direction of the half circles
        var correction = 1;
        if (pointer.x > origX && pointer.y < origY || pointer.x >= origX && pointer.y >= origY) {
            correction = -1;
        }
        this.circle1 = new fabric.Circle({
            left: origX - this.radius,
            top: origY - this.radius,
            radius: this.radius,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: 4,
            hasRotatingPoint: false,
            hasBorders: true,
            selectable: false,
            hasControls: false,
            object_ref: this,
            startAngle: posneg * alpha + -correction * Math.PI / 2,
            endAngle: posneg * alpha + -correction * 3 * Math.PI / 2
        });
        this.circle2 = new fabric.Circle({
            left: pointer.x - this.radius,
            top: pointer.y - this.radius,
            radius: this.radius,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: 4,
            hasRotatingPoint: false,
            hasBorders: true,
            selectable: false,
            hasControls: false,
            object_ref: this,
            startAngle: posneg * alpha + correction * Math.PI / 2,
            endAngle: posneg * alpha + correction * 3 * Math.PI / 2
        });
        DrawingArea.field.add(this.circle1);
        DrawingArea.field.add(this.circle2);
        DrawingArea.field.renderAll();
        this.final_alpha = alpha;
        this.final_posneg = posneg;
    };
    /**
     * This function returns the type of DrawingObject and the edge coordinates of the rectangle for the query.
     */
    StraightMotionPath.prototype.getSelection = function () {
        var ret = [];
        //ret.push(this.type);
        ret.push('polygon');
        ret.push(this.line2.x1);
        ret.push(this.line2.y1);
        ret.push(this.line2.x2);
        ret.push(this.line2.y2);
        var addition_posneg;
        if (this.line2.y2 < this.line2.y1) {
            addition_posneg = -1;
        }
        else {
            addition_posneg = 1;
        }
        var i;
        var alpha = this.final_alpha + Math.PI;
        var alpha_addition = Math.PI / CONFIG.POINTS_PER_HALF_CIRCLE + 1; // in order to receive n points (that are different from the line-circle intersections) along a half circle
        for (i = 0; i < CONFIG.POINTS_PER_HALF_CIRCLE; i++) {
            alpha = alpha + addition_posneg * alpha_addition;
            var x = (this.circle2.left + this.radius) + (this.radius * Math.cos(this.final_posneg * alpha + StraightMotionPath.offset));
            var y = (this.circle2.top + this.radius) + (this.radius * Math.sin(this.final_posneg * alpha + StraightMotionPath.offset));
            ret.push(x);
            ret.push(y);
        }
        ret.push(this.line1.x2);
        ret.push(this.line1.y2);
        ret.push(this.line1.x1);
        ret.push(this.line1.y1);
        alpha = this.final_alpha;
        for (i = 0; i < CONFIG.POINTS_PER_HALF_CIRCLE; i++) {
            alpha = alpha + addition_posneg * alpha_addition;
            var x = (this.circle1.left + this.radius) + (this.radius * Math.cos(this.final_posneg * alpha + StraightMotionPath.offset));
            var y = (this.circle1.top + this.radius) + (this.radius * Math.sin(this.final_posneg * alpha + StraightMotionPath.offset));
            ret.push(x);
            ret.push(y);
        }
        return ret;
    };
    /**
     * This function returns nothing, because motion path object can't be used for event cascade drawing.
     */
    StraightMotionPath.prototype.contained = function (x, y) {
        console.error("The function 'contains' should not be called on a motion path object!");
        return false;
    };
    StraightMotionPath.prototype.remove = function () {
        DrawingArea.field.remove(this.circle1);
        DrawingArea.field.remove(this.circle2);
        DrawingArea.field.remove(this.line1);
        DrawingArea.field.remove(this.line2);
    };
    StraightMotionPath.offset = Math.PI / 2;
    return StraightMotionPath;
}(DrawingObject));
