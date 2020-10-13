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
var FilterArea = /** @class */ (function () {
    function FilterArea() {
        FilterArea.hoverFilter = false;
        FilterArea.eventFilter = $("#event_filter");
        FilterArea.teamFilter = $("#team_filter");
        FilterArea.playerFilter = $("#player_filter");
        FilterArea.periodFilter = $("#period_filter");
        FilterArea.expandFilter = $("#expand_filter");
        FilterArea.matchFilter = $("#match_filter");
        FilterArea.motionpathFilter = $("#motionpath_filter");
        FilterArea.saveFilter = $("#saveQuery_btn");
        FilterArea.adjustLabelSizes();
        FilterArea.$expanddropdown = $('.expanddropdown');
        FilterArea.matchIDVideoPaths = {};
        FilterArea.multipleAttribute = $('.playerfilter').attr('multiple');
        var sport = window.location.search.substr(1).split('=')[1];
        DBConnection.getFilter("/getEventTypes?sportFilter=" + sport);
        DBConnection.getFilter("/getTeams?sportFilter=" + sport);
        DBConnection.getFilter("/getPlayers?sportFilter=" + sport);
        DBConnection.getFilter("/getMatches?sportFilter=" + sport);
        DBConnection.getFilter("/getQueries?sportFilter=" + sport);
        // filters have to log if the user clicked to see the menu in order to determine if the filter has been changed manually by the user
        // if not the filter has been changed by clicking a drawing object on the drawing area and therefore the nextQuery function does not have to be called.
        FilterArea.eventFilter.on('show.bs.select', function (e) {
            FilterArea.hoverFilter = true;
        });
        FilterArea.teamFilter.on('show.bs.select', function (e) {
            FilterArea.hoverFilter = true;
        });
        FilterArea.playerFilter.on('show.bs.select', function (e) {
            FilterArea.hoverFilter = true;
        });
        FilterArea.periodFilter.on('show.bs.select', function (e) {
            FilterArea.hoverFilter = true;
        });
        FilterArea.eventFilter.on('hide.bs.select', function (e) {
            FilterArea.hoverFilter = false;
        });
        FilterArea.teamFilter.on('hide.bs.select', function (e) {
            FilterArea.hoverFilter = false;
        });
        FilterArea.playerFilter.on('hide.bs.select', function (e) {
            FilterArea.hoverFilter = false;
        });
        FilterArea.periodFilter.on('hide.bs.select', function (e) {
            FilterArea.hoverFilter = false;
        });
        FilterArea.eventFilter.on('changed.bs.select', function (e) {
            FilterArea.updateObjectFilter();
        });
        FilterArea.teamFilter.on('changed.bs.select', function (e) {
            FilterArea.updateObjectFilter();
        });
        FilterArea.playerFilter.on('changed.bs.select', function (e) {
            FilterArea.updateObjectFilter();
        });
        FilterArea.periodFilter.on('changed.bs.select', function (e) {
            FilterArea.updateObjectFilter();
        });
        FilterArea.matchFilter.on('changed.bs.select', function (e) {
            FilterArea.matchFilterChanged();
        });
        /*
        $('#matchfilter').on('changed.bs.select', function () {
            let val = $(this).val();
            //DrawingArea.changeSport(val);
            DrawingArea.clearSolutions();
            DBConnection.nextQuery();
        });*/
        $('.motionpathfilter').on('changed.bs.select', function () {
            if (DrawingArea.active_objects.length != 0) {
                //DrawingArea.clearSolutions();
                DBConnection.nextQuery();
            }
        });
    }
    FilterArea.getMPFilter = function () {
        var ret = FilterArea.motionpathFilter.val();
        if (ret === "PLAYER") {
            ret = FilterArea.getPlayerFilters();
        }
        else {
            ret = "filter0:" + ret;
        }
        return ret;
    };
    /**
     * This function updates the filters of a selected object (if nothing is selected, nothing happens)
     */
    FilterArea.updateObjectFilter = function () {
        if (DrawingArea.selected_object != null) {
            DrawingArea.selected_object.updateFilters([FilterArea.getEventFilters(), FilterArea.getTeamFilters(),
                FilterArea.getPlayerFilters(), FilterArea.getPeriodFilters()], FilterArea.getFiltersRaw());
            if (FilterArea.hoverFilter) {
                DrawingArea.clearSolutions();
                DBConnection.nextQuery();
            }
        }
    };
    /**
     * This function gets all filter types over the DBconnection class
     * @param json
     * @param method
     */
    FilterArea.fill = function (json, method) {
        var sport = window.location.search.substr(1).split('=')[1];
        if (method == "/getEventTypes?sportFilter=" + sport) {
            FilterArea.eventFilter.empty();
            FilterArea.expandFilter.empty();
            for (var _i = 0, _a = json.eventType; _i < _a.length; _i++) {
                var text = _a[_i];
                var optiontext = text;
                FilterArea.eventFilter.append(new Option(optiontext));
                FilterArea.expandFilter.append(new Option(optiontext));
            }
            FilterArea.eventFilter.selectpicker('refresh');
            FilterArea.expandFilter.selectpicker('refresh');
        }
        else if (method == "/getTeams?sportFilter=" + sport) {
            FilterArea.teamFilter.empty();
            for (var i in json.result) {
                var optiontext = json.result[i].name + " [ID:" + json.result[i].tid + "]";
                FilterArea.teamFilter.append(new Option(optiontext));
            }
            FilterArea.teamFilter.selectpicker('refresh');
        }
        else if (method == "/getPlayers?sportFilter=" + sport) {
            FilterArea.playerFilter.empty();
            for (var i in json.result) {
                var optiontext = json.result[i].name + " [ID:" + json.result[i].pid + "]";
                FilterArea.playerFilter.append(new Option(optiontext));
            }
            FilterArea.playerFilter.selectpicker('refresh');
        }
        else if (method == "/getMatches?sportFilter=" + sport) {
            for (var i in json) {
                var matchInfo = json[i][0];
                var optiontext = "Match ID: " + matchInfo.matchId[0];
                FilterArea.matchFilter.append(new Option(optiontext));
                // save video path of each matchId
                FilterArea.matchIDVideoPaths[matchInfo.matchId] = matchInfo.videoPath;
            }
            FilterArea.matchFilter.selectpicker('refresh');
            var option = "";
            switch (sport) {
                case "football":
                    option = "First Half";
                    FilterArea.periodFilter.append(new Option(option));
                    option = "Second Half";
                    FilterArea.periodFilter.append(new Option(option));
                    break;
                case "icehockey":
                    option = "First Period";
                    FilterArea.periodFilter.append(new Option(option));
                    option = "Second Period";
                    FilterArea.periodFilter.append(new Option(option));
                    option = "Third Period";
                    FilterArea.periodFilter.append(new Option(option));
                    break;
            }
            FilterArea.periodFilter.selectpicker('refresh');
        }
    };
    /**
     * This function returns the selected event filter/filters.
     * @returns {any}
     */
    FilterArea.getEventFilters = function () {
        var title = document.getElementById("eventfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Select Event") {
            var res = '';
            var events = title.split(", ");
            for (var i in events) {
                res += '"' + i + '":"' + events[i] + '",';
            }
            return res.substring(0, res.length - 1);
        }
        else {
            return "";
        }
    };
    /**
     * This function returns the selected expanding filter/filters.
     * @returns {any}
     */
    FilterArea.getExpandFilters = function () {
        var title = document.getElementById("expandfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Select Expand Filter") {
            var res = '';
            var events = title.split(", ");
            for (var i in events) {
                res += '"' + i + '":"' + events[i] + '",';
            }
            return res.substring(0, res.length - 1);
        }
        else {
            return "";
        }
    };
    /**
     * This function returns the selected team filter/filters.
     * @returns {any}
     */
    FilterArea.getTeamFilters = function () {
        var title = document.getElementById("teamfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Select Team") {
            var res = '';
            var teams = title.split(", ");
            for (var i in teams) {
                var tid = teams[i].match(/\[(.*?)\]/)[1].split(":")[1];
                res += '"filter' + i + '":' + tid + ',';
            }
            return res.substring(0, res.length - 1);
        }
        else {
            return "";
        }
    };
    /**
     * This function returns the selected player filter/filters.
     * @returns {any}
     */
    FilterArea.getPlayerFilters = function () {
        var title = document.getElementById("playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        var res = "";
        if (title != "Select Player") {
            var list = title.split(", ");
            for (var i in list) {
                var id = list[i].match(/\[(.*?)\]/)[1].split(":")[1];
                res += "filter" + i + ":" + id + ",";
            }
            return res.substring(0, res.length - 1);
        }
        else {
            return "";
        }
    };
    /**
     * This function returns the selected period filter/filters.
     * @returns {any}
     */
    FilterArea.getPeriodFilters = function () {
        var title = document.getElementById("periodfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Select Period") {
            var res = "";
            var events = title.split(", ");
            for (var i in events) {
                var num = parseInt(i);
                res += '"filter' + num + '":' + events[i].substring(0, 1) + ',';
            }
            return res.substring(0, res.length - 1);
        }
        else {
            return "";
        }
    };
    /**
     * This function returns the selected match filter/filters.
     * @returns {any}
     */
    FilterArea.getMatchFilters = function () {
        var title = document.getElementById("matchfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        var res = "";
        if (title != "Select Match") {
            var list = title.split(", ");
            for (var i in list) {
                var id = list[i].split(": ")[1];
                res += '"match' + i + '":"' + id + '",';
            }
            return res.substring(0, res.length - 1);
        }
        else {
            return "";
        }
    };
    /**
     * This function activates the Button to save the filter when a query has responded successfully
     */
    FilterArea.activateSaveFilterBtn = function () {
        FilterArea.saveFilter.prop('disabled', false);
    };
    FilterArea.deactivateSaveFilterBtn = function () {
        FilterArea.saveFilter.prop('disabled', true);
    };
    FilterArea.getShiftFilters = function () {
        var event = "shiftEvent";
        var team = FilterArea.teamFilter.selectpicker('var');
        var match = FilterArea.matchFilter.selectpicker('var');
        var period = FilterArea.periodFilter.selectpicker('var');
        return [event, team, match, period];
    };
    /**
     * This function returns the content of the filter selection boxes (without any further processing)
     * @returns {[string,string,string,string]}
     */
    FilterArea.getFiltersRaw = function () {
        var event = FilterArea.eventFilter.selectpicker('val');
        var team = FilterArea.teamFilter.selectpicker('val');
        var player = FilterArea.playerFilter.selectpicker('val');
        var period = FilterArea.periodFilter.selectpicker('val');
        var match = FilterArea.matchFilter.selectpicker('val');
        return [event, team, player, period, match];
    };
    /**
     * This function deactivates the whole filter area, if motion path
     */
    FilterArea.deactivateFilterArea = function () {
        FilterArea.eventFilter.prop('disabled', true);
        FilterArea.teamFilter.prop('disabled', true);
        FilterArea.periodFilter.prop('disabled', true);
        // this is needed to check if the player filter should be deactivated for the active motion path button setting
        if (!($('#motionpath_filter').val() === "PLAYER") && !$('.playerfilter').is("disabled")) {
            FilterArea.playerFilter.prop('disabled', true);
        }
        FilterArea.eventFilter.selectpicker('deselectAll');
        FilterArea.teamFilter.selectpicker('deselectAll');
        FilterArea.playerFilter.selectpicker('deselectAll');
        FilterArea.periodFilter.selectpicker('deselectAll');
        FilterArea.eventFilter.selectpicker('refresh');
        FilterArea.teamFilter.selectpicker('refresh');
        FilterArea.playerFilter.selectpicker('refresh');
        FilterArea.periodFilter.selectpicker('refresh');
    };
    /**
     * This function activates the complete filter area
     */
    FilterArea.activateFilterArea = function () {
        FilterArea.eventFilter.prop('disabled', false);
        FilterArea.teamFilter.prop('disabled', false);
        FilterArea.periodFilter.prop('disabled', false);
        FilterArea.playerFilter.prop('disabled', false);
        FilterArea.eventFilter.selectpicker('refresh');
        FilterArea.teamFilter.selectpicker('refresh');
        FilterArea.periodFilter.selectpicker('refresh');
        FilterArea.playerFilter.selectpicker('refresh');
    };
    /**
     * This function resets the selected filters
     */
    FilterArea.resetFilters = function () {
        FilterArea.eventFilter.selectpicker('deselectAll');
        FilterArea.teamFilter.selectpicker('deselectAll');
        FilterArea.playerFilter.selectpicker('deselectAll');
        FilterArea.periodFilter.selectpicker('deselectAll');
        FilterArea.matchFilter.selectpicker('deselectAll');
    };
    /**
     * This function resets the selected expanding filters
     */
    FilterArea.resetExpandFilter = function () {
        FilterArea.$expanddropdown.selectpicker('deselectAll');
    };
    /**
     * This functions sets the filters of an earlier selected object
     * @param raw
     */
    FilterArea.setObjectFilters = function (object) {
        var raw = object.getFiltersRaw();
        FilterArea.eventFilter.selectpicker('val', raw[0]);
        FilterArea.teamFilter.selectpicker('val', raw[1]);
        FilterArea.playerFilter.selectpicker('val', raw[2]);
        FilterArea.periodFilter.selectpicker('val', raw[3]);
    };
    FilterArea.activateMPSettings = function () {
        FilterArea.motionpathSettings.show();
    };
    FilterArea.deactivateMPSettings = function () {
        FilterArea.motionpathSettings.hide();
    };
    FilterArea.activatePlayerFilter = function () {
        FilterArea.playerFilter.prop('disabled', false);
        FilterArea.playerFilter.selectpicker('refresh');
    };
    FilterArea.deactivatePlayerFilter = function () {
        FilterArea.playerFilter.selectpicker('deselectAll');
        FilterArea.playerFilter.prop('disabled', true);
        FilterArea.playerFilter.selectpicker('refresh');
    };
    FilterArea.playerfilterSelectionDone = function () {
        if (FilterArea.playerFilter.selectpicker('val').length === 0) {
            return false;
        }
        else {
            return true;
        }
    };
    FilterArea.getVideoPath = function (key) {
        // only Match ID is the key, delete string and space
        var splitted = key.split(":", 2);
        var splitted_id = splitted[1].split(" ");
        var id = splitted_id[1];
        return FilterArea.matchIDVideoPaths[id];
    };
    FilterArea.playerfilterMultiSelect = function () {
        var title = document.getElementById("playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title.indexOf(",") >= 0) {
            return true;
        }
        return false;
    };
    FilterArea.adjustLabelSizes = function () {
        var width = $("#expand_label").width();
        $(".filter-label").width(width);
    };
    /**
     * This function is called after the matchFilter has changed.
     */
    FilterArea.matchFilterChanged = function () {
        var title = document.getElementById("matchfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Select Match" && title.split(',').length == 1) { // if a selection has been made && if the user selected one item
            Timeline.switchMatchMode(true);
            videoarea.changeVideo(title);
            DBConnection.getTeamSettings();
            this.updateFiltersAfterMatchChange();
        }
        else {
            Timeline.resetHighlightlist();
            Graph2d.clearItemList();
            Network.clearNodesAndEdges();
            this.reloadFilters();
            DBConnection.resetTeamSettings();
        }
    };
    FilterArea.updateFiltersAfterMatchChange = function () {
        DBConnection.getFilter("/getTeamUpdate");
        DBConnection.getFilter("/getPlayerUpdate");
    };
    FilterArea.reloadFilters = function () {
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        DBConnection.getFilter("/getTeams?sportFilter=" + sport);
        DBConnection.getFilter("/getPlayers?sportFilter=" + sport);
    };
    return FilterArea;
}());
