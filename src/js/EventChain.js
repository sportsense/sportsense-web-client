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
 * An event chain is a continuous line/link of event markers.
 */
var EventChain = /** @class */ (function () {
    function EventChain(em, time, videotime, id, matchId) {
        this.connectors = [];
        this.merged = false;
        this.arrow = null;
        this.deactivated = false;
        this.markers = em;
        this.eventchainID = id;
        this.time = time;
        this.video_time = videotime;
        this.elem_id = "";
        this.matchId = matchId;
        EventChain.chains.push(this);
    }
    /**
     * This function lets the result list set the generated elem_id.
     * @param elem_id
     */
    EventChain.prototype.setElemID = function (elem_id) {
        this.elem_id = elem_id;
        // the connectors have to be drawn after the elem_id has been updated, otherwise the lines get wrong elem_ids
        this.createConnectors();
    };
    /**
     * This function adds a new event marker to the chain in order to extend it.
     * @param em
     */
    EventChain.prototype.addEventMarker = function (em) {
        this.markers.push(em);
    };
    /**
     */
    EventChain.prototype.createConnectors = function () {
        this.deleteConnectors();
        if (this.markers.length > 1) {
            for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
                var em = _a[_i];
                em.redraw();
            }
            for (var i in this.markers) {
                if (parseInt(i) == this.markers.length - 1) {
                    return;
                }
                var pos1 = this.markers[i].getXY();
                var pos2 = this.markers[(parseInt(i) + 1)].getXY();
                var line = this.makeLine([pos1[0], pos1[1], pos2[0], pos2[1]]);
                DrawingArea.field.add(line);
                this.connectors.push(line);
                DrawingArea.field.renderAll();
            }
        }
    };
    /**
     * This function removes all connector lines of ALL event chains.
     */
    EventChain.clearConnectors = function () {
        if (EventChain.chains != null) {
            for (var _i = 0, _a = EventChain.chains; _i < _a.length; _i++) {
                var del = _a[_i];
                del.deleteConnectors();
                del.connectors = [];
            }
        }
        DrawingArea.field.renderAll();
    };
    /**
     * This function removes ALL event chains.
     */
    EventChain.clearChains = function () {
        EventChain.clearConnectors();
        EventChain.chains = [];
        EventMarker.clearMarkers();
        EventChain.active_chain = null;
    };
    /**
     * This function removes all connectors of a single event chain.
     */
    EventChain.prototype.deleteConnectors = function () {
        if (this.connectors.length > 0) {
            for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
                var del = _a[_i];
                DrawingArea.field.remove(del);
            }
            this.connectors = [];
        }
    };
    /**
     * Whenever we click the off-ball-activities-switch or select an event, we have to reset the colors of the events
     */
    EventChain.updateChainColors = function () {
        for (var _i = 0, _a = EventChain.chains; _i < _a.length; _i++) {
            var chain = _a[_i];
            if (chain !== EventChain.active_chain) { // only change color of non-selected events
                chain.setChainColor(1);
                if (!OffBallActivities.isActive) { // possibly reactivate markers in timeline
                    Timeline.activate(chain.elem_id.split("_")[1]);
                }
            }
        }
        DrawingArea.field.renderAll();
    };
    /**
     * This function the settings of the fabric.js lines.
     * @param highlight
     * @param activate
     */
    EventChain.prototype.setChainColor = function (highlight, activate) {
        if (this.deactivated && activate == undefined) {
            return;
        }
        // Here we grey out the non-selected events if off-ball-activities are active
        if (OffBallActivities.isActive && highlight == 1 && EventChain.active_chain != null) {
            highlight = 4; // deactivated color
        }
        if (highlight == 1) {
            if (activate) {
                this.deactivated = false;
                Timeline.activate(this.elem_id.split("_")[1]);
            }
            Timeline.stopHover(this.elem_id.split("_")[1]);
            for (var _i = 0, _a = this.connectors; _i < _a.length; _i++) {
                var line = _a[_i];
                line.set('fill', CONFIG.COLOR_STANDARD);
                line.set('stroke', CONFIG.COLOR_STANDARD);
            }
        }
        else if (highlight == 2) {
            Timeline.stopHover(this.elem_id.split("_")[1]);
            Timeline.setActive(this.elem_id.split("_")[1]);
            for (var _b = 0, _c = this.connectors; _b < _c.length; _b++) {
                var line = _c[_b];
                line.set('fill', CONFIG.COLOR_HIGHLIGHTED);
                line.set('stroke', CONFIG.COLOR_HIGHLIGHTED);
                DrawingArea.field.bringToFront(line);
            }
        }
        else if (highlight == 3) {
            Timeline.hover(this.elem_id.split("_")[1]);
            for (var _d = 0, _e = this.connectors; _d < _e.length; _d++) {
                var line = _e[_d];
                line.set('fill', CONFIG.COLOR_HOVER);
                line.set('stroke', CONFIG.COLOR_HOVER);
            }
        }
        else if (highlight == 4) {
            Timeline.deactivate(this.elem_id.split("_")[1]);
            for (var _f = 0, _g = this.connectors; _f < _g.length; _f++) {
                var line = _g[_f];
                line.set('fill', CONFIG.COLOR_INVISIBLE);
                line.set('stroke', CONFIG.COLOR_INVISIBLE);
            }
        }
        else {
            this.deactivated = true;
            Timeline.deactivate(this.elem_id.split("_")[1]);
            for (var _h = 0, _j = this.connectors; _h < _j.length; _h++) {
                var line = _j[_h];
                line.set('fill', CONFIG.COLOR_DEACTIVATED);
                line.set('stroke', CONFIG.COLOR_DEACTIVATED);
            }
        }
        // this part is common for every kind of highlighting color
        if (this.arrow != null) {
            this.arrow.changeColor(highlight);
        }
        this.changeMarkerColors(highlight);
    };
    /**
     * This function changes all marker (dots on the field) colors.
     * @param highlight
     */
    EventChain.prototype.changeMarkerColors = function (highlight) {
        EventMarker.changeMarkerColor(this.markers, highlight);
    };
    /**
     * This function draws a line at the given coordinates and the sets mouse listeners.
     * @param coords
     * @returns {any}
     */
    EventChain.prototype.makeLine = function (coords) {
        var line = new fabric.Line(coords, {
            fill: CONFIG.COLOR_STANDARD,
            stroke: CONFIG.COLOR_STANDARD,
            strokeWidth: CONFIG.EC_STROKE_WIDTH,
            selectable: false,
            perPixelTargetFind: true,
            matchId: this.matchId
        });
        line.ec = this;
        line.id = this.eventchainID;
        line.time = this.video_time;
        line.elem_id = this.elem_id;
        line.hasControls = line.hasBorders = false;
        line.lockMovementX = line.lockMovementY = true;
        line.on('mousedown', function () {
            var ec = line.ec;
            videoarea.setVideoTime(line.time, line.matchId);
            ec.changeActiveChain();
        });
        line.on("mouseover", function () {
            var ec = line.ec;
            if (ec != EventChain.active_chain) {
                ec.setChainColor(3);
            }
            //ResultList.hover(line.elem_id);
        });
        line.on("mouseout", function () {
            var ec = line.ec;
            if (ec != EventChain.active_chain) {
                ec.setChainColor(1);
            }
            //ResultList.deactivate_hover(line.elem_id);
        });
        return line;
    };
    /**
     * This function changes the active coloration of the chain (if active it becomes pink, if not active anymore it becomes blue again)
     */
    EventChain.prototype.changeActiveChain = function () {
        if (EventChain.active_chain == null) {
            EventChain.active_chain = this;
        }
        else {
            EventChain.active_chain.deactivateActive();
            EventChain.active_chain = this;
        }
        //ResultList.set_active(this.elem_id);
        if (this.arrow != null) {
            this.arrow.changeActiveArrow();
        }
        this.setChainColor(2);
        this.changeMarkerColors(2);
        // update the gui
        OffBallActivities.registerActiveEventChain(this);
        // set correct colors for all events
        //EventChain.updateChainColors();
    };
    /**
     * this function changes the color to blue (or grey, if off-ball-activities are active)
     */
    EventChain.prototype.deactivateActive = function () {
        this.setChainColor(1);
    };
    EventChain.prototype.getLastMarker = function () {
        if (this.markers.length > 0) {
            return this.markers[this.markers.length - 1];
        }
        else {
            return null;
        }
    };
    /**
     * This function returns a set of "last added markers" (for the event chain query).
     * @returns {EventMarker[]}
     */
    EventChain.getLastMarkers = function () {
        var res = [];
        for (var _i = 0, _a = EventChain.chains; _i < _a.length; _i++) {
            var ec = _a[_i];
            var lm = ec.getLastMarker();
            if (lm != null) {
                res.push(lm);
            }
        }
        return res;
    };
    /**
     * This function searches all event chains for a certain id.
     * @param id
     * @returns {EventChain}
     */
    EventChain.searchEventMarkerID = function (id) {
        for (var _i = 0, _a = EventChain.chains; _i < _a.length; _i++) {
            var ec = _a[_i];
            if (ec.containsID(id)) {
                return ec;
            }
        }
    };
    /**
     * This function returns if a single event chain contains a certain id.
     * @param id
     * @returns {boolean}
     */
    EventChain.prototype.containsID = function (id) {
        for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
            var em = _a[_i];
            if (em.markerid == id) {
                return true;
            }
        }
        return false;
    };
    /**
     * This function allows to change the start time of a event chain (for reverse cascading)
     * @param time
     */
    EventChain.prototype.changeTime = function (time, videotime) {
        this.time = time;
        this.video_time = videotime;
    };
    /**
     * This function removes a single event chain and deletes all its traces.
     * If the merged-flag is set, the function will not delete the chain (DBConnection)
     */
    EventChain.prototype.deleteChain = function () {
        if (!this.merged) {
            for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
                var em = _a[_i];
                EventMarker.deleteMarker(em.markerid);
            }
            this.markers = [];
            var newchains = [];
            for (var i in EventChain.chains) {
                if (EventChain.chains[i].eventchainID != this.eventchainID) {
                    newchains.push(EventChain.chains[i]);
                }
            }
            for (var _b = 0, _c = this.connectors; _b < _c.length; _b++) {
                var c = _c[_b];
                DrawingArea.field.remove(c);
            }
            EventChain.chains = newchains;
            this.connectors = [];
            this.eventchainID = -1;
            this.time = null;
        }
        else {
            this.merged = false;
        }
    };
    /**
     * Getter function for the event chain ID.
     * @returns {number}
     */
    EventChain.prototype.getID = function () {
        return this.eventchainID;
    };
    /**
     * Getter function for the element ID of the result list.
     * @returns {string}
     */
    EventChain.prototype.getElemID = function () {
        return this.elem_id;
    };
    /**
     * This function adds all the event markers of another event chain in forwards event cascade order, or reverse event cascade order.
     * @param chain
     */
    EventChain.prototype.addChain = function (chain, reverse) {
        var new_markers = [];
        var iterator = 0;
        for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
            var marker = _a[_i];
            if (!reverse) { // if forward event cascade
                while (true) { // has to start a loop, if following markers are also added before the marker
                    if (iterator < (chain.markers.length - 1) && chain.markers[iterator].time < marker.time) {
                        chain.markers[iterator].setNewParent(this);
                        new_markers.push(chain.markers[iterator]);
                        iterator++;
                    }
                    else {
                        break;
                    }
                }
            }
            else { // if reverse event cascade
                while (true) { // same loop, other condition for time of marker
                    if (iterator < (chain.markers.length) && chain.markers[iterator].time > marker.time) {
                        chain.markers[iterator].setNewParent(this);
                        new_markers.push(chain.markers[iterator]);
                        iterator++;
                    }
                    else {
                        break;
                    }
                }
            }
            new_markers.push(marker);
        }
        for (var i = iterator; i < chain.markers.length; i++) {
            chain.markers[i].setNewParent(this);
            new_markers.push(chain.markers[i]);
        }
        chain.deleteConnectors();
        this.deleteConnectors();
        chain.markers = []; // important, otherwise the deletion of the event chain would delete the transferred event markers.
        this.markers = new_markers;
        this.merged = true;
    };
    EventChain.prototype.setArrow = function (arrow) {
        this.arrow = arrow;
    };
    EventChain.prototype.removeArrow = function () {
        this.arrow = null;
    };
    EventChain.active_chain = null;
    EventChain.chains = [];
    return EventChain;
}());
