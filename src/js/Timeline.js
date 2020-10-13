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
var Timeline = /** @class */ (function () {
    function Timeline() {
        Timeline.container = document.getElementById('visualization');
        Timeline.itemList = [];
        Timeline.highlightList = [];
        Timeline.filterActive = false;
        Timeline.zoomingfilterActive = false;
        Timeline.items = new vis.DataSet(Timeline.itemList);
        Timeline.idCounter = 1;
        Timeline.highlightCounter = 1;
        Timeline.multiMatchSetting = new vis.DataSet([
            { id: 1, content: 'Events' }
        ]);
        Timeline.singleMatchSetting = new vis.DataSet([
            { id: 1, content: 'Events' },
            { id: 2, content: 'Pressing' },
            { id: 3, content: 'Transition' }
        ]);
        switch (window.location.search.substr(1).split('=')[1]) {
            case "football": {
                Timeline.tempMax = '2020-1-1 01:35:00';
                Timeline.tempEnd = '2020-1-1 01:35:00';
                break;
            }
            case "icehockey": {
                Timeline.tempMax = '2020-1-1 01:05:00';
                Timeline.tempEnd = '2020-1-1 01:05:00';
                break;
            }
        }
        // Configuration for the Timeline
        Timeline.options = {
            stack: false,
            height: $('.thirdrow').height(),
            width: $('.thirdrow').width(),
            min: '2020-1-1 00:00:00',
            max: Timeline.tempMax,
            start: '2020-1-1 00:00:00',
            end: Timeline.tempEnd,
            zoomMax: 1000 * 60 * 60 * 24 * 31 * 12 * 5,
            zoomMin: 18000,
            format: {
                minorLabels: function (date, scale, step) {
                    var time = date.format("HH:mm");
                    var secs = date.format("ss");
                    return moment.duration(time).asMinutes() + ":" + secs;
                },
                majorLabels: function (date, scale, step) { return ""; }
            },
            orientation: 'top',
            //timeAxis: {scale: 'minute', step: 5},
            selectable: false
        };
        // Create the Timeline
        Timeline.timeline = new vis.Timeline(Timeline.container, Timeline.items, Timeline.options);
        Timeline.timeline.setGroups(Timeline.multiMatchSetting);
        // Allows for customization of pressure calculation which is visualized in Timeline
        // context menu (right click menu)
        // this menu object defines the whole context menu
        var menu = [{
                name: 'Customize',
                title: 'customize button',
                disable: false,
                fun: function () {
                    // MODAL Pop-up
                    $('#customizePressingModal').modal('show');
                }
            }];
        // this replaces the defined menu with the standard context menu
        $('#pressingAnalysisBtn').contextMenu(menu, {
            triggerOn: 'contextmenu',
            closeOnClick: true,
            winEventClose: true
        });
    }
    Timeline.resizeTimeline = function () {
        Timeline.itemList = [];
        // this makes sure that highlights do not get deleted
        // highlights only get resetted/replaced by the switchMatchMode-function
        var itemsCombined = Timeline.itemList.concat(Timeline.highlightList);
        Timeline.items = new vis.DataSet(itemsCombined);
        Timeline.idCounter = 1;
        Timeline.highlightCounter = 1;
        Timeline.options.width = $('.thirdrow').width();
        Timeline.options.height = $('.thirdrow').height();
        $('#visualization').empty();
        $('#timeline_filter_switch').prop("checked", false);
        Timeline.timeline = new vis.Timeline(Timeline.container, Timeline.items, Timeline.options);
        Timeline.timeline.setGroups(Timeline.multiMatchSetting);
        Timeline.timeline.on('rangechanged', function (properties) {
            var seconds = (properties.end.getTime() - properties.start.getTime()) / 1000;
            Timeline.zoomingLevel = seconds / 54;
            if (Timeline.zoomingfilterActive) {
                ResultList.deactivateResultList();
            }
        });
    };
    /**
     * This function updates the timeline and sets event listeners for a synchronized behaviour with the Graph2d
     */
    Timeline.updateTimelineAfter2d = function () {
        Timeline.options.width = $('.thirdrow').width();
        Timeline.options.height = $('.thirdrow').height();
        $('#visualization').empty();
        $('#timeline_filter_switch').prop("checked", false);
        Timeline.timeline = new vis.Timeline(Timeline.container, Timeline.items, Timeline.options);
        Timeline.timeline.setGroups(Timeline.singleMatchSetting);
        Timeline.reactivateEventlisteners();
        // activate more eventlisteners to have a synchronized behaviour for the graph2d and the timeline graphs
        Timeline.timeline.on('rangechanged', function (properties) {
            var seconds = (properties.end.getTime() - properties.start.getTime()) / 1000;
            Timeline.zoomingLevel = seconds / 54;
            if (Timeline.zoomingfilterActive) {
                ResultList.deactivateResultList();
            }
            onrangechange2();
        });
        Timeline.timeline.on('rangechange', function (properties) {
            onrangechange2();
        });
        Graph2d.graph2d.on('rangechange', function (properties) {
            onrangechange1();
        });
        Graph2d.graph2d.on('rangechanged', function (properties) {
            onrangechange1();
        });
        function onrangechange1() {
            var range = Graph2d.graph2d.getWindow();
            Timeline.timeline.setWindow(range.start, range.end, { animation: false });
        }
        function onrangechange2() {
            var range = Timeline.timeline.getWindow();
            Graph2d.graph2d.setWindow(range.start, range.end, { animation: false });
        }
    };
    /**
     * This function resets the timeline to the status before the Graph2d was activated and resets the event listeners
     */
    Timeline.resetTimelineAfter2d = function () {
        document.getElementById('timeline').setAttribute("style", "height: 25%");
        Timeline.options.width = $('.thirdrow').width();
        Timeline.options.height = $('.thirdrow').height();
        $('#visualization').empty();
        $('#timeline_filter_switch').prop("checked", false);
        Timeline.timeline = new vis.Timeline(Timeline.container, Timeline.items, Timeline.options);
        Timeline.timeline.setGroups(Timeline.singleMatchSetting);
        Timeline.reactivateEventlisteners();
        Timeline.timeline.on('rangechanged', function (properties) {
            var seconds = (properties.end.getTime() - properties.start.getTime()) / 1000;
            Timeline.zoomingLevel = seconds / 54;
            if (Timeline.zoomingfilterActive) {
                ResultList.deactivateResultList();
            }
        });
        Timeline.timeline.off('rangechange', function (properties) {
        });
        Graph2d.graph2d.off('rangechange', function (properties) {
        });
        Graph2d.graph2d.off('rangechanged', function (properties) {
        });
    };
    /**
     * This function reactivates the event listeners for the timeline after the graph2d is activated or deactivated
     */
    Timeline.reactivateEventlisteners = function () {
        // click jump directly to videoscene
        Timeline.timeline.on('click', function (properties) {
            if (properties.group == 1) {
                Timeline.itemList[parseInt(properties.item) - 1].result_obj.setActive();
            }
            else if (properties.group == 2) {
                Timeline.highlightList[parseInt(properties.item) - Timeline.itemList.length - 1].result_obj.setActive();
            }
            else if (properties.group == 3) {
                Timeline.highlightList[parseInt(properties.item) - Timeline.itemList.length - 1].result_obj.setActive();
            }
        });
        // hover for Events (group 1)
        Timeline.timeline.on('itemover', function (properties) {
            if (properties.item <= Timeline.itemList.length) {
                var id = parseInt(properties.item) - 1;
                Timeline.itemList[id].result_obj.hover();
            } // and for transition phases (group 3)
            else {
                try {
                    Timeline.highlightList[parseInt(properties.item) - 1].result_obj.hover();
                }
                catch (_a) {
                    // console.log("Pressing (group 2) needs no hovering!");
                }
            }
        });
        // stop hover for Events (group 1)
        Timeline.timeline.on('itemout', function (properties) {
            if (properties.item <= Timeline.itemList.length) {
                Timeline.itemList[parseInt(properties.item) - 1].result_obj.stopHover();
                Timeline.stopHover(properties.item);
            } // and for transition phases (group 3)
            else {
                try {
                    Timeline.highlightList[parseInt(properties.item) - Timeline.itemList.length - 1].result_obj.stopHover();
                    Timeline.stopHover(properties.item);
                }
                catch (_a) {
                    // console.log("Pressing (group 2) needs no stop hovering!");
                }
            }
        });
    };
    /**
     * This function adds new items to the itemList
     * Normally the itemList will be resetted, then all the results will be added
     * via this method to the itemList, then the addItemListToTimeline method gets called
     * in order to generate the final vis.js items object and to draw the items on the timeline.
     */
    Timeline.addItem = function (result, highlight) {
        var times = Timeline.convertTime(result.getTime());
        var evType = result.getEventType();
        var title_html = "Exact Time: ";
        var abovesixtymins = 60;
        // to show up time in minutes above 59
        if (times[0] === "01") {
            abovesixtymins = abovesixtymins + parseInt(times[1]);
            title_html = "Event type: " + evType + "<br>" + "Exact time " + abovesixtymins + "min " + times[2] + "sec";
        }
        else {
            title_html = "Event type: " + evType + "<br>" + "Exact time " + times[1] + "min " + times[2] + "sec";
        }
        var newItem;
        if (highlight) {
            newItem = { id: Timeline.idCounter, group: 1, start: times[3], className: "highlight-item timeline_id" + Timeline.idCounter, content: '<img src="./imgs/' + evType + '.png" height="35px" width="35px">', title: title_html, result_obj: result };
        }
        else {
            newItem = { id: Timeline.idCounter, group: 1, start: times[3], className: "timeline_id" + Timeline.idCounter, type: 'point', title: title_html, result_obj: result };
        }
        Timeline.itemList.push(newItem);
        Timeline.idCounter++;
    };
    /**
     * This function adds new highlight items to the highlightList
     */
    Timeline.addHighlight = function (startTs, endTs, boxname, text, teamstyle, groupId, result) {
        var start = Timeline.convertTime(startTs);
        var end = Timeline.convertTime(endTs);
        var title_html = text;
        var style = teamstyle;
        var id_counter = Timeline.idCounter;
        var newItem = { id: id_counter + Timeline.highlightCounter - 1, group: groupId, start: start[3], end: end[3], className: "phases_id" + (id_counter + Timeline.highlightCounter - 1), content: boxname, title: title_html, result_obj: result, editable: false, style: style };
        Timeline.highlightList.push(newItem);
        Timeline.highlightCounter++;
    };
    Timeline.convertTime = function (time) {
        var times = time.split(":");
        var mins = times[0];
        var secs = times[1];
        var i_mins = parseInt(times[0]);
        // let i_secs = parseInt(times[1]);
        // not needed -> football match time is always in minutes
        var hours = "00";
        if (i_mins > 59) {
            hours = "01";
            i_mins = i_mins - 60;
            mins = i_mins.toString();
        }
        var formated = "2020-1-1 " + hours + ":" + mins + ":" + secs;
        return [hours, mins, secs, formated];
    };
    /**
     * This function resets the whole timeline and adds all items saved in the itemList.
     */
    Timeline.addItemListToTimeline = function () {
        //console.log(this.highlightList);
        Timeline.items = new vis.DataSet(Timeline.itemList.concat(Timeline.highlightList));
        Timeline.timeline.setItems(Timeline.items);
        if (FilterArea.getMatchFilters() != "") {
            Timeline.timeline.setGroups(Timeline.singleMatchSetting);
        }
        // Listeners that trigger the setActive() and hover() methods.
        Timeline.timeline.on('click', function (properties) {
            if (properties.group == 1) {
                Timeline.itemList[parseInt(properties.item) - 1].result_obj.setActive();
            }
            else if (properties.group == 2) {
                Timeline.highlightList[parseInt(properties.item) - Timeline.itemList.length - 1].result_obj.setActive();
            }
            else if (properties.group == 3) {
                Timeline.highlightList[parseInt(properties.item) - Timeline.itemList.length - 1].result_obj.setActive();
            }
        });
        // hover for Events (group 1)
        Timeline.timeline.on('itemover', function (properties) {
            if (properties.item <= Timeline.itemList.length) {
                var id = parseInt(properties.item) - 1;
                Timeline.itemList[id].result_obj.hover();
            } // and for transition phases (group 3)
            else {
                try {
                    Timeline.highlightList[parseInt(properties.item) - 1].result_obj.hover();
                }
                catch (_a) {
                    //console.log("Pressing (group 2) needs no hovering!");
                }
            }
        });
        // stop hover for Events (group 1)
        Timeline.timeline.on('itemout', function (properties) {
            if (properties.item <= Timeline.itemList.length) {
                Timeline.itemList[parseInt(properties.item) - 1].result_obj.stopHover();
                Timeline.stopHover(properties.item);
            } // and for transition phases (group 3)
            else {
                try {
                    Timeline.highlightList[parseInt(properties.item) - Timeline.itemList.length - 1].result_obj.stopHover();
                    Timeline.stopHover(properties.item);
                }
                catch (_a) {
                    //console.log("Pressing (group 2) needs no stop hovering!");
                }
            }
        });
    };
    Timeline.resetTimeline = function () {
        Timeline.itemList = [];
        Timeline.highlightList = [];
        Timeline.items = new vis.DataSet(Timeline.itemList.concat(Timeline.highlightList));
        Timeline.timeline.setItems(Timeline.items);
        Timeline.idCounter = 1;
        Timeline.highlightCounter = 1;
    };
    Timeline.hover = function (id) {
        var id_num = parseInt(id);
        var elem = $(".timeline_id" + id_num);
        if (elem.length == 2) {
            elem = elem[1];
        }
        else {
            elem = elem[2];
        }
        if (elem != undefined) {
            if (elem.classList.contains('highlight-item')) {
                elem = elem.children[0].children[0];
                if (!elem.classList.contains('hover-highlight-item')) {
                    elem.classList.add("hover-highlight-item");
                }
            }
            else {
                if (!elem.classList.contains("vis-hover")) {
                    elem.classList.add("vis-hover");
                }
            }
        }
    };
    Timeline.stopHover = function (id) {
        var id_num = parseInt(id);
        var elem = $(".timeline_id" + id_num);
        if (elem.length != 0) {
            if (elem.length == 2) {
                elem = elem[1];
            }
            else {
                elem = elem[2];
            }
            if (elem.classList.contains('highlight-item')) {
                elem = elem.children[0].children[0];
                if (elem.classList.contains('hover-highlight-item')) {
                    elem.classList.remove("hover-highlight-item");
                }
            }
            else {
                if (elem.classList.contains("vis-hover")) {
                    elem.classList.remove("vis-hover");
                }
            }
        }
    };
    Timeline.deactivate = function (id) {
        var id_num = parseInt(id);
        var elem = $(".timeline_id" + id_num);
        if (elem.length != 0) {
            if (elem.length == 2) {
                elem = elem[1];
            }
            else {
                elem = elem[2];
            }
            if (elem.classList.contains('highlight-item')) {
                elem = elem.children[0].children[0];
                if (!elem.classList.contains('deactivated-highlight-item')) {
                    elem.classList.add("deactivated-highlight-item");
                }
            }
            else {
                if (!elem.classList.contains("vis-deactivated")) {
                    elem.classList.add("vis-deactivated");
                }
            }
        }
    };
    Timeline.activate = function (id) {
        var id_num = parseInt(id);
        var elem = $(".timeline_id" + id_num);
        if (elem.length != 0) {
            if (elem.length == 2) {
                elem = elem[1];
            }
            else {
                elem = elem[2];
            }
            if (elem.classList.contains('highlight-item')) {
                elem = elem.children[0].children[0];
                if (elem.classList.contains('deactivated-highlight-item')) {
                    elem.classList.remove("deactivated-highlight-item");
                }
            }
            else {
                if (elem.classList.contains("vis-deactivated")) {
                    elem.classList.remove("vis-deactivated");
                }
            }
        }
    };
    Timeline.setActive = function (id) {
        Timeline.timeline.setSelection(id);
    };
    Timeline.getFilterActive = function () {
        return Timeline.filterActive;
    };
    Timeline.triggerTimeFilter = function () {
        var sport = window.location.search.substr(1).split('=')[1];
        Timeline.resetTimeline();
        if (Timeline.filterActive) {
            Timeline.timeline.removeCustomTime("lSlider");
            Timeline.timeline.removeCustomTime("rSlider");
            Timeline.items = new vis.DataSet(Timeline.itemList);
            Timeline.timeline.setItems(Timeline.items);
            Timeline.filterActive = false;
        }
        else {
            // create sliders
            Timeline.timeline.addCustomTime(new Date('2020-1-1 00:00:00'), "lSlider");
            if (sport == 'football')
                Timeline.timeline.addCustomTime(new Date('2020-1-1 01:33:00'), "rSlider");
            if (sport == 'icehockey')
                Timeline.timeline.addCustomTime(new Date('2020-1-1 01:00:00'), "rSlider");
            Timeline.filterActive = true;
            Timeline.timeline.on('timechanged', function (item) {
                if (item.time < Timeline.MIN) {
                    Timeline.timeline.setCustomTime(Timeline.MIN, item.id);
                }
                if (item.time > Timeline.MAX) {
                    item.time = Timeline.MAX;
                }
                DrawingArea.clearSolutions();
                DBConnection.nextQuery();
            });
        }
        DrawingArea.clearSolutions();
        DBConnection.nextQuery();
    };
    Timeline.getTimeFilter = function () {
        if (Timeline.filterActive) {
            var t = new Date(2020, 0, 1, 0, 0, 0, 0).getTime();
            var t1 = Timeline.timeline.getCustomTime("lSlider").getTime() - t;
            var t2 = Timeline.timeline.getCustomTime("rSlider").getTime() - t;
            if (t1 < t2) {
                return '"min":"' + t1 + '","max":"' + t2 + '"';
            }
            else {
                return '"min":"' + t2 + '","max":"' + t1 + '"';
            }
        }
        else {
            return "";
        }
    };
    Timeline.switchMatchMode = function (single) {
        if (single) {
            DrawingArea.clearCanvas(true);
            Timeline.timeline.setGroups(Timeline.singleMatchSetting);
            DBConnection.getHighlights();
        }
        else {
            DrawingArea.clearCanvas();
            Timeline.timeline.setGroups(Timeline.multiMatchSetting);
        }
    };
    Timeline.triggerZoomingFilter = function () {
        if (!Timeline.zoomingfilterActive) {
            Timeline.zoomingfilterActive = true;
            ResultList.deactivateResultList();
        }
        else {
            Timeline.zoomingfilterActive = false;
            DrawingArea.clearSolutions();
            DBConnection.nextQuery();
        }
    };
    Timeline.resetHighlightlist = function () {
        this.highlightList = [];
        this.switchMatchMode(false);
    };
    Timeline.resetHighlightlistPhases = function () {
        this.highlightList = [];
        Timeline.timeline.setGroups(Timeline.singleMatchSetting);
    };
    Timeline.getItemListLength = function () {
        return this.itemList.length;
    };
    Timeline.MIN = new Date(2020, 0, 1, 0, 0, 0, 0);
    Timeline.MAX = new Date(2020, 0, 1, 1, 30, 0, 0);
    return Timeline;
}());
