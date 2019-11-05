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
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    /**
     * the constructor creates a new fabric.js object and adds it to the rink
     * @param pointer
     * @param x
     * @param y
     */
    function Circle(pointer, x, y, num) {
        var _this = _super.call(this, "circle") || this;
        _this.object_num = num;
        _this.circle = new fabric.Circle({
            left: x,
            top: y,
            radius: _this.calculateHypotenuse((pointer.x - x), (pointer.y - y)),
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasBorders: true,
            hasControls: false,
            object_ref: _this
        });
        DrawingArea.field.add(_this.circle);
        return _this;
    }
    /**
     * disables the selection of this object
     */
    Circle.prototype.disableSelection = function () {
        this.circle.selectable = false;
    };
    /**
     * enables the selection of this object
     */
    Circle.prototype.enableSelection = function () {
        this.circle.selectable = true;
    };
    /**
     * This function is used by an fabric.js event listener.
     * If DrawingArea is in "drawing mode" this function is called after every mouse:move event.
     * The active_object will scale with the mouse position.
     * @param pointer
     * @param origX
     * @param origY
     */
    Circle.prototype.resize = function (pointer, origX, origY) {
        var radius = this.calculateHypotenuse(origX - pointer.x, origY - pointer.y);
        this.circle.set("left", origX - radius);
        this.circle.set("top", origY - radius);
        this.circle.set("radius", radius);
        this.circle.setCoords(); // important step: this method updates the selection box to the new size of the drawn object
        DrawingArea.field.renderAll();
    };
    /**
     * This function returns the length of the hypothenuse of the circle.
     * @param a
     * @param b
     * @returns {number}
     */
    Circle.prototype.calculateHypotenuse = function (a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    };
    /**
     * This function returns the type of DrawingObject, the middle coordinate and the radius length of the circle for the query.
     * @returns {[string,any,any,any]}
     */
    Circle.prototype.getSelection = function () {
        return [this.type, this.circle.left + this.circle.radius, this.circle.top + this.circle.radius, this.circle.left]; // left is returned to recalculate the radius after converting to db coordinates
    };
    /**
     * This function returns true, if a coordinate lies within the circle.
     */
    Circle.prototype.contained = function (x, y) {
        var midx = this.circle.left + this.circle.radius;
        var midy = this.circle.top + this.circle.radius;
        var res = Math.sqrt(Math.pow(Math.abs(x - midx), 2) + Math.pow(Math.abs(y - midy), 2));
        if (res <= this.circle.radius) {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * This function removes the circle.
     */
    Circle.prototype.remove = function () {
        this.circle.remove();
    };
    /**
     * This function changes the value of object_num
     * (if a object on the DrawingArea has been removed the object_num needs to be updated).
     */
    Circle.prototype.setObjectNum = function (x) {
        this.object_num = x;
    };
    return Circle;
}(DrawingObject));
