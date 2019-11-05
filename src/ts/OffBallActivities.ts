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

class OffBallActivities {

    private static slider1: any;
    private static slider2: any;

    private static playerOptions: string[];

    public static playerFilter: any;
    public static teamCheckBoxA: any;
    public static teamCheckBoxB: any;

    public static isActive: boolean;
    public static teamAIsActive: boolean;
    public static teamBIsActive: boolean;
    public static ballIsActive: boolean;
    public static polygonIsActive: boolean;

    public static currentEvent: EventChain = undefined;

    constructor() {
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
    public static triggerOffBallActivities(): void {
        OffBallActivities.isActive = !OffBallActivities.isActive;
        $('.offball-toggle').toggle(); // hides / shows the gui of the off-ball activities

        // if the off-ball activities are activated, we want it to retrieve the motion paths from the database
        if (OffBallActivities.isActive) {
            OffBallActivities.nextQuery();
        } else {
            OffBallActivities.clear();
        }

        OffBallActivities.updateAreaSelections();
        OffBallActivities.updatePolygonVisibility();

        // apply correct colors / grey out non-selected events
        EventChain.updateChainColors();
    }

    /**
     * This method is called whenever the "Display bounding boxes" checkbox is toggled.
     */
    public static triggerPolygonSelection(): void {
        OffBallActivities.polygonIsActive = !OffBallActivities.polygonIsActive;
        OffBallActivities.updatePolygonVisibility();
    }

    /**
     * This method decides whether bounding polygons should be drawn and either draws or deletes them.
     */
    public static updatePolygonVisibility(): void {
        if (OffBallActivities.isActive && OffBallActivities.polygonIsActive) {
            BoundingBox.drawPolygons();
        } else {
            BoundingBox.clearPolygons();
        }
        DrawingArea.field.renderAll();
    }

    /**
     * This method is called whenever the "Ball" checkbox is toggled.
     */
    public static triggerBallSelection(): void {
        OffBallActivities.ballIsActive = !OffBallActivities.ballIsActive;
        OffBallActivities.updatePlayerSelection();
        OffBallActivities.updatePolygonVisibility();
    }
    /**
     * This method is called whenever the "Team A" checkbox is toggled.
     */
    public static triggerTeamASelection(): void {
        OffBallActivities.teamAIsActive = !OffBallActivities.teamAIsActive;
        OffBallActivities.updatePlayerSelection();
        OffBallActivities.updatePolygonVisibility();
    }
    /**
     * This method is called whenever the "Team B" checkbox is toggled.
     */
    public static triggerTeamBSelection(): void {
        OffBallActivities.teamBIsActive = !OffBallActivities.teamBIsActive;
        OffBallActivities.updatePlayerSelection();
        OffBallActivities.updatePolygonVisibility();
    }

    /**
     * This method goes through all players in the player filter and decides whether the player should be selected or not
     * based on the states of the team and ball checkboxes.
     */
    private static updatePlayerSelection(): void {
        let selection: string[] = [];
        for (let playerOption of this.playerOptions) { // going through the list of players
            let i: number = playerOption.indexOf(" [ID:");
            if (i >= 0) {
                let teamChar: string = playerOption.substr(i+5, 1); // extracting the team char from the id
                if (OffBallActivities.teamAIsActive && (teamChar == "A" || teamChar == "C")) { // this player belongs to theam A
                    selection.push(playerOption);
                }
                if (teamChar == "B" || teamChar == "D") { // either this player belongs to team B or it is the ball
                    if (playerOption.substr(i+5, 4) == "BALL") { // we only take the ball into selection if ball button is active
                        if (OffBallActivities.ballIsActive) {
                            selection.push(playerOption);
                        }
                    } else { // it's a player and not the ball
                        if (OffBallActivities.teamBIsActive) {
                            selection.push(playerOption);
                        }
                    }
                }
            }
        }
        OffBallActivities.playerFilter.selectpicker('val', selection);
        OffBallActivities.nextQuery();
    }

    /**
     * Clears the event selection in the off-ball activities and clears the motion paths from the field.
     */
    public static clear(): void {
        OffBallActivities.currentEvent = EventChain.active_chain;
        MultiPathLineWithArrow.clearLines();
    }

    /**
     * This method either shows or hides the area selection of the event query.
     */
    private static updateAreaSelections() {
        // do we show or hide the elements?
        let color: string = OffBallActivities.isActive && OffBallActivities.currentEvent != undefined ? CONFIG.COLOR_INVISIBLE : CONFIG.COLOR_SELECTION;

        for (let object of DrawingArea.active_objects) { // going through all area selection elements
            if (object.type == "rectangle") {
                let rectangle: Rectangle = object as Rectangle;
                rectangle.rect.set('stroke', color);
            } else if (object.type == "circle") {
                let circle: Circle = object as Circle;
                circle.circle.set('stroke', color);
            } else if (object.type == "polygon") {
                let polygon: Polygon = object as Polygon;
                polygon.poly.set('stroke', color);
            }
        }
    }

    /**
     * Requesting updated motion paths from the database.
     */
    public static nextQuery(): void {
        if (OffBallActivities.isActive && OffBallActivities.currentEvent != null) {
            DBConnection.offBallMotionPath();
        }
    }

    /**
     * This method is called whenever one of the beams of the time slider is moved.
     */
    public static sliderChanged(): void {
        let seconds1 = OffBallActivities.slider1.value;
        let seconds2 = OffBallActivities.slider2.value;
        let secondsMin = Math.min(seconds1, seconds2);
        let secondsMax = Math.max(seconds1, seconds2);

        let secondsTextMax = Math.abs(secondsMax) == 1 ? "second" : "seconds";
        $('#offball_info').text(secondsMin + " to " + secondsMax + " " + secondsTextMax); // updating text in gui

        if (OffBallActivities.isActive) {
            OffBallActivities.nextQuery();
        }
    }

    /**
     * This method is called whenever a beam of the time slider has been moved and mouse has been released.
     */
    public static sliderSet() : void {
        //OffBallActivities.nextQuery();
    }

    /**
     * Fills the players from the database into the player filter area.
     * This method mirrors the method FilterArea.fill() in structure and methodology.
     */
    public static fill(json: any, method: string): void {
        if (method == "/getPlayers") {
            this.playerOptions = [];

            let balloptiontext: string = "Ball movement [ID:BALL]";
            this.playerOptions.push(balloptiontext);
            OffBallActivities.playerFilter.append(new Option(balloptiontext));

            for (let i in json.result) {
                let optiontext: string = json.result[i].name + " [ID:" + json.result[i].pid + "]";
                this.playerOptions.push(optiontext);
                OffBallActivities.playerFilter.append(new Option(optiontext));
            }
        }
    }

    /**
     * Constructs the filters for the motion path query based on selected options.
     */
    public static getFilterQuery(): string {
        let sportFilter: string = window.location.search.substr(1).split('=')[1];

        let res: string = '&eventFilters={' + '' + "}";
        res += '&teamFilters={' + '' + "}";
        res += '&playerFilters={' + OffBallActivities.getPlayerFilters() + "}";
        res += '&periodFilters={' + '' + "}";
        res += '&timeFilter={' + OffBallActivities.getTimeFilter() + '}';
        res += '&sportFilter={' + "'sport':" + sportFilter + "}";
        res += '&matchIDFilter=' + OffBallActivities.getCurrentEventMatchID();
        res += '&minPathLength={"true"}';
        return res;
    }

    /**
     * This function returns the selected player filter/filters.
     * @returns the filters for all selected players or the filter for the ball, if no player is selected
     */
    private static getPlayerFilters(): string {
        let title = document.getElementById("offball_playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Player filter") {
            let res = "";
            let list = title.split(", ");
            for (let i in list) {
                let id = list[i].match(/\[(.*?)\]/)[1].split(":")[1];
                res += "filter" + i + ":" + id + ",";
            }
            return res.substring(0, res.length - 1);
        } else {
            return "";
        }
    }

    /**
     * This method returns the selected time interval of the time slider around the time of the selected event in milliseconds.
     */
    private static getTimeFilter(): string {
        let t0 = OffBallActivities.getTime(); // time of selected event
        let t1 = t0 + OffBallActivities.slider1.value * 1000;
        let t2 = t0 + OffBallActivities.slider2.value * 1000;

        if (t1 < t2){
            return '"min":"' + t1 + '","max":"' + t2 + '"';
        } else {
            return '"min":"' + t2 + '","max":"' + t1 + '"';
        }
    }

    /**
     * Get the time of the selected event in milliseconds.
     */
    private static getTime(): number {
        let milliseconds : number = 0;

        if (OffBallActivities.currentEvent !== null) {
            let timeSlices : string[] = OffBallActivities.currentEvent.time.split(":");
            let mins : number = parseInt(timeSlices[0]);
            let secs : number = parseInt(timeSlices[1]);
            milliseconds = (mins * 60 + secs) * 1000;
        }

        return milliseconds;
    }

    /**
     * This method sets the selected event. It is called whenever an event is clicked.
     * @param ec selected event
     */
    public static registerActiveEventChain(ec : EventChain): void {
        OffBallActivities.currentEvent = ec;
        OffBallActivities.nextQuery();

        OffBallActivities.updateAreaSelections();

        // currently not needed
        /*
        if (OffBallActivities.currentEvent != undefined) {
            OffBallActivities.showEventInfo(ResultList.getResult(OffBallActivities.currentEvent.getID()));
        }*/
    }

    /**
     * This method displays some basic info about the selected event like time, type and involved players.
     * @param result
     */
    public static showEventInfo(result: Result): void {
        if (result != null) {
            let text: string = "";
            text += "<p>Time: " + result.getTime() + "</p>";
            text += "<p>Type: " + result.getEventType() + "</p>";
            text += "<p>Involved players: ";
            let first: boolean = true;
            for (let playerId of result.getPlayerIds()) { // going through all involved players
                if (!first) { text += ", "; } // we separate the player names with commas
                let playerTeam: string = playerId.substr(0,1);
                let color: string = playerTeam == "A" || playerTeam == "C" ? CONFIG.COLOR_TEAM_A_STANDARD : CONFIG.COLOR_TEAM_B_STANDARD;
                text += '<span style="color: '+color+';">' + OffBallActivities.findPlayerName(playerId) + '</span>';
                first = false;
            }
            text += "</p>";
            $("#event_summarizer").html(text);
        }
    }

    /**
     * Get corresponding player name from player id.
     * @param id to get name for
     */
    private static findPlayerName(id: string): string {
        for (let player of OffBallActivities.playerOptions) {// going through all players to get names from corresponding ids
            let i = player.indexOf(id); // searching for occurence of player id in name string
            if (i >= 5) {
                return player.substr(0,i-5); // player names look like this: 'Muster [ID:A1]', so we have to cut away the id part
            }
        }
        return id;
    }

    /**
     * Get the matchID of the selected event
     */
    private static getCurrentEventMatchID():string {
        return this.currentEvent.matchId;
    }
}
