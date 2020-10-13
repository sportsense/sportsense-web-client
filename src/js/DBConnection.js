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
var DBConnection = /** @class */ (function () {
    function DBConnection() {
    }
    /**
     * This function checks the button state and starts the according query.
     */
    DBConnection.nextQuery = function (filterName) {
        if (filterName) {
            DBConnection.filterName = filterName;
            DBConnection.sportName = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
            //If there is a filterName given in the method call then set the filterName
        }
        var buttonState = DrawingButtons.getButtonState();
        if (buttonState[1] == 0 && buttonState[2] == 1 && !(DrawingArea.active_objects.length > 0 && (DrawingArea.active_objects[0].type == "straight_motion_path" || DrawingArea.active_objects[0].type == "freehand_motion_path"))) {
            DBConnection.shapeQuery(true, 0, false);
            DrawingButtons.deactivateActiveButton();
        }
        else if (buttonState[1] == 1 && buttonState[2] == 2) {
            DBConnection.eventCascade();
            DrawingButtons.deactivateActiveButton();
        }
        else if (buttonState[1] == 2 && buttonState[2] == 3) {
            DBConnection.reverseEventCascade();
            DrawingButtons.deactivateActiveButton();
            DrawingButtons.activateExpandButton();
        }
        else if (buttonState[2] == 4 || buttonState[2] == 5 || (DrawingArea.active_objects.length > 0 && (DrawingArea.active_objects[0].type === "straight_motion_path" || DrawingArea.active_objects[0].type === "freehand_motion_path"))) {
            DBConnection.motionPath();
            DrawingButtons.deactivateDrawing();
            DrawingButtons.standardDrawingMode();
        }
        else {
            console.error("Wrong button state.");
        }
        //FilterArea.resetFilters();
    };
    /**
     * This function sends the query as string to the proxy, after receiving the results the function fills it into the result area.
     * Methods:
     * shapeQuery: gets called when a normal query is created
     * ecQuery: Event Cascade
     * mpQuery: Motionpath query
     * highlightQuery: When use clicks on match they see the most important events as point as well as the phases in the timeline
     * /getEventTypes, /getTeams, /getPlayers, /getMatches, to fill the selections in the filter area
     */
    DBConnection.sendQuery = function (query, method, reverse, all_ids, executeAgain, cascade) {
        if (DBConnection.filterName != undefined) {
            if (method == "shapeQuery") {
                query = query.replace("/getAreaEvents?", ("/saveFilter?filterName=" + this.filterName + "&"));
            }
            //Here we change the query before we make the xhttp request
            // This is done when the user wants to save the query
        }
        var xhttp = new XMLHttpRequest();
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        //function gets called when the ready state changes. It goes from 0 to 4. 4 means request finished and response is ready
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var json = JSON.parse(xhttp.responseText);
                if (DBConnection.filterName != undefined || method == "/saveEventCascade") {
                    DBConnection.querySaved("Query Saved");
                    if (all_ids.length != 0) {
                        DBConnection.filterName = all_ids[0];
                        DBConnection.sportName = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
                    }
                    SaveQuery.addSavedQuery(DBConnection.filterName, json);
                    DBConnection.filterName = undefined;
                    DBConnection.sportName = undefined;
                }
                else if (method == "delQuery") {
                    DBConnection.querySaved("Query Deleted");
                }
                else if (method == "rerunQuery") {
                    DBConnection.fillResults(json, cascade, false);
                }
                else if (method == "shapeQuery") {
                    DBConnection.fillResults(json, cascade, false);
                }
                else if (method == "shiftQuery") {
                    DBConnection.fillResults(json, cascade, false);
                }
                else if (method == "entryQuery") {
                    DBConnection.fillHeatmapResults(json, cascade, false);
                }
                else if (method == "findAllQuery") {
                    DBConnection.fillResults(json, cascade, false);
                }
                else if (method == "ecQuery") {
                    DBConnection.fillECResult(json, all_ids, reverse);
                }
                else if (method == "mpQuery") {
                    DBConnection.fillMPResult(json, false);
                }
                else if (method == "mpQueryWithArrows") {
                    DBConnection.fillMPResult(json, true);
                }
                else if (method == "highlightQuery") {
                    DBConnection.fillHighlights(json);
                }
                else if (method == "/analyzeTeams") {
                    Analysis.analyzeTeams(json);
                }
                else if (method == "/analyzePlayers") {
                    Analysis.analyzePlayers(json);
                }
                else if (method == "/analyzeQueries") {
                    Analysis.showQueryGraphs(json);
                }
                else if (method == "/analyzePressing") {
                    DBConnection.analyzePressingResult(json);
                }
                else if (method == "/analyzePressing2d") {
                    DBConnection.analyzePressing2dResult(json, method);
                }
                else if (method == "/analyzeTransitions") {
                    DBConnection.analyzeTransitionResult(json);
                }
                else if (method == "/analyzePlayerSpeed") {
                    DBConnection.analyzePlayerSpeedResult(json, method);
                }
                else if (method == "/analyzePlayerPassNetwork") {
                    DBConnection.analyzePlayerNetworkResult(json);
                }
                else if (method == "/getTeamSettings") {
                    DBConnection.setTeamSettings(json);
                }
                else if (method == "/saveUser") {
                    DBConnection.userSaved("User Saved");
                }
                else if (method == "/getUsers") {
                    UserSettings.fillUsers(json);
                }
                else if (method == "/getUserParameter") {
                    UserSettings.updateModalValues(json);
                }
                else if (method == "/customizePressing") {
                    DBConnection.customized(json);
                }
                else if (method == "/getQueries?sportFilter=" + sport) {
                    if (DBConnection.analysisOn == false) {
                        SaveQuery.fillQueries(json);
                    }
                    else { //We want the queries for the analyzeQuery Window
                        Analysis.fillQuerySelection(json);
                        DBConnection.analysisOn = false;
                    }
                }
                else if ((method == "/getPlayers?sportFilter=" + sport) && DBConnection.analysisOn == true) {
                    //Fills the players in the player analysis Selection
                    Analysis.fillSelectionPlayer(json);
                }
                else if ((method == "/getTeams?sportFilter=" + sport) && DBConnection.analysisOn == true) {
                    //Fills the teams in the team analysis Selection
                    Analysis.fillSelectionTeam(json);
                }
                else if ((method == "/getMatches?sportFilter=" + sport) && DBConnection.analysisOn == true) {
                    //Fills the matches in the player and team analysis Selection
                    Analysis.fillSelectionMatch(json);
                    DBConnection.analysisOn = false;
                }
                else {
                    // Fills the filters in the filter Area
                    FilterArea.fill(json, method);
                    OffBallActivities.fill(json, method);
                }
                xhttp.abort(); //cancels current request
                // this is needed to rerun a event cascade query from scratch
                if (executeAgain == 1) {
                    ResultList.clearResultList();
                    DBConnection.eventCascade();
                }
                else if (executeAgain == 2) {
                    ResultList.clearResultList();
                    DBConnection.reverseEventCascade();
                }
            }
        };
        xhttp.open(CONFIG.METHOD, query, true); //method: GET or Post, query: url, the file location, asynchronous true
        xhttp.send();
    };
    /**
     * Calls the Server with the teams to analyze and which parameters
     * @param teamIDArray
     * @param paramArray
     */
    DBConnection.analyzeTeams = function (user, teamIDArray, paramArray, matchArray) {
        var method = "/analyzeTeams";
        var userName = user;
        var defaultPressingInfo = '&pressingDurationThreshold=' + CONFIG.PRESSING_DURATION_THRESHOLD + '&pressingIndexThreshold=' + CONFIG.PRESSING_INDEX_THRESHOLD;
        var query = CONFIG.PROXY_ADDRESS + method + "?user=" + userName + "&teams=" + teamIDArray + "&parameters=" + paramArray + "&matches=" + matchArray + defaultPressingInfo;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server with the players to analyze and which parameters
     * @param playerIDArray
     * @param paramArray
     */
    DBConnection.analyzePlayers = function (user, playerIDArray, paramArray, matchArray) {
        var method = "/analyzePlayers";
        var userName = user;
        var query = CONFIG.PROXY_ADDRESS + method + "?user=" + userName + "&players=" + playerIDArray + "&parameters=" + paramArray + "&matches=" + matchArray;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Sends query to server with all the id's of the save queries in order for them to be analyzed.
     * @param queryIdArray
     * @param timeFilter
     */
    DBConnection.analyzeQueries = function (queryIdArray, timeFilter) {
        var method = "/analyzeQueries";
        var query = CONFIG.PROXY_ADDRESS + method + "?queryIds=" + queryIdArray + "&timeFilter=" + timeFilter;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server for getting Pressure Phases of a specific match
     */
    DBConnection.analyzePressing = function (user) {
        var method = "/analyzePressing";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        var username = user;
        var pressingInfo = 'userName=' + username + '&pressingDurationThreshold=' + CONFIG.PRESSING_DURATION_THRESHOLD + '&pressingIndexThreshold=' + CONFIG.PRESSING_INDEX_THRESHOLD;
        var query = CONFIG.PROXY_ADDRESS + method + "?" + match + "&" + pressingInfo;
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server for getting the Pressure Index values for both teams of a specific match
     */
    DBConnection.analyzePressing2d = function () {
        var method = "/analyzePressing2d";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        var query = CONFIG.PROXY_ADDRESS + method + "?" + match;
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server for getting the offensive transition phases for a team in a specific match
     */
    DBConnection.analyzeOffTransition = function (user) {
        var method = "/analyzeTransitions";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        var team = 'teamFilters={' + FilterArea.getTeamFilters() + '}';
        var username = user;
        var transType = 'type=offensive';
        var query = CONFIG.PROXY_ADDRESS + method + "?" + username + "&" + match + "&" + team + "&" + transType;
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server for getting the defensive transition phases for a team in a specific match
     */
    DBConnection.analyzeDefTransition = function (user) {
        var method = "/analyzeTransitions";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        var team = 'teamFilters={' + FilterArea.getTeamFilters() + '}';
        var username = user;
        var transType = 'type=defensive';
        var query = CONFIG.PROXY_ADDRESS + method + "?" + username + "&" + match + "&" + team + "&" + transType;
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server for getting the speed of one or several players in a specific match
     */
    DBConnection.analyzePlayerSpeed = function () {
        var method = "/analyzePlayerSpeed";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        var players = 'playerFilters={' + FilterArea.getPlayerFilters() + '}';
        var query = CONFIG.PROXY_ADDRESS + method + "?" + match + "&" + players;
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Calls the Server for getting the pass network of a team in a specific match
     */
    DBConnection.analyzePlayerPassNetwork = function () {
        var method = "/analyzePlayerPassNetwork";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        var team = 'teamFilters={' + FilterArea.getTeamFilters() + '}';
        var query = CONFIG.PROXY_ADDRESS + method + "?" + match + "&" + team;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Gets the result from the Server and calls the fillHighlightsPhases method
     */
    DBConnection.analyzePressingResult = function (json) {
        DBConnection.fillPressingPhases(json);
    };
    /**
     * Gets the result from the Server and calls the fillItemList and visualizeGraph2d methods
     */
    DBConnection.analyzePressing2dResult = function (json, method) {
        Graph2d.fillItemList(json, method);
        Graph2d.visualizeGraph2d(method);
    };
    /**
     * Gets the result from the Server and calls the fillTransitionPhases method
     */
    DBConnection.analyzeTransitionResult = function (json) {
        DBConnection.fillTransitionPhases(json);
    };
    /**
     * Gets the result from the Server and calls the filmItemlist and visualizeGraph2d methods
     */
    DBConnection.analyzePlayerSpeedResult = function (json, method) {
        Graph2d.fillItemList(json, method);
        Graph2d.visualizeGraph2d(method);
    };
    /**
     * Gets the result from the Server and calls the createNodesAndEdges and visualizeNetwork methods
     */
    DBConnection.analyzePlayerNetworkResult = function (json) {
        Network.createNodesAndEdges(json);
        Network.visualizeNetwork();
    };
    /**
     * Calls the Server to change the values in the DB for a specific user
     * @param user
     * @param pressingIndex
     * @param pressingDuration
     */
    DBConnection.customizePressing = function (user, pressingIndex, pressingDuration) {
        var method = "/customizePressing";
        var username = user;
        var index = pressingIndex;
        var duration = pressingDuration;
        var customizeInfo = 'userName=' + username + '&pressingDurationThreshold=' + duration + '&pressingIndexThreshold=' + index;
        var query = CONFIG.PROXY_ADDRESS + method + "?" + customizeInfo;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Gets the result from the Server
     */
    DBConnection.customized = function (json) {
        //console.log("Successful Pressure customization");
    };
    DBConnection.getUserParam = function (user) {
        var method = "/getUserParameter";
        var username = user;
        var query = CONFIG.PROXY_ADDRESS + method + "?userName=" + username;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Generates an alert for 3.0 seconds that the query has been saved/deleted
     * @param output
     */
    DBConnection.querySaved = function (output) {
        var x = document.getElementById('saved'); //Make the saved alert appear
        x.innerText = output;
        x.style.display = "table";
        setTimeout(function () {
            x.style.display = "none";
        }, 3000); //Waits 3.0 seconds to remove the alert again
    };
    /**
     * Generates an alert for 2.0 seconds that the user has been saved
     * @param output
     */
    DBConnection.userSaved = function (output) {
        var x = document.getElementById('user_saved'); //Make the saved alert appear
        x.innerText = output;
        x.style.display = "table";
        setTimeout(function () {
            x.style.display = "none";
        }, 2000); //Waits 2.0 seconds to remove the alert again
    };
    /**
     * This function searches for events within one or multiple user-drawn objects.
     * It is also used by event cascade functions.
     */
    DBConnection.shapeQuery = function (multipleObjects, executeAgain, cascade) {
        var shape_input;
        Arrow.deleteAllArrows();
        EventChain.clearChains(); // has to be reset to get no duplicate results, if DrawingObjects cover the same events.
        ResultList.clearResultList();
        if (multipleObjects) {
            for (var _i = 0, _a = DrawingArea.active_objects; _i < _a.length; _i++) {
                var object = _a[_i];
                shape_input = object.getSelection();
                DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getAreaEvents?") + object.getFilterQuery() + DBConnection.getMatchFilter(), "shapeQuery", false, [], executeAgain, cascade);
            }
        }
        else {
            shape_input = DrawingArea.active_objects[0].getSelection();
            DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getAreaEvents?") + DrawingArea.active_objects[0].getFilterQuery() + DBConnection.getMatchFilter(), "shapeQuery", false, [], executeAgain, cascade);
        }
    };
    /**
     * This function searches for entry events used for the heatmap.
     */
    DBConnection.entryQuery = function () {
        var btn = document.getElementById("entryEventsBtn").innerHTML;
        if (btn != "Deactivate Entries") {
            var entryFilters = '&sportFilter={\'sport\':icehockey}'
                + DBConnection.getMatchFilter()
                + DBConnection.getTeamFilter()
                + DBConnection.getPlayerFilter()
                + DBConnection.getPeriodFilter()
                + '&eventFilters={"0":"entryEvent"}';
            DBConnection.sendQuery(DBConnection.getCustomEntryURL("/getAreaEvents?") + entryFilters, "entryQuery", false, [], 0, false);
            document.getElementById("entryEventsBtn").innerHTML = 'Deactivate Entries';
        }
        else {
            document.getElementById("entryEventsBtn").innerHTML = 'Entries';
            DrawingArea.clearAndResetDefault();
        }
    };
    /**
     * This function searches for shift events used for displaying shifts in the timeline.
     */
    DBConnection.shiftQuery = function () {
        var shiftURL = CONFIG.PROXY_ADDRESS
            + "/getAreaEvents?"
            + "shape=null&coordinates={}"
            + '&sportFilter={\'sport\':icehockey}'
            + DBConnection.getMatchFilter()
            + DBConnection.getTeamFilter()
            + DBConnection.getPlayerFilter()
            + DBConnection.getPeriodFilter()
            + '&eventFilters={"0":"shiftEvent"}';
        Arrow.deleteAllArrows();
        EventChain.clearChains();
        ResultList.clearResultList();
        DrawingArea.clearCanvas();
        FilterArea.resetFilters();
        DBConnection.sendQuery(shiftURL, "shiftQuery", false, [], 0, true);
    };
    DBConnection.findAllQuery = function () {
        var findAllURL = CONFIG.PROXY_ADDRESS
            + "/getAreaEvents?"
            + "shape=null&coordinates={}"
            + DBConnection.getEventFilter()
            + DBConnection.getTeamFilter()
            + DBConnection.getPlayerFilter()
            + DBConnection.getPeriodFilter()
            + DBConnection.getMatchFilter()
            + DBConnection.getSportFilter();
        DBConnection.sendQuery(findAllURL, "findAllQuery", false, [], 0, false);
    };
    /**
     * This function is called if forward event cascade is selected, it fetches all available data and calls the sendQuery function.
     */
    DBConnection.eventCascade = function () {
        // this part finds out, if eventCascade needs to be rerun after the REST request
        var executeAgain = 0;
        if (DBConnection.cascadeDepth + 1 != DrawingArea.active_objects.length) {
            executeAgain = 1;
        }
        // this part executes the event cascade
        if (DBConnection.cascadeDepth == 0) {
            DBConnection.cascadeDepth++;
            DBConnection.shapeQuery(false, executeAgain, true);
        }
        else {
            // makes the analysing button visible
            $('#analysingBtn').removeClass("invisible");
            MultiPathLine.deleteAllLines();
            DBConnection.active_eventmarkers = EventChain.getLastMarkers();
            var active_object = DrawingArea.active_objects[DBConnection.cascadeDepth];
            var shape_input = active_object.getSelection();
            var geofiltersquery = void 0;
            if (shape_input[0] == "rectangle") {
                shape_input = DBConnection.rectCoordinateCorrection(shape_input);
                geofiltersquery = DBConnection.getRectQuery(shape_input);
            }
            else if (shape_input[0] == "circle") {
                shape_input = DBConnection.circleCoordinateCorrection(shape_input);
                geofiltersquery = DBConnection.getCircleQuery(shape_input);
            }
            else {
                shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
                geofiltersquery = DBConnection.getPolygonQuery(shape_input);
            }
            geofiltersquery += active_object.getFilterQuery();
            geofiltersquery += DBConnection.getMatchFilter();
            var tsquery = '?reverse=false&timestamps=[';
            var all_ids = [];
            for (var _i = 0, _a = DBConnection.active_eventmarkers; _i < _a.length; _i++) {
                var em = _a[_i];
                all_ids.push(em.markerid);
                tsquery = tsquery + '{"id":"' + em.markerid + '","t":"' + em.time + '","matchId":"' + em.getMarkerMatchID() + '"},';
            }
            tsquery = tsquery.substring(0, tsquery.length - 1);
            tsquery = tsquery + ']&threshold=' + DBConnection.THRESHOLD + "&";
            var finalquery = CONFIG.PROXY_ADDRESS + "/getEventCascade" + tsquery + geofiltersquery;
            DBConnection.sendQuery(finalquery, "ecQuery", false, all_ids, executeAgain, true);
            DBConnection.cascadeDepth++;
        }
    };
    /**
     * This function is called if reverse event cascade is selected, it fetches all available data and calls for every point the sendQuery function.
     */
    DBConnection.reverseEventCascade = function () {
        // check if reverse cascade has to be executed multiple times and, if yes, setting the corresponding variable.
        var executeAgain = 0;
        if (DBConnection.cascadeDepth < DBConnection.reverse_cascade_expandfilters.length) {
            executeAgain = 2;
        }
        // the first real use of this function (if cascade depth is 1, otherwise only a regular shape query has been executed) needs to set the active event marker array.
        if (DBConnection.cascadeDepth == 1) {
            DBConnection.active_eventmarkers = EventMarker.getMarkerList();
        }
        // here begins the reverse event cascade
        if (DBConnection.cascadeDepth == 0) {
            DBConnection.cascadeDepth++;
            DBConnection.shapeQuery(false, executeAgain, true);
        }
        else {
            // makes the analysing button visible
            $('#analysingBtn').removeClass("invisible");
            MultiPathLine.deleteAllLines();
            DBConnection.reverse_cascade_active = true;
            if (DBConnection.cascadeDepth > 1) {
                DBConnection.active_eventmarkers = EventChain.getLastMarkers();
                // this checks if the user made a selection to filter the results.
                if (DBConnection.lastActiveLength < DrawingArea.active_objects.length) {
                    var newlist = [];
                    for (var _i = 0, _a = DBConnection.active_eventmarkers; _i < _a.length; _i++) {
                        var em = _a[_i];
                        var tmp = em.getXY();
                        if (DrawingArea.active_objects[DrawingArea.active_objects.length - 1].contained(tmp[0], tmp[1])) {
                            newlist.push(em);
                        }
                        else {
                            var ec = em.getParentChain();
                            ec.deleteChain();
                        }
                    }
                    DBConnection.active_eventmarkers = newlist;
                }
            }
            var geofiltersquery = 'shape=none&coordinates={}';
            var tsquery = '?reverse=true&timestamps=[';
            var all_ids = [];
            for (var _b = 0, _c = DBConnection.active_eventmarkers; _b < _c.length; _b++) {
                var em = _c[_b];
                all_ids.push(em.markerid);
                tsquery = tsquery + '{"id":"' + em.markerid + '","time":"' + em.time + '","matchId":"' + em.getMarkerMatchID() + '"},';
            }
            tsquery = tsquery.substring(0, tsquery.length - 1);
            tsquery = tsquery + ']&threshold=' + DBConnection.THRESHOLD + "&";
            var expandfilters = void 0;
            if (DBConnection.cascadeDepth <= DBConnection.reverse_cascade_expandfilters.length) {
                expandfilters = DBConnection.reverse_cascade_expandfilters[DBConnection.cascadeDepth - 1];
            }
            else {
                expandfilters = FilterArea.getExpandFilters();
                DBConnection.reverse_cascade_expandfilters.push(expandfilters);
            }
            var sportfilter = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
            var filters_1 = '&eventFilters={' + expandfilters + "}&teamFilters={}&playerFilters={}&periodFilters={}&sportFilter={'sport':" + sportfilter + "}&matchFilters={}&timeFilter={}";
            var finalquery = CONFIG.PROXY_ADDRESS + "/getEventCascade" + tsquery + geofiltersquery + filters_1;
            DBConnection.sendQuery(finalquery, "ecQuery", true, all_ids, executeAgain, true);
            DBConnection.cascadeDepth++;
            FilterArea.resetExpandFilter();
            DBConnection.reverse_cascade_active = false;
        }
        DBConnection.lastActiveLength = DrawingArea.active_objects.length;
    };
    /**
     *  This function executes a motion path query.
     */
    DBConnection.motionPath = function () {
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        var shape_input = DrawingArea.active_objects[0].getSelection();
        DrawingArea.active_objects[0].manipulateMotionPathFilter();
        DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getMotionPath?") + DrawingArea.active_objects[0].getFilterQuery() + DBConnection.getMatchFilter(), "mpQuery", false, [], 0, false);
    };
    /**
     *  This function executes a motion path query, but time constrained rather than space constrained.
     */
    DBConnection.offBallMotionPath = function () {
        var shape_input = DrawingArea.getFullAreaSelection();
        MultiPathLineWithArrow.clearLines();
        DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getMotionPath?") + OffBallActivities.getFilterQuery() + DBConnection.getMatchFilter(), "mpQueryWithArrows", false, [], 0, false);
    };
    DBConnection.getCustomEntryURL = function (custom_url) {
        var shape_input = ["rectangle", -30.5, 15, 30.5, -15];
        custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getRectQuery(shape_input);
        return custom_url;
    };
    DBConnection.getCustomShiftURL = function (custom_url) {
        var shape_input = ["", null, null, null, null];
        custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getRectQuery(shape_input);
        return custom_url;
    };
    /**
     * This function is called by the shapeQuery function and combines URL and query.
     */
    DBConnection.getCustomURL = function (shape_input, custom_url) {
        if (shape_input[0] == "rectangle") {
            shape_input = DBConnection.rectCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getRectQuery(shape_input);
        }
        else if (shape_input[0] == "circle") {
            /*                                          if the circle should be handled as a polygon this can be uncommented
            shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getPolygonQuery(shape_input);
            */
            shape_input = DBConnection.circleCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getCircleQuery(shape_input);
        }
        else if (shape_input[0] == "polygon") {
            shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getPolygonQuery(shape_input);
        }
        else if (shape_input[0] == "straight_motion_path" || shape_input[0] == "freehand_motion_path") {
            shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getPolygonQuery(shape_input);
        }
        else {
            console.error("Shape type unknown!");
            return;
        }
        return custom_url;
    };
    /**
     * This function fetches all available data of a rectangle object and creates the corresponding query.
     */
    DBConnection.getRectQuery = function (shape_input) {
        var res = 'shape=' + shape_input[0].toString();
        res += '&coordinates={"bottomLeftX":"' + shape_input[1].toString() + '",';
        res += '"bottomLeftY":"' + shape_input[2].toString() + '",';
        res += '"upperRightX":"' + shape_input[3].toString() + '",';
        res += '"upperRightY":"' + shape_input[4].toString() + '"}';
        return res;
    };
    /**
     * This function fetches all available data of a circle object and creates the corresponding query.
     */
    DBConnection.getCircleQuery = function (shape_input) {
        var res = 'shape=' + shape_input[0].toString();
        res += '&coordinates={"centerX":"' + shape_input[1].toString() + '",';
        res += '"centerY":"' + shape_input[2].toString() + '",';
        res += '"radius":"' + shape_input[3].toString() + '"}';
        return res;
    };
    /**
     * This function generates a part of the polygon url and is also used by the motion path queries,
     * because they also use polygons for the geoquery
     */
    DBConnection.getPolygonQuery = function (shape_input) {
        var res = 'shape=' + shape_input[0].toString();
        res += '&coordinates={"vertices":[';
        for (var i = 1; i < shape_input.length; i++) {
            res += "[";
            res += shape_input[i].toString();
            res += "],";
        }
        res = res.substring(0, res.length - 1);
        res += ']}';
        return res;
    };
    /**
     * This function converts the canvas coordinates of a rectangle to DB coordinates.
     */
    DBConnection.rectCoordinateCorrection = function (shape_input) {
        var p1 = DrawingArea.canvasToDBCoordinates(shape_input[1], shape_input[2]);
        var p2 = DrawingArea.canvasToDBCoordinates(shape_input[3], shape_input[4]);
        return [shape_input[0], p1[0], p1[1], p2[0], p2[1]];
    };
    /**
     * This function converts the canvas coordinates of a circle to DB coordinates.
     */
    DBConnection.circleCoordinateCorrection = function (shape_input) {
        var p1 = DrawingArea.canvasToDBCoordinates(shape_input[1], shape_input[2]);
        var r = DrawingArea.canvasRadiusToDBRadius(shape_input[3], shape_input[2], p1);
        return [shape_input[0], p1[0], p1[1], r];
    };
    /**
     * This function converts the canvas coordinates of a polygon to DB coordinates.
     */
    DBConnection.polygonCoordinateCorrection = function (shape_input) {
        var points = [];
        points.push(shape_input[0]);
        for (var i = 1; i < shape_input.length; i = i + 2) {
            points.push(DrawingArea.canvasToDBCoordinates(shape_input[i], shape_input[i + 1]));
        }
        return points;
    };
    /**
     * Takes the REST response and fills the delivered data into the result list.
     */
    DBConnection.fillResults = function (json, cascade, highlightList) {
        var counter = ResultList.countElements() + 1;
        // TODO: Optimization required, long duration for large shape queries
        for (var _i = 0, _a = json.result[0]; _i < _a.length; _i++) {
            var object = _a[_i];
            var time = DBConnection.convertMillisToTime(object.details[0].ts);
            var id = object.details[0]._id.$oid;
            var eventtype = object.details[0].type;
            var coords = object.details[0].xyCoords;
            var matchID = object.details[0]["matchId"];
            var players = object.details[0]["playerIds"];
            if (EventMarker.getMarker(id) == null) { // if no marker with this id exists, then add it to the canvas
                var ec = new EventChain([], time, object.details[0].videoTs, counter, matchID);
                var em = new EventMarker(coords[0], id, object.details[0].ts, time, ec);
                if (coords.length == 2 && !cascade) {
                    var arrow = new Arrow(coords, ec);
                    ec.setArrow(arrow);
                }
                ec.addEventMarker(em);
                ResultList.addResult(new Result(counter, time, object.details[0].videoTs, coords[0], coords[1], eventtype, players, ec));
            }
            counter++;
        }
        ResultList.fillTimeline(highlightList);
    };
    DBConnection.fillHeatmapResults = function (json, cascade, highlightList) {
        var count = ResultList.countElements() + 1;
        for (var _i = 0, _a = json.result[0]; _i < _a.length; _i++) {
            var object = _a[_i];
            var time = DBConnection.convertMillisToTime(object.details[0].ts);
            var id = object.details[0]._id.$oid;
            var eventtype = object.details[0].type;
            var coords = object.details[0].xyCoords;
            var matchID = object.details[0]["matchId"];
            var players = object.details[0]["playerIds"];
            if (EventMarker.getMarker(id) == null) { // if no marker with this id exists, then add it to the canvas
                var ec = new EventChain([], time, object.details[0].videoTs, count, matchID);
                var em = new EventMarker(coords[0], id, object.details[0].ts, time, ec);
                if (coords.length == 2 && !cascade) {
                    var arrow = new Arrow(coords, ec);
                    ec.setArrow(arrow);
                }
                ec.addEventMarker(em);
                ResultList.addResult(new Result(count, time, object.details[0].videoTs, coords[0], coords[1], eventtype, players, ec));
            }
            count++;
        }
        ResultList.fillTimeline(highlightList);
        Analysis.entryHeatmap(json);
    };
    DBConnection.resetEventCascadeQueryArray = function () {
        DBConnection.eventIDs = [];
    };
    DBConnection.saveEcQuery = function (queryName) {
        var method = "/saveEventCascade";
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        var eventIds = [];
        for (var _i = 0, _a = DBConnection.active_eventmarkers; _i < _a.length; _i++) {
            var em = _a[_i];
            eventIds.push(em.markerid);
        }
        var query = CONFIG.PROXY_ADDRESS + method + "?eventIds=" + eventIds + "&queryName=" + queryName + "&querySport=" + sport;
        DBConnection.sendQuery(query, method, false, [queryName], 0, false);
    };
    DBConnection.saveNormalQuery = function (queryName) {
        var method = "/saveEventCascade";
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        var query = CONFIG.PROXY_ADDRESS + method + "?eventIds=" + DBConnection.eventIDs + "&queryName=" + queryName + "&querySport=" + sport;
        DBConnection.sendQuery(query, method, false, [queryName], 0, false);
    };
    /**
     * Calls the Server to save a new User
     * @param userRole
     * @param userName
     */
    DBConnection.saveUser = function (userRole, userName) {
        var method = "/saveUser";
        var userInfo = "?userRole=" + userRole + "&userName=" + userName;
        var defaultSettings = '&pressingDurationThreshold=' + CONFIG.PRESSING_DURATION_THRESHOLD + '&pressingIndexThreshold=' + CONFIG.PRESSING_INDEX_THRESHOLD;
        var query = CONFIG.PROXY_ADDRESS + method + userInfo + defaultSettings;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * This function takes the REST response of a forward event cascade and fills the delivered data into the result list and into the drawing area.
     */
    DBConnection.fillECResult = function (json, all_ids, reverse) {
        var used_ids = [];
        var counter = 1;
        ResultList.clearResultList();
        // check if returned json is not empty
        // @ts-ignore
        if (Object.keys(json).length > 0) {
            var results = json.result;
            //results = DBConnection.checkEventChainMerge(results, reverse);
            for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
                var result = results_1[_i];
                var id = result[0].id[0];
                //This is if the user would save the query then we save all the event IDs
                if (DBConnection.eventIDs.indexOf(id) == -1) { //check whether an eventID is already present in the array
                    DBConnection.eventIDs.push(id);
                }
                used_ids.push(id);
                var ec = EventChain.searchEventMarkerID(id);
                var location_1 = result[0].details[0].xyCoords[0];
                var new_id = result[0].details[0]._id.$oid;
                var players = result[0].details[0]["playerIds"];
                // if reverse event cascade the time of the EventChain has to be changed (start point is earlier)
                // if forward event cascade the time of the EventChain can be reused
                var time_formatted = void 0;
                var period = "0";
                var time1min = 0;
                var eventtype = void 0;
                var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
                if (reverse) {
                    eventtype = "Reverse event cascade";
                    var videotime = result[0].details[0].videoTs;
                    var decimal = void 0;
                    if (sport === "football") {
                        decimal = (result[0].details[0].ts / 1000) / 60; //milliseconds
                    }
                    if (sport === "icehockey") {
                        decimal = (result[0].details[0].ts) / 60; //seconds
                    }
                    var minutes = Math.floor(decimal);
                    var seconds = Math.floor((decimal - minutes) * 60);
                    var min = minutes.toString();
                    var sec = seconds.toString();
                    if (minutes < 10) {
                        min = "0" + minutes;
                    }
                    if (seconds < 10) {
                        sec = "0" + seconds;
                    }
                    time_formatted = min + ":" + sec;
                    ec.changeTime(time_formatted, videotime);
                }
                else {
                    eventtype = "Forward event cascade";
                    time_formatted = ec.time;
                    time1min = time_formatted.substring(0, 2);
                }
                if (time1min < 45) {
                    period = "1";
                }
                else {
                    period = "2";
                }
                ec.addEventMarker(new EventMarker(location_1, new_id, result[0].details[0].ts, time_formatted, ec));
                ResultList.addResult(new Result(counter, time_formatted, ec.video_time, location_1[0], location_1[1], eventtype, players, ec));
                counter++;
            }
        }
        // if a input id (all_ids) in the query is not contained in the used_ids it returned no result, so we remove the EventChain object from the rink
        for (var _a = 0, all_ids_1 = all_ids; _a < all_ids_1.length; _a++) {
            var id = all_ids_1[_a];
            var contained = false;
            for (var _b = 0, used_ids_1 = used_ids; _b < used_ids_1.length; _b++) {
                var used_id = used_ids_1[_b];
                if (used_id === id) {
                    contained = true;
                }
            }
            if (contained == false) {
                EventChain.searchEventMarkerID(id).deleteChain();
            }
        }
        DrawingArea.field.renderAll();
        ResultList.fillTimeline(false);
        //hides the analysing button
        $('#analysingBtn').addClass("invisible");
    };
    /**
     * This function sorts and adds the results of the motion path query to the drawing- and result area.
     */
    DBConnection.fillMPResult = function (json, withArrow) {
        if (withArrow) {
            // we have to clear the lines here for a second time (like in offBallMotionPath() ), when we move the
            // off ball motion time slider too fast
            MultiPathLineWithArrow.clearLines();
        }
        // counter used as ID for Multipathline
        var counter = 1;
        var results = json;
        // sort the result json so that the longest paths will be first results
        var sorted_results = [];
        while (results.length != 0) {
            var longest = null;
            for (var i = 0; i < results.length; i++) {
                if (longest == null) {
                    longest = i;
                }
                else if (results[longest].length[0] < results[i].length[0]) {
                    longest = i;
                }
            }
            sorted_results.push(results[longest]);
            results.splice(longest, 1);
        }
        // this length is used to allow very short arrows for the case of motions in off ball activities
        var length = 0;
        // draw the sorted result and add them to the result area
        //let results = 0;
        for (var _i = 0, sorted_results_1 = sorted_results; _i < sorted_results_1.length; _i++) {
            var result = sorted_results_1[_i];
            var decimal = (result.startTime / 1000) / 60; // timestamp comes in milliseconds, divide by 1000 and divide by 60 results in decimal minutes
            var minutes = Math.floor(decimal); // cutting away the decimal part gives the amount of minutes
            var seconds = Math.floor((decimal - minutes) * 60); // subtracting the amount of minutes and multiplying by 60 results in the remaining amount of seconds
            var min = minutes.toString();
            var sec = seconds.toString();
            if (minutes < 10) {
                min = "0" + minutes;
            }
            if (seconds < 10) {
                sec = "0" + seconds;
            }
            var time = min + ":" + sec;
            var locations = [];
            var points = void 0;
            if (result.motionPath[0] != 0) {
                points = result.motionPath[0];
                var lastX = undefined;
                var lastY = undefined;
                for (var _a = 0, points_1 = points; _a < points_1.length; _a++) {
                    var location_2 = points_1[_a];
                    var add = false;
                    var x = parseFloat(location_2[0]);
                    var y = parseFloat(location_2[1]);
                    if (lastX == undefined) {
                        add = true;
                    }
                    else {
                        var distToLastUsed = Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2); // removed square root
                        if (distToLastUsed >= 4.0 || (withArrow && length < 4.0)) { // 4=2^2 instead of 2 because we removed the square root
                            add = true;
                            length += distToLastUsed;
                        }
                    }
                    if (add) {
                        locations.push(location_2);
                        lastX = x;
                        lastY = y;
                    }
                }
                var eventtype = result.eventType[0];
                var period = "0";
                if (minutes < 45) {
                    period = "1";
                }
                else {
                    period = "2";
                }
                var matchId = result["matchId"][0];
                if (withArrow) {
                    var playerId = result.playerId[0];
                    // if paths are long enough
                    if (locations.length > 1) {
                        new MultiPathLineWithArrow(locations, time, result.videoTime[0], counter, eventtype, period, matchId, playerId).register();
                    }
                    // if not we have to set two fake coordinates to allow the drawing of an arrow
                    else {
                        var xFake = void 0;
                        var yFake = void 0;
                        for (var _b = 0, points_2 = points; _b < points_2.length; _b++) {
                            var location_3 = points_2[_b];
                            xFake = parseFloat(location_3[0]) + 0.5;
                            yFake = parseFloat(location_3[1]) + 0.5;
                        }
                        locations.push([xFake, yFake]);
                        new MultiPathLineWithArrow(locations, time, result.videoTime[0], counter, eventtype, period, matchId, playerId).register();
                    }
                }
                else {
                    new MultiPathLine(locations, time, result.videoTime[0], counter, eventtype, period, matchId).register();
                }
                counter++;
            }
        }
        // arrows are used for the off-ball activity, the events of which we do not need in the timeline
        if (withArrow) { // possibly draw containing polygons
            OffBallActivities.updatePolygonVisibility();
        }
        else {
            ResultList.fillTimeline(false);
        }
        //hides the analysing button
        $('#analysingBtn').addClass("invisible");
    };
    /**
     * This function checks all received IDs of the database, if there are duplicates it will merge those two event chains.
     * It creates a list and checks for duplicate OIDs (same starting/result points of two different event chains).
     * This function doesn't (probably even can't) catch all merges.
     *
     * This function could also be optimized a lot: by first comparing matchIDs and if these are the same, by comparing
     * starting times. If these conditions are true iterate through all points of the chain. (at the moment the function
     * just iterates through all available event markers and checks for matches)
     *
     * TODO: not usable with too many results, takes way too much time to run
     * TODO: still contains some bugs, requires also more testing (REVERSE EVENT CASCADE)
     */
    DBConnection.checkEventChainMerge = function (results, reverse) {
        var list = []; //
        var results_to_delete = []; // a list of points that will be deleted of the results
        var contained = true; // if this boolean is true, the function will add
        for (var i in results) {
            var oid = results[parseInt(i)][0].details[0]._id.$oid; //
            var id = results[parseInt(i)][0].id[0]; //
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var element = list_1[_i];
                var ec1 = EventMarker.getMarker(element[2]).getParentChain();
                var ec2 = EventMarker.getMarker(id).getParentChain();
                if (element[1] === oid || ec1.containsID(oid)) { // if oid == oid same result point, or oid is already contained in the event chain
                    ec1.addChain(ec2, reverse);
                    results_to_delete.push(parseInt(i));
                }
                else {
                    contained = true;
                }
            }
            if (contained) {
                list.push([i, oid, id]);
                contained = false;
            }
        }
        // delete all results that were merged
        for (var i = results_to_delete.length; i > 0; i--) {
            results.splice(results_to_delete[i], 1);
        }
        return results;
    };
    /**
     * This function allows the filter area to fill the filter list.
     * Every event type, player name and team name is going to be delivered.
     */
    DBConnection.getFilter = function (method) {
        var query;
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        // important only if matchFilterChanged
        if (method == "/getTeamUpdate") {
            var match = DBConnection.getMatchFilter();
            method = "/getTeams?sportFilter=" + sport;
            query = CONFIG.PROXY_ADDRESS + method + "&" + match.substr(1);
        }
        else if (method == "/getPlayerUpdate") {
            var match = DBConnection.getMatchFilter();
            method = "/getPlayers?sportFilter=" + sport;
            query = CONFIG.PROXY_ADDRESS + method + "&" + match.substr(1);
        }
        // regular query when loading UI
        else {
            query = CONFIG.PROXY_ADDRESS + method;
        }
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * This function allows to fill the user list in the dropdown.
     */
    DBConnection.getUsers = function (method) {
        var query = CONFIG.PROXY_ADDRESS + method;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * Used to delete the queries in the database or rerun them if the user clicks show
     * @param method: either "delQuery" or "rerunQuery"
     * @param queryID: the mongoDB ID of that query
     */
    DBConnection.editSavedQueries = function (method, queryID) {
        var query = CONFIG.PROXY_ADDRESS + "/getQueries?method=" + method + "&queryID=" + queryID;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    DBConnection.removeLastExpandFilter = function () {
        DBConnection.reverse_cascade_expandfilters.splice(-1, 1);
    };
    DBConnection.resetExpandFilterList = function () {
        DBConnection.reverse_cascade_expandfilters = [];
    };
    DBConnection.getMatchFilter = function () {
        var res = '&matchFilters={' + FilterArea.getMatchFilters() + "}";
        return res;
    };
    DBConnection.getTeamFilter = function () {
        var res = '&teamFilters={' + FilterArea.getTeamFilters() + "}";
        return res;
    };
    DBConnection.getPeriodFilter = function () {
        var res = '&periodFilters={' + FilterArea.getPeriodFilters() + "}";
        return res;
    };
    DBConnection.getPlayerFilter = function () {
        var res = '&playerFilters={' + FilterArea.getPlayerFilters() + "}";
        return res;
    };
    DBConnection.getEventFilter = function () {
        var res = '&eventFilters={' + FilterArea.getEventFilters() + "}";
        return res;
    };
    DBConnection.getSportFilter = function () {
        var res = '&sportFilter={\'sport\':' + window.location.search.substring(window.location.search.lastIndexOf("=") + 1) + '}';
        return res;
    };
    DBConnection.getHighlights = function () {
        var sportfilter = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        var eventfilter = "";
        for (var i in CONFIG.HIGHLIGHT_EVENTS) {
            eventfilter = eventfilter + '"' + i + '":"' + CONFIG.HIGHLIGHT_EVENTS[i] + '",';
        }
        eventfilter = eventfilter.slice(0, -1);
        var query = CONFIG.PROXY_ADDRESS + '/getAreaEvents?eventFilters={' + eventfilter + '}&teamFilters={}&playerFilters={}&periodFilters={}&timeFilter={}&sportFilter={"sport":' + sportfilter + '}&matchFilters={' + FilterArea.getMatchFilters() + "}";
        DBConnection.sendQuery(query, "highlightQuery", false, [], 0, false);
    };
    DBConnection.fillHighlights = function (json) {
        DBConnection.fillResults(json, false, true);
    };
    /**
     * This function takes the results of the pressing analysis.
     */
    DBConnection.fillPressingPhases = function (json) {
        var style;
        var info;
        var phase;
        Phases.clearPressingPhases();
        //Loops through the results (pressure phases)
        for (var i in json) {
            var stats = json[i];
            var time = stats[0]["start"];
            var start_time = DBConnection.convertMillisToTime(stats[0]["start"]);
            var end_time = DBConnection.convertMillisToTime(stats[0]["end"]);
            var duration = DBConnection.convertMillisToTime(stats[0]["duration"]);
            var video_ts = stats[0]["videoTs"];
            var teamID = stats[0]["team"];
            var matchID = stats[0]["matchId"];
            var phaseID = stats[0]["phaseId"];
            var avgPressure = stats[0]["avgPressure"];
            var minPressure = stats[0]["minPressure"];
            var maxPressure = stats[0]["maxPressure"];
            var venue = stats[0]["venue"];
            var startX = stats[0]["startX"];
            var startY = stats[0]["startY"];
            // put some information in the info variable for the hovering
            info = "Phase: " + phaseID + "<br>" + "PI (AVG): " + avgPressure + "<br>" + "PI (MIN): " + minPressure + "<br>" + "PI (MAX): " + maxPressure + "<br>" + "Duration: " + duration;
            // Set Color for boxes in timeline
            if (venue == "Home") {
                if (CONFIG.COLOR_TEAM_A_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }
                else {
                    style = "color: white; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }
            }
            else {
                if (CONFIG.COLOR_TEAM_B_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_B_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_B_STANDARD;
                }
                else {
                    style = "color: white; background-color: " + CONFIG.COLOR_TEAM_B_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_B_STANDARD;
                }
            }
            phase = new Phases(start_time, end_time, video_ts, time, startX, startY, phaseID, matchID, teamID, venue, info, style);
            Phases.pressing_phases.push(phase);
        }
        // Add Phases to ResultList and to Highlights
        Phases.sortPressingPhases();
        Phases.addPressingPhases();
        //hides the analysing button
        $('#analysingBtn').addClass("invisible");
    };
    /**
     * This function takes the results of the transition analysis.
     */
    DBConnection.fillTransitionPhases = function (json) {
        var style;
        var info;
        var phase;
        Phases.clearTransitionPhases();
        //Loops through the results (transition phases)
        for (var i in json) {
            var stats = json[i];
            var time = stats[0]["start"];
            var start_time = DBConnection.convertMillisToTime(stats[0]["start"]);
            var end_time = DBConnection.convertMillisToTime(stats[0]["end"]);
            var duration = DBConnection.convertMillisToTime(stats[0]["duration"]);
            var video_ts = stats[0]["videoTs"];
            var teamID = stats[0]["team"];
            var matchID = stats[0]["matchId"];
            var phaseID = stats[0]["phaseId"];
            var venue = stats[0]["venue"];
            var startX = stats[0]["startX"];
            var startY = stats[0]["startY"];
            // put some information in the info variable for the hovering
            info = "Phase: " + phaseID + "<br>" + "Duration: " + duration;
            // Set Color for boxes in timeline
            if (venue == "Home") {
                if (CONFIG.COLOR_TEAM_A_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }
                else {
                    style = "color: white; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }
            }
            else {
                if (CONFIG.COLOR_TEAM_B_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_B_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_B_STANDARD;
                }
                else {
                    style = "color: white; background-color: " + CONFIG.COLOR_TEAM_B_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_B_STANDARD;
                }
            }
            phase = new Phases(start_time, end_time, video_ts, time, startX, startY, phaseID, matchID, teamID, venue, info, style);
            Phases.transition_phases.push(phase);
        }
        // Add Phases to ResultList and to Highlights
        Phases.sortTransitionPhases();
        Phases.addTransitionPhases();
        //hides the analysing button
        $('#analysingBtn').addClass("invisible");
    };
    DBConnection.convertMillisToTime = function (ts) {
        var decimal = (ts / 1000) / 60; // timestamp comes in milliseconds, divide by 1000 and divide by 60 results in decimal minutes
        var minutes = Math.floor(decimal); // cutting away the decimal part gives the amount of minutes
        var seconds = Math.floor((decimal - minutes) * 60); // subtracting the amount of minutes and multiplying by 60 results in the remaining amount of seconds
        var min = minutes.toString();
        var sec = seconds.toString();
        if (minutes < 10) {
            min = "0" + minutes;
        }
        if (seconds < 10) {
            sec = "0" + seconds;
        }
        return min + ":" + sec;
    };
    /**
     * This function calls the server for getting the teamColors from the MongoDB
     */
    DBConnection.getTeamSettings = function () {
        var method = "/getTeamSettings";
        var match = 'matchFilters={' + FilterArea.getMatchFilters() + "}";
        var query = CONFIG.PROXY_ADDRESS + method + "?" + match;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    };
    /**
     * This function takes the REST response and sets the teamColors new for visualization in UI
     */
    DBConnection.setTeamSettings = function (json) {
        CONFIG.COLOR_TEAM_A_STANDARD = json["Home"].toString();
        CONFIG.COLOR_TEAM_B_STANDARD = json["Away"].toString();
        CONFIG.TEAM_A_Name = json["HomeName"].toString();
        CONFIG.TEAM_A_CHAR = json["HomeID"].toString();
        CONFIG.TEAM_B_Name = json["AwayName"].toString();
        CONFIG.TEAM_B_CHAR = json["AwayID"].toString();
        // Offball Label Update
        OffBallActivities.updateTeamLabelColors();
        OffBallActivities.updateTeamLabelNames();
        Graph2d.updateColors();
        Network.updateColors();
    };
    /**
     * This function sets the teamColors back to default values from the CONFIG file
     * and updates the colors of the offballTeamLabels in the UI.
     */
    DBConnection.resetTeamSettings = function () {
        CONFIG.COLOR_TEAM_A_STANDARD = "rgba(220,0,0,1)";
        CONFIG.COLOR_TEAM_B_STANDARD = "rgba(220,0,0,1)";
        CONFIG.COLOR_TEAM_A_HIGHLIGHTED = "rgba(255,112,166,1)";
        CONFIG.COLOR_TEAM_A_HOVER = "rgba(255,50,50,1)";
        CONFIG.COLOR_TEAM_B_STANDARD = "rgba(0,0,220,1)";
        CONFIG.COLOR_TEAM_B_HIGHLIGHTED = "rgba(255,112,166,1)";
        CONFIG.COLOR_TEAM_B_HOVER = "rgba(50,50,255,1)";
        CONFIG.TEAM_A_Name = "Team A";
        CONFIG.TEAM_A_CHAR = "A";
        CONFIG.TEAM_B_Name = "Team B";
        CONFIG.TEAM_B_CHAR = "B";
        OffBallActivities.updateTeamLabelColors();
        OffBallActivities.resetTeamLabelNames();
        Graph2d.updateColors();
        Network.updateColors();
    };
    DBConnection.cascadeDepth = 0;
    DBConnection.lastActiveLength = 1;
    DBConnection.active_eventmarkers = [];
    DBConnection.THRESHOLD = 5000;
    DBConnection.reverse_cascade_active = false;
    DBConnection.reverse_cascade_expandfilters = [];
    DBConnection.analysisOn = false;
    DBConnection.eventIDs = []; //All events IDs from the event Cascade get added to this array, when clear then clear it, when save then send it to server and clear it
    DBConnection.normalEventIDs = [];
    return DBConnection;
}());
