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
 * A phase is a period of time where a specific condition holds
 */
class Phases {

    private phase_id: number;
    private elem_id: string;
    public matchId: string;
    public playerId: string;
    public teamId: string;
    public venue: string;
    public info: string;
    public style: string;
    public start_time: string;
    public end_time: string;
    public video_time: number;
    public time: number;
    public startX: number;
    public startY: number;
    public coords: number[];


    public static pressing_phases: Phases[] = [];
    public static transition_phases: Phases[] = [];

    constructor(start_time: any, end_time: any, videotime: number, time: number, startX: number, startY: number, id: number, matchId: string, teamId: string, venue: string, info:string, style:string) {
        this.phase_id = id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.video_time = videotime;
        this.time = time;
        this.startX = startX;
        this.startY = startY;
        this.coords = [startX,startY];
        this.elem_id = "";
        this.matchId = matchId;
        this.teamId = teamId;
        this.venue = venue;
        this.info = info;
        this.style = style;
    }

    /**
     * This function lets the result list set the generated elem_id.
     * @param elem_id
     */
    public setElemID(elem_id) {
        this.elem_id = elem_id;
    }

    /**
     * This function removes ALL phases.
     */
    public static clearPhases() {
        this.pressing_phases = [];
        this.transition_phases = [];
    }

    /**
     * This function removes the pressing phases.
     */
    public static clearPressingPhases() {
        this.pressing_phases = [];
    }

    /**
     * This function removes the transition phases.
     */
    public static clearTransitionPhases() {
        this.transition_phases = [];
    }

    /**
     * This function sorts all pressing phases among their id in ascending order.
     */
    public static sortPressingPhases() {
        this.pressing_phases.sort(function(a, b){
            let phase_one = a.phase_id;
            let phase_two = b.phase_id;
            let comparison = 0;
            if (phase_one > phase_two) {
                comparison = 1;
            } else if (phase_one < phase_two) {
                comparison = -1;
            }
            return comparison;
        });
    }

    /**
     * This function sorts all transition phases among their id in ascending order.
     */
    public static sortTransitionPhases() {
        this.transition_phases.sort(function(a, b){
            let phase_one = a.phase_id;
            let phase_two = b.phase_id;
            let comparison = 0;
            if (phase_one > phase_two) {
                comparison = 1;
            } else if (phase_one < phase_two) {
                comparison = -1;
            }
            return comparison;
        });
    }

    /**
     * This function adds the pressing phases to the resultList and to the highlightList.
     * It visualizes the starting point of each pressing phase on the canvas.
     * It calls the addItemListToTimeline() function for the visualization of the results in the timeline
     */
    public static addPressingPhases() {
        let counter = ResultList.countElements() + 1 + this.transition_phases.length;
        for (let i of Phases.pressing_phases) {
            let id = "UID:" + counter;
            let venue = i.venue;
            let ec = new EventChain([], i.start_time, i.video_time, counter, i.matchId);
            let em = new EventMarker(i.coords, id, i.time, i.start_time, ec);
            if (venue == "Home") {
                EventMarker.changeMarkerColor([em], 5);
            }
            else {
                EventMarker.changeMarkerColor([em],6);
            }

            ec.addEventMarker(em);

            let result = new Result(counter, i.start_time, i.video_time, i.coords[0], i.coords[1], "pressingPhase", [], ec);
            ResultList.addResult(result);
            Timeline.addHighlight(i.start_time, i.end_time, i.teamId, i.info, i.style, 2, result);
            counter ++;
        }
        Timeline.addItemListToTimeline();
    }

    /**
     * This function adds the transition phases to the resultList and to the highlightList.
     * It visualizes the starting point of each transition phase on the canvas.
     * It calls the addItemListToTimeline() function for the visualization of the results in the timeline
     */
    public static addTransitionPhases() {
        let counter = ResultList.countElements() + 1 + this.pressing_phases.length;
        for (let i of Phases.transition_phases) {
            let id = "UID:" + counter;
            let ec = new EventChain([], i.start_time, i.video_time, counter, i.matchId);
            let em = new EventMarker(i.coords, id, i.time, i.start_time, ec);
            ec.addEventMarker(em);

            let result = new Result(counter, i.start_time, i.video_time, i.coords[0], i.coords[1], "transitionPhase", [], ec);
            ResultList.addResult(result);
            Timeline.addHighlight(i.start_time, i.end_time, i.teamId, i.info, i.style, 3, result);
            counter++;
        }
        Timeline.addItemListToTimeline();
    }

    /**
     * Getter function for the phases ID.
     * @returns {number}
     */
    public getID() {
        return this.phase_id;
    }

    /**
     * Getter function for the element ID of the result list.
     * @returns {string}
     */
    public getElemID() {
        return this.elem_id;
    }
}
