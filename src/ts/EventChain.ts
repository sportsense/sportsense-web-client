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

declare var fabric: any;

/**
 * An event chain is a continuous line/link of event markers.
 */
class EventChain {

    private connectors: any[] = [];
    private eventchainID: number;
    private elem_id: string;
    private merged: boolean = false;
    public matchId: string;
    public time: string;
    public video_time: number;
    public markers: EventMarker[];
    public arrow: Arrow = null;
    private deactivated: boolean = false;

    public static active_chain: EventChain = null;
    private static chains: EventChain[] = [];

    constructor(em: EventMarker[], time: any, videotime: number, id: number, matchId: string) {
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
    public setElemID(elem_id) {
        this.elem_id = elem_id;
        // the connectors have to be drawn after the elem_id has been updated, otherwise the lines get wrong elem_ids
        this.createConnectors();
    }

    /**
     * This function adds a new event marker to the chain in order to extend it.
     * @param em
     */
    public addEventMarker(em: EventMarker): void {
        this.markers.push(em);
    }

    /**
     */
    private createConnectors(): void {
        this.deleteConnectors();
        if (this.markers.length > 1) {
            for (let em of this.markers) {
                em.redraw();
            }
            for (let i in this.markers) {
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
    }

    /**
     * This function removes all connector lines of ALL event chains.
     */
    public static clearConnectors(): void {
        if (EventChain.chains != null) {
            for (let del of EventChain.chains) {
                del.deleteConnectors();
                del.connectors = [];
            }
        }
        DrawingArea.field.renderAll();
    }

    /**
     * This function removes ALL event chains.
     */
    public static clearChains() {
        EventChain.clearConnectors();
        EventChain.chains = [];
        EventMarker.clearMarkers();
        EventChain.active_chain = null;
    }

    /**
     * This function removes all connectors of a single event chain.
     */
    private deleteConnectors() {
        if (this.connectors.length > 0) {
            for (let del of this.connectors) {
                DrawingArea.field.remove(del);
            }
            this.connectors = [];
        }
    }

    /**
     * Whenever we click the off-ball-activities-switch or select an event, we have to reset the colors of the events
     */
    public static updateChainColors(): void {
        for (let chain of EventChain.chains) {
            if (chain !== EventChain.active_chain) { // only change color of non-selected events
                chain.setChainColor(1);

                if (!OffBallActivities.isActive) { // possibly reactivate markers in timeline
                    Timeline.activate(chain.elem_id.split("_")[1]);
                }
            }
        }
        DrawingArea.field.renderAll();
    }

    /**
     * This function the settings of the fabric.js lines.
     * @param highlight
     * @param activate
     */
    public setChainColor(highlight: number, activate?: boolean): void {
        if(this.deactivated && activate == undefined){
            return;
        }

        // Here we grey out the non-selected events if off-ball-activities are active
        if (OffBallActivities.isActive && highlight == 1 && EventChain.active_chain != null) {
            highlight = 4; // deactivated color
        }

        if (highlight == 1) {
            if(activate){
                this.deactivated = false;
                Timeline.activate(this.elem_id.split("_")[1]);
            }
            Timeline.stopHover(this.elem_id.split("_")[1]);
            for (let line of this.connectors) {
                line.set('fill', CONFIG.COLOR_STANDARD);
                line.set('stroke', CONFIG.COLOR_STANDARD);
            }
        } else if (highlight == 2) {
            Timeline.stopHover(this.elem_id.split("_")[1]);
            Timeline.setActive(this.elem_id.split("_")[1]);
            for (let line of this.connectors) {
                line.set('fill', CONFIG.COLOR_HIGHLIGHTED);
                line.set('stroke', CONFIG.COLOR_HIGHLIGHTED);
                DrawingArea.field.bringToFront(line);
            }
        } else if (highlight == 3){
            Timeline.hover(this.elem_id.split("_")[1]);
            for (let line of this.connectors) {
                line.set('fill', CONFIG.COLOR_HOVER);
                line.set('stroke', CONFIG.COLOR_HOVER);
            }
        } else if (highlight == 4){
            Timeline.deactivate(this.elem_id.split("_")[1]);
            for (let line of this.connectors) {
                line.set('fill', CONFIG.COLOR_INVISIBLE);
                line.set('stroke', CONFIG.COLOR_INVISIBLE);
            }
        } else {
            this.deactivated = true;
            Timeline.deactivate(this.elem_id.split("_")[1]);
            for (let line of this.connectors) {
                line.set('fill', CONFIG.COLOR_DEACTIVATED);
                line.set('stroke', CONFIG.COLOR_DEACTIVATED);
            }
        }

        // this part is common for every kind of highlighting color
        if (this.arrow != null) {
            this.arrow.changeColor(highlight);
        }
        this.changeMarkerColors(highlight);
    }

    /**
     * This function changes all marker (dots on the field) colors.
     * @param highlight
     */
    private changeMarkerColors(highlight: number) {
        EventMarker.changeMarkerColor(this.markers, highlight);
    }

    /**
     * This function draws a line at the given coordinates and the sets mouse listeners.
     * @param coords
     * @returns {any}
     */
    makeLine(coords): any {
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
            let ec: EventChain = line.ec;
            videoarea.setVideoTime(line.time, line.matchId);
            ec.changeActiveChain();
        });

        line.on("mouseover", function () {
            let ec: EventChain = line.ec;
            if (ec != EventChain.active_chain) {
                ec.setChainColor(3);
            }
            //ResultList.hover(line.elem_id);
        });

        line.on("mouseout", function () {
            let ec: EventChain = line.ec;
            if (ec != EventChain.active_chain) {
                ec.setChainColor(1);
            }
            //ResultList.deactivate_hover(line.elem_id);
        });

        return line;
    }

    /**
     * This function changes the active coloration of the chain (if active it becomes pink, if not active anymore it becomes blue again)
     */
    public changeActiveChain(): void {
        if (EventChain.active_chain == null) {
            EventChain.active_chain = this;
        } else {
            EventChain.active_chain.deactivateActive();
            EventChain.active_chain = this;
        }
        //ResultList.set_active(this.elem_id);
        if(this.arrow != null){
            this.arrow.changeActiveArrow();
        }
        this.setChainColor(2);
        this.changeMarkerColors(2);

        // update the gui
        OffBallActivities.registerActiveEventChain(this);

        // set correct colors for all events
        EventChain.updateChainColors();
    }

    /**
     * this function changes the color to blue (or grey, if off-ball-activities are active)
     */
    public deactivateActive(): void {
        this.setChainColor(1);
    }

    private getLastMarker(): EventMarker {
        if (this.markers.length > 0) {
            return this.markers[this.markers.length - 1];
        } else {
            return null;
        }
    }

    /**
     * This function returns a set of "last added markers" (for the event chain query).
     * @returns {EventMarker[]}
     */
    public static getLastMarkers(): EventMarker[] {
        let res: EventMarker[] = [];
        for (let ec of EventChain.chains) {
            let lm: EventMarker = ec.getLastMarker()
            if (lm != null) {
                res.push(lm);
            }
        }
        return res;
    }

    /**
     * This function searches all event chains for a certain id.
     * @param id
     * @returns {EventChain}
     */
    public static searchEventMarkerID(id: string): EventChain {
        for (let ec of EventChain.chains) {
            if (ec.containsID(id)) {
                return ec;
            }
        }
    }

    /**
     * This function returns if a single event chain contains a certain id.
     * @param id
     * @returns {boolean}
     */
    public containsID(id: string): boolean {
        for (let em of this.markers) {
            if (em.markerid == id) {
                return true;
            }
        }
        return false;
    }

    /**
     * This function allows to change the start time of a event chain (for reverse cascading)
     * @param time
     */
    public changeTime(time: any, videotime: any): void {
        this.time = time;
        this.video_time = videotime;
    }

    /**
     * This function removes a single event chain and deletes all its traces.
     * If the merged-flag is set, the function will not delete the chain (DBConnection)
     */
    public deleteChain(): void {
        if (!this.merged) {
            for (let em of this.markers) {
                EventMarker.deleteMarker(em.markerid);
            }
            this.markers = [];
            var newchains = [];
            for (let i in EventChain.chains) {
                if (EventChain.chains[i].eventchainID != this.eventchainID) {
                    newchains.push(EventChain.chains[i]);
                }
            }
            for (let c of this.connectors) {
                DrawingArea.field.remove(c);
            }
            EventChain.chains = newchains;
            this.connectors = [];
            this.eventchainID = -1;
            this.time = null;
        } else {
            this.merged = false;
        }
    }

    /**
     * Getter function for the event chain ID.
     * @returns {number}
     */
    public getID() {
        return this.eventchainID;
    }

    /**
     * Getter function for the element ID of the result list.
     * @returns {string}
     */
    public getElemID() {
        return this.elem_id;
    }

    /**
     * This function adds all the event markers of another event chain in forwards event cascade order, or reverse event cascade order.
     * @param chain
     */
    public addChain(chain: EventChain, reverse: boolean): void {
        let new_markers: EventMarker[] = [];
        let iterator: number = 0;
        for (let marker of this.markers) {
            if (!reverse) {                                          // if forward event cascade
                while (true) {                                       // has to start a loop, if following markers are also added before the marker
                    if (iterator < (chain.markers.length-1) && chain.markers[iterator].time < marker.time) {
                        chain.markers[iterator].setNewParent(this);
                        new_markers.push(chain.markers[iterator]);
                        iterator++;
                    } else {
                        break;
                    }
                }
            } else {                                                  // if reverse event cascade
                while (true) {                                        // same loop, other condition for time of marker
                    if (iterator < (chain.markers.length) && chain.markers[iterator].time > marker.time) {
                        chain.markers[iterator].setNewParent(this);
                        new_markers.push(chain.markers[iterator]);
                        iterator++;
                    } else {
                        break;
                    }
                }
            }
            new_markers.push(marker);
        }
        for (let i = iterator; i < chain.markers.length; i++) {
            chain.markers[i].setNewParent(this);
            new_markers.push(chain.markers[i]);
        }
        chain.deleteConnectors();
        this.deleteConnectors();
        chain.markers = [];                 // important, otherwise the deletion of the event chain would delete the transferred event markers.
        this.markers = new_markers;
        this.merged = true;
    }

    public setArrow(arrow: Arrow): void{
        this.arrow = arrow;
    }

    public removeArrow(): void{
        this.arrow = null;
    }
}
