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

declare var ClipperLib: any;
//declare var cms:any;

class FreehandMotionPath extends DrawingObject {

    private object: any;
    private radius: number;
    private object_num;
    private circular_shape: any;
    private path: any;
    private polygon: any;
    private static points_on_circle = 16;

    /**
     * the constructor creates a new fabric.js object and adds it to the rink
     */
    constructor(x, y, width, num) {
        super("freehand_motion_path");
        this.object_num = num;
        this.radius = width / 2;
        this.path = [];
        this.path.push({"X": x, "Y": y});

        /* first generate a set of coordinates that form a circle
         this shape will be used for the minkowski sum
         (the minkowski sum function will draw the circular_shape along
         the path and return the coordinates of the resulting polygon)*/

        this.circular_shape = [];
        let a = 0;
        for (let i = 0; i < FreehandMotionPath.points_on_circle; i++) {
            a = a + Math.PI / (FreehandMotionPath.points_on_circle/2);
            let x = this.radius * Math.cos(a);
            let y = this.radius * Math.sin(a);
            this.circular_shape.push({
                X: x,
                Y: y
            });
        }

        this.polygon = null;
    }


    /**
     * This function changes the value of object_num
     * (if a object on the DrawingArea has been removed the object_num needs to be updated).
     */
    public setObjectNum(x): void {
        this.object_num = x;
    }

    /**
     * Motion path objects are not selectable and therefore the switching of being selectable is not needed.
     */
    public disableSelection(): void {
        return;
    }

    /**
     * Motion path objects are not selectable and therefore the switching of being selectable is not needed.
     */
    public enableSelection(): void {
        return;
    }

    /**
     *
     */
    public resize(pointer, origX, origY): void {
        // add new point to drawn path
        this.path.push({"X": pointer.x, "Y": pointer.y});

        // calculate minkowski sum of the new path
        let sum = ClipperLib.Clipper.MinkowskiSum(this.circular_shape, this.path, ClipperLib.PolyFillType.pftEvenOdd, false);

        // convert clipper_unminified.js coordinates to fabric.js format
        let points = new Array();
        for (let i = 0; i < sum[0].length; i++) {
            points.push({
                x: sum[0][i].X,
                y: sum[0][i].Y
            });
        }

        //if the polygon is already on the rink --> remove polygon
        if (this.polygon != null) {
            DrawingArea.field.remove(this.polygon);
        }

        // draw new polygon
        this.polygon = new fabric.Polygon(points, {
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            opacity: 1,
            hasRotatingPoint: false,
            hasControls: false,
            object_ref: this,
            hasBorders: true,
            selectable: false
        });
        DrawingArea.field.add(this.polygon);
        DrawingArea.field.renderAll();
    }

    /**
     * This function returns the type of DrawingObject and the edge coordinates of the rectangle for the query.
     */
    public getSelection(): any[] {
        let poly = this.polygon;
        let matrix = poly.calcTransformMatrix();
        let transformedPoints = poly.get("points").map(function (p) {
            return new fabric.Point(p.x - poly.minX - poly.width / 2, p.y - poly.minY - poly.height / 2);
        }).map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });

        let ret: any[] = [];
        //ret.push(this.type);
        ret.push('polygon');
        for (let i = 0; i < this.polygon.points.length; i++) {
            let point = transformedPoints[i];
            ret.push(point.x);
            ret.push(point.y);
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
        this.polygon.remove();
    }
}
