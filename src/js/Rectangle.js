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
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    /**
     * the constructor creates a new fabric.js object and adds it to the rink
     */
    function Rectangle(pointer, x, y, num) {
        var _this = _super.call(this, "rectangle") || this;
        _this.object_num = num;
        _this.rect = new fabric.Rect({
            left: x,
            top: y,
            width: pointer.x - x,
            height: pointer.y - y,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasControls: false,
            object_ref: _this
        });
        DrawingArea.field.add(_this.rect);
        DrawingArea.field.renderAll();
        return _this;
    }
    /**
     * This function changes the value of object_num
     * (if a object on the DrawingArea has been removed the object_num needs to be updated).
     */
    Rectangle.prototype.setObjectNum = function (x) {
        this.object_num = x;
    };
    /**
     * disables the selection of this object
     */
    Rectangle.prototype.disableSelection = function () {
        this.rect.selectable = false;
    };
    /**
     * enables the selection of this object
     */
    Rectangle.prototype.enableSelection = function () {
        this.rect.selectable = true;
    };
    /**
     * This function is used by an fabric.js event listener.
     * If DrawingArea is in "drawing mode" this function is called after every mouse:move event.
     * The active_object will scale with the mouse position.
     */
    Rectangle.prototype.resize = function (pointer, origX, origY) {
        if (origX > pointer.x && pointer.x > DrawingArea.border) {
            this.rect.set({ left: Math.abs(pointer.x) });
        }
        if (origY > pointer.y && pointer.y > DrawingArea.border) {
            this.rect.set({ top: Math.abs(pointer.y) });
        }
        if (pointer.x < this.rect.canvas.width - DrawingArea.border && pointer.x > DrawingArea.border) {
            this.rect.set({ width: Math.abs(origX - pointer.x) });
        }
        if (pointer.y < this.rect.canvas.height - DrawingArea.border && pointer.y > DrawingArea.border) {
            this.rect.set({ height: Math.abs(origY - pointer.y) });
        }
        this.rect.setCoords(); // important step: this method updates the selection box to the new size of the drawn object
        DrawingArea.field.renderAll();
    };
    /**
     * This function returns the type of DrawingObject and the edge coordinates of the rectangle for the query.
     */
    Rectangle.prototype.getSelection = function () {
        return [this.type, this.rect.left, this.rect.top + this.rect.height, this.rect.left + this.rect.width, this.rect.top];
    };
    /**
     * This function returns true, if a coordinate lies within the rectangle.
     */
    Rectangle.prototype.contained = function (x, y) {
        if (x > this.rect.left && x < this.rect.left + this.rect.width && y > this.rect.top && y < this.rect.top + this.rect.height) {
            return true;
        }
        else {
            return false;
        }
    };
    Rectangle.prototype.remove = function () {
        this.rect.remove();
    };
    return Rectangle;
}(DrawingObject));
