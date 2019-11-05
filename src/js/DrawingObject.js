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
var DrawingObject = /** @class */ (function () {
    function DrawingObject(type) {
        this.type = type;
        this.filters_raw = [];
        this.filters = [FilterArea.getEventFilters(), FilterArea.getTeamFilters(), FilterArea.getPlayerFilters(), FilterArea.getPeriodFilters()];
    }
    /**
     * This function returns the filter part of the final query
     * @returns {string}
     */
    DrawingObject.prototype.getFilterQuery = function () {
        var sportfilter = window.location.search.substr(1).split('=')[1];
        var res = '&eventFilters={' + this.filters[0] + "}";
        res += '&teamFilters={' + this.filters[1] + "}";
        res += '&playerFilters={' + this.filters[2] + "}";
        res += '&periodFilters={' + this.filters[3] + "}";
        res += '&timeFilter={' + Timeline.getTimeFilter() + '}';
        res += '&sportFilter={' + "'sport':" + sportfilter + "}";
        return res;
    };
    DrawingObject.prototype.getFiltersRaw = function () {
        return this.filters_raw;
    };
    DrawingObject.prototype.setFiltersRaw = function (raw) {
        this.filters_raw = raw;
    };
    DrawingObject.prototype.updateFilters = function (u, r) {
        this.filters = u;
        this.filters_raw = r;
    };
    DrawingObject.didMouseMoveEnough = function (lastCoords, newCoords) {
        var s = Math.pow(lastCoords[0] - newCoords[0], 2) + Math.pow(lastCoords[1] - newCoords[1], 2);
        return (s > 4.0); // distance is two, but we spare cpu power by not taking the square root
    };
    DrawingObject.prototype.manipulateMotionPathFilter = function () {
        this.filters = ["", "", FilterArea.getMPFilter(), ""];
    };
    return DrawingObject;
}());
