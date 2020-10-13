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

class DBConnection {

    public static cascadeDepth: number = 0;
    private static lastActiveLength: number = 1;
    public static active_eventmarkers: EventMarker[] = [];
    private static THRESHOLD: number = 5000;
    private static reverse_cascade_active: boolean = false;
    private static reverse_cascade_expandfilters: string[] = [];
    private static filterName: string;
    private static sportName: string;
    public static analysisOn: boolean = false;
    public static eventIDs: string[] = []; //All events IDs from the event Cascade get added to this array, when clear then clear it, when save then send it to server and clear it
    public static normalEventIDs: string[] = [];


    /**
     * This function checks the button state and starts the according query.
     */
    public static nextQuery(filterName?: string): void {
        if (filterName){
            DBConnection.filterName = filterName;
            DBConnection.sportName = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
            //If there is a filterName given in the method call then set the filterName
        }

        let buttonState = DrawingButtons.getButtonState();
        if (buttonState[1] == 0 && buttonState[2] == 1 && !(DrawingArea.active_objects.length > 0 && (DrawingArea.active_objects[0].type == "straight_motion_path" || DrawingArea.active_objects[0].type == "freehand_motion_path"))) {
            DBConnection.shapeQuery(true,0,false);
            DrawingButtons.deactivateActiveButton();
        } else if (buttonState[1] == 1 && buttonState[2] == 2) {
            DBConnection.eventCascade();
            DrawingButtons.deactivateActiveButton();
        } else if (buttonState[1] == 2 && buttonState[2] == 3) {
            DBConnection.reverseEventCascade();
            DrawingButtons.deactivateActiveButton();
            DrawingButtons.activateExpandButton();
        } else if (buttonState[2] == 4 || buttonState[2] == 5 || (DrawingArea.active_objects.length > 0 && (DrawingArea.active_objects[0].type === "straight_motion_path" || DrawingArea.active_objects[0].type === "freehand_motion_path"))){
            DBConnection.motionPath();
            DrawingButtons.deactivateDrawing();
            DrawingButtons.standardDrawingMode();
        } else {
            console.error("Wrong button state.")
        }
        //FilterArea.resetFilters();
    }

    /**
     * This function sends the query as string to the proxy, after receiving the results the function fills it into the result area.
     * Methods:
     * shapeQuery: gets called when a normal query is created
     * ecQuery: Event Cascade
     * mpQuery: Motionpath query
     * highlightQuery: When use clicks on match they see the most important events as point as well as the phases in the timeline
     * /getEventTypes, /getTeams, /getPlayers, /getMatches, to fill the selections in the filter area
     */
    private static sendQuery(query: string, method: string, reverse: boolean, all_ids: string[], executeAgain: number, cascade: boolean): void {

        if (DBConnection.filterName != undefined){
            if (method == "shapeQuery"){
                query = query.replace("/getAreaEvents?", ("/saveFilter?filterName=" + this.filterName + "&"));
            }
            //Here we change the query before we make the xhttp request
            // This is done when the user wants to save the query
        }

        let xhttp = new XMLHttpRequest();
        let sport: string = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        //function gets called when the ready state changes. It goes from 0 to 4. 4 means request finished and response is ready
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let json = JSON.parse(xhttp.responseText);

                if (DBConnection.filterName != undefined || method =="/saveEventCascade") {
                    DBConnection.querySaved("Query Saved");
                    if (all_ids.length != 0){
                        DBConnection.filterName = all_ids[0];
                        DBConnection.sportName = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
                    }
                    SaveQuery.addSavedQuery(DBConnection.filterName, json);
                    DBConnection.filterName = undefined;
                    DBConnection.sportName = undefined;
                } else if (method == "delQuery") {
                    DBConnection.querySaved("Query Deleted");
                } else if (method == "rerunQuery") {
                    DBConnection.fillResults(json, cascade, false);
                } else if (method == "shapeQuery") {
                    DBConnection.fillResults(json, cascade, false);
                } else if (method == "shiftQuery") {
                    DBConnection.fillResults(json, cascade, false);
                } else if (method == "entryQuery") {
                    DBConnection.fillHeatmapResults(json, cascade, false);
                } else if (method == "findAllQuery") {
                    DBConnection.fillResults(json, cascade, false);
                } else if (method == "ecQuery") {
                    DBConnection.fillECResult(json, all_ids, reverse);
                } else if (method == "mpQuery") {
                    DBConnection.fillMPResult(json, false);
                } else if (method == "mpQueryWithArrows") {
                    DBConnection.fillMPResult(json, true);
                } else if (method == "highlightQuery") {
                    DBConnection.fillHighlights(json);
                } else if (method == "/analyzeTeams"){
                    Analysis.analyzeTeams(json);
                } else if (method == "/analyzePlayers") {
                    Analysis.analyzePlayers(json);
                } else if (method == "/analyzeQueries") {
                    Analysis.showQueryGraphs(json);
                } else if (method == "/analyzePressing") {
                    DBConnection.analyzePressingResult(json);
                } else if (method == "/analyzePressing2d") {
                    DBConnection.analyzePressing2dResult(json, method);
                } else if (method == "/analyzeTransitions") {
                    DBConnection.analyzeTransitionResult(json);
                } else if (method == "/analyzePlayerSpeed") {
                    DBConnection.analyzePlayerSpeedResult(json, method);
                } else if (method == "/analyzePlayerPassNetwork") {
                    DBConnection.analyzePlayerNetworkResult(json);
                }else if (method == "/getTeamSettings"){
                    DBConnection.setTeamSettings(json);
                } else if (method == "/saveUser"){
                    DBConnection.userSaved("User Saved");
                } else if (method == "/getUsers"){
                    UserSettings.fillUsers(json);
                } else if (method == "/getUserParameter"){
                    UserSettings.updateModalValues(json);
                } else if (method == "/customizePressing"){
                    DBConnection.customized(json);
                } else if (method == "/getQueries?sportFilter=" + sport){
                    if (DBConnection.analysisOn == false){
                        SaveQuery.fillQueries(json);
                    } else { //We want the queries for the analyzeQuery Window
                        Analysis.fillQuerySelection(json);
                        DBConnection.analysisOn = false;
                    }
                } else if ((method == "/getPlayers?sportFilter=" + sport) && DBConnection.analysisOn == true){
                    //Fills the players in the player analysis Selection
                    Analysis.fillSelectionPlayer(json);
                } else if ((method == "/getTeams?sportFilter=" + sport) && DBConnection.analysisOn == true){
                    //Fills the teams in the team analysis Selection
                    Analysis.fillSelectionTeam(json);
                } else if ((method == "/getMatches?sportFilter=" + sport) && DBConnection.analysisOn == true){
                    //Fills the matches in the player and team analysis Selection
                    Analysis.fillSelectionMatch(json);
                    DBConnection.analysisOn = false;
                } else {
                    // Fills the filters in the filter Area
                    FilterArea.fill(json, method);
                    OffBallActivities.fill(json, method);
                }
                xhttp.abort(); //cancels current request
                // this is needed to rerun a event cascade query from scratch
                if(executeAgain == 1){
                    ResultList.clearResultList();
                    DBConnection.eventCascade();
                }else if(executeAgain == 2){
                    ResultList.clearResultList();
                    DBConnection.reverseEventCascade();
                }
            }
        };
        xhttp.open(CONFIG.METHOD, query, true); //method: GET or Post, query: url, the file location, asynchronous true
        xhttp.send();
    }


    /**
     * Calls the Server with the teams to analyze and which parameters
     * @param teamIDArray
     * @param paramArray
     */
    public static analyzeTeams(user: string, teamIDArray: string[], paramArray: string[], matchArray: string[]){
        let method = "/analyzeTeams";
        let userName = user;
        let defaultPressingInfo: string = '&pressingDurationThreshold=' + CONFIG.PRESSING_DURATION_THRESHOLD + '&pressingIndexThreshold=' + CONFIG.PRESSING_INDEX_THRESHOLD;
        let query: string = CONFIG.PROXY_ADDRESS + method + "?user=" + userName + "&teams=" + teamIDArray + "&parameters=" + paramArray + "&matches=" + matchArray + defaultPressingInfo;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server with the players to analyze and which parameters
     * @param playerIDArray
     * @param paramArray
     */
    public static analyzePlayers(user: string, playerIDArray: string[], paramArray: string[], matchArray: string[]){
        let method = "/analyzePlayers";
        let userName = user;
        let query: string = CONFIG.PROXY_ADDRESS + method + "?user=" + userName + "&players=" + playerIDArray + "&parameters=" + paramArray + "&matches=" + matchArray;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Sends query to server with all the id's of the save queries in order for them to be analyzed.
     * @param queryIdArray
     * @param timeFilter
     */
    public static analyzeQueries(queryIdArray: string[], timeFilter: string){
        let method = "/analyzeQueries";
        let query: string = CONFIG.PROXY_ADDRESS + method + "?queryIds=" + queryIdArray +"&timeFilter=" + timeFilter;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server for getting Pressure Phases of a specific match
     */
    public static analyzePressing(user:string){
        let method = "/analyzePressing";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        let username: string = user;
        let pressingInfo: string = 'userName=' + username + '&pressingDurationThreshold=' + CONFIG.PRESSING_DURATION_THRESHOLD + '&pressingIndexThreshold=' + CONFIG.PRESSING_INDEX_THRESHOLD;
        let query: string = CONFIG.PROXY_ADDRESS + method + "?"+ match + "&" + pressingInfo;

        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server for getting the Pressure Index values for both teams of a specific match
     */
    public static analyzePressing2d(){
        let method = "/analyzePressing2d";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        let query: string = CONFIG.PROXY_ADDRESS + method + "?"+ match;

        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server for getting the offensive transition phases for a team in a specific match
     */
    public static analyzeOffTransition(user:string){
        let method: string = "/analyzeTransitions";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        let team: string = 'teamFilters={' + FilterArea.getTeamFilters() + '}';
        let username = user;
        let transType: string = 'type=offensive';
        let query: string = CONFIG.PROXY_ADDRESS + method + "?"+ username + "&" + match + "&" + team + "&" + transType;

        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server for getting the defensive transition phases for a team in a specific match
     */
    public static analyzeDefTransition(user:string){
        let method: string = "/analyzeTransitions";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        let team: string = 'teamFilters={' + FilterArea.getTeamFilters() + '}';
        let username = user;
        let transType: string = 'type=defensive';
        let query: string = CONFIG.PROXY_ADDRESS + method + "?"+ username + "&" + match + "&" + team + "&" + transType;

        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server for getting the speed of one or several players in a specific match
     */
    public static analyzePlayerSpeed():void{
        let method: string = "/analyzePlayerSpeed";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        let players: string = 'playerFilters={' + FilterArea.getPlayerFilters() + '}';
        let query: string = CONFIG.PROXY_ADDRESS + method + "?" + match + "&" + players;

        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Calls the Server for getting the pass network of a team in a specific match
     */
    public static analyzePlayerPassNetwork(): void{
        let method: string = "/analyzePlayerPassNetwork";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + '}';
        let team: string = 'teamFilters={' + FilterArea.getTeamFilters() + '}';
        let query: string = CONFIG.PROXY_ADDRESS + method + "?" + match + "&" + team;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Gets the result from the Server and calls the fillHighlightsPhases method
     */
    public static analyzePressingResult(json):void{
        DBConnection.fillPressingPhases(json);
    }

    /**
     * Gets the result from the Server and calls the fillItemList and visualizeGraph2d methods
     */
    public static analyzePressing2dResult(json, method):void{
        Graph2d.fillItemList(json, method);
        Graph2d.visualizeGraph2d(method);
    }

    /**
     * Gets the result from the Server and calls the fillTransitionPhases method
     */
    public static analyzeTransitionResult(json):void{
        DBConnection.fillTransitionPhases(json);
    }

    /**
     * Gets the result from the Server and calls the filmItemlist and visualizeGraph2d methods
     */
    public static analyzePlayerSpeedResult(json, method):void{
        Graph2d.fillItemList(json, method);
        Graph2d.visualizeGraph2d(method);
    }

    /**
     * Gets the result from the Server and calls the createNodesAndEdges and visualizeNetwork methods
     */
    public static analyzePlayerNetworkResult(json):void{
        Network.createNodesAndEdges(json);
        Network.visualizeNetwork();
    }

    /**
     * Calls the Server to change the values in the DB for a specific user
     * @param user
     * @param pressingIndex
     * @param pressingDuration
     */
    public static customizePressing(user:string, pressingIndex:number, pressingDuration:number){
        let method = "/customizePressing";
        let username = user;
        let index = pressingIndex;
        let duration = pressingDuration;

        let customizeInfo: string = 'userName=' + username + '&pressingDurationThreshold=' +duration + '&pressingIndexThreshold=' + index;
        let query: string = CONFIG.PROXY_ADDRESS + method + "?"+ customizeInfo;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Gets the result from the Server
     */
    public static customized(json): void{
        //console.log("Successful Pressure customization");
    }

    public static getUserParam(user:string): void{
        let method = "/getUserParameter";
        let username = user;
        let query: string = CONFIG.PROXY_ADDRESS + method + "?userName="+ username;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Generates an alert for 3.0 seconds that the query has been saved/deleted
     * @param output
     */
    private static querySaved(output: string){
        let x = document.getElementById('saved'); //Make the saved alert appear
        x.innerText = output;
        x.style.display = "table";

        setTimeout(function () {
            x.style.display = "none";
        }, 3000); //Waits 3.0 seconds to remove the alert again
    }

    /**
     * Generates an alert for 2.0 seconds that the user has been saved
     * @param output
     */
    private static userSaved(output: string){
        let x = document.getElementById('user_saved'); //Make the saved alert appear
        x.innerText = output;
        x.style.display = "table";

        setTimeout(function () {
            x.style.display = "none";
        }, 2000); //Waits 2.0 seconds to remove the alert again
    }

    /**
     * This function searches for events within one or multiple user-drawn objects.
     * It is also used by event cascade functions.
     */
    private static shapeQuery(multipleObjects: boolean, executeAgain: number,cascade:boolean) {
        let shape_input;
        Arrow.deleteAllArrows();
        EventChain.clearChains();           // has to be reset to get no duplicate results, if DrawingObjects cover the same events.
        ResultList.clearResultList();
        if(multipleObjects) {
            for (let object of DrawingArea.active_objects) {
                shape_input = object.getSelection();
                DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getAreaEvents?") + object.getFilterQuery() + DBConnection.getMatchFilter(), "shapeQuery", false, [], executeAgain, cascade);
            }
        }else{
            shape_input = DrawingArea.active_objects[0].getSelection();
            DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getAreaEvents?") + DrawingArea.active_objects[0].getFilterQuery() + DBConnection.getMatchFilter(), "shapeQuery", false, [], executeAgain, cascade);
        }
    }

    /**
     * This function searches for entry events used for the heatmap.
     */
    private static entryQuery() {
        let btn = document.getElementById("entryEventsBtn").innerHTML;
        if (btn != "Deactivate Entries") {
            let entryFilters = '&sportFilter={\'sport\':icehockey}'
                + DBConnection.getMatchFilter()
                + DBConnection.getTeamFilter()
                + DBConnection.getPlayerFilter()
                + DBConnection.getPeriodFilter()
                + '&eventFilters={"0":"entryEvent"}';

            DBConnection.sendQuery(DBConnection.getCustomEntryURL("/getAreaEvents?") + entryFilters, "entryQuery", false, [], 0, false)
            document.getElementById("entryEventsBtn").innerHTML = 'Deactivate Entries';
        } else {
            document.getElementById("entryEventsBtn").innerHTML = 'Entries';
            DrawingArea.clearAndResetDefault();
        }
    }

    /**
     * This function searches for shift events used for displaying shifts in the timeline.
     */
    private static shiftQuery() {
        let shiftURL = CONFIG.PROXY_ADDRESS
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

        DBConnection.sendQuery(shiftURL, "shiftQuery",false, [], 0, true);
    }

    private static findAllQuery() {
        let findAllURL = CONFIG.PROXY_ADDRESS
            + "/getAreaEvents?"
            + "shape=null&coordinates={}"
            + DBConnection.getEventFilter()
            + DBConnection.getTeamFilter()
            + DBConnection.getPlayerFilter()
            + DBConnection.getPeriodFilter()
            + DBConnection.getMatchFilter()
            + DBConnection.getSportFilter();
        DBConnection.sendQuery(findAllURL, "findAllQuery",false, [], 0, false);
    }

    /**
     * This function is called if forward event cascade is selected, it fetches all available data and calls the sendQuery function.
     */
    private static eventCascade(): void {
        // this part finds out, if eventCascade needs to be rerun after the REST request
        let executeAgain: number = 0;
        if(DBConnection.cascadeDepth+1 != DrawingArea.active_objects.length){
            executeAgain = 1;
        }

        // this part executes the event cascade
        if (DBConnection.cascadeDepth == 0) {
            DBConnection.cascadeDepth++;
            DBConnection.shapeQuery(false,executeAgain,true);
        } else {
            // makes the analysing button visible
            $('#analysingBtn').removeClass("invisible");

            MultiPathLine.deleteAllLines();
            DBConnection.active_eventmarkers = EventChain.getLastMarkers();
            let active_object: DrawingObject = DrawingArea.active_objects[DBConnection.cascadeDepth];
            let shape_input = active_object.getSelection();

            let geofiltersquery;
            if (shape_input[0] == "rectangle") {
                shape_input = DBConnection.rectCoordinateCorrection(shape_input);
                geofiltersquery = DBConnection.getRectQuery(shape_input);
            } else if (shape_input[0] == "circle") {
                shape_input = DBConnection.circleCoordinateCorrection(shape_input);
                geofiltersquery = DBConnection.getCircleQuery(shape_input);
            } else {
                shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
                geofiltersquery = DBConnection.getPolygonQuery(shape_input);
            }
            geofiltersquery += active_object.getFilterQuery();
            geofiltersquery += DBConnection.getMatchFilter();

            let tsquery = '?reverse=false&timestamps=[';
            let all_ids: string[] = [];
            for (let em of DBConnection.active_eventmarkers) {
                all_ids.push(em.markerid);
                tsquery = tsquery + '{"id":"' + em.markerid + '","t":"' + em.time + '","matchId":"' + em.getMarkerMatchID() + '"},';
            }
            tsquery = tsquery.substring(0, tsquery.length - 1);
            tsquery = tsquery + ']&threshold=' + DBConnection.THRESHOLD + "&";
            let finalquery = CONFIG.PROXY_ADDRESS + "/getEventCascade" + tsquery + geofiltersquery;
            DBConnection.sendQuery(finalquery, "ecQuery", false, all_ids, executeAgain,true);
            DBConnection.cascadeDepth++;
        }
    }

    /**
     * This function is called if reverse event cascade is selected, it fetches all available data and calls for every point the sendQuery function.
     */
    private static reverseEventCascade(): void {

        // check if reverse cascade has to be executed multiple times and, if yes, setting the corresponding variable.
        let executeAgain: number = 0;
        if(DBConnection.cascadeDepth < DBConnection.reverse_cascade_expandfilters.length){
            executeAgain = 2;
        }

        // the first real use of this function (if cascade depth is 1, otherwise only a regular shape query has been executed) needs to set the active event marker array.
        if(DBConnection.cascadeDepth == 1){
            DBConnection.active_eventmarkers = EventMarker.getMarkerList();
        }

        // here begins the reverse event cascade
        if (DBConnection.cascadeDepth == 0) {
            DBConnection.cascadeDepth++;
            DBConnection.shapeQuery(false,executeAgain,true);
        } else {
            // makes the analysing button visible
            $('#analysingBtn').removeClass("invisible");
            MultiPathLine.deleteAllLines();
            DBConnection.reverse_cascade_active = true;
            if (DBConnection.cascadeDepth > 1) {
                DBConnection.active_eventmarkers = EventChain.getLastMarkers();
                // this checks if the user made a selection to filter the results.
                if (DBConnection.lastActiveLength < DrawingArea.active_objects.length) {
                    let newlist: EventMarker[] = [];
                    for (let em of DBConnection.active_eventmarkers) {
                        let tmp = em.getXY();
                        if (DrawingArea.active_objects[DrawingArea.active_objects.length - 1].contained(tmp[0], tmp[1])) {
                            newlist.push(em);
                        } else {
                            let ec = em.getParentChain();
                            ec.deleteChain();
                        }
                    }
                    DBConnection.active_eventmarkers = newlist;
                }
            }

            let geofiltersquery = 'shape=none&coordinates={}';
            let tsquery = '?reverse=true&timestamps=[';
            let all_ids: string[] = [];
            for (let em of DBConnection.active_eventmarkers) {
                all_ids.push(em.markerid);
                tsquery = tsquery + '{"id":"' + em.markerid + '","time":"' + em.time + '","matchId":"' + em.getMarkerMatchID() + '"},';
            }
            tsquery = tsquery.substring(0, tsquery.length - 1);
            tsquery = tsquery + ']&threshold=' + DBConnection.THRESHOLD + "&";

            let expandfilters: string;
            if(DBConnection.cascadeDepth <= DBConnection.reverse_cascade_expandfilters.length){
                expandfilters = DBConnection.reverse_cascade_expandfilters[DBConnection.cascadeDepth-1];
            }else{
                expandfilters = FilterArea.getExpandFilters();
                DBConnection.reverse_cascade_expandfilters.push(expandfilters);
            }
            let sportfilter: string = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
            let filters: string = '&eventFilters={' + expandfilters + "}&teamFilters={}&playerFilters={}&periodFilters={}&sportFilter={'sport':" + sportfilter + "}&matchFilters={}&timeFilter={}";
            let finalquery = CONFIG.PROXY_ADDRESS + "/getEventCascade" + tsquery + geofiltersquery + filters;
            DBConnection.sendQuery(finalquery,"ecQuery", true, all_ids, executeAgain,true);
            DBConnection.cascadeDepth++;
            FilterArea.resetExpandFilter();
            DBConnection.reverse_cascade_active = false;
        }

        DBConnection.lastActiveLength = DrawingArea.active_objects.length;
    }

    /**
     *  This function executes a motion path query.
     */
    private static motionPath(): void{
        // makes the analysing button visible
        $('#analysingBtn').removeClass("invisible");
        let shape_input = DrawingArea.active_objects[0].getSelection();
        DrawingArea.active_objects[0].manipulateMotionPathFilter();
        DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getMotionPath?") + DrawingArea.active_objects[0].getFilterQuery() + DBConnection.getMatchFilter(), "mpQuery", false, [], 0,false);
    }

    /**
     *  This function executes a motion path query, but time constrained rather than space constrained.
     */
    public static offBallMotionPath(): void{
        let shape_input = DrawingArea.getFullAreaSelection();
        MultiPathLineWithArrow.clearLines();
        DBConnection.sendQuery(DBConnection.getCustomURL(shape_input, "/getMotionPath?") + OffBallActivities.getFilterQuery() + DBConnection.getMatchFilter(), "mpQueryWithArrows", false, [], 0,false);
    }

    private static getCustomEntryURL(custom_url: string) {
        let shape_input = ["rectangle", -30.5, 15, 30.5, -15];
        custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getRectQuery(shape_input);
        return custom_url;
    }

    private static getCustomShiftURL(custom_url: string) {
        let shape_input = ["", null, null, null, null];
        custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getRectQuery(shape_input);
        return custom_url;
    }

    /**
     * This function is called by the shapeQuery function and combines URL and query.
     */
    private static getCustomURL(shape_input: any, custom_url: string): string {
        if (shape_input[0] == "rectangle") {
            shape_input = DBConnection.rectCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getRectQuery(shape_input);
        } else if (shape_input[0] == "circle") {
            /*                                          if the circle should be handled as a polygon this can be uncommented
            shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getPolygonQuery(shape_input);
            */
            shape_input = DBConnection.circleCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getCircleQuery(shape_input);
        } else if (shape_input[0] == "polygon") {
            shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getPolygonQuery(shape_input);
        } else if (shape_input[0] == "straight_motion_path" || shape_input[0] == "freehand_motion_path") {
            shape_input = DBConnection.polygonCoordinateCorrection(shape_input);
            custom_url = CONFIG.PROXY_ADDRESS + custom_url + DBConnection.getPolygonQuery(shape_input);
        }else{
            console.error("Shape type unknown!");
            return;
        }
        return custom_url;
    }

    /**
     * This function fetches all available data of a rectangle object and creates the corresponding query.
     */
    private static getRectQuery(shape_input: any[]): string {

        let res = 'shape=' + shape_input[0].toString();
        res += '&coordinates={"bottomLeftX":"' + shape_input[1].toString() + '",';
        res += '"bottomLeftY":"' + shape_input[2].toString() + '",';
        res += '"upperRightX":"' + shape_input[3].toString() + '",';
        res += '"upperRightY":"' + shape_input[4].toString() + '"}';
        return res;
    }

    /**
     * This function fetches all available data of a circle object and creates the corresponding query.
     */
    private static getCircleQuery(shape_input: number[]): string {
        let res = 'shape=' + shape_input[0].toString();
        res += '&coordinates={"centerX":"' + shape_input[1].toString() + '",';
        res += '"centerY":"' + shape_input[2].toString() + '",';
        res += '"radius":"' + shape_input[3].toString() + '"}';
        return res;
    }

    /**
     * This function generates a part of the polygon url and is also used by the motion path queries,
     * because they also use polygons for the geoquery
     */
    private static getPolygonQuery(shape_input: any[]): string{
        let res = 'shape=' + shape_input[0].toString();
        res += '&coordinates={"vertices":[';
        for(let i = 1; i < shape_input.length; i++){
            res += "[";
            res += shape_input[i].toString();
            res += "],";
        }
        res = res.substring(0,res.length-1);
        res += ']}';
        return res;
    }

    /**
     * This function converts the canvas coordinates of a rectangle to DB coordinates.
     */
    private static rectCoordinateCorrection(shape_input: any[]): any[] {

        let p1 = DrawingArea.canvasToDBCoordinates(shape_input[1], shape_input[2]);
        let p2 = DrawingArea.canvasToDBCoordinates(shape_input[3], shape_input[4]);

        return [shape_input[0], p1[0], p1[1], p2[0], p2[1]];
    }

    /**
     * This function converts the canvas coordinates of a circle to DB coordinates.
     */
    private static circleCoordinateCorrection(shape_input: any[]): any[] {
        let p1 = DrawingArea.canvasToDBCoordinates(shape_input[1], shape_input[2]);
        let r = DrawingArea.canvasRadiusToDBRadius(shape_input[3], shape_input[2], p1);
        return [shape_input[0], p1[0], p1[1], r];
    }

    /**
     * This function converts the canvas coordinates of a polygon to DB coordinates.
     */
    private static polygonCoordinateCorrection(shape_input: any[]): any[]{
        let points: any[] = [];
        points.push(shape_input[0]);
        for(let i = 1; i < shape_input.length; i=i+2){
            points.push(DrawingArea.canvasToDBCoordinates(shape_input[i],shape_input[i+1]));
        }
        return points;
    }

    /**
     * Takes the REST response and fills the delivered data into the result list.
     */
    private static fillResults(json, cascade: boolean, highlightList: boolean): void {
        let counter = ResultList.countElements()+1;

        // TODO: Optimization required, long duration for large shape queries
        for (let object of json.result[0]) {
            let time: string = DBConnection.convertMillisToTime(object.details[0].ts);
            let id = object.details[0]._id.$oid;
            let eventtype = object.details[0].type;
            let coords = object.details[0].xyCoords;
            let matchID = object.details[0]["matchId"];
            let players = object.details[0]["playerIds"];

            if(EventMarker.getMarker(id) == null) {                         // if no marker with this id exists, then add it to the canvas
                let ec = new EventChain([], time, object.details[0].videoTs, counter, matchID);
                let em = new EventMarker(coords[0], id, object.details[0].ts, time, ec);
                if(coords.length == 2 && !cascade){
                    let arrow = new Arrow(coords, ec);
                    ec.setArrow(arrow);
                }
                ec.addEventMarker(em);
                ResultList.addResult(new Result(counter, time, object.details[0].videoTs,coords[0],coords[1],eventtype,players,ec));
            }
            counter++;
        }
        ResultList.fillTimeline(highlightList);
    }

    private static fillHeatmapResults(json, cascade: boolean, highlightList: boolean): void {
        let count = ResultList.countElements()+1;
        for (let object of json.result[0]) {
            let time: string = DBConnection.convertMillisToTime(object.details[0].ts);
            let id = object.details[0]._id.$oid;
            let eventtype = object.details[0].type;
            let coords = object.details[0].xyCoords;
            let matchID = object.details[0]["matchId"];
            let players = object.details[0]["playerIds"];

            if(EventMarker.getMarker(id) == null) {                         // if no marker with this id exists, then add it to the canvas
                let ec = new EventChain([], time, object.details[0].videoTs, count, matchID);
                let em = new EventMarker(coords[0], id, object.details[0].ts, time, ec);
                if(coords.length == 2 && !cascade){
                    let arrow = new Arrow(coords, ec);
                    ec.setArrow(arrow);
                }
                ec.addEventMarker(em);
                ResultList.addResult(new Result(count, time, object.details[0].videoTs,coords[0],coords[1],eventtype,players,ec));
            }
            count++;
        }
        ResultList.fillTimeline(highlightList);
        Analysis.entryHeatmap(json);

    }

    public static resetEventCascadeQueryArray(): void{
        DBConnection.eventIDs = [];
    }

    public static saveEcQuery(queryName: string): void{
        let method: string = "/saveEventCascade";
        let sport: string = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        let eventIds: string[] = [];
        for (let em of DBConnection.active_eventmarkers){
            eventIds.push(em.markerid);
        }
        let query: string = CONFIG.PROXY_ADDRESS + method + "?eventIds=" + eventIds +"&queryName=" + queryName + "&querySport=" + sport;
        DBConnection.sendQuery(query, method, false, [queryName], 0, false);
    }

    public static saveNormalQuery(queryName: string): void{
        let method: string = "/saveEventCascade";
        let sport: string = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        let query: string = CONFIG.PROXY_ADDRESS + method + "?eventIds=" + DBConnection.eventIDs +"&queryName=" + queryName + "&querySport=" + sport;
        DBConnection.sendQuery(query, method, false, [queryName], 0, false);
    }

    /**
     * Calls the Server to save a new User
     * @param userRole
     * @param userName
     */
    public static saveUser(userRole: string, userName: string): void{
        let method: string = "/saveUser";
        let userInfo: string = "?userRole=" + userRole + "&userName=" + userName;
        let defaultSettings: string = '&pressingDurationThreshold=' + CONFIG.PRESSING_DURATION_THRESHOLD + '&pressingIndexThreshold=' + CONFIG.PRESSING_INDEX_THRESHOLD;
        let query: string = CONFIG.PROXY_ADDRESS + method + userInfo + defaultSettings;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * This function takes the REST response of a forward event cascade and fills the delivered data into the result list and into the drawing area.
     */
    private static fillECResult(json, all_ids: string[],reverse: boolean): void {
        let used_ids: string[] = [];
        let counter = 1;
        ResultList.clearResultList();
        // check if returned json is not empty
        // @ts-ignore
        if(Object.keys(json).length > 0) {
            let results = json.result;
            //results = DBConnection.checkEventChainMerge(results, reverse);
            for (let result of results) {
                let id = result[0].id[0];

                //This is if the user would save the query then we save all the event IDs
                if (DBConnection.eventIDs.indexOf(id) == -1) {  //check whether an eventID is already present in the array
                    DBConnection.eventIDs.push(id);
                }

                used_ids.push(id);
                let ec = EventChain.searchEventMarkerID(id);
                let location = result[0].details[0].xyCoords[0];
                let new_id: string = result[0].details[0]._id.$oid;
                let players = result[0].details[0]["playerIds"];

                // if reverse event cascade the time of the EventChain has to be changed (start point is earlier)
                // if forward event cascade the time of the EventChain can be reused
                let time_formatted;
                let period = "0";
                let time1min = 0;
                let eventtype;
                let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
                if (reverse) {
                    eventtype = "Reverse event cascade";
                    let videotime: number = result[0].details[0].videoTs;
                    let decimal: number;
                    if (sport === "football") {
                        decimal = (result[0].details[0].ts / 1000) / 60; //milliseconds
                    }
                    if (sport === "icehockey") {
                        decimal = (result[0].details[0].ts) / 60; //seconds
                    }
                    let minutes: number = Math.floor(decimal);
                    let seconds: number = Math.floor((decimal - minutes) * 60);

                    let min: string = minutes.toString();
                    let sec: string = seconds.toString();

                    if (minutes < 10) {
                        min = "0" + minutes;
                    }
                    if (seconds < 10) {
                        sec = "0" + seconds;
                    }

                    time_formatted = min + ":" + sec;
                    ec.changeTime(time_formatted, videotime);

                } else {
                    eventtype = "Forward event cascade";
                    time_formatted = ec.time;
                    time1min = time_formatted.substring(0, 2);
                }
                if (time1min < 45) {
                    period = "1";
                } else {
                    period = "2";
                }
                ec.addEventMarker(new EventMarker(location, new_id, result[0].details[0].ts, time_formatted, ec));
                ResultList.addResult(new Result(counter, time_formatted, ec.video_time, location[0], location[1], eventtype, players, ec));
                counter++;
            }
        }

        // if a input id (all_ids) in the query is not contained in the used_ids it returned no result, so we remove the EventChain object from the rink
        for (let id of all_ids) {
            let contained: boolean = false;
            for (let used_id of used_ids) {
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
    }

    /**
     * This function sorts and adds the results of the motion path query to the drawing- and result area.
     */
    private static fillMPResult(json, withArrow: boolean): void {

        if (withArrow) {
            // we have to clear the lines here for a second time (like in offBallMotionPath() ), when we move the
            // off ball motion time slider too fast
            MultiPathLineWithArrow.clearLines();
        }

        // counter used as ID for Multipathline
        let counter = 1;
        let results = json;

        // sort the result json so that the longest paths will be first results
        let sorted_results = [];
        while(results.length != 0) {
            let longest: number = null;
            for (let i = 0; i < results.length; i++) {
                if(longest == null){
                    longest = i;
                }else if (results[longest].length[0] < results[i].length[0]){
                    longest = i;
                }
            }
            sorted_results.push(results[longest]);
            results.splice(longest, 1);
        }

        // this length is used to allow very short arrows for the case of motions in off ball activities
        let length: number = 0;

        // draw the sorted result and add them to the result area
        //let results = 0;
        for (let result of sorted_results) {

            let decimal: number = (result.startTime/1000)/60;               // timestamp comes in milliseconds, divide by 1000 and divide by 60 results in decimal minutes
            let minutes: number = Math.floor(decimal);                          // cutting away the decimal part gives the amount of minutes
            let seconds: number = Math.floor((decimal - minutes)*60);           // subtracting the amount of minutes and multiplying by 60 results in the remaining amount of seconds

            let min: string = minutes.toString();
            let sec: string = seconds.toString();

            if(minutes < 10){
                min = "0"+minutes;
            }
            if(seconds < 10){
                sec = "0"+seconds;
            }
            let time: string = min + ":" + sec;
            let locations:any[] = [];

            let points;
            if (result.motionPath[0] != 0) {
                points = result.motionPath[0];

                let lastX: number = undefined;
                let lastY: number = undefined;
                for (let location of points) {
                    let add: boolean = false;
                    let x: number = parseFloat(location[0]);
                    let y: number = parseFloat(location[1]);
                    if (lastX == undefined) {
                        add = true;
                    } else {
                        let distToLastUsed = Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2); // removed square root
                        if (distToLastUsed >= 4.0 || (withArrow && length < 4.0)) { // 4=2^2 instead of 2 because we removed the square root
                            add = true;
                            length += distToLastUsed;
                        }
                    }
                    if (add) {
                        locations.push(location);
                        lastX = x;
                        lastY = y;
                    }
                }

                let eventtype = result.eventType[0];
                let period = "0";
                if (minutes < 45) {
                    period = "1";
                } else {
                    period = "2";
                }
                let matchId = result["matchId"][0];
                if (withArrow) {
                    let playerId = result.playerId[0];

                    // if paths are long enough
                    if(locations.length>1) {
                        new MultiPathLineWithArrow(locations, time, result.videoTime[0], counter, eventtype, period, matchId, playerId).register();
                    }
                    // if not we have to set two fake coordinates to allow the drawing of an arrow
                    else{
                        let xFake: number;
                        let yFake: number;
                        for (let location of points) {
                            xFake = parseFloat(location[0])+0.5;
                            yFake = parseFloat(location[1])+0.5;
                        }
                        locations.push([xFake,yFake]);
                        new MultiPathLineWithArrow(locations, time, result.videoTime[0], counter, eventtype, period, matchId, playerId).register();
                    }
                } else {
                    new MultiPathLine(locations, time, result.videoTime[0], counter, eventtype, period, matchId).register();
                }
                counter++;
            }
        }
        // arrows are used for the off-ball activity, the events of which we do not need in the timeline
        if (withArrow) { // possibly draw containing polygons
            OffBallActivities.updatePolygonVisibility();
        } else {
            ResultList.fillTimeline(false);
        }

        //hides the analysing button
        $('#analysingBtn').addClass("invisible");
    }

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
    private static checkEventChainMerge(results,reverse: boolean): any{
        let list: any[] = [];                           //
        let results_to_delete: number[] = [];           // a list of points that will be deleted of the results
        let contained: boolean = true;                  // if this boolean is true, the function will add

        for (let i in results) {
            let oid = results[parseInt(i)][0].details[0]._id.$oid;          //
            let id = results[parseInt(i)][0].id[0];                         //
            for (let element of list) {
                let ec1: EventChain = EventMarker.getMarker(element[2]).getParentChain();
                let ec2: EventChain = EventMarker.getMarker(id).getParentChain();
                if (element[1] === oid || ec1.containsID(oid)) {         // if oid == oid same result point, or oid is already contained in the event chain
                    ec1.addChain(ec2,reverse);
                    results_to_delete.push(parseInt(i));
                }else{
                    contained = true;
                }
            }
            if(contained){
                list.push([i, oid, id]);
                contained = false;
            }
        }
        // delete all results that were merged
        for(let i: number = results_to_delete.length; i > 0; i--){
            results.splice(results_to_delete[i],1);
        }
        return results;
    }

    /**
     * This function allows the filter area to fill the filter list.
     * Every event type, player name and team name is going to be delivered.
     */
    public static getFilter(method: string): void {
        let query: string;
        let sport: string = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        // important only if matchFilterChanged
        if (method == "/getTeamUpdate") {
            let match: string = DBConnection.getMatchFilter();
            method = "/getTeams?sportFilter=" + sport;
            query = CONFIG.PROXY_ADDRESS + method + "&" + match.substr(1);
        }
        else if (method == "/getPlayerUpdate"){
            let match: string = DBConnection.getMatchFilter();
            method = "/getPlayers?sportFilter=" + sport;
            query = CONFIG.PROXY_ADDRESS + method + "&" + match.substr(1);
        }
        // regular query when loading UI
        else{
            query = CONFIG.PROXY_ADDRESS + method;
        }
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * This function allows to fill the user list in the dropdown.
     */
    public static getUsers(method: string): void {
        let query: string = CONFIG.PROXY_ADDRESS + method;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Used to delete the queries in the database or rerun them if the user clicks show
     * @param method: either "delQuery" or "rerunQuery"
     * @param queryID: the mongoDB ID of that query
     */
    public static editSavedQueries(method: string, queryID: string): void{
        let query: string = CONFIG.PROXY_ADDRESS + "/getQueries?method=" +method +"&queryID=" + queryID;
        DBConnection.sendQuery(query,method,false,[],0,false);
    }

    public static removeLastExpandFilter(): void{
        DBConnection.reverse_cascade_expandfilters.splice(-1, 1);
    }

    public static resetExpandFilterList(): void{
        DBConnection.reverse_cascade_expandfilters = [];
    }

    private static getMatchFilter(): string{
        let res = '&matchFilters={' + FilterArea.getMatchFilters() + "}";
        return res;
    }

    private static  getTeamFilter(): string{
        let res = '&teamFilters={' + FilterArea.getTeamFilters() + "}";
        return res;
    }

    private static  getPeriodFilter(): string{
        let res = '&periodFilters={' + FilterArea.getPeriodFilters() + "}";
        return res;
    }

    private static  getPlayerFilter(): string{
        let res = '&playerFilters={' + FilterArea.getPlayerFilters() + "}";
        return res;
    }

    private static  getEventFilter(): string{
        let res = '&eventFilters={' + FilterArea.getEventFilters() + "}";
        return res;
    }

    private static getSportFilter(): string{
        let res = '&sportFilter={\'sport\':' + window.location.search.substring(window.location.search.lastIndexOf("=")+1) + '}';
        return res;
    }

    public static getHighlights(): void{
        let sportfilter: string = window.location.search.substring(window.location.search.lastIndexOf("=")+1);

        let eventfilter: string = "";
        for(let i in CONFIG.HIGHLIGHT_EVENTS){
            eventfilter = eventfilter + '"' + i + '":"' + CONFIG.HIGHLIGHT_EVENTS[i] + '",'
        }
        eventfilter = eventfilter.slice(0,-1);

        let query: string = CONFIG.PROXY_ADDRESS + '/getAreaEvents?eventFilters={' + eventfilter + '}&teamFilters={}&playerFilters={}&periodFilters={}&timeFilter={}&sportFilter={"sport":' + sportfilter + '}&matchFilters={' + FilterArea.getMatchFilters() + "}";
        DBConnection.sendQuery(query, "highlightQuery", false, [], 0, false);
    }

    private static fillHighlights(json): void{
        DBConnection.fillResults(json, false, true);
    }

    /**
     * This function takes the results of the pressing analysis.
     */
    private static fillPressingPhases(json): void {
        let style:string;
        let info:string;
        let phase:Phases;
        Phases.clearPressingPhases();

        //Loops through the results (pressure phases)
        for (let i in json) {
            let stats = json[i];
            let time = stats[0]["start"];
            let start_time = DBConnection.convertMillisToTime(stats[0]["start"]);
            let end_time = DBConnection.convertMillisToTime(stats[0]["end"]);
            let duration = DBConnection.convertMillisToTime(stats[0]["duration"]);
            let video_ts = stats[0]["videoTs"];
            let teamID = stats[0]["team"];
            let matchID = stats[0]["matchId"];
            let phaseID = stats[0]["phaseId"];
            let avgPressure = stats[0]["avgPressure"];
            let minPressure = stats[0]["minPressure"];
            let maxPressure = stats[0]["maxPressure"];
            let venue = stats[0]["venue"];
            let startX = stats[0]["startX"];
            let startY = stats[0]["startY"];

            // put some information in the info variable for the hovering
            info = "Phase: "  + phaseID + "<br>" + "PI (AVG): " + avgPressure + "<br>" + "PI (MIN): "  + minPressure + "<br>" + "PI (MAX): " + maxPressure + "<br>" + "Duration: " + duration;

            // Set Color for boxes in timeline
            if (venue == "Home"){
                if(CONFIG.COLOR_TEAM_A_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }else{
                    style = "color: white; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }
            }
            else {
                if(CONFIG.COLOR_TEAM_B_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_B_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_B_STANDARD;
                }else{
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
    }

    /**
     * This function takes the results of the transition analysis.
     */
    private static fillTransitionPhases(json): void {
        let style:string;
        let info:string;
        let phase:Phases;
        Phases.clearTransitionPhases();

        //Loops through the results (transition phases)
        for (let i in json) {
            let stats = json[i];
            let time = stats[0]["start"];
            let start_time = DBConnection.convertMillisToTime(stats[0]["start"]);
            let end_time = DBConnection.convertMillisToTime(stats[0]["end"]);
            let duration = DBConnection.convertMillisToTime(stats[0]["duration"]);
            let video_ts = stats[0]["videoTs"];
            let teamID = stats[0]["team"];
            let matchID = stats[0]["matchId"];
            let phaseID = stats[0]["phaseId"];
            let venue = stats[0]["venue"];
            let startX = stats[0]["startX"];
            let startY = stats[0]["startY"];

            // put some information in the info variable for the hovering
            info = "Phase: "  + phaseID + "<br>" + "Duration: " + duration;

            // Set Color for boxes in timeline
            if (venue == "Home"){
                if(CONFIG.COLOR_TEAM_A_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }else{
                    style = "color: white; background-color: " + CONFIG.COLOR_TEAM_A_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_A_STANDARD;
                }
            }
            else {
                if(CONFIG.COLOR_TEAM_B_STANDARD != "black") {
                    style = "color: black; background-color: " + CONFIG.COLOR_TEAM_B_STANDARD + "; border-color: " + CONFIG.COLOR_TEAM_B_STANDARD;
                }else{
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
    }


    private static convertMillisToTime(ts: number): string{
        let decimal: number = (ts/1000)/60;               // timestamp comes in milliseconds, divide by 1000 and divide by 60 results in decimal minutes
            let minutes: number = Math.floor(decimal);                          // cutting away the decimal part gives the amount of minutes
            let seconds: number = Math.floor((decimal - minutes)*60);           // subtracting the amount of minutes and multiplying by 60 results in the remaining amount of seconds

            let min: string = minutes.toString();
            let sec: string = seconds.toString();

            if(minutes < 10){
                min = "0"+minutes;
            }
            if(seconds < 10){
                sec = "0"+seconds;
            }

            return min + ":" + sec;
    }

    /**
     * This function calls the server for getting the teamColors from the MongoDB
     */
    public static getTeamSettings(): void {
        let method = "/getTeamSettings";
        let match: string = 'matchFilters={' + FilterArea.getMatchFilters() + "}";
        let query: string = CONFIG.PROXY_ADDRESS + method + "?" + match;
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * This function takes the REST response and sets the teamColors new for visualization in UI
     */
    private static setTeamSettings(json): void {
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
    }

    /**
     * This function sets the teamColors back to default values from the CONFIG file
     * and updates the colors of the offballTeamLabels in the UI.
     */
    public static resetTeamSettings():void{
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
    }
}
