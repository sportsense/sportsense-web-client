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
var Result = /** @class */ (function () {
    function Result(id, t, vt, x, y, type, players, e) {
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
    Result.prototype.getTime = function () {
        return this.time;
    };
    Result.prototype.getVideoTime = function () {
        return this.videoTime;
    };
    Result.prototype.getStartPosition = function () {
        return [this.startXPos, this.startYPos];
    };
    Result.prototype.getEndPosition = function () {
        return [this.endXPos, this.endYPos];
    };
    Result.prototype.getEventType = function () {
        return this.eventType;
    };
    Result.prototype.getPlayerIds = function () {
        return this.playerIds;
    };
    Result.prototype.setActive = function () {
        console.log("setActive");
        if (!this.deactivated) {
            if (this.element instanceof EventChain) {
                this.element.changeActiveChain();
            }
            else {
                this.element.changeActiveLine();
            }
            //console.log("matchID:" + this.element.matchId);
            //console.log("videotime:" + this.element.video_time);
            videoarea.setVideoTime(this.element.video_time, this.element.matchId);
        }
    };
    Result.prototype.hover = function () {
        if (!this.deactivated) {
            if (this.element != EventChain.active_chain && this.element != MultiPathLine.active_line) {
                if (this.element instanceof EventChain) {
                    this.element.setChainColor(3);
                }
                else {
                    this.element.changeColor(3);
                }
            }
        }
    };
    Result.prototype.stopHover = function () {
        if (!this.deactivated) {
            if (this.element != EventChain.active_chain && this.element != MultiPathLine.active_line) {
                if (this.element instanceof EventChain) {
                    this.element.setChainColor(1);
                }
                else {
                    this.element.changeColor(1);
                }
            }
        }
    };
    Result.prototype.deactivateResult = function () {
        if (this.element instanceof EventChain) {
            this.element.setChainColor(4);
        }
        else {
            this.element.changeColor(4);
        }
        this.deactivated = true;
    };
    Result.prototype.activateResult = function () {
        if (this.element instanceof EventChain) {
            this.element.setChainColor(1, true);
        }
        else {
            this.element.changeColor(1, true);
        }
        this.deactivated = false;
    };
    return Result;
}());
