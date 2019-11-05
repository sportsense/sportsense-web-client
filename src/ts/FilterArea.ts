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

class FilterArea {

    private static eventFilter;
    private static teamFilter;
    private static playerFilter;
    private static periodFilter;
    private static expandFilter;
    private static matchFilter;
    private static motionpathFilter;
    private static $expanddropdown;
    private static motionpathSettings;
    private static matchIDVideoPaths;
    private static multipleAttribute;
    private static hoverFilter: boolean;
    private static  saveFilter;

    constructor() {
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

        // TODO: adjust the video paths
        FilterArea.matchIDVideoPaths = {
            "Match ID: 742569" : "SUI-CRO.mp4",
            "Match ID: 132772" : "NAC-AJAX.mp4",
            "Match ID: 32665" : "FCSG-Servette.mp4"
        };

        FilterArea.multipleAttribute = $('.playerfilter').attr('multiple');

        DBConnection.getFilter("/getEventTypes");
        DBConnection.getFilter("/getTeams");
        DBConnection.getFilter("/getPlayers");
        DBConnection.getFilter("/getMatches");
        DBConnection.getFilter("/getQueries");

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

    public static getMPFilter(): string {
        let ret = FilterArea.motionpathFilter.val();
        if (ret === "PLAYER") {
            ret = FilterArea.getPlayerFilters();
        } else {
            ret = "filter0:" + ret;
        }
        return ret;
    }

    /**
     * This function updates the filters of a selected object (if nothing is selected, nothing happens)
     */
    private static updateObjectFilter(): void {
        if (DrawingArea.selected_object != null) {
            DrawingArea.selected_object.updateFilters([FilterArea.getEventFilters(), FilterArea.getTeamFilters(),
                 FilterArea.getPlayerFilters(), FilterArea.getPeriodFilters()], FilterArea.getFiltersRaw());
            if(FilterArea.hoverFilter){
                DrawingArea.clearSolutions();
                DBConnection.nextQuery();
            }
        }
    }

    /**
     * This function gets all filter types over the DBconnection class
     * @param json
     * @param method
     */
    public static fill(json: any, method: string): void {
        if (method == "/getEventTypes") {
            for (let text of json.eventType) {
                let optiontext: string = text;
                FilterArea.eventFilter.append(new Option(optiontext));
                FilterArea.expandFilter.append(new Option(optiontext));
            }
            FilterArea.eventFilter.selectpicker('refresh');
            FilterArea.expandFilter.selectpicker('refresh');
        } else if (method == "/getTeams") {
            for (let i in json.result) {
                let optiontext: string = json.result[i].name + " [ID:" + json.result[i].tid + "]";
                FilterArea.teamFilter.append(new Option(optiontext));
            }
            FilterArea.teamFilter.selectpicker('refresh');
        } else if (method == "/getPlayers") {
            //SaveQuery.fillQueries(json); //just to test the saved Filter funciton
            for (let i in json.result) {
                let optiontext: string = json.result[i].name + " [ID:" + json.result[i].pid + "]";
                FilterArea.playerFilter.append(new Option(optiontext));
            }
            FilterArea.playerFilter.selectpicker('refresh');
        } else if (method == "/getMatches") {
            for (let match_string in json) {
                let match = json[match_string][0];
                if (window.location.search.substr(1).split('=')[1] === match.sport[0]) {
                    let optiontext: string = "Match ID: " + match.matchId[0];
                    FilterArea.matchFilter.append(new Option(optiontext));
                    //FilterArea.matchFilter.add(option);
                    // save video path of each matchId
                    FilterArea.matchIDVideoPaths[match.matchId[0]] = match.videoPath[0];
                }
            }
            FilterArea.matchFilter.selectpicker('refresh');
        }
    }

    /**
     * This function returns the selected event filter/filters.
     * @returns {any}
     */
    public static getEventFilters(): string {
        var title = document.getElementById("eventfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "No event filter selected") {
            var res: string = '';
            var events: string[] = title.split(", ");
            for (let i in events) {
                res += '"' + i + '":"' + events[i] + '",';
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This function returns the selected expanding filter/filters.
     * @returns {any}
     */
    public static getExpandFilters(): string {
        var title = document.getElementById("expandfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "No expand filter selected") {
            var res: string = '';
            var events: string[] = title.split(", ");
            for (let i in events) {
                res += '"' + i + '":"' + events[i] + '",';
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This function returns the selected team filter/filters.
     * @returns {any}
     */
    public static getTeamFilters(): string {
        var title = document.getElementById("teamfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "No team filter selected") {
            var res: string = '';
            var teams: string[] = title.split(", ");
            for (let i in teams) {
                var tid = teams[i].match(/\[(.*?)\]/)[1].split(":")[1];
                res += '"filter' + i + '":' + tid + ',';
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This function returns the selected player filter/filters.
     * @returns {any}
     */
    public static getPlayerFilters(): string {
        var title = document.getElementById("playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        var res = "";
        if (title != "No player filter selected") {
            var list = title.split(", ");
            for (let i in list) {
                var id = list[i].match(/\[(.*?)\]/)[1].split(":")[1];
                res += "filter" + i + ":" + id + ",";
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This function returns the selected period filter/filters.
     * @returns {any}
     */
    public static getPeriodFilters(): string {
        var title = document.getElementById("periodfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;

        if (title != "No period filter selected") {
            let res: string = "";
            var events: string[] = title.split(", ");
            for (let i in events) {
                var num: number = parseInt(i);
                res += '"filter' + num + '":' + events[i].substring(0, 1) + ',';
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This function returns the selected match filter/filters.
     * @returns {any}
     */
    public static getMatchFilters(): string {
        let title = document.getElementById("matchfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        let res = "";
        if (title != "No match filter selected") {
            let list = title.split(", ");
            for (let i in list) {
                var id = list[i].split(": ")[1];
                res += '"filter' + i + '":"' + id + '",';
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This function activates the Button to save the filter when a query has responded successfully
     */
    public static activateSaveFilterBtn(){
        FilterArea.saveFilter.prop('disabled', false);
    }

    public static deactivateSaveFilterBtn(){
        FilterArea.saveFilter.prop('disabled', true);
    }

    /**
     * This function returns the content of the filter selection boxes (without any further processing)
     * @returns {[string,string,string,string]}
     */
    public static getFiltersRaw(): string[] {
        var event = FilterArea.eventFilter.selectpicker('val');
        var team = FilterArea.teamFilter.selectpicker('val');
        var player = FilterArea.playerFilter.selectpicker('val');
        var period = FilterArea.periodFilter.selectpicker('val');
        var match = FilterArea.matchFilter.selectpicker('val');

        return [event, team, player, period, match];
    }

    /**
     * This function deactivates the whole filter area, if motion path
     */
    public static deactivateFilterArea(): void {
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
    }

    /**
     * This function activates the complete filter area
     */
    public static activateFilterArea(): void {
        FilterArea.eventFilter.prop('disabled', false);
        FilterArea.teamFilter.prop('disabled', false);
        FilterArea.periodFilter.prop('disabled', false);
        FilterArea.playerFilter.prop('disabled', false);
        
        FilterArea.eventFilter.selectpicker('refresh');
        FilterArea.teamFilter.selectpicker('refresh');
        FilterArea.periodFilter.selectpicker('refresh');
        FilterArea.playerFilter.selectpicker('refresh');
    }

    /**
     * This function resets the selected filters
     */
    public static resetFilters() {
        FilterArea.eventFilter.selectpicker('deselectAll');
        FilterArea.teamFilter.selectpicker('deselectAll');
        FilterArea.playerFilter.selectpicker('deselectAll');
        FilterArea.periodFilter.selectpicker('deselectAll');
        FilterArea.matchFilter.selectpicker('deselectAll');
    }

    /**
     * This function resets the selected expanding filters
     */
    public static resetExpandFilter() {
        FilterArea.$expanddropdown.selectpicker('deselectAll');
    }

    /**
     * This functions sets the filters of an earlier selected object
     * @param raw
     */
    public static setObjectFilters(object: DrawingObject): void {
        let raw: string[] = object.getFiltersRaw();
        FilterArea.eventFilter.selectpicker('val', raw[0]);
        FilterArea.teamFilter.selectpicker('val', raw[1]);
        FilterArea.playerFilter.selectpicker('val', raw[2]);
        FilterArea.periodFilter.selectpicker('val', raw[3]);
    }

    public static activateMPSettings(): void {
        FilterArea.motionpathSettings.show();
    }

    public static deactivateMPSettings(): void {
        FilterArea.motionpathSettings.hide();
    }

    public static activatePlayerFilter(): void {
        FilterArea.playerFilter.prop('disabled', false);
        FilterArea.playerFilter.selectpicker('refresh');
    }

    public static deactivatePlayerFilter(): void {
        FilterArea.playerFilter.selectpicker('deselectAll');
        FilterArea.playerFilter.prop('disabled', true);
        FilterArea.playerFilter.selectpicker('refresh');
    }

    public static playerfilterSelectionDone(): boolean {
        if (FilterArea.playerFilter.selectpicker('val').length === 0) {
            return false;
        } else {
            return true;
        }
    }

    public static getVideoPath(key): string {
        return FilterArea.matchIDVideoPaths[key];
    }

    public static playerfilterMultiSelect(): boolean {
        var title = document.getElementById("playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title.indexOf(",") >= 0) {
            return true;
        }
        return false;
    }

    private static adjustLabelSizes(): void {
        let width: number = $("#expand_label").width();
        $(".filter-label").width(width);
    }

    private static matchFilterChanged(): void{
        var title = document.getElementById("matchfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        //console.log(title);
        if (title != "No match filter selected" && title.split(',').length == 1) {      // if a selection has been made && if the user selected one item
            Timeline.switchMatchMode(true);
            videoarea.changeVideo(title);

        }else{
            Timeline.switchMatchMode(false);
        }
    }
}
