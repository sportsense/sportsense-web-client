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

declare var Chart: any;
declare var h337: any;
declare var heatmapInstance: any;

//declare var noUiSlider: any;
//import  * as noUiSlider from "nouislider";

class Analysis {

    private static playerSelection;

    // needed for the visualization in the UI
    private static parameterDict = {
        "gamesPlayed" : "Games Played",
        "gamesWon" : "Games Won",
        "gamesLost" : "Games Lost",
        "gamesDrawn" : "Games Drawn",
        "winPercentage" : "Win Percentage [%]",
        "successfulPassEvent" : "Successful Passes",
        "misplacedPassEvent" : "Misplaced Passes",
        "passAccuracy" : "Passing Accuracy [%]",
        "longPasses" : "Long Passes",
        "shortPasses" : "Short Passes",
        "avgPassLength" : "Avg Pass Length [m]",
        "avgPassVelocity" : "Avg Pass Velocity [km/h]",
        "avgPacking" : "Avg Packing",
        "leftPasses" : "Passes Left",
        "rightPasses" : "Passes Right",
        "forwardPasses" : "Passes Forward",
        "backwardPasses" : "Passes Backward",
        "goalEvent" : "Goals",
        "totalShots" : "Total Shots",
        "shotOnTargetEvent" : "Shots on Target",
        "shotOffTargetEvent" : "Shots off Target",
        "avgShotLength" : "Avg Shot Length [m]",
        "avgShotVelocity" : "Avg Shot Velocity [km/h]",
        "DribblingStatistic" : "Dribblings",
        "interceptionEvent" : "Interceptions",
        "clearanceEvent" : "Clearances",
        "totalUnderPressurePhases": "Under Pressing Phases",
        "avgUnderPressurePhasesPerGame": "Under Pressing Phases per Game",
        "avgUnderPressureIndex" : "Average Pressing exposed [Pressing-Index]",
        "totalPressurePhases": "Pressing Phases",
        "avgPhasesPerGame": "Pressing Phases per Game",
        "avgPressureIndex" : "Average Pressing exerted [Pressing-Index]",
        "timeSpeedZone1" : "Spent time [in s] standing [< 1 km/h]",
        "timeSpeedZone2" : "Spent time [in s] walking [1.1-11 km/h]",
        "timeSpeedZone3" : "Spent time [in s] jogging [11.1-14 km/h]",
        "timeSpeedZone4" : "Spent time [in s] running [14.1-17 km/h]",
        "timeSpeedZone5" : "Spent time [in s] sprinting [17.1-24 km/h]",
        "timeSpeedZone6" : "Spent time [in s] at maximum speed [> 24 km/h]",
        "totalTouches" : "Touches",
        "cornerkickEvent" : "Cornerkicks",
        "throwinEvent" : "Throwins",
        "freekickEvent" : "Freekicks",
        "playerFoulsEvent" : "Fouls committed",
        "playerGetFouledEvent" : "Fouls against",
        "teamFoulsEvent" : "Fouls committed",
        "teamGetFouledEvent" : "Fouls against",
        "transitionsOffensive" : "Transitions DEF-OFF per Game",
        "transitionsDefensive" : "Transitions OFF-DEF per Game",
        "successfulTakeOnEvent" : "Successful Take Ons",
        "failedTakeOnEvent" : "Failed Take Ons",
        "playerOn" : "Substitutions (In)",
        "playerOff" : "Substitutions (Out)",
        "subsPerGame" : "Substitutions per Game",
        "dumpEvent" : "Dumps",
        "entryEvent" : "Entries",
        "shiftEvent" : "Shifts",
        "faceOffEvent" : "Face Offs",
        "shotAtGoalEvent" : "Shots at Goal",
        "penaltyEvent" : "Penalties",
        "stickhandlingEvent" : "Stickhandlings"
    };

    public static initialiseHeatmap() {
        heatmapInstance = undefined;
    }

    //TODO: Fix Heatmap Issue
    public static clearHeatmap() {
        try {
            var canvas = heatmapInstance._renderer.canvas;
            $(canvas).remove();
            heatmapInstance.undefined;
        }
        catch{
            console.log("heatmap issue!");
        }
    }

    /**
     * This function is called when displaying the heatmap for the entry events
     * **/
    public static entryHeatmap(json) {
        let count = 0;
        for (let i in json.result[0]) {
            count++;
        }
        heatmapInstance = h337.create({
            container: document.getElementById('field-container'),
            radius: 30,
        });

        heatmapInstance.setData({data: []});
        //heatmapInstance.clear();

        var points = [];

        for (let object of json.result[0]) {
            let coords = object.details[0].xyCoords;
            let canvasCoords = DrawingArea.dbToCanvasCoordinates(coords[0][0], coords[0][1]);
            let x = Number(canvasCoords[0]);
            let y = Number(canvasCoords[1]);
            var point = {x: Math.round(x), y: Math.round(y), value: 5};
            points.push(point);
        }
        //let temp = {x: 420, y: 300, value: 100};
        //points.push(temp);
        var data = {
            min: 1,
            max: count,
            data: points
        };

        heatmapInstance.setData(data);
    }

    public static openNewTab(analysis: string) {
        let link = window.location.href;
        link = link.substr(0, link.lastIndexOf("/"));
        let user_link = "?user=" + document.getElementById('userMenu').textContent;
        let sportLink = "&discipline=" + window.location.search.substring(window.location.search.lastIndexOf("=")+1);

        switch (analysis) {
            case "teamAnalysis": {
                link = link + "/teamAnalysis.html" + user_link.trim() + sportLink;
                break;
            }
            case "playerAnalysis": {
                link = link + "/playerAnalysis.html" + user_link.trim() + sportLink;
                break;
            }
            case "queryAnalysis":{
                link = link + "/queryAnalysis.html" + user_link.trim() + sportLink;
                break
            }
            default:{
                console.log("invalid choice " + analysis);
                break;
            }
        }
        window.open(link);
    }

    //creates the player and team name cards on the top from the cards array
    public static setCards(cards){
        $('.players-g').html('');
        for (let i = 0; i < Object.keys(cards).length; i++){
            $('.players-g').append('<div class="card-g" data-name="'+Object.keys(cards)[i]+'"><div class="name-g">'+Object.keys(cards)[i]+'</div></div>');
            //console.log(Object.keys(cards)[i]);
        }

        $('.teams-g').html('');
        for (let i = 0; i < Object.keys(cards).length; i++){
            $('.teams-g').append('<div class="card-g" data-name="'+Object.keys(cards)[i]+'"><div class="name-g">'+Object.keys(cards)[i]+'</div></div>');
            //console.log(Object.keys(cards)[i]);
        }
    }

    //creates the rows of graphs from the parameter array
    public static setRows(param){
        $('.rows-g').html('');
        for(let i = 0; i < param.length; i++) {
            $('.rows-g').append('<div class="row-name">'+ this.getParameterNames(param[i].toString()) +'</div><div class="row-g" data-i="'+param[i]+'"></div>');
        }
    }

    //creates all the graphs in all the rows
    public static setBars(cards, param, colors){
        $('.row-g').html('');
        for(let i = 0; i < param.length; i++) {
            for(let p = 0; p < Object.keys(cards).length; p++) {
                $('.row-g[data-i="'+ param[i] +'"]').append('                  <div class="bar-g" data-o="'+ Object.keys(cards)[p] +'" data-value="'+cards[Object.keys(cards)[p]][i]+'" style="background-color:'+colors[p][0]+';"><div class="fill-g" style="background-color:'+colors[p][1]+';"><div class="value-g">'+cards[Object.keys(cards)[p]][i]+'</div></div></div>');
            }
        }
        Analysis.updateBars();
    }

    //makes the graphs display the data correctly and should be used in conjunction with setBars()
    public static updateBars(){
        $('.row-g').each(function() {
            let n = $(this).find('.bar-g');
            let values = [];

            $(n).each(function() {
                values.push($(this).data('value'));
            });
            let highest = Math.max(...values);

            $(n).each(function() {
                let height = 100-($(this).data('value')/highest*100);
                if (height > 100){
                    height = 100;}

                $(this).find('.fill-g').css('height', height + '%');
            })
        })
    }

    public static updateGraph(cards, param){
        this.setCards(cards);
        this.setRows(param);
        this.setBars(cards,param, Analysis.colors);
    }

    public static colors = [['#e5524a','#ee8b86'],['#187fce','#74b2e2'],['#008d68','#66bba4'],['#ffa800','#ffcb66'],['#7b457b','#b08fb0'], ['#e5524a','#ee8b86'],['#187fce','#74b2e2'],['#008d68','#66bba4'],['#ffa800','#ffcb66'],['#7b457b','#b08fb0'],['#e5524a','#ee8b86']];

    /**
     * Calls the method that creates the graphs
     * @param json
     */
    public static analyzePlayers(json){
        let parameterArray = $('select#param_select').val();
        let playersAndStats = "";

        let b = 0;
        for(let i in json){ //Loops through the players stats

            let stats = json[i];
            let pName = $("#player_select option:selected[value = "+i+"]").text();  //Selects the player with the ID as value.

            let combined = "";
            //So we don't have the comma after the last element
            if (b === ( $("#player_select option:selected").length -1)){
                combined = '"' + pName + '":['+stats+']';
            } else {
                combined = '"' + pName + '":['+stats+'],';
            }

            playersAndStats += combined;
            b++
        }

        // terminates the loading button
        document.getElementById("playerAnalysisButton").innerHTML= "Analyze";

        let jsonCards = "{"+playersAndStats+"}";
        let cards = JSON.parse(jsonCards);
        this.updateGraph(cards,parameterArray);
    }

    /**
     * Calls the method that creates the graphs
     * @param json
     */
    public static analyzeTeams(json){
        let parameterArray = $('select#team_param_select').val();
        let teamsAndStats = "";

        let b = 0;
        for(let i in json){ //Loops through the teams stats
            let stats = json[i];
            let tName = $("#team_select option:selected[value = "+i+"]").text();  //Selects the team with the ID as value.

            let combined = "";
            //So we don't have the comma after the last element
            if (b === ( $("#team_select option:selected").length -1)){
                combined = '"' + tName + '":['+stats+']';
            } else {
                combined = '"' + tName + '":['+stats+'],';
            }

            teamsAndStats += combined;
            b++
        }

        // terminates the loading button
        document.getElementById("teamAnalysisButton").innerHTML= "Analyze";

        let jsonCards = "{"+teamsAndStats+"}";
        let cards = JSON.parse(jsonCards);
        this.updateGraph(cards,parameterArray);
    }

    //Analyzes the players
    public static analyzeP(){
        if(($('select#player_select').val() == "") || ($('select#param_select').val() == "")){
            $('#error-playermodal-text').text("You have to select at least one player and one parameter for the Player Analysis.");
            $("#errorPlayerModal").modal();
            return;
        }
        else{
            // activate loading button
            document.getElementById("playerAnalysisButton").innerHTML='<i class="fa fa-circle-o-notch fa-spin"></i> Analysing...';

            let playerIdArray = $('select#player_select').val();
            let parameterArray = $('select#param_select').val();
            let matchArray = $('select#match_select').val();
            let user = window.location.search.substr(1).split('=')[1];

            //For some names in the Selection, there were duplicates, this removes them.
            let playerIdArrayWithoutDuplicates = playerIdArray.filter(function (item, pos) {
                return playerIdArray.indexOf(item) == pos;
            });

            DBConnection.analyzePlayers(user, playerIdArrayWithoutDuplicates, parameterArray, matchArray);
        }
    }

    //Analyzes the teams
    public static analyzeT(){
        if(($('select#team_select').val() == "") || ($('select#team_param_select').val() == "")){
            $('#error-teammodal-text').text("You have to select at least one team and one parameter for the Team Analysis.");
            $("#errorTeamModal").modal();
            return;
        }
        else {
            // activate loading button
            document.getElementById("teamAnalysisButton").innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i> Analysing...';

            let teamIdArray = $('select#team_select').val();
            let parameterArray = $('select#team_param_select').val();
            let matchArray = $('select#match_select').val();
            let user = window.location.search.substr(1).split('=')[1];

            DBConnection.analyzeTeams(user, teamIdArray, parameterArray, matchArray);
        }
    }

    public static getParameterNames(key): string {
        return this.parameterDict[key];
    }

    public static showQueryGraphs(json) {
        let queryLabels = [];
        let chartType;

        if ($('#chartToggler').is(":checked")) {
            chartType = 'bar';
        } else {
            chartType = 'line';
        }

        let successfulPassData = {
            label: 'Successful Passes',
            data: [],
            yAxisID: "quantity"
        };

        let passPercentageData = {
            label: 'Pass Accuracy (%)',
            data: [],
            yAxisID: "percentage"
        };

        let avgPassLengthData = {
            label: 'Avg. Length (m)',
            data: [],
            yAxisID: "length"
        };

        let avgPassVelocityData = {
            label: 'Avg. Velocity (km/h)',
            data: [],
            yAxisID: "velocity"
        };

        let maxPassLengthData = {
            label: 'Max Length (m)',
            data: [],
            yAxisID: "length"
        };

        let maxPassVelocityData = {
            label: 'Max Velocity (km/h)',
            data: [],
            yAxisID: "velocity"
        };

        let avgPackingData = {
            label: 'Avg Packing',
            data: [],
            yAxisID: "packing"
        };
        let avgLength = 'Avg. Length (m)';
        let avgVelocity = 'Avg. Velocity (km/h)';
        let maxLength = 'Max Length (m)';
        let maxVelocity = 'Max Velocity (km/h)';
        let qty = "quantity";

        let forwardPassData = new Graph('Forward', qty);
        let backwardPassData = new Graph('Backward', qty);
        let leftPassData = new Graph('Left', qty);
        let rightPassData = new Graph('Right', qty);

        let misplacedAvgPassLengthData = new Graph(avgLength, "length");
        let avgMisplacedPassVelocityData = new Graph(avgVelocity, "velocity");
        let misplacedPassBackwardData = new Graph("Backward", qty);
        let misplacedPassForwardData = new Graph("Forward", qty);
        let misplacedPassLeftData = new Graph("Left", qty);
        let misplacedPassRightData = new Graph("Right", qty);
        let misplacedPassEventsData = new Graph("Misplaced Passes", qty);
        let maxMisplacedLengthData = new Graph(maxLength, "length");
        let maxMisplacedVelocityData = new Graph(maxVelocity, "velocity");

        let overThirtyPassesData = new Graph("Over 30 m", "length");
        let underSevenPassesData = new Graph("Under 7 m", "length");
        let sevenToFifteenPassesData = new Graph("7 - 15 m", "length");
        let fifteenToThirtyPassesData = new Graph("15 - 30 m", "length");
        let MPoverThirtyPassesData = new Graph("Over 30 m", "length");
        let MPunderSevenPassesData = new Graph("Under 7 m", "length");
        let MPsevenToFifteenPassesData = new Graph("7 - 15 m", "length");
        let MPfifteenToThirtyPassesData = new Graph("15 - 30 m", "length");

        let totalShotsData = new Graph("Total Shots", qty);
        let shotsOnTargetData = new Graph("Shots on Target", qty);
        let goalsData = new Graph("Goals", qty);

        let avgShotLenData = new Graph(avgLength, "length");
        let avgShotVelData = new Graph(avgVelocity, "velocity");
        let maxShotLenData = new Graph(maxLength, "length");
        let maxShotVelData = new Graph(maxVelocity, "velocity");

        //Interceptions
        let interceptionsData = new Graph("Interceptions", qty);

        //Clearance
        let avgClearanceLengthData = new Graph(avgLength, "length");
        let clearanceEventsData = new Graph("Clearances", qty);

        //corners
        let cornerkickEventsData = new Graph("Cornerkicks", qty);

        //freekicks
        let freekicksData = new Graph("Freekicks", qty);

        //throw-ins
        let throwinsData = new Graph("Throw-ins", qty);

        let setPiecesData = new Graph("Set Pieces", qty);

        let entryData = {
            label: 'Entries',
            data: [],
            yAxisID: "quantity"
        };

        let dumpData = {
            label: 'Dumps',
            data: [],
            yAxisID: "quantity"
        };

        let shiftData = {
            label: 'Shifts',
            data: [],
            yAxisID: "quantity"
        };

        let faceOffData = {
            label: 'Face Offs',
            data: [],
            yAxisID: "quantity"
        };

        let shotAtGoalData = {
            label: 'Shots At Goal',
            data: [],
            yAxisID: "quantity"
        };

        for (let i in json) {
            let queryName: String = json[i].name;
            queryLabels.push(queryName);

            //Misplaced Passes
            let avgMisplacedPassLength: number = json[i].avgMisplacedPassLength;
            let avgMisplacedPassVelocity: number = json[i].avgMisplacedPassVelocity;
            let misplacedPassBackward: number = json[i].misplacedPassBackward;
            let misplacedPassForward: number = json[i].misplacedPassForward;
            let misplacedPassLeft: number = json[i].misplacedPassLeft;
            let misplacedPassRight: number = json[i].misplacedPassRight;
            let misplacedPassEvents: number = json[i].misplacedPassEvents;
            let maxMisplacedLength: number = json[i].maxMisplacedPassLength;
            let maxMisplacedVelocity: number = json[i].maxMisplacedPassVelocity;
            maxMisplacedVelocityData.data.push(maxMisplacedVelocity);
            maxMisplacedLengthData.data.push(maxMisplacedLength);
            misplacedAvgPassLengthData.data.push(avgMisplacedPassLength);
            avgMisplacedPassVelocityData.data.push(avgMisplacedPassVelocity);
            misplacedPassBackwardData.data.push(misplacedPassBackward);
            misplacedPassForwardData.data.push(misplacedPassForward);
            misplacedPassLeftData.data.push(misplacedPassLeft);
            misplacedPassRightData.data.push(misplacedPassRight);
            misplacedPassEventsData.data.push(misplacedPassEvents);

            //Successful Passes
            let avgPacking: number = json[i].avgPacking;
            avgPackingData.data.push(avgPacking);
            let avgPassLength: number = json[i].avgPassLength;
            avgPassLengthData.data.push(avgPassLength);
            let avgPassVelocity: number = json[i].avgPassVelocity;
            avgPassVelocityData.data.push(avgPassVelocity);
            let backwardPasses: number = json[i].backwardPasses;
            backwardPassData.data.push(backwardPasses);
            let forwardPasses: number = json[i].forwardPasses;
            forwardPassData.data.push(forwardPasses);
            let leftPasses: number = json[i].leftPasses;
            leftPassData.data.push(leftPasses);
            let rightPasses: number = json[i].rightPasses;
            rightPassData.data.push(rightPasses);
            let overThirtyPasses: number = json[i].overThirtyPasses;
            let underSevenPasses: number = json[i].underSevenPasses;
            let sevenToFifteenPasses: number = json[i].sevenToFifteenPasses;
            let fifteenToThirtyPasses: number = json[i].fifteenToThirtyPasses;
            let MPoverThirtyPasses: number = json[i].MPoverThirtyPasses;
            let MPunderSevenPasses: number = json[i].MPunderSevenPasses;
            let MPsevenToFifteenPasses: number = json[i].MPsevenToFifteenPasses;
            let MPfifteenToThirtyPasses: number = json[i].MPfifteenToThirtyPasses;
            overThirtyPassesData.data.push(overThirtyPasses);
            underSevenPassesData.data.push(underSevenPasses);
            sevenToFifteenPassesData.data.push(sevenToFifteenPasses);
            fifteenToThirtyPassesData.data.push(fifteenToThirtyPasses);
            MPoverThirtyPassesData.data.push(MPoverThirtyPasses);
            MPunderSevenPassesData.data.push(MPunderSevenPasses);
            MPsevenToFifteenPassesData.data.push(MPsevenToFifteenPasses);
            MPfifteenToThirtyPassesData.data.push(MPfifteenToThirtyPasses);

            let successfulPassEvents: number = json[i].successfulPassEvents;
            successfulPassData.data.push(successfulPassEvents);
            let passPercentage: number = 0;
            if (successfulPassEvents != 0) {
                passPercentage = Math.floor((successfulPassEvents / (successfulPassEvents + misplacedPassEvents)) * 1000) / 10;
                passPercentageData.data.push(passPercentage);
            }

            let maxPassLength: number = json[i].maxPassLength;
            maxPassLengthData.data.push(maxPassLength);
            let maxPassVelocity: number = json[i].maxPassVelocity;
            maxPassVelocityData.data.push(maxPassVelocity);

            //Shooting
            let avgShotLength: number = json[i].avgShotLength;
            let avgShotVelocity: number = json[i].avgShotVelocity;
            let maxShotLength: number = json[i].maxShotLength;
            let maxShotVelocity: number = json[i].maxShotVelocity;
            let totalShots: number = json[i].totalShots;
            let shotOffTargetEvents: number = json[i].shotOffTargetEvents;
            let shotOnTargetEvents: number = json[i].shotOnTargetEvents;
            let goals: number = json[i].goalEvents;
            totalShotsData.data.push(totalShots);
            shotsOnTargetData.data.push(shotOnTargetEvents);
            goalsData.data.push(goals);

            avgShotLenData.data.push(avgShotLength);
            avgShotVelData.data.push(avgShotVelocity);
            maxShotLenData.data.push(maxShotLength);
            maxShotVelData.data.push(maxShotVelocity);

            //Interceptions
            let interceptions: number = json[i].interceptionEvents;

            //Clearance
            let avgClearanceLength: number = json[i].avgClearanceLength;
            let clearanceEvents: number = json[i].clearanceEvents;

            //corners
            let cornerkickEvent: number = json[i].cornerkickEvents;

            //freekicks
            let freekicks: number = json[i].freekickEvents;

            //throw-ins
            let throwins: number = json[i].throwinEvents;
            //Interceptions
            interceptionsData.data.push(interceptions);

            //Clearance
            avgClearanceLengthData.data.push(avgClearanceLength);
            clearanceEventsData.data.push(clearanceEvents);

            //corners
            cornerkickEventsData.data.push(cornerkickEvent);

            //freekicks
            freekicksData.data.push(freekicks);

            //throw-ins
            throwinsData.data.push(throwins);

            let setPieces = throwins + freekicks + cornerkickEvent;
            setPiecesData.data.push(setPieces);

            let dumps: number = json[i].dumpEvents;
            dumpData.data.push(dumps);

            let entries: number = json[i].entryEvents;
            entryData.data.push(entries);

            let shifts: number = json[i].shiftEvents;
            shiftData.data.push(shifts);

            let faceOffs: number = json[i].faceOffEvents;
            faceOffData.data.push(faceOffs);

            let shotsAtGoal: number = json[i].shotAtGoalEvents;
            shotAtGoalData.data.push(shotsAtGoal);
        }
        $('#allCharts').html(''); //To destroy previous charts

        let queryParamArray = $('select#query_param_select').val();
        let data;
        let yAxes = [];
        let title;
        let scheme = 'brewer.Spectral10';
        let graphID;
        for (let i = 0; i < queryParamArray.length; i++) {
            graphID = queryParamArray[i];
            switch (queryParamArray[i]) {
                case "misplaced/Successful":
                    data = { //This needs to be done this way, if we push only the data.datasets we get an error, see: https://github.com/chartjs/Chart.js/issues/6207
                        labels: queryLabels,
                        datasets: [successfulPassData, misplacedPassEventsData]
                    };
                    yAxes = [{id: "quantity", ticks: {beginAtZero: true}}];
                    title = "Successful & Misplaced Passes";
                    break;
                case "passAccuracy": //, passPercentageData
                    data = {
                        labels: queryLabels,
                        datasets: [passPercentageData]
                    };
                    yAxes = [{id: "percentage", ticks: {beginAtZero: true}}];
                    title = "Pass Accuracy";
                    break;
                case "avgMaxSuccPassLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPassLengthData, maxPassLengthData]
                    };
                    yAxes = [{id: "length", ticks: {beginAtZero: true}}];
                    title = "Avg & Max Length - Successful Passes";
                    break;
                case "SuccessfulPassesVelocity":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPassVelocityData, maxPassVelocityData]
                    };
                    yAxes = [{id: "velocity", ticks: {beginAtZero: true}}];
                    title = "Avg & Max Velocity - Successful Passes";
                    break;
                case "packing":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPackingData]
                    };
                    yAxes = [{id: "packing", ticks: {beginAtZero: true}}];
                    title = "Avg Packing - Successful Passes";
                    break;
                case "PassDirectionsSuccessfulPasses":
                    data = {
                        labels: queryLabels,
                        datasets: [leftPassData, forwardPassData, backwardPassData, rightPassData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Pass Directions - Successful Passes";
                    break;
                case "MisplacedPassesLength":
                    data = {
                        labels: queryLabels,
                        datasets: [misplacedAvgPassLengthData, maxMisplacedLengthData]
                    };
                    yAxes = [{id: "length", ticks: {beginAtZero: true}}];
                    title = "Avg & Max Length - Misplaced Passes";
                    break;
                case "MisplacedPassesVelocity":
                    data = {
                        labels: queryLabels,
                        datasets: [avgMisplacedPassVelocityData, maxMisplacedVelocityData]
                    };
                    yAxes = [{id: "velocity", ticks: {beginAtZero: true}}];
                    title = "Avg & Max Velocity - Misplaced Passes";
                    break;
                case "PassDirectionsMisplacedPasses":
                    data = {
                        labels: queryLabels,
                        datasets: [misplacedPassLeftData, misplacedPassForwardData, misplacedPassBackwardData, misplacedPassRightData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Pass Directions - Misplaced Passes";
                    break;
                case "passLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [underSevenPassesData, sevenToFifteenPassesData, fifteenToThirtyPassesData, overThirtyPassesData]
                    };
                    yAxes = [{id: "length", ticks: {beginAtZero: true}}];
                    title = "Pass Lengths - Successful Passes";
                    break;
                case "MPpassLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [MPunderSevenPassesData, MPsevenToFifteenPassesData, MPfifteenToThirtyPassesData, MPoverThirtyPassesData]
                    };
                    yAxes = [{id: "length", ticks: {beginAtZero: true}}];
                    title = "Pass Lengths - Unsuccessful Passes";
                    break;
                case "Shots - General":
                    data = {
                        labels: queryLabels,
                        datasets: [goalsData, shotsOnTargetData, totalShotsData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Shots - General";
                    graphID = "GeneralShots";
                    break;
                case "Shot Attributes":
                    data = {
                        labels: queryLabels,
                        datasets: [avgShotLenData, avgShotVelData, maxShotLenData, maxShotVelData]
                    };
                    yAxes = [{id: "velocity", ticks: {beginAtZero: true}}, {id: "length", ticks: {beginAtZero: true}}];
                    title = "Shots - Attributes";
                    graphID = "AttributesShots";
                    break;
                case "Interceptions":
                    data = {
                        labels: queryLabels,
                        datasets: [interceptionsData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Interceptions";
                    graphID = "interceptions";
                    break;
                case "Clearances":
                    data = {
                        labels: queryLabels,
                        datasets: [clearanceEventsData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Clearances";
                    break;
                case "avgClearanceLength":
                    data = {
                        labels: queryLabels,
                        datasets: [avgClearanceLengthData]
                    };
                    yAxes = [{id: "length", ticks: {beginAtZero: true}}];
                    title = "Avg Clearance Length";
                    break;
                case "Set Pieces":
                    data = {
                        labels: queryLabels,
                        datasets: [freekicksData, cornerkickEventsData, throwinsData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Set Pieces";
                    graphID = "setPieces";
                    break;
                case "Query Overview":
                    data = {
                        labels: queryLabels,
                        datasets: [successfulPassData, misplacedPassEventsData, totalShotsData, interceptionsData, clearanceEventsData, setPiecesData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Query Overview";
                    graphID = "qOverview";
                    break;
                case "dumpEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [dumpData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Dumps";
                    graphID = "Dumps";
                    break;
                case "entryEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [entryData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Entries";
                    graphID = "Entries";
                    break;
                case "shiftEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [shiftData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Shifts";
                    graphID = "Shifts";
                    break;
                case "faceOffEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [faceOffData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Face Offs";
                    graphID = "FaceOffs";
                    break;
                case "shotAtGoalEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [shotAtGoalData]
                    };
                    yAxes = [{id: qty, ticks: {beginAtZero: true}}];
                    title = "Shots At Goal";
                    graphID = "ShotsAtGoal";
                    break;
            }
            this.createGraph(data, title, chartType, graphID, yAxes, scheme);
        }
        // terminates the loading button
        document.getElementById("queryAnalysisButton").innerHTML = "Analyze";
    }


    public static createGraph(graphData, title, chartType, graphID, yAxis, scheme){
        $('#allCharts').append('<canvas id=' + graphID + '></canvas>');
        let myChart = <HTMLCanvasElement> document.getElementById(graphID);
        let chartConext = myChart.getContext('2d');
        Chart.defaults.global.getDefaultFontFamily = 'Lato';
        Chart.defaults.global.defaultFontSize = 18;
        Chart.defaults.global.defaultFontColor = '#777';

        let chartOptions = {
            plugins:{
                colorschemes: {
                    scheme: scheme
                }
            },
            title:{
                display:true,
                text:title,
                fontSize:25
            },
            scales: {
                yAxes: yAxis
            },
            legend:{
                display:true,
                position:'right',
                labels:{
                    fontColor:'#000'
                }
            }
        };

        let theChart = new Chart(chartConext, {
            type: chartType,
            data: graphData,
            options: chartOptions
        });

        theChart.update();
    }

    public static showOrHideTimelineFilter(){
        let slider = document.getElementById("sliderDiv");
        if (slider.style.display ==="none"){
            slider.style.display = "inline";
        } else {
            slider.style.display = "none";
            let sliderVal = document.getElementById("slider") as noUiSlider.Instance;
            sliderVal.noUiSlider.set([0,90]); //Set the timeFilter
        }
    }

    /**
     * Calls DBconnection to send the Query to the server
     */
    public static analyzeQueries(){
        if(($('select#query_select').val() == "") || ($('select#query_param_select').val() == "")){
            $('#error-querymodal-text').text("You have to select at least one query and one parameter for the Query Analysis.");
            $("#errorQueryModal").modal();
            return;
        }
        else{
            // activates loading button
            document.getElementById("queryAnalysisButton").innerHTML='<i class="fa fa-circle-o-notch fa-spin"></i> Analysing...';

            let slider = document.getElementById("slider") as noUiSlider.Instance;
            let queryIdArray = $('select#query_select').val();
            let timeFilter = slider.noUiSlider.get().toString(); //Get the timeFilter
            DBConnection.analyzeQueries(queryIdArray, timeFilter);
        }
    }

    //to init the player and parameter selection
    public static loadSelectionPlayer(){
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        DBConnection.getFilter("/getPlayers?sportFilter=" + sport);

        $('#param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
    }

    //to init the team and parameter selection
    public static loadSelectionTeam(){
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        DBConnection.getFilter("/getTeams?sportFilter=" + sport);

        $('#team_param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
    }

    //to init the match and parameter selection
    public static loadSelectionMatch(){
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        DBConnection.getFilter("/getMatches?sportFilter=" +sport);

        $('#match_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Matches</div>",
            selectionHeader: "<div class='custom-header'>Selected Matches</div>"
        });
    }

    public static fillSelectionPlayer(json){
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);

        let parameterName: string = "";
        let parameterID: string = "";
        let o = new Option("","");
        switch(sport) {
            case "football":
                parameterName = "Take Ons";
                parameterID = "successfulTakeOnEvent";
                o = new Option(parameterName, parameterID);
                $('#offense').append(o);

                parameterName = "Failed Take Ons";
                parameterID = "failedTakeOnEvent";
                o = new Option(parameterName, parameterID);
                $('#offense').append(o);

                parameterName = "Dribblings";
                parameterID = "DribblingStatistic";
                o = new Option(parameterName, parameterID);
                $('#offense').append(o);

                parameterName = "Clearances";
                parameterID = "clearanceEvent";
                o = new Option(parameterName, parameterID);
                $('#defense').append(o);

                parameterName = "Cornerkicks";
                parameterID = "cornerkickEvent";
                o = new Option(parameterName, parameterID);
                $('#setPieces').append(o);

                parameterName = "Throw ins";
                parameterID = "throwinEvent";
                o = new Option(parameterName, parameterID);
                $('#setPieces').append(o);

                parameterName = "Freekicks";
                parameterID = "freekickEvent";
                o = new Option(parameterName, parameterID);
                $('#setPieces').append(o);

                parameterName = "Substitutions (In)";
                parameterID = "playerOn";
                o = new Option(parameterName, parameterID);
                $('#other').append(o);

                parameterName = "Substitutions (Out)";
                parameterID = "playerOff";
                o = new Option(parameterName, parameterID);
                $('#other').append(o);
                break;

            case "icehockey":
                parameterName = "Entries";
                parameterID = "entryEvent";
                o = new Option(parameterName, parameterID);
                $('#offense').append(o);

                parameterName = "Stickhandlings";
                parameterID = "stickhandlingEvent";
                o = new Option(parameterName, parameterID);
                $('#offense').append(o);

                parameterName = "Penalties";
                parameterID = "penaltyEvent";
                o = new Option(parameterName, parameterID);
                $('#defense').append(o);

                parameterName = "Face Offs";
                parameterID = "faceOffEvent";
                o = new Option(parameterName, parameterID);
                $('#setPieces').append(o);

                parameterName = "Shifts";
                parameterID = "shiftEvent";
                o = new Option(parameterName, parameterID);
                $('#other').append(o);

                parameterName = "Dumps";
                parameterID = "dumpEvent";
                o = new Option(parameterName, parameterID);
                $('#other').append(o);
                break;
        }

        $('#param_select').multiSelect('refresh');

        for (let i in json.result) {
            let playerName: string = json.result[i].name;
            let playerID: string = json.result[i].pid;
            let o = new Option(playerName, playerID);
            //Adds the player options to the selection as well as the player ID as the value. "<option value= " + playerID + ">" + playerName + "</option>"
            $('#player_select').append(o);
        }

        $('#player_select').multiSelect({
            selectionHeader:"<div class='custom-header'>Selected Players (Max 11) </div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Players'>",
            afterInit: function(ms){    //For the search bar, uses quicksearch library
                let that = this,
                    $selectableSearch = that.$selectableUl.prev(),
                    $selectionSearch = that.$selectionUl.prev(),
                    selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
                    selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function(e){
                        if (e.which === 40){
                            that.$selectableUl.focus();
                            return false;
                        }
                    });

                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function(e){
                        if (e.which == 40){
                            that.$selectionUl.focus();
                            return false;
                        }
                    });
            },
            afterSelect: function(){
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function(){
                this.qs1.cache();
                this.qs2.cache();
            }
        });

        $('#player_select').multiSelect('refresh');
    }

    //fill the box with team names
    public static fillSelectionTeam(json){
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);

        let parameterName: string = "";
        let parameterID: string = "";
        let o = new Option("","");
        switch(sport) {
            case "football":
                parameterName = "Take Ons";
                parameterID = "successfulTakeOnEvent";
                o = new Option(parameterName, parameterID);
                $('#t_offense').append(o);

                parameterName = "Failed Take Ons";
                parameterID = "failedTakeOnEvent";
                o = new Option(parameterName, parameterID);
                $('#t_offense').append(o);

                parameterName = "Dribblings";
                parameterID = "DribblingStatistic";
                o = new Option(parameterName, parameterID);
                $('#t_offense').append(o);

                parameterName = "Clearances";
                parameterID = "clearanceEvent";
                o = new Option(parameterName, parameterID);
                $('#t_defense').append(o);

                parameterName = "Offensive";
                parameterID = "transitionsOffensive";
                o = new Option(parameterName, parameterID);
                $('#t_transitions').append(o);

                parameterName = "Defensive";
                parameterID = "transitionsDefensive";
                o = new Option(parameterName, parameterID);
                $('#t_transitions').append(o);

                parameterName = "Under Pressing Phases";
                parameterID = "totalUnderPressurePhases";
                o = new Option(parameterName, parameterID);
                $('#t_pressing').append(o);

                parameterName = "Under Pressing Phases per Game";
                parameterID = "avgUnderPressurePhasesPerGame";
                o = new Option(parameterName, parameterID);
                $('#t_pressing').append(o);

                parameterName = "Avg Pressing exposed";
                parameterID = "avgUnderPressureIndex";
                o = new Option(parameterName, parameterID);
                $('#t_pressing').append(o);

                parameterName = "Pressing Phases";
                parameterID = "totalPressurePhases";
                o = new Option(parameterName, parameterID);
                $('#t_pressing').append(o);

                parameterName = "Pressing Phases per Game";
                parameterID = "avgPhasesPerGame";
                o = new Option(parameterName, parameterID);
                $('#t_pressing').append(o);

                parameterName = "Avg Pressing exerted";
                parameterID = "avgPressureIndex";
                o = new Option(parameterName, parameterID);
                $('#t_pressing').append(o);

                parameterName = "Cornerkicks";
                parameterID = "cornerkickEvent";
                o = new Option(parameterName, parameterID);
                $('#t_setPieces').append(o);

                parameterName = "Freekicks";
                parameterID = "freekickEvent";
                o = new Option(parameterName, parameterID);
                $('#t_setPieces').append(o);

                parameterName = "Throw ins";
                parameterID = "throwinEvent";
                o = new Option(parameterName, parameterID);
                $('#t_setPieces').append(o);

                parameterName = "Substitutions per Game";
                parameterID = "subsPerGame";
                o = new Option(parameterName, parameterID);
                $('#t_other').append(o);
                break;

            case "icehockey":
                parameterName = "Entries";
                parameterID = "entryEvent";
                o = new Option(parameterName, parameterID);
                $('#t_offense').append(o);

                parameterName = "Stickhandlings";
                parameterID = "stickhandlingEvent";
                o = new Option(parameterName, parameterID);
                $('#t_offense').append(o);

                parameterName = "Penalties";
                parameterID = "penaltyEvent";
                o = new Option(parameterName, parameterID);
                $('#t_defense').append(o);

                parameterName = "Face Offs";
                parameterID = "faceOffEvent";
                o = new Option(parameterName, parameterID);
                $('#t_setPieces').append(o);

                parameterName = "Shifts";
                parameterID = "shiftEvent";
                o = new Option(parameterName, parameterID);
                $('#t_other').append(o);

                parameterName = "Dumps";
                parameterID = "dumpEvent";
                o = new Option(parameterName, parameterID);
                $('#t_other').append(o);
                break;
        }

        $('#team_param_select').multiSelect('refresh');


        for (let i in json.result) {
            let teamName: string = json.result[i].name;
            let teamID: string = json.result[i].tid;
            let o = new Option(teamName, teamID);

            //Adds the team options to the selection as well as the team ID as the value. "<option value= " + teamID + ">" + teamName + "</option>"
            $('#team_select').append(o);
        }

        $('#team_select').multiSelect({
            selectionHeader:"<div class='custom-header'>Selected Teams</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Teams'>",
            afterInit: function(ms){    //For the search bar, uses quicksearch library
                let that = this,
                    $selectableSearch = that.$selectableUl.prev(),
                    $selectionSearch = that.$selectionUl.prev(),
                    selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
                    selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function(e){
                        if (e.which === 40){
                            that.$selectableUl.focus();
                            return false;
                        }
                    });

                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function(e){
                        if (e.which == 40){
                            that.$selectionUl.focus();
                            return false;
                        }
                    });
            },

            afterSelect: function(){
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function(){
                this.qs1.cache();
                this.qs2.cache();
            }
        });

        $('#team_select').multiSelect('refresh');
    }

    //fill the box with team names
    public static fillSelectionMatch(json){
        for (let i in json) {
            let matchInfo = json[i][0];
            let matchId:string = matchInfo.matchId;
            let homeTeam:string = matchInfo.homeTeamName;
            let awayTeam:string = matchInfo.awayTeamName;
            let matchName:string = homeTeam + " vs. " + awayTeam;
            let o = new Option(matchName,matchId);

            //Adds the team options to the selection as well as the team ID as the value. "<option value= " + teamID + ">" + teamName + "</option>"
            $('#match_select').append(o);
        }

        $('#match_select').multiSelect({
            selectionHeader:"<div class='custom-header'>Selected Matches</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Teams'>",
            afterInit: function(ms){    //For the search bar, uses quicksearch library
                let that = this,
                    $selectableSearch = that.$selectableUl.prev(),
                    $selectionSearch = that.$selectionUl.prev(),
                    selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
                    selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function(e){
                        if (e.which === 40){
                            that.$selectableUl.focus();
                            return false;
                        }
                    });

                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function(e){
                        if (e.which == 40){
                            that.$selectionUl.focus();
                            return false;
                        }
                    });
            },

            afterSelect: function(){
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function(){
                this.qs1.cache();
                this.qs2.cache();
            }
        });

        $('#match_select').multiSelect('refresh');
    }

    /**
     * Select and Deselect ALL parameters in the Player Analysis
     */
    public static selectAllPlayerParam():void {
        if (document.getElementById('selectPlayerParamBtn').innerHTML == "Select All") {
            $('#param_select').multiSelect('select_all');
            document.getElementById('selectPlayerParamBtn').innerHTML = "Deselect All";
        }
        else if (document.getElementById('selectPlayerParamBtn').innerHTML == "Deselect All"){
            $('#param_select').multiSelect('deselect_all');
            document.getElementById('selectPlayerParamBtn').innerHTML = "Select All";
        }
    }

    /**
     * Select and Deselect ALL parameters in the Team Analysis
     */
    public static selectAllTeamParam():void {
        if (document.getElementById('selectTeamParamBtn').innerHTML == "Select All") {
            $('#team_param_select').multiSelect('select_all');
            document.getElementById('selectTeamParamBtn').innerHTML = "Deselect All";
        }
        else if (document.getElementById('selectTeamParamBtn').innerHTML == "Deselect All"){
            $('#team_param_select').multiSelect('deselect_all');
            document.getElementById('selectTeamParamBtn').innerHTML = "Select All";
        }
    }

    /**
     * Select and Deselect ALL parameters in the Query Analysis
     */
    public static selectAllQueryParam():void {
        if (document.getElementById('selectQueryParamBtn').innerHTML == "Select All") {
            $('#query_param_select').multiSelect('select_all');
            document.getElementById('selectQueryParamBtn').innerHTML = "Deselect All";
        }
        else if (document.getElementById('selectQueryParamBtn').innerHTML == "Deselect All"){
            $('#query_param_select').multiSelect('deselect_all');
            document.getElementById('selectQueryParamBtn').innerHTML = "Select All";
        }
    }

    public static loadQuerySelection(){
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        let parameterName: string = "";
        let parameterID: string = "";
        let o = new Option("","");
        switch(sport) {
            case "football":
                parameterName = "Clearances";
                parameterID = "clearanceEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);

                parameterName = "Cornerkicks";
                parameterID = "cornerkickEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);

                parameterName = "Throw ins";
                parameterID = "throwinEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);
                break;

            case "icehockey":
                parameterName = "Dumps";
                parameterID = "dumpEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);

                parameterName = "Entries";
                parameterID = "entryEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);

                parameterName = "Shifts";
                parameterID = "shiftEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);

                parameterName = "Face Offs";
                parameterID = "faceOffEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);

                parameterName = "Shots At Goal";
                parameterID = "shotAtGoalEvent";
                o = new Option(parameterName, parameterID);
                $('#query_param_select').append(o);
        }
        let sliderDiv = document.getElementById("sliderDiv");
        sliderDiv.style.display = "none";

        DBConnection.analysisOn = true;
        DBConnection.getFilter("/getQueries?sportFilter=" + sport);

        $('#query_param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });

        //TODO: Load the timeline to filter here.
        let slider = document.getElementById('slider') as noUiSlider.Instance;
        let thirdHalf = document.getElementById('3rdHalf');
        let secondHalf = document.getElementById('2ndHalf');
        let firstHalf = document.getElementById('1stHalf');
        thirdHalf.innerText = "3rd Period";
        switch (sport) {
            case "football":
                noUiSlider.create(slider, {
                    start: [0, 90],
                    tooltips: [true, true],
                    connect: true,
                    step: 0.5,
                    range: {
                        'min': 0,
                        'max': 100
                    }
                });
                thirdHalf.style.display = "none";
                break;
            case "icehockey":
                noUiSlider.create(slider, {
                    start: [0, 60],
                    tooltips: [true, true],
                    connect: true,
                    step: 0.5,
                    range: {
                        'min': 0,
                        'max': 60
                    }
                });
                secondHalf.innerText = "2nd Period";
                firstHalf.innerText = "1st Period";
                break;
            default:
                noUiSlider.create(slider, {
                    start: [0, 90],
                    tooltips: [true, true],
                    connect: true,
                    step: 0.5,
                    range: {
                        'min': 0,
                        'max': 100
                    }
                });
                break;
        }

        slider.noUiSlider.on('set', function () {
            Analysis.analyzeQueries();
        });
    }

    public static setFirstHalf(){
        let slider = document.getElementById('slider') as noUiSlider.Instance;
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        switch (sport) {
            case "football":
                slider.noUiSlider.set([0,45]);
                break;
            case "icehockey":
                slider.noUiSlider.set([0,20]);
                break;
        }
    }

    public static setSecondHalf(){
        let slider = document.getElementById('slider') as noUiSlider.Instance;
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        switch (sport) {
            case "football":
                slider.noUiSlider.set([45,90]);
                break;
            case "icehockey":
                slider.noUiSlider.set([20,40]);
                break;
        }
    }

    public static setThirdHalf(){
        let slider = document.getElementById('slider') as noUiSlider.Instance;
        let sport = window.location.search.substring(window.location.search.lastIndexOf("=")+1);
        switch (sport) {
            case "icehockey":
                slider.noUiSlider.set([40,60]);
        }
    }

    public static fillQuerySelection(json){

        //create options for all the queries with the QueryID as value and QueryName as text
        for (let i in json.result){
            let queryName: string = json.result[i].name;
            let querySport: string = json.result[i].sport;
            let query_ID: string = json.result[i].qid;
            if(window.location.search.substring(window.location.search.lastIndexOf("=")+1) === querySport) {
                let o = new Option(queryName, query_ID);
                $('#query_select').append(o);
            }
        }

        $('#query_select').multiSelect({
            selectionHeader:"<div class='custom-header'>Selected Queries (Max 5)</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Queries'>",
            afterInit: function(ms){    //For the search bar, uses quicksearch library
                let that = this,
                    $selectableSearch = that.$selectableUl.prev(),
                    $selectionSearch = that.$selectionUl.prev(),
                    selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
                    selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function(e){
                        if (e.which === 40){
                            that.$selectableUl.focus();
                            return false;
                        }
                    });

                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function(e){
                        if (e.which == 40){
                            that.$selectionUl.focus();
                            return false;
                        }
                    });
            },
            afterSelect: function(){
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function(){
                this.qs1.cache();
                this.qs2.cache();
            }
        });
        $('#query_select').multiSelect('refresh');
    }

    /**
     * Checks if a match is selected and calls DBConnection to calculate the pressing phases
     */
    public static calculatePressing(){
        let btnContent = document.getElementById("pressingAnalysisBtn").innerHTML;
        if(btnContent=="Pressing Phases") {
            if(FilterArea.getMatchFilters() == ""){
                $('#error-modal-text').text("You have to select a match for the pressing analysis.");
                $("#errorMPModal").modal();
                return;
            }else{
                // if phases from ResultList should be removed and to clear drawingArea
                ResultList.removeResultsFromResultList(Timeline.getItemListLength());
                DrawingArea.clearAndResetDefault();

                document.getElementById("pressingAnalysisBtn").innerHTML = 'Deactivate Pressing Phases';
                let user = document.getElementById('userMenu').textContent;
                let userName = user.trim();

                DBConnection.analyzePressing(userName);
            }
        }
        else{
            document.getElementById("pressingAnalysisBtn").innerHTML='Pressing Phases';
            Timeline.resizeTimeline();
            DrawingArea.clearAndResetDefault();
        }
    }

    /**
     * Checks if a match is selected and calls DBConnection to calculate the pressing index for the match
     */
    public static calculatePressingFor2d(): void{
        //first check if speed Analysis graph2d is currently visible and delete if so
        let speedBtn = document.getElementById("playerSpeedBtn").innerHTML;
        if(speedBtn != "Speed Analysis") {
            document.getElementById("playerSpeedBtn").innerHTML='Speed Analysis';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }

        //now the pressing Index calculation starts
        let btnContent = document.getElementById("pressingAnalysis2dBtn").innerHTML;
        if(btnContent=="Pressing Index") {
            if (FilterArea.getMatchFilters() == "") {
                $('#error-modal-text').text("You have to select a match for the pressing analysis.");
                $("#errorMPModal").modal();
                return;
            }
            else {
                document.getElementById("pressingAnalysis2dBtn").innerHTML = 'Deactivate Pressing Index';
                document.getElementById('timeline').setAttribute("style", "height: 12.5%");
                DBConnection.analyzePressing2d();
            }
        }
        else{
            document.getElementById("pressingAnalysis2dBtn").innerHTML='Pressing Index';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }
    }

    /**
     * Function is called if clear button is clicked and resets timeline and graph2d to default settings
     */
    public static reset2dToDefault():void{
        document.getElementById("pressingAnalysis2dBtn").innerHTML='Pressing Index';
        document.getElementById("playerSpeedBtn").innerHTML='Speed Analysis';
        document.getElementById('timeline').setAttribute("style","height: 25%");
        Graph2d.clearItemList();
        Timeline.resizeTimeline();
    }

    /**
     * Checks if at least one player is selected and calls DBConnection to calculate the players' speed
     */
    public static calculatePlayerSpeed():void {
        //first check if pressingIndex graph2d is currently visible and delete if so
        let pressingBtn = document.getElementById("pressingAnalysis2dBtn").innerHTML;
        if(pressingBtn != "Pressing Index") {
            document.getElementById("pressingAnalysis2dBtn").innerHTML='Pressing Index';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }

        //now the Speed Analysis starts
        let btnContent = document.getElementById("playerSpeedBtn").innerHTML;
        if(btnContent=="Speed Analysis") {
            if (FilterArea.getPlayerFilters() != "" && FilterArea.getMatchFilters() != "") {
                document.getElementById("playerSpeedBtn").innerHTML = 'Deactivate Speed Analysis';
                document.getElementById('timeline').setAttribute("style", "height: 12.5%");
                Graph2d.fillPlayerList();
                DBConnection.analyzePlayerSpeed();
            } else {
                $('#error-modal-text').text("You have to select a match and at least one player for the speed analysis.");
                $("#errorMPModal").modal();
                return;
            }
        }
        else{
            document.getElementById("playerSpeedBtn").innerHTML='Speed Analysis';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }
    }

    public static calculatePlayerPassNetwork(): void {
        let btn = document.getElementById("passNetworkBtn").innerHTML;
        if(btn != "Deactivate Pass Network") {
            if (FilterArea.getTeamFilters() != "" && FilterArea.getMatchFilters() != "") {
                document.getElementById("passNetworkBtn").innerHTML = 'Deactivate Pass Network';
                DBConnection.analyzePlayerPassNetwork();
            }
            else {
                $('#error-modal-text').text("You have to select a match and a team for the network analysis.");
                $("#errorMPModal").modal();
                return;
            }
        }
        else{
            document.getElementById("passNetworkBtn").innerHTML = 'Pass Network';
            Network.clearNodesAndEdges();
        }
    }

    /**
     * Called if a customizaton of pressing values has taken place and calls the server to update values in the DB
     */
    public static setNewPressingValues(){
        let indexThreshold: number = $('#pressingIndexThreshold').val();
        let durationThreshold: number = $('#pressingDurationThreshold').val() * 1000; //milliseconds
        let user = document.getElementById('userMenu').textContent;

        DBConnection.customizePressing(user,indexThreshold,durationThreshold);

        // needed to customize pressing if no user is selected --> values only stored temporary for the session
        CONFIG.PRESSING_INDEX_THRESHOLD = $('#pressingIndexThreshold').val();
        CONFIG.PRESSING_DURATION_THRESHOLD = $('#pressingDurationThreshold').val() * 1000;

        // Need to remove phases from ResultList and to clear drawingArea
        ResultList.removeResultsFromResultList(Timeline.getItemListLength());
        DrawingArea.clearAndResetDefault();
    }

    /**
     * Called if pressing values are set back to default in the customization modal
     */
    public static setDefaultPressingValues(){
        $('#pressingIndexThreshold').val(2);
        $('#pressingDurationThreshold').val(2);
    }

    public static calculateOffTransition(){
        if(FilterArea.getMatchFilters() == "" || FilterArea.getTeamFilters() == "") {
            $('#error-modal-text').text("You have to select a match and a team for the transition analysis.");
            $("#errorMPModal").modal();
            return;
        }
        else {
            // if phases from ResultList should be removed and to clear drawingArea
             ResultList.removeResultsFromResultList(Timeline.getItemListLength());
             DrawingArea.clearAndResetDefault();

            let user = document.getElementById('userMenu').textContent;
            DBConnection.analyzeOffTransition(user);
        }
    }

    public static calculateDefTransition(){
        if(FilterArea.getMatchFilters() == "" || FilterArea.getTeamFilters() == "") {
            $('#error-modal-text').text("You have to select a match and a team for the transition analysis.");
            $("#errorMPModal").modal();
            return;
        }
        else {
            // if phases from ResultList should be removed and to clear drawingArea
            ResultList.removeResultsFromResultList(Timeline.getItemListLength());
            DrawingArea.clearAndResetDefault();

            let user = document.getElementById('userMenu').textContent;
            DBConnection.analyzeDefTransition(user);
        }
    }
}


class Graph {
    label: string;
    data: number[];
    yAxisID: string;

    constructor(label: string, yAxisID: string) {
        this.label = label;
        this.yAxisID = yAxisID;
        this.data = [];
    }
}
