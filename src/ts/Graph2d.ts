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

declare var vis: any;
declare var moment: any;

class Graph2d {

    private static container: any;
    public static graph2d: any;
    public static players:any[];
    private static groups: any;
    private static itemList: any[];
    private static options: any;
    private static colorHome: any;
    private static colorAway: any;

    constructor() {
        Graph2d.container = document.getElementById('visualization2d');

        Graph2d.itemList = [];
        Graph2d.players = [];

        Graph2d.colorHome = CONFIG.COLOR_TEAM_A_STANDARD;
        Graph2d.colorAway = CONFIG.COLOR_TEAM_B_STANDARD;

        // Default configuration for the Graph2d
        // IMPORTANT: must be similar to the Timeline.ts configuration
        Graph2d.options = {
            //clickToUse: true,
            stack: false,
            height: $('.fourthrow').height(),
            width: $('.fourthrow').width(),
            min: '2020-1-1 00:00:00',
            max: '2020-1-1 01:35:00',
            start: '2020-1-1 00:00:00',
            end: '2020-1-1 01:35:00',
            zoomMax: 1000 * 60 * 60 * 24 * 31 * 12 * 5,
            zoomMin: 18000,
            orientation: 'none',
            dataAxis: {
                width: '78px',
                left: {
                    title: {
                        text: 'Default Text'
                    }
                }
            }
        };
    }

    /**
     * This function is called to update the colors for the graph2d corresponding to the team colors of the selected match
     */
    public static updateColors(): void {
        Graph2d.colorHome = CONFIG.COLOR_TEAM_A_STANDARD;
        Graph2d.colorAway = CONFIG.COLOR_TEAM_B_STANDARD;
    }

    /**
     * This function is called to fill the playerList for later usage when setting up groups for visualization of the player graph2d
     */
    public static fillPlayerList():void{
        // most parts copied from FilterArea.getPlayers() method
        let title = document.getElementById("playerfilter").getElementsByTagName("div")[0].getElementsByTagName("button")[0].title;
        if (title != "Select Player") {
            let list = title.split(", ");
            for (let i in list) {
                let player = list[i];
                this.players.push(player);
            }
        }
    }

    /**
     * This function takes the JSON result from the Server to fill the itemlist
     */
    public static fillItemList(json: JSON, method: string): void {
        let group;
        let newItem;

        for (let i in json) {
            let stats = json[i];
            let ts = stats[0]["time"];
            let venue = stats[0]["venue"];
            let time = this.convertMillisToTime(ts);
            let time_formatted = this.convertTime(time)[3];
            let player = stats[0]["player"];

            if (method == "/analyzePressing2d") {
                if (venue == "home") {
                    group = 1;
                } else {
                    group = 2;
                }
                let pressing = stats[0]["pressing"]
                newItem = {x: time_formatted, y: pressing, group: group};
            }
            else if (method == "/analyzePlayerSpeed") {
                group = player;
                let speed = stats[0]["speed"];
                newItem = {x: time_formatted, y: speed, group: group};
            }
            this.itemList.push(newItem);
        }
    }

    /**
     * This function creates and visualizes the graph2d
     */
    public static visualizeGraph2d(method:string): void {
        this.updateGraph2dOptions(method);
        Graph2d.graph2d = new vis.Graph2d(Graph2d.container, Graph2d.itemList, Graph2d.groups, Graph2d.options);
        Timeline.updateTimelineAfter2d();

        //TODO: Try to make points clickable!!!!
        /*Graph2d.graph2d.on('click', function (properties) {
            console.log("Test");// + Graph2d.graph2d.getEventProperties('value'));
        });*/

        //hides the analysing button
        $('#analysingBtn').addClass("invisible");
    }

    /**
     * This function updates the graphOptions and the group settings corresponding to the method
     */
    public static updateGraph2dOptions(method:string): void {
        if(method == "/analyzePressing2d"){
            Graph2d.options = {
                // clickToUse: true,
                stack: false,
                height: $('.fourthrow').height(),
                width: $('.fourthrow').width(),
                min: '2020-1-1 00:00:00',
                max: '2020-1-1 01:35:00',
                start: '2020-1-1 00:00:00',
                end: '2020-1-1 01:35:00',
                zoomMax: 1000 * 60 * 60 * 24 * 31 * 12 * 5,
                zoomMin: 18000,
                orientation: 'none',
                dataAxis: {
                    width: '78px',
                    left: {
                        title: {
                            text: 'Pressing Index'
                        }
                    }
                },
                legend: {
                    left:{
                        position:'top-left'
                    }
                }
            };

            Graph2d.groups = new vis.DataSet();
            Graph2d.groups.add({
                id: 1,
                content: CONFIG.TEAM_A_Name,
                className: 'graph2d',
                style: 'stroke: ' + Graph2d.colorHome,
                options: {
                    drawPoints: false,
                    interpolation: {
                        parametrization: 'centripetal'
                    }
                    /*{
                    styles: 'stroke:' + Graph2d.colorHome + ';fill:' + Graph2d.colorHome,
                    style:'circle',
                    size: 5
                }*/
                }
            });

            Graph2d.groups.add({
                id: 2,
                content: CONFIG.TEAM_B_Name,
                className: 'graph2d',
                style: 'stroke: ' + Graph2d.colorAway,
                options: {
                    drawPoints: false,
                    interpolation: {
                        parametrization: 'centripetal'
                    }
                    /*{
                    styles: 'stroke:' + Graph2d.colorAway + ';fill:' + Graph2d.colorAway,
                    style: 'circle',
                    size: 5
                }*/
                }
            });
        }
        else if (method == "/analyzePlayerSpeed"){
            Graph2d.options = {
               // clickToUse: true,
                stack: false,
                height: $('.fourthrow').height(),
                width: $('.fourthrow').width(),
                min: '2020-1-1 00:00:00',
                max: '2020-1-1 01:35:00',
                start: '2020-1-1 00:00:00',
                end: '2020-1-1 01:35:00',
                zoomMax: 1000 * 60 * 60 * 24 * 31 * 12 * 5,
                zoomMin: 18000,
                orientation: 'none',
                dataAxis: {
                    width: '78px',
                    left: {
                        title: {
                            text: 'Speed [km/h]'
                        }
                    }
                },
                legend: {
                    left:{
                        position:'top-left'
                    }
                }
            };

            let colors = ['#e5524a','#187fce','#008d68','#ffa800','#7b457b','#e5524a','#187fce','#008d68','#ffa800','#7b457b','#e5524a'];
            Graph2d.groups = new vis.DataSet();

            // create groups dynamically
            for (let i in this.players){
                let id = this.players[i].match(/\[(.*?)\]/)[1].split(":")[1];
                let name = this.players[i].split("[")[0];

                Graph2d.groups.add({
                    id: id,
                    content: name,
                    className: 'graph2d',
                    style: 'stroke: ' + colors[i],
                    options: {
                        drawPoints: false,
                        interpolation: {
                            parametrization: 'centripetal'
                        }
                    }
                });
            }
        }
    }

    /**
     * This function converts the ts (in ms) into the min:sec format for further processing
     */
    private static convertMillisToTime(ts: any): string {
        let decimal: number = (ts / 1000) / 60;               // timestamp comes in milliseconds, divide by 1000 and divide by 60 results in decimal minutes
        let minutes: number = Math.floor(decimal);                          // cutting away the decimal part gives the amount of minutes
        let seconds: number = Math.floor((decimal - minutes) * 60);           // subtracting the amount of minutes and multiplying by 60 results in the remaining amount of seconds

        let min: string = minutes.toString();
        let sec: string = seconds.toString();

        if (minutes < 10) {
            min = "0" + minutes;
        }
        if (seconds < 10) {
            sec = "0" + seconds;
        }

        return min + ":" + sec;
    }

    /**
     * This function converts the min:sec format into the specific format of the graph2d timeline which allows the visualization.
     */
    private static convertTime(time: string): any[] {
        let times = time.split(":");
        let mins = times[0];
        let secs = times[1];

        let i_mins = parseInt(times[0]);
        // let i_secs = parseInt(times[1]);

        // not needed -> football match time is always in minutes
        let hours = "00";
        if (i_mins > 59) {
            hours = "01";
            i_mins = i_mins - 60;
            mins = i_mins.toString();
        }

        let formatted = "2020-1-1 " + hours + ":" + mins + ":" + secs;
        return [hours, mins, secs, formatted];
    }

    /**
     * This function is called after the matchFilter changed and deletes the content of the itemlist, the playerlist and the last graph2d
     */
    public static clearItemList(): void {
        Graph2d.itemList = [];
        Graph2d.players = [];

        // remove old content in graph2d visualization
        let div = document.getElementById('visualization2d');
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        if(document.getElementById("playerSpeedBtn").innerHTML=='Deactivate Speed Analysis'){
            document.getElementById("playerSpeedBtn").innerHTML='Speed Analysis';
            Timeline.resetTimelineAfter2d();
        }
    }
}

