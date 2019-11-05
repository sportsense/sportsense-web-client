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
 * abstract class of a drawing object
 * so the drawing object could easily be extended
 */

abstract class DrawingObject {

    public type: string;
    private filters_raw: string[];
    private filters: string[];

    constructor(type: string) {
        this.type = type;
        this.filters_raw = [];
        this.filters = [FilterArea.getEventFilters(), FilterArea.getTeamFilters(), FilterArea.getPlayerFilters(), FilterArea.getPeriodFilters()];
    }

    abstract setObjectNum(x): void;

    abstract disableSelection(): void;

    abstract enableSelection(): void;

    abstract resize(pointer, origX, origY): void;

    abstract getSelection(): any;

    abstract contained(x, y): boolean;

    abstract remove(): void;

    /**
     * This function returns the filter part of the final query
     * @returns {string}
     */
    public getFilterQuery(): string {
        let sportfilter: string = window.location.search.substr(1).split('=')[1];
        let res: string = '&eventFilters={' + this.filters[0] + "}";
        res += '&teamFilters={' + this.filters[1] + "}";
        res += '&playerFilters={' + this.filters[2] + "}";
        res += '&periodFilters={' + this.filters[3] + "}";
        res += '&timeFilter={' + Timeline.getTimeFilter() + '}';
        res += '&sportFilter={' + "'sport':" + sportfilter + "}";
        return res;
    }

    public getFiltersRaw(): string[] {
        return this.filters_raw;
    }

    public setFiltersRaw(raw: string[]): void {
        this.filters_raw = raw;
    }

    public updateFilters(u: string[], r: string[]): void {
        this.filters = u;
        this.filters_raw = r;
    }

    public static didMouseMoveEnough(lastCoords, newCoords): boolean {
        let s = Math.pow(lastCoords[0] - newCoords[0], 2) + Math.pow(lastCoords[1] - newCoords[1], 2);
        return (s > 4.0); // distance is two, but we spare cpu power by not taking the square root
    }

    public manipulateMotionPathFilter(): void{
        this.filters = ["", "", FilterArea.getMPFilter(), ""];
    }
}
