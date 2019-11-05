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
var BoundingBox = /** @class */ (function () {
    function BoundingBox() {
    }
    /**
     * Deleting polygons from field
     */
    BoundingBox.clearPolygons = function () {
        DrawingArea.field.remove(BoundingBox.startPolygon);
        DrawingArea.field.remove(BoundingBox.endPolygon);
    };
    /**
     * Drawing polygons on field
     */
    BoundingBox.drawPolygons = function () {
        BoundingBox.clearPolygons(); // clean up possible pre-existing polygons
        var points = MultiPathLineWithArrow.getPathStartAndEndPoints();
        // we draw polygons around the start and end points of the motion paths
        BoundingBox.startPolygon = BoundingBox.constructPolygon(points[0], CONFIG.COLOR_POLYGON_START);
        if (BoundingBox.startPolygon != null) {
            DrawingArea.field.add(BoundingBox.startPolygon);
        }
        BoundingBox.endPolygon = BoundingBox.constructPolygon(points[1], CONFIG.COLOR_POLYGON_END);
        if (BoundingBox.endPolygon != null) {
            DrawingArea.field.add(BoundingBox.endPolygon);
        }
    };
    /**
     * Given a set of points, this method constructs the convex hull in the given color.
     * @param points to encase
     * @param color of polygon
     */
    BoundingBox.constructPolygon = function (points, color) {
        // setting up starting point in upper left corner
        var x = DrawingArea.db_X_min;
        var y = DrawingArea.db_Y_min;
        // first vector points to the right
        var dx = DrawingArea.db_X_max - DrawingArea.db_X_min;
        var dy = 0;
        var previousPoints = []; // list of visited points
        var path = "";
        var length = points.length;
        // first point is selected differently to other points
        var nextPoint = BoundingBox.getNextPoint(points, x, y, dx, dy);
        for (var i = 0; i < length + 2; i++) { // we cut the border point finding process after a certain while
            // no points found at all?
            if (nextPoint == null) {
                break;
            }
            // did we already encounter the next point?
            var position = BoundingBox.positionInList(previousPoints, [nextPoint.x, nextPoint.y]);
            if (position >= 0) {
                path = BoundingBox.buildPath(previousPoints, position);
                break;
            }
            // new border point -> add to seen points
            previousPoints.push([nextPoint.x, nextPoint.y]);
            nextPoint = BoundingBox.getNextPoint(points, nextPoint.x, nextPoint.y, nextPoint.dx, nextPoint.dy);
        }
        // finally we construct the polygon object
        var line = new fabric.Path(path, {
            stroke: color,
            strokeWidth: CONFIG.EC_STROKE_WIDTH,
            fill: false,
            selectable: false,
            perPixelTargetFind: true
        });
        return line;
    };
    /**
     * This point selects the point from the given list with the smallest positive angle to the previous point and direction.
     * @param points list of points to check out
     * @param x previous point x
     * @param y previous point y
     * @param dx previous direction x
     * @param dy previous direction y
     */
    BoundingBox.getNextPoint = function (points, x, y, dx, dy) {
        var l = points.length;
        var closestPoint = null;
        var smallestAngle = Math.PI * 2; // same direction as (dx,dy), but with one turn
        for (var i = 0; i < l; i++) {
            var px = points[i][0];
            var py = points[i][1];
            if (px != x && py != y) { // it is not the same point as the last point
                var newDx = px - x;
                var newDy = py - y;
                var angleX = dx * newDx + dy * newDy;
                var angleY = dx * newDy - dy * newDx;
                var angle = Math.atan2(angleY, angleX);
                if ((closestPoint) == null || (angle < smallestAngle)) {
                    smallestAngle = angle;
                    closestPoint = { x: px, y: py, dx: newDx, dy: newDy };
                }
            }
        }
        return closestPoint;
    };
    /**
     * Building the string of the polygon from given list of points. We do not use the whole list, but only a subset
     * starting from the given position.
     * @param previousPoints list of points
     * @param position start position of sub list
     */
    BoundingBox.buildPath = function (previousPoints, position) {
        var path = "";
        var length = previousPoints.length;
        if (length > position) {
            for (var i = position; i < length; i++) {
                path = path + " L " + previousPoints[i][0] + " " + previousPoints[i][1];
            }
            path = path + "L " + previousPoints[position][0] + " " + previousPoints[position][1];
        }
        return path;
    };
    /**
     * Retrieving the index of a point in a list.
     * @param previousPoints list of points
     * @param point to get index of
     */
    BoundingBox.positionInList = function (previousPoints, point) {
        var position = -1;
        var length = previousPoints.length;
        for (var i = 0; i < length; i++) { // when the distance to the point we're looking for is small enough, we assume it is the same point
            var distance = Math.pow((previousPoints[i][0] - point[0]), 2) + Math.pow((previousPoints[i][1] - point[1]), 2);
            if (distance < 1) {
                return i;
            }
        }
        return position;
    };
    return BoundingBox;
}());
