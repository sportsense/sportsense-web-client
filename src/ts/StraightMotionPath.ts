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

class StraightMotionPath extends DrawingObject {

    private object: any;
    private circle1: any;
    private circle2: any;
    private line1: any;
    private line2: any;
    private radius: number;
    private object_num;
    private final_alpha: number;
    private final_posneg: number;
    private static offset = Math.PI / 2;

    /**
     * the constructor creates a new fabric.js object and adds it to the rink
     */
    constructor(x, y, width, num) {
        super("straight_motion_path");
        this.object_num = num;
        this.radius = width / 2;

        this.circle1 = new fabric.Circle({
            left: x - this.radius,
            top: y - this.radius,
            radius: this.radius,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasBorders: true,
            hasControls: false,
            object_ref: this,
            startAngle: 0,
            endAngle: Math.PI
        });
        this.circle2 = new fabric.Circle({
            left: x - this.radius,
            top: y - this.radius,
            radius: this.radius,
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasBorders: true,
            hasControls: false,
            object_ref: this,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI
        });
        this.line1 = new fabric.Line([x, y - (width / 2), x, y - (width / 2)], {
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
        this.line2 = new fabric.Line([x, y + (width / 2), x, y + (width / 2)], {
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

        DrawingArea.field.add(this.circle1);
        DrawingArea.field.add(this.circle2);
        DrawingArea.field.add(this.line1);
        DrawingArea.field.add(this.line2);

        //this.object = new fabric.Group([circle1,circle2,line1,line2]);
    }

    /**
     * This function changes the value of object_num
     * (if a object on the DrawingArea has been removed the object_num needs to be updated).
     */
    public setObjectNum(x): void {
        this.object_num = x;
    }

    /**
     * disables the selection of this object
     *
     * TODO: this function is disabled/the object is not selectable as long as the group selection doesn't work properly
     */
    public disableSelection(): void {
        return;
        /*
         this.circle1.selectable = false;
         this.circle2.selectable = false;
         this.line1.selectable = false;
         this.line2.selectable = false;
         */
    }

    /**
     * enables the selection of this object
     *
     * TODO: this function is disabled/the object is not selectable as long as the group selection doesn't work properly
     */
    public enableSelection(): void {
        return;
        /*
         this.circle1.selectable = true;
         this.circle2.selectable = true;
         this.line1.selectable = true;
         this.line2.selectable = true;
         */
    }

    /**
     * This function is used by an fabric.js event listener.
     * If DrawingArea is in "drawing mode" this function is called after every mouse:move event.
     * The active_object will scale with the mouse position.
     *
     * TODO: while resizing pressing the right mouse button will lead to another motion path drawing on top
     */
    public resize(pointer, origX, origY): void {
        let opposite = Math.sqrt(Math.pow(pointer.y - origY, 2));
        let hypotenuse = Math.sqrt(Math.pow(pointer.x - origX, 2) + Math.pow(pointer.y - origY, 2));
        let alpha = Math.asin(opposite / hypotenuse);

        // formulas: x = Cx+(r*cos(alpha)), y = Cy+(r*sin(alpha))
        // alpha has to be rotated by 90 degrees (1.5708 radiant) either clockwise or counterclockwise

        let posneg;
        if ((pointer.x > origX && pointer.y < origY) || (pointer.x < origX && pointer.y > origY)) {
            posneg = -1.0;
        } else {
            posneg = 1.0
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
        let correction = 1;
        if (pointer.x > origX && pointer.y < origY || pointer.x >= origX && pointer.y >= origY) {
            correction = -1
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
    }

    /**
     * This function returns the type of DrawingObject and the edge coordinates of the rectangle for the query.
     */
    public getSelection(): any[] {
        let ret: any[] = [];

        //ret.push(this.type);
        ret.push('polygon');
        ret.push(this.line2.x1);
        ret.push(this.line2.y1);
        ret.push(this.line2.x2);
        ret.push(this.line2.y2);

        let addition_posneg;
        if (this.line2.y2 < this.line2.y1) {
            addition_posneg = -1;
        } else {
            addition_posneg = 1;
        }

        let i: number;
        let alpha = this.final_alpha + Math.PI;
        let alpha_addition: number = Math.PI / CONFIG.POINTS_PER_HALF_CIRCLE+1        // in order to receive n points (that are different from the line-circle intersections) along a half circle
        for (i = 0; i < CONFIG.POINTS_PER_HALF_CIRCLE; i++) {
            alpha = alpha + addition_posneg * alpha_addition;
            let x: number = (this.circle2.left + this.radius) + (this.radius * Math.cos(this.final_posneg * alpha + StraightMotionPath.offset));
            let y: number = (this.circle2.top + this.radius) + (this.radius * Math.sin(this.final_posneg * alpha + StraightMotionPath.offset));
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
            let x: number = (this.circle1.left + this.radius) + (this.radius * Math.cos(this.final_posneg * alpha + StraightMotionPath.offset));
            let y: number = (this.circle1.top + this.radius) + (this.radius * Math.sin(this.final_posneg * alpha + StraightMotionPath.offset));
            ret.push(x);
            ret.push(y);
        }
        return ret;
    }

    /**
     * This function returns nothing, because motion path object can't be used for event cascade drawing.
     */
    public contained(x, y): boolean {
        console.error("The function 'contains' should not be called on a motion path object!");
        return false;
    }

    public remove(): void {
        DrawingArea.field.remove(this.circle1);
        DrawingArea.field.remove(this.circle2);
        DrawingArea.field.remove(this.line1);
        DrawingArea.field.remove(this.line2);
    }
}
