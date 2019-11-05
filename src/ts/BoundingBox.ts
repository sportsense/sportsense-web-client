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

class BoundingBox {

    private static startPolygon: any;
    private static endPolygon: any;

    /**
     * Deleting polygons from field
     */
    public static clearPolygons(): void {
        DrawingArea.field.remove(BoundingBox.startPolygon);
        DrawingArea.field.remove(BoundingBox.endPolygon);
    }

    /**
     * Drawing polygons on field
     */
    public static drawPolygons(): void {
        BoundingBox.clearPolygons(); // clean up possible pre-existing polygons

        let points: any[] = MultiPathLineWithArrow.getPathStartAndEndPoints();

        // we draw polygons around the start and end points of the motion paths
        BoundingBox.startPolygon = BoundingBox.constructPolygon(points[0], CONFIG.COLOR_POLYGON_START);
        if (BoundingBox.startPolygon != null) {
            DrawingArea.field.add(BoundingBox.startPolygon);
        }
        BoundingBox.endPolygon = BoundingBox.constructPolygon(points[1], CONFIG.COLOR_POLYGON_END);
        if (BoundingBox.endPolygon != null) {
            DrawingArea.field.add(BoundingBox.endPolygon);
        }
    }

    /**
     * Given a set of points, this method constructs the convex hull in the given color.
     * @param points to encase
     * @param color of polygon
     */
    private static constructPolygon(points: any[], color: string) {
        // setting up starting point in upper left corner
        let x: number = DrawingArea.db_X_min;
        let y: number = DrawingArea.db_Y_min;
        // first vector points to the right
        let dx: number = DrawingArea.db_X_max - DrawingArea.db_X_min;
        let dy: number = 0;

        let previousPoints = []; // list of visited points
        let path: string = "";
        let length: number = points.length;

        // first point is selected differently to other points
        let nextPoint = BoundingBox.getNextPoint(points, x, y, dx, dy);
        for (let i = 0; i < length + 2; i++) { // we cut the border point finding process after a certain while
            // no points found at all?
            if (nextPoint == null) { break; }

            // did we already encounter the next point?
            let position = BoundingBox.positionInList(previousPoints, [nextPoint.x, nextPoint.y]);
            if (position >= 0) {
                path = BoundingBox.buildPath(previousPoints, position);
                break;
            }

            // new border point -> add to seen points
            previousPoints.push([nextPoint.x, nextPoint.y]);
            nextPoint = BoundingBox.getNextPoint(points, nextPoint.x, nextPoint.y, nextPoint.dx, nextPoint.dy);
        }

        // finally we construct the polygon object
        let line = new fabric.Path(path, {
            stroke: color,
            strokeWidth: CONFIG.EC_STROKE_WIDTH,
            fill: false,
            selectable: false,
            perPixelTargetFind: true
        });

        return line;
    }

    /**
     * This point selects the point from the given list with the smallest positive angle to the previous point and direction.
     * @param points list of points to check out
     * @param x previous point x
     * @param y previous point y
     * @param dx previous direction x
     * @param dy previous direction y
     */
    private static getNextPoint(points, x, y, dx, dy) {
        let l: number = points.length;

        let closestPoint = null;
        let smallestAngle = Math.PI*2; // same direction as (dx,dy), but with one turn

        for (let i=0; i<l; i++) {
            let px = points[i][0];
            let py = points[i][1];

            if (px != x && py != y) { // it is not the same point as the last point
                let newDx = px - x;
                let newDy = py - y;

                let angleX = dx*newDx + dy*newDy;
                let angleY = dx*newDy - dy*newDx;

                let angle = Math.atan2(angleY, angleX);

                if ((closestPoint) == null || (angle < smallestAngle)) {
                    smallestAngle = angle;
                    closestPoint = {x: px, y: py, dx: newDx, dy: newDy};
                }
            }
        }

        return closestPoint;
    }

    /**
     * Building the string of the polygon from given list of points. We do not use the whole list, but only a subset
     * starting from the given position.
     * @param previousPoints list of points
     * @param position start position of sub list
     */
    private static buildPath(previousPoints: any[], position: number): string {
        let path = "";
        let length: number = previousPoints.length;

        if (length > position) {
            for (let i=position; i<length; i++) {
                path = path + " L " + previousPoints[i][0] + " " + previousPoints[i][1];
            }
            path = path + "L " + previousPoints[position][0] + " " + previousPoints[position][1];
        }

        return path;
    }

    /**
     * Retrieving the index of a point in a list.
     * @param previousPoints list of points
     * @param point to get index of
     */
    private static positionInList(previousPoints: any[], point: number[]): number {
        let position: number = -1;
        let length: number = previousPoints.length;

        for (let i=0; i<length; i++) { // when the distance to the point we're looking for is small enough, we assume it is the same point
            let distance = Math.pow((previousPoints[i][0] - point[0]),2) + Math.pow((previousPoints[i][1] - point[1]),2);
            if (distance < 1) { return i; }
        }

        return position;
    }
}