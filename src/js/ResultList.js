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
var ResultList = /** @class */ (function () {
    function ResultList() {
    }
    ResultList.addResult = function (result) {
        ResultList.resultList.push(result);
    };
    ResultList.getResult = function (num) {
        if (num < ResultList.resultList.length) {
            return ResultList.resultList[num];
        }
        else {
            console.error("ERROR: THIS RESULT DOES NOT EXIST!");
            return null;
        }
    };
    ResultList.clearResultList = function () {
        ResultList.resultList = [];
        Timeline.resetTimeline();
    };
    ResultList.removeResultsFromResultList = function (start) {
        ResultList.resultList.slice(start);
        Timeline.resetTimeline();
    };
    ResultList.countElements = function () {
        return ResultList.resultList.length;
    };
    ResultList.fillTimeline = function (highlightList) {
        Timeline.resetTimeline();
        for (var _i = 0, _a = ResultList.resultList; _i < _a.length; _i++) {
            var res = _a[_i];
            Timeline.addItem(res, highlightList);
        }
        Timeline.addItemListToTimeline();
    };
    ResultList.deactivateResultList = function () {
        if (EventChain.active_chain != null) {
            EventChain.active_chain.deactivateActive();
            EventChain.active_chain = null;
        }
        for (var _i = 0, _a = ResultList.resultList; _i < _a.length; _i++) {
            var res = _a[_i];
            if (Timeline.zoomingLevel > CONFIG.ZOOMINGFILTER_LEVEL_1.min_view) {
                if (!(CONFIG.ZOOMINGFILTER_LEVEL_1.events.indexOf(res.getEventType()) > -1)) {
                    res.deactivateResult();
                }
                else {
                    res.activateResult();
                }
            }
            else if (Timeline.zoomingLevel < CONFIG.ZOOMINGFILTER_LEVEL_2.max_view && Timeline.zoomingLevel > CONFIG.ZOOMINGFILTER_LEVEL_2.min_view) {
                if (!(CONFIG.ZOOMINGFILTER_LEVEL_2.events.indexOf(res.getEventType()) > -1)) {
                    res.deactivateResult();
                }
                else {
                    res.activateResult();
                }
            }
            else if (Timeline.zoomingLevel < CONFIG.ZOOMINGFILTER_LEVEL_3.max_view) {
                if (!(CONFIG.ZOOMINGFILTER_LEVEL_3.events.indexOf(res.getEventType()) > -1)) {
                    res.deactivateResult();
                }
                else {
                    res.activateResult();
                }
            }
        }
    };
    ResultList.resultList = [];
    return ResultList;
}());
