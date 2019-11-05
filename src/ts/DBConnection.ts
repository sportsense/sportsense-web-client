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
    public static analysisOn: boolean = false;
    public static eventIDs: string[] = []; //All events IDs from the event Cascade get added to this array, when clear then clear it, when save then send it to server and clear it
    public static normalEventIDs: string[] = [];


    /**
     * This function checks the button state and starts the according query.
     */
    public static nextQuery(filterName?: string): void {
        if (filterName){
            DBConnection.filterName = filterName;
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
     * highlightQuery: When use clikcs on match they see the most important events as point as well as the phases in the timeline
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

        //console.log(query);
        let xhttp = new XMLHttpRequest();
        //function gets called when the ready state changes. It goes from 0 to 4. 4 means request finished and response is ready
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let json = JSON.parse(xhttp.responseText);

                if (DBConnection.filterName != undefined || method =="/saveEventCascade") {
                    DBConnection.querySaved("Query Saved");
                    if (all_ids.length != 0){
                        DBConnection.filterName = all_ids[0];
                    }
                    SaveQuery.addSavedQuery(DBConnection.filterName, json);
                    DBConnection.filterName = undefined;
                } else if (method == "delQuery"){
                    DBConnection.querySaved("Query Deleted");
                } else if (method == "rerunQuery"){
                    DBConnection.fillResults(json,cascade,false);
                } else if (method == "shapeQuery") {
                    DBConnection.fillResults(json, cascade, false);
                } else if (method == "ecQuery") {
                    DBConnection.fillECResult(json, all_ids, reverse);
                } else if(method == "mpQuery") {
                    //console.log(query);
                    DBConnection.fillMPResult(json, false);
                } else if(method == "mpQueryWithArrows") {
                    console.log(query);
                    DBConnection.fillMPResult(json, true);
                }else if(method == "highlightQuery"){
                    DBConnection.fillHighlights(json);
                } else if (method == "/analyzePlayers"){
                    Analysis.analyzePlayers(json);
                } else if (method == "/analyzeQueries"){
                    Analysis.showQueryGraphs(json);
                } else if (method == "/getQueries"){
                    if (DBConnection.analysisOn == false){
                        SaveQuery.fillQueries(json);
                    } else { //We want the queries for the analyzeQuery Window
                        Analysis.fillQuerySelection(json);
                        DBConnection.analysisOn = false;
                    }
                } else if (method == "/getPlayers" && DBConnection.analysisOn == true){
                    //Fills the players in the player analysis Selection
                    Analysis.fillSelection(json);
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
     * Calls the Server with the players to analyze and which parameters
     * @param playerIDArray
     * @param paramArray
     */
    public static analyzePlayers(playerIDArray: string[], paramArray: string[]){
        let method = "/analyzePlayers";
        let query: string = CONFIG.PROXY_ADDRESS + method + "?players=" + playerIDArray + "&parameters=" + paramArray;
        //console.log(query);
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
        //console.log(query);
        DBConnection.sendQuery(query, method, false, [], 0, false);
    }

    /**
     * Generates an alert for 2.5 seconds that the query has been saved/deleted
     * @param output
     */
    private static querySaved(output: string){
        let x = document.getElementById('saved'); //Make the saved alert appear
        x.innerText = output;
        x.style.display = "table";

        setTimeout(function () {
            x.style.display = "none";
        }, 2500); //Waits 2.5 seconds to remove the alert again
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
            //console.log(finalquery);
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
            let sportfilter: string = window.location.search.substr(1).split('=')[1];
            let filters: string = '&eventFilters={' + expandfilters + "}&teamFilters={}&playerFilters={}&periodFilters={}&sportFilter={'sport':" + sportfilter + "}&matchFilters={}&timeFilter={}";
            let finalquery = CONFIG.PROXY_ADDRESS + "/getEventCascade" + tsquery + geofiltersquery + filters;
            //console.log(finalquery);
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

    public static resetEventCascadeQueryArray(): void{
        DBConnection.eventIDs = [];
    }

    public static saveEcQuery(queryName: string): void{
        let method: string = "/saveEventCascade";
        let eventIds: string[] = [];
        for (let em of DBConnection.active_eventmarkers){
            eventIds.push(em.markerid);
        }
        let query: string = CONFIG.PROXY_ADDRESS + method + "?eventIds=" + eventIds +"&queryName=" + queryName;
        console.log(query);
        DBConnection.sendQuery(query, method, false, [queryName], 0, false);
    }

    public static saveNormalQuery(queryName: string): void{
        let method: string = "/saveEventCascade";
        let query: string = CONFIG.PROXY_ADDRESS + method + "?eventIds=" + DBConnection.eventIDs +"&queryName=" + queryName;
        console.log(query);
        DBConnection.sendQuery(query, method, false, [queryName], 0, false);
    }

    /**
     * This function takes the REST response of a forward event cascade and fills the delivered data into the result list and into the drawing area.
     */
    private static fillECResult(json, all_ids: string[],reverse: boolean): void {
        let used_ids: string[] = [];
        let counter = 1;
        ResultList.clearResultList();
        // check if returned json is not empty
        if(Object.keys(json).length > 0) {
            let results = json.result;
            //results = DBConnection.checkEventChainMerge(results, reverse);
            for (let result of results) {
                let id = result[0].id[0];
                //console.log("ID: " + id);

                //This is if the user would save the query then we save all the event IDs
                if (DBConnection.eventIDs.indexOf(id) == -1) {  //check whether an eventID is already present in the array
                    DBConnection.eventIDs.push(id);
                }

                used_ids.push(id);
                let ec = EventChain.searchEventMarkerID(id);
                let location = result[0].details[0].xyCoords[0];
                //console.log("location: " + location + " ID: " + id);
                let new_id: string = result[0].details[0]._id.$oid;
                let players = result[0].details[0]["playerIds"];

                // if reverse event cascade the time of the EventChain has to be changed (start point is earlier)
                // if forward event cascade the time of the EventChain can be reused
                let time_formatted;
                let period = "0";
                let time1min = 0;
                let eventtype;
                if (reverse) {
                    eventtype = "Reverse event cascade";
                    let videotime: number = result[0].details[0].videoTs;
                    let decimal: number = (result[0].details[0].ts / 1000) / 60;
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

            //console.log("Calculation okay !");
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
                    new MultiPathLineWithArrow(locations, time, result.videoTime[0], counter, eventtype, period, matchId, playerId).register();
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

    private static  getMatchFilter(): string{
        let res = '&matchFilters={' + FilterArea.getMatchFilters() + "}";
        return res;
    }

    public static getHighlights(): void{
        let sportfilter: string = window.location.search.substr(1).split('=')[1];

        let eventfilter: string = "";
        for(let i in CONFIG.HIGHLIGHT_EVENTS){
            eventfilter = eventfilter + '"' + i + '":"' + CONFIG.HIGHLIGHT_EVENTS[i] + '",'
        }
        eventfilter = eventfilter.slice(0,-1);

        let query: string = CONFIG.PROXY_ADDRESS + '/getAreaEvents?eventFilters={' + eventfilter + '}&teamFilters={}&playerFilters={}&periodFilters={}&timeFilter={}&sportFilter={"sport":' + sportfilter + '}&matchFilters={' + FilterArea.getMatchFilters() + "}";
        DBConnection.sendQuery(query, "highlightQuery", false, [], 0, false);
    }

    private static fillHighlights(json): void{

        // For future purposes: if there are any dominance or other kind of phases detected
        /*for(let d of json.matchDetails[0].phases){
            let start = DBConnection.convertMillisToTime(parseInt(d.start));
            let end = DBConnection.convertMillisToTime(parseInt(d.end));
            let text = d.phase
            Timeline.addHighlight(start,end,text,2)
        }
        for(let d of json.matchDetails[0].dominance){
            let start = DBConnection.convertMillisToTime(parseInt(d.start));
            let end = DBConnection.convertMillisToTime(parseInt(d.end));
            let text = d.team
            Timeline.addHighlight(start,end,text,3)
        }
        */
        DBConnection.fillResults(json, false, true);
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
}
