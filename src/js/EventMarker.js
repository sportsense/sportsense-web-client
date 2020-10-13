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
/**
 * An event marker is a single marker (point on the canvas)
 */
var EventMarker = /** @class */ (function () {
    /**
     * this constructor adds an event marker on the canvas at a given position
     */
    function EventMarker(location, id, time, videotime, ec) {
        var strokeWidth = CONFIG.MARKER_SIZE;
        var radius = CONFIG.MARKER_SIZE / 2;
        var location = DrawingArea.dbToCanvasCoordinates(location[0], location[1]);
        this.marker = new fabric.Circle({
            left: location[0],
            top: location[1],
            strokeWidth: strokeWidth,
            radius: radius,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_STANDARD,
            selectable: false
        });
        this.parent_chain = ec;
        this.marker.hasControls = this.marker.hasBorders = false;
        this.marker.lockMovementX = this.marker.lockMovementY = true;
        this.markerid = id;
        this.time = time;
        this.marker.on('mousedown', function () {
            videoarea.setVideoTime(ec.video_time, ec.matchId);
            if (document.getElementById("pressingAnalysisBtn").innerHTML == "Pressing Phases") {
                ec.changeActiveChain();
            }
        });
        this.marker.on("mouseover", function () {
            if (ec != EventChain.active_chain) {
                if (document.getElementById("pressingAnalysisBtn").innerHTML == "Pressing Phases") {
                    ec.setChainColor(3);
                }
            }
        });
        this.marker.on("mouseout", function () {
            if (ec != EventChain.active_chain) {
                if (document.getElementById("pressingAnalysisBtn").innerHTML == "Pressing Phases") {
                    ec.setChainColor(1);
                }
            }
        });
        EventMarker.markers.push(this);
        DrawingArea.field.add(this.marker);
        DrawingArea.field.bringToFront(this.marker);
        DrawingArea.field.renderAll();
        DBConnection.eventIDs = [];
        for (var i = 0; i < EventMarker.markers.length; i++) {
            if (DBConnection.eventIDs.indexOf(id) == -1) { //This adds all the mongoDB ids of the events into an array to later store them in the database (If a user clicks "save")
                DBConnection.eventIDs.push(EventMarker.markers[i].markerid); //If you want to store the filter in the Database with the attributes (coordinates, different filters etc...) then just remove this "if" statement, remove the 2 lines
            }
        }
    }
    /**
     * This function takes an event marker and updates the marker array.
     * @param marker
     */
    EventMarker.push = function (marker) {
        EventMarker.markers.push(marker);
    };
    /**
     * This function can change the color of a set of markers according to the requested state (active, hover and inactive)
     * @param id
     * @param highlight
     */
    EventMarker.changeMarkerColor = function (markers, highlight) {
        // Here we grey out the non-selected markers if off-ball-activities are active
        if (OffBallActivities.isActive && highlight == 1 && EventChain.active_chain != null) {
            highlight = 4; // deactivated color
        }
        for (var _i = 0, markers_1 = markers; _i < markers_1.length; _i++) {
            var marker = markers_1[_i];
            if (highlight == 1) {
                marker.marker.set("stroke", CONFIG.COLOR_STANDARD);
            }
            else if (highlight == 2) {
                marker.marker.set("stroke", CONFIG.COLOR_HIGHLIGHTED);
                DrawingArea.field.bringToFront(marker.marker);
            }
            else if (highlight == 3) {
                marker.marker.set("stroke", CONFIG.COLOR_HOVER);
            }
            else if (highlight == 4) {
                marker.marker.set("stroke", CONFIG.COLOR_INVISIBLE);
            }
            else if (highlight == 5) {
                marker.marker.set("stroke", CONFIG.COLOR_TEAM_A_STANDARD);
            }
            else if (highlight == 6) {
                marker.marker.set("stroke", CONFIG.COLOR_TEAM_B_STANDARD);
            }
            else {
                marker.marker.set("stroke", CONFIG.COLOR_DEACTIVATED);
            }
        }
        DrawingArea.field.renderAll();
    };
    /**
     * This function removes all markers on the canvas.
     */
    EventMarker.clearMarkers = function () {
        for (var i in EventMarker.markers) {
            EventMarker.markers[i].removeMarker();
        }
        EventMarker.markers = [];
    };
    /**
     * This function removes a single marker on the canvas.
     */
    EventMarker.prototype.removeMarker = function () {
        DrawingArea.field.remove(this.marker);
        DrawingArea.field.renderAll();
    };
    /**
     * This function searches for a certain marker id and removes this marker.
     * @param id
     */
    EventMarker.deleteMarker = function (id) {
        var newmarkers = [];
        for (var _i = 0, _a = EventMarker.markers; _i < _a.length; _i++) {
            var em = _a[_i];
            if (id != em.markerid) {
                newmarkers.push(em);
            }
            else {
                em.removeMarker();
            }
        }
        EventMarker.markers = newmarkers;
    };
    /**
     * This function returns the coordinates of a marker.
     * @returns {[number,number]}
     */
    EventMarker.prototype.getXY = function () {
        return [(this.marker.left - this.marker.radius), (this.marker.top - this.marker.radius)];
    };
    /**
     * This function returns the whole marker list.
     * @returns {EventMarker[]}
     */
    EventMarker.getMarkerList = function () {
        return EventMarker.markers;
    };
    /**
     * This function adds this marker again to the marker array and adds it again to the canvas.
     */
    EventMarker.prototype.redraw = function () {
        DrawingArea.field.remove(this.marker);
        EventMarker.markers.push(this);
        DrawingArea.field.add(this.marker);
        DrawingArea.field.bringToFront(this.marker);
        DrawingArea.field.renderAll();
    };
    /**
     * This function returns the parent EventChain
     * @returns {EventChain}
     */
    EventMarker.prototype.getParentChain = function () {
        return this.parent_chain;
    };
    /**
     * This function returns the marker object of an input ID, if the ID exists.
     * @param id
     * @returns {any}
     */
    EventMarker.getMarker = function (id) {
        for (var _i = 0, _a = EventMarker.markers; _i < _a.length; _i++) {
            var marker = _a[_i];
            if (id == marker.markerid) {
                return marker;
            }
        }
        return null;
    };
    /**
     * This function sets a new parent EventChain
     * @param ec
     */
    EventMarker.prototype.setNewParent = function (ec) {
        this.parent_chain = ec;
    };
    /**
     * This function returns the parent EventChain's matchID
     */
    EventMarker.prototype.getMarkerMatchID = function () {
        return this.parent_chain.matchId;
    };
    EventMarker.markers = [];
    return EventMarker;
}());
