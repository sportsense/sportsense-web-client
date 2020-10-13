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
var OffBallActivities = /** @class */ (function () {
    function OffBallActivities() {
        // initializing all values
        OffBallActivities.isActive = false;
        OffBallActivities.teamAIsActive = false;
        OffBallActivities.teamBIsActive = false;
        OffBallActivities.ballIsActive = false;
        OffBallActivities.polygonIsActive = false;
        OffBallActivities.currentEvent = null;
        // retrieving the gui elements from the html dom
        OffBallActivities.slider1 = document.getElementById("offball_slider1");
        OffBallActivities.slider2 = document.getElementById("offball_slider2");
        OffBallActivities.teamCheckBoxA = document.getElementById("offball_team_a_switch");
        OffBallActivities.teamCheckBoxB = document.getElementById("offball_team_b_switch");
        OffBallActivities.playerFilter = $('#offball_player_filter'); // has to be done via jquery so that the selectpicker works
        // here we set the colors of the team labels
        $('#offball_team_a_label').css('color', CONFIG.COLOR_TEAM_A_STANDARD);
        $('#offball_team_b_label').css('color', CONFIG.COLOR_TEAM_B_STANDARD);
    }
    /**
     * This method is called whenever the "Activate off-ball activities" checkbox is toggled.
     */
    OffBallActivities.triggerOffBallActivities = function () {
        OffBallActivities.isActive = !OffBallActivities.isActive;
        $('.offball-toggle').toggle(); // hides / shows the gui of the off-ball activities
        // if the off-ball activities are activated, we want it to retrieve the motion paths from the database
        if (OffBallActivities.isActive) {
            OffBallActivities.nextQuery();
        }
        else {
            OffBallActivities.clear();
        }
        OffBallActivities.updateAreaSelections();
        OffBallActivities.updatePolygonVisibility();
        // apply correct colors / grey out non-selected events
        EventChain.updateChainColors();
    };
    /**
     * This method is called whenever the "Display bounding boxes" checkbox is toggled.
     */
    OffBallActivities.triggerPolygonSelection = function () {
        OffBallActivities.polygonIsActive = !OffBallActivities.polygonIsActive;
        OffBallActivities.updatePolygonVisibility();
    };
    /**
     * This method decides whether bounding polygons should be drawn and either draws or deletes them.
     */
    OffBallActivities.updatePolygonVisibility = function () {
        if (OffBallActivities.isActive && OffBallActivities.polygonIsActive) {
            BoundingBox.drawPolygons();
        }
        else {
            BoundingBox.clearPolygons();
        }
        DrawingArea.field.renderAll();
    };
    /**
     * This method is called whenever the "Ball" checkbox is toggled.
     */
    OffBallActivities.triggerBallSelection = function () {
        OffBallActivities.ballIsActive = !OffBallActivities.ballIsActive;
        OffBallActivities.updatePlayerSelection();
        OffBallActivities.updatePolygonVisibility();
    };
    /**
     * This method is called whenever the "Team A" checkbox is toggled.
     */
    OffBallActivities.triggerTeamASelection = function () {
        OffBallActivities.teamAIsActive = !OffBallActivities.teamAIsActive;
        OffBallActivities.updatePlayerSelection();
        OffBallActivities.updatePolygonVisibility();
    };
    /**
     * This method is called whenever the "Team B" checkbox is toggled.
     */
    OffBallActivities.triggerTeamBSelection = function () {
        OffBallActivities.teamBIsActive = !OffBallActivities.teamBIsActive;
        OffBallActivities.updatePlayerSelection();
        OffBallActivities.updatePolygonVisibility();
    };
    /**
     * This method goes through all players in the player filter and decides whether the player should be selected or not
     * based on the states of the team and ball checkboxes.
     */
    OffBallActivities.updatePlayerSelection = function () {
        var selection = [];
        //console.log(matchFilter);
        for (var _i = 0, _a = this.playerOptions; _i < _a.length; _i++) {
            var playerOption = _a[_i];
            var i = playerOption.indexOf(" [ID:");
            if (i >= 0) {
                var teamChar = playerOption.substr(i + 5, 1); // extracting the team char from the id
                if (OffBallActivities.teamAIsActive && (teamChar == CONFIG.TEAM_A_CHAR)) { // this player belongs to team A
                    selection.push(playerOption);
                }
                else if (teamChar == CONFIG.TEAM_B_CHAR) { // either this player belongs to team B or it is the ball
                    if (playerOption.substr(i + 5, 4) == "BALL") { // we only take the ball into selection if ball button is active
                        if (OffBallActivities.ballIsActive) {
                            selection.push(playerOption);
                        }
                    }
                    else { // it's a player and not the ball
                        if (OffBallActivities.teamBIsActive) {
                            selection.push(playerOption);
                        }
                    }
                }
                else if (teamChar == "B") { // if we have team label C, D, etc. we have to do the extra check for the Ball here
                    if (playerOption.substr(i + 5, 4) == "BALL") { // we only take the ball into selection if ball button is active
                        if (OffBallActivities.ballIsActive) {
                            selection.push(playerOption);
                        }
                    }
                }
            }
        }
        OffBallActivities.playerFilter.selectpicker('val', selection);
        OffBallActivities.nextQuery();
    };
    /**
     * Clears the event selection in the off-ball activities and clears the motion paths from the field.
     */
    OffBallActivities.clear = function () {
        OffBallActivities.currentEvent = EventChain.active_chain;
        MultiPathLineWithArrow.clearLines();
    };
    /**
     * This method either shows or hides the area selection of the event query.
     */
    OffBallActivities.updateAreaSelections = function () {
        // do we show or hide the elements?
        var color = OffBallActivities.isActive && OffBallActivities.currentEvent != undefined ? CONFIG.COLOR_INVISIBLE : CONFIG.COLOR_SELECTION;
        for (var _i = 0, _a = DrawingArea.active_objects; _i < _a.length; _i++) {
            var object = _a[_i];
            if (object.type == "rectangle") {
                var rectangle = object;
                rectangle.rect.set('stroke', color);
            }
            else if (object.type == "circle") {
                var circle = object;
                circle.circle.set('stroke', color);
            }
            else if (object.type == "polygon") {
                var polygon = object;
                polygon.poly.set('stroke', color);
            }
        }
    };
    /**
     * Requesting updated motion paths from the database.
     */
    OffBallActivities.nextQuery = function () {
        if (OffBallActivities.isActive && OffBallActivities.currentEvent != null) {
            DBConnection.offBallMotionPath();
        }
    };
    /**
     * This method is called whenever one of the beams of the time slider is moved.
     */
    OffBallActivities.sliderChanged = function () {
        var seconds1 = OffBallActivities.slider1.value;
        var seconds2 = OffBallActivities.slider2.value;
        var secondsMin = Math.min(seconds1, seconds2);
        var secondsMax = Math.max(seconds1, seconds2);
        var secondsTextMax = Math.abs(secondsMax) == 1 ? "second" : "seconds";
        $('#offball_info').text(secondsMin + " to " + secondsMax + " " + secondsTextMax); // updating text in gui
        if (OffBallActivities.isActive) {
            OffBallActivities.nextQuery();
        }
    };
    /**
     * This method is called whenever a beam of the time slider has been moved and mouse has been released.
     */
    OffBallActivities.sliderSet = function () {
        //OffBallActivities.nextQuery();
    };
    /**
     * Fills the players from the database into the player filter area.
     * This method mirrors the method FilterArea.fill() in structure and methodology.
     */
    OffBallActivities.fill = function (json, method) {
        var sportFilter = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        //if (method == "/getPlayers?sportFilter=" + sportFilter) {
        if (method == "/getPlayers?sportFilter=" + sportFilter) {
            this.playerOptions = [];
            OffBallActivities.playerFilter.empty();
            var balloptiontext = "Ball movement [ID:BALL]";
            this.playerOptions.push(balloptiontext);
            OffBallActivities.playerFilter.append(new Option(balloptiontext));
            for (var i in json.result) {
                var optiontext = json.result[i].name + " [ID:" + json.result[i].pid + "]";
                this.playerOptions.push(optiontext);
                OffBallActivities.playerFilter.append(new Option(optiontext));
            }
            OffBallActivities.playerFilter.selectpicker('refresh');
        }
    };
    /**
     * Constructs the filters for the motion path query based on selected options.
     */
    OffBallActivities.getFilterQuery = function () {
        var sportFilter = window.location.search.substr(1).split('=')[1];
        var res = '&eventFilters={' + '' + '}';
        res += '&teamFilters={' + '' + '}';
        res += '&playerFilters={' + OffBallActivities.getPlayerFilters() + '}';
        res += '&periodFilters={' + '' + '}';
        res += '&timeFilter={' + OffBallActivities.getTimeFilter() + '}';
        res += '&sportFilter={' + "'sport':" + sportFilter + '}';
        res += '&matchIDFilter=' + OffBallActivities.getCurrentEventMatchID();
        res += '&minPathLength={"true"}';
        return res;
    };
    /**
     * This function returns the selected player filter/filters.
     * @returns the filters for all selected players or the filter for the ball, if no player is selected
     */
    OffBallActivities.getPlayerFilters = function () {
        var title = document.getElementById("offball_playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        var res = "";
        if (title != "Player filter") {
            var list = title.split(", ");
            for (var i in list) {
                var id = list[i].match(/\[(.*?)\]/)[1].split(":")[1];
                res += "filter" + i + ":" + id + ",";
            }
            return res.substring(0, res.length - 1);
        }
        else {
            // by default the ball is selected and its trajectory is visualized on the canvas
            return "filter0: BALL";
            // alternative to have no trajectory visualized on the canvas: works, but throws an error
            // return res;
        }
    };
    /**
     * This method returns the selected time interval of the time slider around the time of the selected event in milliseconds.
     */
    OffBallActivities.getTimeFilter = function () {
        var t0 = OffBallActivities.getTime(); // time of selected event
        var t1 = t0 + OffBallActivities.slider1.value * 1000;
        var t2 = t0 + OffBallActivities.slider2.value * 1000;
        if (t1 < t2) {
            return '"min":"' + t1 + '","max":"' + t2 + '"';
        }
        else {
            return '"min":"' + t2 + '","max":"' + t1 + '"';
        }
    };
    /**
     * Get the time of the selected event in milliseconds.
     */
    OffBallActivities.getTime = function () {
        var milliseconds = 0;
        if (OffBallActivities.currentEvent !== null) {
            var timeSlices = OffBallActivities.currentEvent.time.split(":");
            var mins = parseInt(timeSlices[0]);
            var secs = parseInt(timeSlices[1]);
            milliseconds = (mins * 60 + secs) * 1000;
        }
        return milliseconds;
    };
    /**
     * This method sets the selected event. It is called whenever an event is clicked.
     * @param ec selected event
     */
    OffBallActivities.registerActiveEventChain = function (ec) {
        OffBallActivities.currentEvent = ec;
        OffBallActivities.nextQuery();
        OffBallActivities.updateAreaSelections();
        // currently not needed
        /*
        if (OffBallActivities.currentEvent != undefined) {
            OffBallActivities.showEventInfo(ResultList.getResult(OffBallActivities.currentEvent.getID()));
        }*/
    };
    /**
     * This method displays some basic info about the selected event like time, type and involved players.
     * @param result
     */
    OffBallActivities.showEventInfo = function (result) {
        if (result != null) {
            var text = "";
            text += "<p>Time: " + result.getTime() + "</p>";
            text += "<p>Type: " + result.getEventType() + "</p>";
            text += "<p>Involved players: ";
            var first = true;
            for (var _i = 0, _a = result.getPlayerIds(); _i < _a.length; _i++) {
                var playerId = _a[_i];
                if (!first) {
                    text += ", ";
                } // we separate the player names with commas
                var playerTeam = playerId.substr(0, 1);
                var color = playerTeam == "A" || playerTeam == "C" ? CONFIG.COLOR_TEAM_A_STANDARD : CONFIG.COLOR_TEAM_B_STANDARD;
                text += '<span style="color: ' + color + ';">' + OffBallActivities.findPlayerName(playerId) + '</span>';
                first = false;
            }
            text += "</p>";
            $("#event_summarizer").html(text);
        }
    };
    /**
     * Get corresponding player name from player id.
     * @param id to get name for
     */
    OffBallActivities.findPlayerName = function (id) {
        for (var _i = 0, _a = OffBallActivities.playerOptions; _i < _a.length; _i++) {
            var player = _a[_i];
            var i = player.indexOf(id); // searching for occurence of player id in name string
            if (i >= 5) {
                return player.substr(0, i - 5); // player names look like this: 'Muster [ID:A1]', so we have to cut away the id part
            }
        }
        return id;
    };
    /**
     * Get the matchID of the selected event
     */
    OffBallActivities.getCurrentEventMatchID = function () {
        return this.currentEvent.matchId;
    };
    /**
     * Updates the color of the labels according to the team Colors
     */
    OffBallActivities.updateTeamLabelColors = function () {
        $('#offball_team_a_label').css('color', CONFIG.COLOR_TEAM_A_STANDARD);
        $('#offball_team_b_label').css('color', CONFIG.COLOR_TEAM_B_STANDARD);
    };
    /**
     * Updates the names of the labels according to the team Names
     */
    OffBallActivities.updateTeamLabelNames = function () {
        document.getElementById('offball_team_a_label').innerHTML = CONFIG.TEAM_A_Name;
        document.getElementById('offball_team_b_label').innerHTML = CONFIG.TEAM_B_Name;
    };
    /**
     * Resets the names of the labels
     */
    OffBallActivities.resetTeamLabelNames = function () {
        document.getElementById('offball_team_a_label').innerHTML = "Team A";
        document.getElementById('offball_team_b_label').innerHTML = "Team B";
    };
    OffBallActivities.currentEvent = undefined;
    return OffBallActivities;
}());
