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

class Result {

    private listID: string;

    // time is for displaying to the user, it's a string out of two numbers (minutes and seconds) separated by a double point.
    private time: string;
    // videoTime is stored as a number is not thought for displaying, this number can be used to call the setVideoTime function of VideoArea
    private videoTime: number;

    // Locations stored in DB-format. So it can be used directly for displaying to the user.
    private startXPos: number;
    private startYPos: number;

    private endXPos: number;
    private endYPos: number;

    // eventType can be used to display directly to the user
    private eventType: string;

    // playerIds stores the player ids of the involved players
    private playerIds: string[];

    // can be used to trigger a hover/setActive function
    // is either of type EventChain, or MultiPathLine, or MultiPathLineWithArrow
    private element: any;

    private deactivated: boolean;

    constructor(id, t: string, vt: number, x: number, y: number, type: string, players: string[], e: any) {
        this.listID = "resultlist_" + id.toString();

        this.time = t;
        this.videoTime = vt;

        this.startXPos = x;
        this.startYPos = y;

        this.endXPos = x;
        this.endYPos = y;

        this.eventType = type;

        this.playerIds = players;

        this.element = e;
        
        this.element.setElemID(this.listID);
        
        this.deactivated = false;
    }

    public getTime(): string {
        return this.time;
    }

    public getVideoTime(): number {
        return this.videoTime;
    }

    public getStartPosition(): [number, number] {
        return [this.startXPos, this.startYPos];
    }

    public getEndPosition(): [number, number] {
        return [this.endXPos, this.endYPos];
    }

    public getEventType(): string {
        return this.eventType;
    }

    public getPlayerIds(): string[] {
        return this.playerIds;
    }

    public setActive(): void {
        console.log("setActive");
        if(!this.deactivated){
            if(this.element instanceof EventChain){
                this.element.changeActiveChain();
            }else{
                this.element.changeActiveLine();
            }
            //console.log("matchID:" + this.element.matchId);
            //console.log("videotime:" + this.element.video_time);
            videoarea.setVideoTime(this.element.video_time, this.element.matchId);
        }
    }

    public hover(): void {
        if(!this.deactivated){
            if (this.element != EventChain.active_chain && this.element != MultiPathLine.active_line) {
                if(this.element instanceof EventChain){
                    this.element.setChainColor(3);
                }else{
                    this.element.changeColor(3);
                }
            }
        }
    }

    public stopHover(): void {
        if(!this.deactivated){
            if (this.element != EventChain.active_chain && this.element != MultiPathLine.active_line) {
                if(this.element instanceof EventChain){
                    this.element.setChainColor(1);
                }else{
                    this.element.changeColor(1);
                }
            }
        }
    }

    public deactivateResult(): void{
        if(this.element instanceof EventChain){
            this.element.setChainColor(4);
        }else{
            this.element.changeColor(4);
        }
        this.deactivated = true;
    }

    public activateResult(): void{
        if(this.element instanceof EventChain){
            this.element.setChainColor(1, true);
        }else{
            this.element.changeColor(1, true);
        }
        this.deactivated = false;
    }
}
