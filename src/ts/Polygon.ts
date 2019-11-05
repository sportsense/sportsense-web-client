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

declare var $: any;

class Polygon extends DrawingObject {

    public poly: any;
    private object_num;
    private nvert: number;

    constructor(num) {
        super("polygon");
        this.object_num = num;
        this.nvert = 0;
    }

    /**
     * This function removes the polygon.
     */
    public remove(): void {
        this.poly.remove();
    }

    public getSelection(): any[] {
        let polygon = this.poly;
        let matrix = polygon.calcTransformMatrix();
        let transformedPoints = polygon.get("points").map(function (p) {
            return new fabric.Point(p.x - polygon.minX - polygon.width / 2, p.y - polygon.minY - polygon.height / 2);
        }).map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });

        let ret: any[] = [];
        ret.push(this.type);
        for (let i = 0; i < this.poly.points.length; i++) {
            let point = transformedPoints[i];
            ret.push(point.x);
            ret.push(point.y);
        }
        return ret;
    }

    /**
     * This function returns true if a point is contained within the polygon.
     * Taken from: https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
     */
    public contained(testx: number, testy: number): boolean {
        let polygon = this.poly;
        var matrix = polygon.calcTransformMatrix();
        var transformedPoints = polygon.get("points").map(function (p) {
            return new fabric.Point(p.x - polygon.minX - polygon.width / 2, p.y - polygon.minY - polygon.height / 2);
        }).map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });

        let c = false;
        for (let i = 0, j = this.nvert - 1; i < this.nvert; j = i++) {
            if (((transformedPoints[i].y > testy) != (transformedPoints[j].y > testy)) &&
                (testx < (transformedPoints[j].x - transformedPoints[i].x) * (testy - transformedPoints[i].y) / (transformedPoints[j].y - transformedPoints[i].y) + transformedPoints[i].x)) {
                c = !c;
            }
        }
        return c;
    }

    /**
     * enables the selection of this object
     */
    public enableSelection(): void {
        if (this.poly != null) {
            this.poly.selectable = true;
        }
    }

    /**
     * disables the selection of this object
     */
    public disableSelection(): void {
        if (this.poly != null) {
            this.poly.selectable = false;
        }
    }


    public finishPolygon(lineArray): void {
        let points = new Array();
        $.each(lineArray, function (index, line) {
            points.push({
                x: line.getCoords()[0].x,
                y: line.getCoords()[0].y
            });
            DrawingArea.field.remove(line);
        });

        this.nvert = lineArray.length;

        let polygon = new fabric.Polygon(points, {
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
    }

    /**
     * The polygon is the only DrawingObject that is drawn in a different way.
     * The user will not drag the object to the wished size, the side points will be generated along the mouse path.
     * After releasing the left mouse button the polygon will be finished (last point connects with starting point).
     * THIS IS AN EXCEPTION: THIS FUNCTION JUST TRIGGERS THE END OF THE DRAWING PROCESS!
     */
    public resize(): void {
        this.finishPolygon(DrawingArea.polygon_lines);
    }

    public setObjectNum(x): void {
        this.object_num = x;
    }
}
