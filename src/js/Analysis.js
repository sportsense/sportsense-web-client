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
//declare var noUiSlider: any;
//import  * as noUiSlider from "nouislider";
var Analysis = /** @class */ (function () {
    function Analysis() {
    }
    Analysis.initialiseHeatmap = function () {
        heatmapInstance = undefined;
    };
    //TODO: Fix Heatmap Issue
    Analysis.clearHeatmap = function () {
        try {
            var canvas = heatmapInstance._renderer.canvas;
            $(canvas).remove();
            heatmapInstance.undefined;
        }
        catch (_a) {
            console.log("heatmap issue!");
        }
    };
    /**
     * This function is called when displaying the heatmap for the entry events
     * **/
    Analysis.entryHeatmap = function (json) {
        var count = 0;
        for (var i in json.result[0]) {
            count++;
        }
        heatmapInstance = h337.create({
            container: document.getElementById('field-container'),
            radius: 30,
        });
        heatmapInstance.setData({ data: [] });
        //heatmapInstance.clear();
        var points = [];
        for (var _i = 0, _a = json.result[0]; _i < _a.length; _i++) {
            var object = _a[_i];
            var coords = object.details[0].xyCoords;
            var canvasCoords = DrawingArea.dbToCanvasCoordinates(coords[0][0], coords[0][1]);
            var x = Number(canvasCoords[0]);
            var y = Number(canvasCoords[1]);
            var point = { x: Math.round(x), y: Math.round(y), value: 5 };
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
    };
    Analysis.openNewTab = function (analysis) {
        var link = window.location.href;
        link = link.substr(0, link.lastIndexOf("/"));
        var user_link = "?user=" + document.getElementById('userMenu').textContent;
        var sportLink = "&discipline=" + window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        switch (analysis) {
            case "teamAnalysis": {
                link = link + "/teamAnalysis.html" + user_link.trim() + sportLink;
                break;
            }
            case "playerAnalysis": {
                link = link + "/playerAnalysis.html" + user_link.trim() + sportLink;
                break;
            }
            case "queryAnalysis": {
                link = link + "/queryAnalysis.html" + user_link.trim() + sportLink;
                break;
            }
            default: {
                console.log("invalid choice " + analysis);
                break;
            }
        }
        window.open(link);
    };
    //creates the player and team name cards on the top from the cards array
    Analysis.setCards = function (cards) {
        $('.players-g').html('');
        for (var i = 0; i < Object.keys(cards).length; i++) {
            $('.players-g').append('<div class="card-g" data-name="' + Object.keys(cards)[i] + '"><div class="name-g">' + Object.keys(cards)[i] + '</div></div>');
            //console.log(Object.keys(cards)[i]);
        }
        $('.teams-g').html('');
        for (var i = 0; i < Object.keys(cards).length; i++) {
            $('.teams-g').append('<div class="card-g" data-name="' + Object.keys(cards)[i] + '"><div class="name-g">' + Object.keys(cards)[i] + '</div></div>');
            //console.log(Object.keys(cards)[i]);
        }
    };
    //creates the rows of graphs from the parameter array
    Analysis.setRows = function (param) {
        $('.rows-g').html('');
        for (var i = 0; i < param.length; i++) {
            $('.rows-g').append('<div class="row-name">' + this.getParameterNames(param[i].toString()) + '</div><div class="row-g" data-i="' + param[i] + '"></div>');
        }
    };
    //creates all the graphs in all the rows
    Analysis.setBars = function (cards, param, colors) {
        $('.row-g').html('');
        for (var i = 0; i < param.length; i++) {
            for (var p = 0; p < Object.keys(cards).length; p++) {
                $('.row-g[data-i="' + param[i] + '"]').append('                  <div class="bar-g" data-o="' + Object.keys(cards)[p] + '" data-value="' + cards[Object.keys(cards)[p]][i] + '" style="background-color:' + colors[p][0] + ';"><div class="fill-g" style="background-color:' + colors[p][1] + ';"><div class="value-g">' + cards[Object.keys(cards)[p]][i] + '</div></div></div>');
            }
        }
        Analysis.updateBars();
    };
    //makes the graphs display the data correctly and should be used in conjunction with setBars()
    Analysis.updateBars = function () {
        $('.row-g').each(function () {
            var n = $(this).find('.bar-g');
            var values = [];
            $(n).each(function () {
                values.push($(this).data('value'));
            });
            var highest = Math.max.apply(Math, values);
            $(n).each(function () {
                var height = 100 - ($(this).data('value') / highest * 100);
                if (height > 100) {
                    height = 100;
                }
                $(this).find('.fill-g').css('height', height + '%');
            });
        });
    };
    Analysis.updateGraph = function (cards, param) {
        this.setCards(cards);
        this.setRows(param);
        this.setBars(cards, param, Analysis.colors);
    };
    /**
     * Calls the method that creates the graphs
     * @param json
     */
    Analysis.analyzePlayers = function (json) {
        var parameterArray = $('select#param_select').val();
        var playersAndStats = "";
        var b = 0;
        for (var i in json) { //Loops through the players stats
            var stats = json[i];
            var pName = $("#player_select option:selected[value = " + i + "]").text(); //Selects the player with the ID as value.
            var combined = "";
            //So we don't have the comma after the last element
            if (b === ($("#player_select option:selected").length - 1)) {
                combined = '"' + pName + '":[' + stats + ']';
            }
            else {
                combined = '"' + pName + '":[' + stats + '],';
            }
            playersAndStats += combined;
            b++;
        }
        // terminates the loading button
        document.getElementById("playerAnalysisButton").innerHTML = "Analyze";
        var jsonCards = "{" + playersAndStats + "}";
        var cards = JSON.parse(jsonCards);
        this.updateGraph(cards, parameterArray);
    };
    /**
     * Calls the method that creates the graphs
     * @param json
     */
    Analysis.analyzeTeams = function (json) {
        var parameterArray = $('select#team_param_select').val();
        var teamsAndStats = "";
        var b = 0;
        for (var i in json) { //Loops through the teams stats
            var stats = json[i];
            var tName = $("#team_select option:selected[value = " + i + "]").text(); //Selects the team with the ID as value.
            var combined = "";
            //So we don't have the comma after the last element
            if (b === ($("#team_select option:selected").length - 1)) {
                combined = '"' + tName + '":[' + stats + ']';
            }
            else {
                combined = '"' + tName + '":[' + stats + '],';
            }
            teamsAndStats += combined;
            b++;
        }
        // terminates the loading button
        document.getElementById("teamAnalysisButton").innerHTML = "Analyze";
        var jsonCards = "{" + teamsAndStats + "}";
        var cards = JSON.parse(jsonCards);
        this.updateGraph(cards, parameterArray);
    };
    //Analyzes the players
    Analysis.analyzeP = function () {
        if (($('select#player_select').val() == "") || ($('select#param_select').val() == "")) {
            $('#error-playermodal-text').text("You have to select at least one player and one parameter for the Player Analysis.");
            $("#errorPlayerModal").modal();
            return;
        }
        else {
            // activate loading button
            document.getElementById("playerAnalysisButton").innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i> Analysing...';
            var playerIdArray_1 = $('select#player_select').val();
            var parameterArray = $('select#param_select').val();
            var matchArray = $('select#match_select').val();
            var user = window.location.search.substr(1).split('=')[1];
            //For some names in the Selection, there were duplicates, this removes them.
            var playerIdArrayWithoutDuplicates = playerIdArray_1.filter(function (item, pos) {
                return playerIdArray_1.indexOf(item) == pos;
            });
            DBConnection.analyzePlayers(user, playerIdArrayWithoutDuplicates, parameterArray, matchArray);
        }
    };
    //Analyzes the teams
    Analysis.analyzeT = function () {
        if (($('select#team_select').val() == "") || ($('select#team_param_select').val() == "")) {
            $('#error-teammodal-text').text("You have to select at least one team and one parameter for the Team Analysis.");
            $("#errorTeamModal").modal();
            return;
        }
        else {
            // activate loading button
            document.getElementById("teamAnalysisButton").innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i> Analysing...';
            var teamIdArray = $('select#team_select').val();
            var parameterArray = $('select#team_param_select').val();
            var matchArray = $('select#match_select').val();
            var user = window.location.search.substr(1).split('=')[1];
            DBConnection.analyzeTeams(user, teamIdArray, parameterArray, matchArray);
        }
    };
    Analysis.getParameterNames = function (key) {
        return this.parameterDict[key];
    };
    Analysis.showQueryGraphs = function (json) {
        var queryLabels = [];
        var chartType;
        if ($('#chartToggler').is(":checked")) {
            chartType = 'bar';
        }
        else {
            chartType = 'line';
        }
        var successfulPassData = {
            label: 'Successful Passes',
            data: [],
            yAxisID: "quantity"
        };
        var passPercentageData = {
            label: 'Pass Accuracy (%)',
            data: [],
            yAxisID: "percentage"
        };
        var avgPassLengthData = {
            label: 'Avg. Length (m)',
            data: [],
            yAxisID: "length"
        };
        var avgPassVelocityData = {
            label: 'Avg. Velocity (km/h)',
            data: [],
            yAxisID: "velocity"
        };
        var maxPassLengthData = {
            label: 'Max Length (m)',
            data: [],
            yAxisID: "length"
        };
        var maxPassVelocityData = {
            label: 'Max Velocity (km/h)',
            data: [],
            yAxisID: "velocity"
        };
        var avgPackingData = {
            label: 'Avg Packing',
            data: [],
            yAxisID: "packing"
        };
        var avgLength = 'Avg. Length (m)';
        var avgVelocity = 'Avg. Velocity (km/h)';
        var maxLength = 'Max Length (m)';
        var maxVelocity = 'Max Velocity (km/h)';
        var qty = "quantity";
        var forwardPassData = new Graph('Forward', qty);
        var backwardPassData = new Graph('Backward', qty);
        var leftPassData = new Graph('Left', qty);
        var rightPassData = new Graph('Right', qty);
        var misplacedAvgPassLengthData = new Graph(avgLength, "length");
        var avgMisplacedPassVelocityData = new Graph(avgVelocity, "velocity");
        var misplacedPassBackwardData = new Graph("Backward", qty);
        var misplacedPassForwardData = new Graph("Forward", qty);
        var misplacedPassLeftData = new Graph("Left", qty);
        var misplacedPassRightData = new Graph("Right", qty);
        var misplacedPassEventsData = new Graph("Misplaced Passes", qty);
        var maxMisplacedLengthData = new Graph(maxLength, "length");
        var maxMisplacedVelocityData = new Graph(maxVelocity, "velocity");
        var overThirtyPassesData = new Graph("Over 30 m", "length");
        var underSevenPassesData = new Graph("Under 7 m", "length");
        var sevenToFifteenPassesData = new Graph("7 - 15 m", "length");
        var fifteenToThirtyPassesData = new Graph("15 - 30 m", "length");
        var MPoverThirtyPassesData = new Graph("Over 30 m", "length");
        var MPunderSevenPassesData = new Graph("Under 7 m", "length");
        var MPsevenToFifteenPassesData = new Graph("7 - 15 m", "length");
        var MPfifteenToThirtyPassesData = new Graph("15 - 30 m", "length");
        var totalShotsData = new Graph("Total Shots", qty);
        var shotsOnTargetData = new Graph("Shots on Target", qty);
        var goalsData = new Graph("Goals", qty);
        var avgShotLenData = new Graph(avgLength, "length");
        var avgShotVelData = new Graph(avgVelocity, "velocity");
        var maxShotLenData = new Graph(maxLength, "length");
        var maxShotVelData = new Graph(maxVelocity, "velocity");
        //Interceptions
        var interceptionsData = new Graph("Interceptions", qty);
        //Clearance
        var avgClearanceLengthData = new Graph(avgLength, "length");
        var clearanceEventsData = new Graph("Clearances", qty);
        //corners
        var cornerkickEventsData = new Graph("Cornerkicks", qty);
        //freekicks
        var freekicksData = new Graph("Freekicks", qty);
        //throw-ins
        var throwinsData = new Graph("Throw-ins", qty);
        var setPiecesData = new Graph("Set Pieces", qty);
        var entryData = {
            label: 'Entries',
            data: [],
            yAxisID: "quantity"
        };
        var dumpData = {
            label: 'Dumps',
            data: [],
            yAxisID: "quantity"
        };
        var shiftData = {
            label: 'Shifts',
            data: [],
            yAxisID: "quantity"
        };
        var faceOffData = {
            label: 'Face Offs',
            data: [],
            yAxisID: "quantity"
        };
        var shotAtGoalData = {
            label: 'Shots At Goal',
            data: [],
            yAxisID: "quantity"
        };
        for (var i in json) {
            var queryName = json[i].name;
            queryLabels.push(queryName);
            //Misplaced Passes
            var avgMisplacedPassLength = json[i].avgMisplacedPassLength;
            var avgMisplacedPassVelocity = json[i].avgMisplacedPassVelocity;
            var misplacedPassBackward = json[i].misplacedPassBackward;
            var misplacedPassForward = json[i].misplacedPassForward;
            var misplacedPassLeft = json[i].misplacedPassLeft;
            var misplacedPassRight = json[i].misplacedPassRight;
            var misplacedPassEvents = json[i].misplacedPassEvents;
            var maxMisplacedLength = json[i].maxMisplacedPassLength;
            var maxMisplacedVelocity = json[i].maxMisplacedPassVelocity;
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
            var avgPacking = json[i].avgPacking;
            avgPackingData.data.push(avgPacking);
            var avgPassLength = json[i].avgPassLength;
            avgPassLengthData.data.push(avgPassLength);
            var avgPassVelocity = json[i].avgPassVelocity;
            avgPassVelocityData.data.push(avgPassVelocity);
            var backwardPasses = json[i].backwardPasses;
            backwardPassData.data.push(backwardPasses);
            var forwardPasses = json[i].forwardPasses;
            forwardPassData.data.push(forwardPasses);
            var leftPasses = json[i].leftPasses;
            leftPassData.data.push(leftPasses);
            var rightPasses = json[i].rightPasses;
            rightPassData.data.push(rightPasses);
            var overThirtyPasses = json[i].overThirtyPasses;
            var underSevenPasses = json[i].underSevenPasses;
            var sevenToFifteenPasses = json[i].sevenToFifteenPasses;
            var fifteenToThirtyPasses = json[i].fifteenToThirtyPasses;
            var MPoverThirtyPasses = json[i].MPoverThirtyPasses;
            var MPunderSevenPasses = json[i].MPunderSevenPasses;
            var MPsevenToFifteenPasses = json[i].MPsevenToFifteenPasses;
            var MPfifteenToThirtyPasses = json[i].MPfifteenToThirtyPasses;
            overThirtyPassesData.data.push(overThirtyPasses);
            underSevenPassesData.data.push(underSevenPasses);
            sevenToFifteenPassesData.data.push(sevenToFifteenPasses);
            fifteenToThirtyPassesData.data.push(fifteenToThirtyPasses);
            MPoverThirtyPassesData.data.push(MPoverThirtyPasses);
            MPunderSevenPassesData.data.push(MPunderSevenPasses);
            MPsevenToFifteenPassesData.data.push(MPsevenToFifteenPasses);
            MPfifteenToThirtyPassesData.data.push(MPfifteenToThirtyPasses);
            var successfulPassEvents = json[i].successfulPassEvents;
            successfulPassData.data.push(successfulPassEvents);
            var passPercentage = 0;
            if (successfulPassEvents != 0) {
                passPercentage = Math.floor((successfulPassEvents / (successfulPassEvents + misplacedPassEvents)) * 1000) / 10;
                passPercentageData.data.push(passPercentage);
            }
            var maxPassLength = json[i].maxPassLength;
            maxPassLengthData.data.push(maxPassLength);
            var maxPassVelocity = json[i].maxPassVelocity;
            maxPassVelocityData.data.push(maxPassVelocity);
            //Shooting
            var avgShotLength = json[i].avgShotLength;
            var avgShotVelocity = json[i].avgShotVelocity;
            var maxShotLength = json[i].maxShotLength;
            var maxShotVelocity = json[i].maxShotVelocity;
            var totalShots = json[i].totalShots;
            var shotOffTargetEvents = json[i].shotOffTargetEvents;
            var shotOnTargetEvents = json[i].shotOnTargetEvents;
            var goals = json[i].goalEvents;
            totalShotsData.data.push(totalShots);
            shotsOnTargetData.data.push(shotOnTargetEvents);
            goalsData.data.push(goals);
            avgShotLenData.data.push(avgShotLength);
            avgShotVelData.data.push(avgShotVelocity);
            maxShotLenData.data.push(maxShotLength);
            maxShotVelData.data.push(maxShotVelocity);
            //Interceptions
            var interceptions = json[i].interceptionEvents;
            //Clearance
            var avgClearanceLength = json[i].avgClearanceLength;
            var clearanceEvents = json[i].clearanceEvents;
            //corners
            var cornerkickEvent = json[i].cornerkickEvents;
            //freekicks
            var freekicks = json[i].freekickEvents;
            //throw-ins
            var throwins = json[i].throwinEvents;
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
            var setPieces = throwins + freekicks + cornerkickEvent;
            setPiecesData.data.push(setPieces);
            var dumps = json[i].dumpEvents;
            dumpData.data.push(dumps);
            var entries = json[i].entryEvents;
            entryData.data.push(entries);
            var shifts = json[i].shiftEvents;
            shiftData.data.push(shifts);
            var faceOffs = json[i].faceOffEvents;
            faceOffData.data.push(faceOffs);
            var shotsAtGoal = json[i].shotAtGoalEvents;
            shotAtGoalData.data.push(shotsAtGoal);
        }
        $('#allCharts').html(''); //To destroy previous charts
        var queryParamArray = $('select#query_param_select').val();
        var data;
        var yAxes = [];
        var title;
        var scheme = 'brewer.Spectral10';
        var graphID;
        for (var i = 0; i < queryParamArray.length; i++) {
            graphID = queryParamArray[i];
            switch (queryParamArray[i]) {
                case "misplaced/Successful":
                    data = {
                        labels: queryLabels,
                        datasets: [successfulPassData, misplacedPassEventsData]
                    };
                    yAxes = [{ id: "quantity", ticks: { beginAtZero: true } }];
                    title = "Successful & Misplaced Passes";
                    break;
                case "passAccuracy": //, passPercentageData
                    data = {
                        labels: queryLabels,
                        datasets: [passPercentageData]
                    };
                    yAxes = [{ id: "percentage", ticks: { beginAtZero: true } }];
                    title = "Pass Accuracy";
                    break;
                case "avgMaxSuccPassLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPassLengthData, maxPassLengthData]
                    };
                    yAxes = [{ id: "length", ticks: { beginAtZero: true } }];
                    title = "Avg & Max Length - Successful Passes";
                    break;
                case "SuccessfulPassesVelocity":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPassVelocityData, maxPassVelocityData]
                    };
                    yAxes = [{ id: "velocity", ticks: { beginAtZero: true } }];
                    title = "Avg & Max Velocity - Successful Passes";
                    break;
                case "packing":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPackingData]
                    };
                    yAxes = [{ id: "packing", ticks: { beginAtZero: true } }];
                    title = "Avg Packing - Successful Passes";
                    break;
                case "PassDirectionsSuccessfulPasses":
                    data = {
                        labels: queryLabels,
                        datasets: [leftPassData, forwardPassData, backwardPassData, rightPassData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Pass Directions - Successful Passes";
                    break;
                case "MisplacedPassesLength":
                    data = {
                        labels: queryLabels,
                        datasets: [misplacedAvgPassLengthData, maxMisplacedLengthData]
                    };
                    yAxes = [{ id: "length", ticks: { beginAtZero: true } }];
                    title = "Avg & Max Length - Misplaced Passes";
                    break;
                case "MisplacedPassesVelocity":
                    data = {
                        labels: queryLabels,
                        datasets: [avgMisplacedPassVelocityData, maxMisplacedVelocityData]
                    };
                    yAxes = [{ id: "velocity", ticks: { beginAtZero: true } }];
                    title = "Avg & Max Velocity - Misplaced Passes";
                    break;
                case "PassDirectionsMisplacedPasses":
                    data = {
                        labels: queryLabels,
                        datasets: [misplacedPassLeftData, misplacedPassForwardData, misplacedPassBackwardData, misplacedPassRightData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Pass Directions - Misplaced Passes";
                    break;
                case "passLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [underSevenPassesData, sevenToFifteenPassesData, fifteenToThirtyPassesData, overThirtyPassesData]
                    };
                    yAxes = [{ id: "length", ticks: { beginAtZero: true } }];
                    title = "Pass Lengths - Successful Passes";
                    break;
                case "MPpassLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [MPunderSevenPassesData, MPsevenToFifteenPassesData, MPfifteenToThirtyPassesData, MPoverThirtyPassesData]
                    };
                    yAxes = [{ id: "length", ticks: { beginAtZero: true } }];
                    title = "Pass Lengths - Unsuccessful Passes";
                    break;
                case "Shots - General":
                    data = {
                        labels: queryLabels,
                        datasets: [goalsData, shotsOnTargetData, totalShotsData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Shots - General";
                    graphID = "GeneralShots";
                    break;
                case "Shot Attributes":
                    data = {
                        labels: queryLabels,
                        datasets: [avgShotLenData, avgShotVelData, maxShotLenData, maxShotVelData]
                    };
                    yAxes = [{ id: "velocity", ticks: { beginAtZero: true } }, { id: "length", ticks: { beginAtZero: true } }];
                    title = "Shots - Attributes";
                    graphID = "AttributesShots";
                    break;
                case "Interceptions":
                    data = {
                        labels: queryLabels,
                        datasets: [interceptionsData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Interceptions";
                    graphID = "interceptions";
                    break;
                case "Clearances":
                    data = {
                        labels: queryLabels,
                        datasets: [clearanceEventsData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Clearances";
                    break;
                case "avgClearanceLength":
                    data = {
                        labels: queryLabels,
                        datasets: [avgClearanceLengthData]
                    };
                    yAxes = [{ id: "length", ticks: { beginAtZero: true } }];
                    title = "Avg Clearance Length";
                    break;
                case "Set Pieces":
                    data = {
                        labels: queryLabels,
                        datasets: [freekicksData, cornerkickEventsData, throwinsData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Set Pieces";
                    graphID = "setPieces";
                    break;
                case "Query Overview":
                    data = {
                        labels: queryLabels,
                        datasets: [successfulPassData, misplacedPassEventsData, totalShotsData, interceptionsData, clearanceEventsData, setPiecesData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Query Overview";
                    graphID = "qOverview";
                    break;
                case "dumpEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [dumpData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Dumps";
                    graphID = "Dumps";
                    break;
                case "entryEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [entryData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Entries";
                    graphID = "Entries";
                    break;
                case "shiftEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [shiftData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Shifts";
                    graphID = "Shifts";
                    break;
                case "faceOffEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [faceOffData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Face Offs";
                    graphID = "FaceOffs";
                    break;
                case "shotAtGoalEvent":
                    data = {
                        labels: queryLabels,
                        datasets: [shotAtGoalData]
                    };
                    yAxes = [{ id: qty, ticks: { beginAtZero: true } }];
                    title = "Shots At Goal";
                    graphID = "ShotsAtGoal";
                    break;
            }
            this.createGraph(data, title, chartType, graphID, yAxes, scheme);
        }
        // terminates the loading button
        document.getElementById("queryAnalysisButton").innerHTML = "Analyze";
    };
    Analysis.createGraph = function (graphData, title, chartType, graphID, yAxis, scheme) {
        $('#allCharts').append('<canvas id=' + graphID + '></canvas>');
        var myChart = document.getElementById(graphID);
        var chartConext = myChart.getContext('2d');
        Chart.defaults.global.getDefaultFontFamily = 'Lato';
        Chart.defaults.global.defaultFontSize = 18;
        Chart.defaults.global.defaultFontColor = '#777';
        var chartOptions = {
            plugins: {
                colorschemes: {
                    scheme: scheme
                }
            },
            title: {
                display: true,
                text: title,
                fontSize: 25
            },
            scales: {
                yAxes: yAxis
            },
            legend: {
                display: true,
                position: 'right',
                labels: {
                    fontColor: '#000'
                }
            }
        };
        var theChart = new Chart(chartConext, {
            type: chartType,
            data: graphData,
            options: chartOptions
        });
        theChart.update();
    };
    Analysis.showOrHideTimelineFilter = function () {
        var slider = document.getElementById("sliderDiv");
        if (slider.style.display === "none") {
            slider.style.display = "inline";
        }
        else {
            slider.style.display = "none";
            var sliderVal = document.getElementById("slider");
            sliderVal.noUiSlider.set([0, 90]); //Set the timeFilter
        }
    };
    /**
     * Calls DBconnection to send the Query to the server
     */
    Analysis.analyzeQueries = function () {
        if (($('select#query_select').val() == "") || ($('select#query_param_select').val() == "")) {
            $('#error-querymodal-text').text("You have to select at least one query and one parameter for the Query Analysis.");
            $("#errorQueryModal").modal();
            return;
        }
        else {
            // activates loading button
            document.getElementById("queryAnalysisButton").innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i> Analysing...';
            var slider = document.getElementById("slider");
            var queryIdArray = $('select#query_select').val();
            var timeFilter = slider.noUiSlider.get().toString(); //Get the timeFilter
            DBConnection.analyzeQueries(queryIdArray, timeFilter);
        }
    };
    //to init the player and parameter selection
    Analysis.loadSelectionPlayer = function () {
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        DBConnection.getFilter("/getPlayers?sportFilter=" + sport);
        $('#param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
    };
    //to init the team and parameter selection
    Analysis.loadSelectionTeam = function () {
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        DBConnection.getFilter("/getTeams?sportFilter=" + sport);
        $('#team_param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
    };
    //to init the match and parameter selection
    Analysis.loadSelectionMatch = function () {
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        DBConnection.getFilter("/getMatches?sportFilter=" + sport);
        $('#match_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Matches</div>",
            selectionHeader: "<div class='custom-header'>Selected Matches</div>"
        });
    };
    Analysis.fillSelectionPlayer = function (json) {
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        var parameterName = "";
        var parameterID = "";
        var o = new Option("", "");
        switch (sport) {
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
        for (var i in json.result) {
            var playerName = json.result[i].name;
            var playerID = json.result[i].pid;
            var o_1 = new Option(playerName, playerID);
            //Adds the player options to the selection as well as the player ID as the value. "<option value= " + playerID + ">" + playerName + "</option>"
            $('#player_select').append(o_1);
        }
        $('#player_select').multiSelect({
            selectionHeader: "<div class='custom-header'>Selected Players (Max 11) </div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Players'>",
            afterInit: function (ms) {
                var that = this, $selectableSearch = that.$selectableUl.prev(), $selectionSearch = that.$selectionUl.prev(), selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)', selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function (e) {
                    if (e.which === 40) {
                        that.$selectableUl.focus();
                        return false;
                    }
                });
                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function (e) {
                    if (e.which == 40) {
                        that.$selectionUl.focus();
                        return false;
                    }
                });
            },
            afterSelect: function () {
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function () {
                this.qs1.cache();
                this.qs2.cache();
            }
        });
        $('#player_select').multiSelect('refresh');
    };
    //fill the box with team names
    Analysis.fillSelectionTeam = function (json) {
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        var parameterName = "";
        var parameterID = "";
        var o = new Option("", "");
        switch (sport) {
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
        for (var i in json.result) {
            var teamName = json.result[i].name;
            var teamID = json.result[i].tid;
            var o_2 = new Option(teamName, teamID);
            //Adds the team options to the selection as well as the team ID as the value. "<option value= " + teamID + ">" + teamName + "</option>"
            $('#team_select').append(o_2);
        }
        $('#team_select').multiSelect({
            selectionHeader: "<div class='custom-header'>Selected Teams</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Teams'>",
            afterInit: function (ms) {
                var that = this, $selectableSearch = that.$selectableUl.prev(), $selectionSearch = that.$selectionUl.prev(), selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)', selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function (e) {
                    if (e.which === 40) {
                        that.$selectableUl.focus();
                        return false;
                    }
                });
                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function (e) {
                    if (e.which == 40) {
                        that.$selectionUl.focus();
                        return false;
                    }
                });
            },
            afterSelect: function () {
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function () {
                this.qs1.cache();
                this.qs2.cache();
            }
        });
        $('#team_select').multiSelect('refresh');
    };
    //fill the box with team names
    Analysis.fillSelectionMatch = function (json) {
        for (var i in json) {
            var matchInfo = json[i][0];
            var matchId = matchInfo.matchId;
            var homeTeam = matchInfo.homeTeamName;
            var awayTeam = matchInfo.awayTeamName;
            var matchName = homeTeam + " vs. " + awayTeam;
            var o = new Option(matchName, matchId);
            //Adds the team options to the selection as well as the team ID as the value. "<option value= " + teamID + ">" + teamName + "</option>"
            $('#match_select').append(o);
        }
        $('#match_select').multiSelect({
            selectionHeader: "<div class='custom-header'>Selected Matches</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Teams'>",
            afterInit: function (ms) {
                var that = this, $selectableSearch = that.$selectableUl.prev(), $selectionSearch = that.$selectionUl.prev(), selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)', selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function (e) {
                    if (e.which === 40) {
                        that.$selectableUl.focus();
                        return false;
                    }
                });
                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function (e) {
                    if (e.which == 40) {
                        that.$selectionUl.focus();
                        return false;
                    }
                });
            },
            afterSelect: function () {
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function () {
                this.qs1.cache();
                this.qs2.cache();
            }
        });
        $('#match_select').multiSelect('refresh');
    };
    /**
     * Select and Deselect ALL parameters in the Player Analysis
     */
    Analysis.selectAllPlayerParam = function () {
        if (document.getElementById('selectPlayerParamBtn').innerHTML == "Select All") {
            $('#param_select').multiSelect('select_all');
            document.getElementById('selectPlayerParamBtn').innerHTML = "Deselect All";
        }
        else if (document.getElementById('selectPlayerParamBtn').innerHTML == "Deselect All") {
            $('#param_select').multiSelect('deselect_all');
            document.getElementById('selectPlayerParamBtn').innerHTML = "Select All";
        }
    };
    /**
     * Select and Deselect ALL parameters in the Team Analysis
     */
    Analysis.selectAllTeamParam = function () {
        if (document.getElementById('selectTeamParamBtn').innerHTML == "Select All") {
            $('#team_param_select').multiSelect('select_all');
            document.getElementById('selectTeamParamBtn').innerHTML = "Deselect All";
        }
        else if (document.getElementById('selectTeamParamBtn').innerHTML == "Deselect All") {
            $('#team_param_select').multiSelect('deselect_all');
            document.getElementById('selectTeamParamBtn').innerHTML = "Select All";
        }
    };
    /**
     * Select and Deselect ALL parameters in the Query Analysis
     */
    Analysis.selectAllQueryParam = function () {
        if (document.getElementById('selectQueryParamBtn').innerHTML == "Select All") {
            $('#query_param_select').multiSelect('select_all');
            document.getElementById('selectQueryParamBtn').innerHTML = "Deselect All";
        }
        else if (document.getElementById('selectQueryParamBtn').innerHTML == "Deselect All") {
            $('#query_param_select').multiSelect('deselect_all');
            document.getElementById('selectQueryParamBtn').innerHTML = "Select All";
        }
    };
    Analysis.loadQuerySelection = function () {
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        var parameterName = "";
        var parameterID = "";
        var o = new Option("", "");
        switch (sport) {
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
        var sliderDiv = document.getElementById("sliderDiv");
        sliderDiv.style.display = "none";
        DBConnection.analysisOn = true;
        DBConnection.getFilter("/getQueries?sportFilter=" + sport);
        $('#query_param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
        //TODO: Load the timeline to filter here.
        var slider = document.getElementById('slider');
        var thirdHalf = document.getElementById('3rdHalf');
        var secondHalf = document.getElementById('2ndHalf');
        var firstHalf = document.getElementById('1stHalf');
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
    };
    Analysis.setFirstHalf = function () {
        var slider = document.getElementById('slider');
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        switch (sport) {
            case "football":
                slider.noUiSlider.set([0, 45]);
                break;
            case "icehockey":
                slider.noUiSlider.set([0, 20]);
                break;
        }
    };
    Analysis.setSecondHalf = function () {
        var slider = document.getElementById('slider');
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        switch (sport) {
            case "football":
                slider.noUiSlider.set([45, 90]);
                break;
            case "icehockey":
                slider.noUiSlider.set([20, 40]);
                break;
        }
    };
    Analysis.setThirdHalf = function () {
        var slider = document.getElementById('slider');
        var sport = window.location.search.substring(window.location.search.lastIndexOf("=") + 1);
        switch (sport) {
            case "icehockey":
                slider.noUiSlider.set([40, 60]);
        }
    };
    Analysis.fillQuerySelection = function (json) {
        //create options for all the queries with the QueryID as value and QueryName as text
        for (var i in json.result) {
            var queryName = json.result[i].name;
            var querySport = json.result[i].sport;
            var query_ID = json.result[i].qid;
            if (window.location.search.substring(window.location.search.lastIndexOf("=") + 1) === querySport) {
                var o = new Option(queryName, query_ID);
                $('#query_select').append(o);
            }
        }
        $('#query_select').multiSelect({
            selectionHeader: "<div class='custom-header'>Selected Queries (Max 5)</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All Queries'>",
            afterInit: function (ms) {
                var that = this, $selectableSearch = that.$selectableUl.prev(), $selectionSearch = that.$selectionUl.prev(), selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)', selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';
                that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
                    .on('keydown', function (e) {
                    if (e.which === 40) {
                        that.$selectableUl.focus();
                        return false;
                    }
                });
                that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
                    .on('keydown', function (e) {
                    if (e.which == 40) {
                        that.$selectionUl.focus();
                        return false;
                    }
                });
            },
            afterSelect: function () {
                this.qs1.cache();
                this.qs2.cache();
            },
            afterDeselect: function () {
                this.qs1.cache();
                this.qs2.cache();
            }
        });
        $('#query_select').multiSelect('refresh');
    };
    /**
     * Checks if a match is selected and calls DBConnection to calculate the pressing phases
     */
    Analysis.calculatePressing = function () {
        var btnContent = document.getElementById("pressingAnalysisBtn").innerHTML;
        if (btnContent == "Pressing Phases") {
            if (FilterArea.getMatchFilters() == "") {
                $('#error-modal-text').text("You have to select a match for the pressing analysis.");
                $("#errorMPModal").modal();
                return;
            }
            else {
                // if phases from ResultList should be removed and to clear drawingArea
                ResultList.removeResultsFromResultList(Timeline.getItemListLength());
                DrawingArea.clearAndResetDefault();
                document.getElementById("pressingAnalysisBtn").innerHTML = 'Deactivate Pressing Phases';
                var user = document.getElementById('userMenu').textContent;
                var userName = user.trim();
                DBConnection.analyzePressing(userName);
            }
        }
        else {
            document.getElementById("pressingAnalysisBtn").innerHTML = 'Pressing Phases';
            Timeline.resizeTimeline();
            DrawingArea.clearAndResetDefault();
        }
    };
    /**
     * Checks if a match is selected and calls DBConnection to calculate the pressing index for the match
     */
    Analysis.calculatePressingFor2d = function () {
        //first check if speed Analysis graph2d is currently visible and delete if so
        var speedBtn = document.getElementById("playerSpeedBtn").innerHTML;
        if (speedBtn != "Speed Analysis") {
            document.getElementById("playerSpeedBtn").innerHTML = 'Speed Analysis';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }
        //now the pressing Index calculation starts
        var btnContent = document.getElementById("pressingAnalysis2dBtn").innerHTML;
        if (btnContent == "Pressing Index") {
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
        else {
            document.getElementById("pressingAnalysis2dBtn").innerHTML = 'Pressing Index';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }
    };
    /**
     * Function is called if clear button is clicked and resets timeline and graph2d to default settings
     */
    Analysis.reset2dToDefault = function () {
        document.getElementById("pressingAnalysis2dBtn").innerHTML = 'Pressing Index';
        document.getElementById("playerSpeedBtn").innerHTML = 'Speed Analysis';
        document.getElementById('timeline').setAttribute("style", "height: 25%");
        Graph2d.clearItemList();
        Timeline.resizeTimeline();
    };
    /**
     * Checks if at least one player is selected and calls DBConnection to calculate the players' speed
     */
    Analysis.calculatePlayerSpeed = function () {
        //first check if pressingIndex graph2d is currently visible and delete if so
        var pressingBtn = document.getElementById("pressingAnalysis2dBtn").innerHTML;
        if (pressingBtn != "Pressing Index") {
            document.getElementById("pressingAnalysis2dBtn").innerHTML = 'Pressing Index';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }
        //now the Speed Analysis starts
        var btnContent = document.getElementById("playerSpeedBtn").innerHTML;
        if (btnContent == "Speed Analysis") {
            if (FilterArea.getPlayerFilters() != "" && FilterArea.getMatchFilters() != "") {
                document.getElementById("playerSpeedBtn").innerHTML = 'Deactivate Speed Analysis';
                document.getElementById('timeline').setAttribute("style", "height: 12.5%");
                Graph2d.fillPlayerList();
                DBConnection.analyzePlayerSpeed();
            }
            else {
                $('#error-modal-text').text("You have to select a match and at least one player for the speed analysis.");
                $("#errorMPModal").modal();
                return;
            }
        }
        else {
            document.getElementById("playerSpeedBtn").innerHTML = 'Speed Analysis';
            Graph2d.clearItemList();
            Timeline.resetTimelineAfter2d();
        }
    };
    Analysis.calculatePlayerPassNetwork = function () {
        var btn = document.getElementById("passNetworkBtn").innerHTML;
        if (btn != "Deactivate Pass Network") {
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
        else {
            document.getElementById("passNetworkBtn").innerHTML = 'Pass Network';
            Network.clearNodesAndEdges();
        }
    };
    /**
     * Called if a customizaton of pressing values has taken place and calls the server to update values in the DB
     */
    Analysis.setNewPressingValues = function () {
        var indexThreshold = $('#pressingIndexThreshold').val();
        var durationThreshold = $('#pressingDurationThreshold').val() * 1000; //milliseconds
        var user = document.getElementById('userMenu').textContent;
        DBConnection.customizePressing(user, indexThreshold, durationThreshold);
        // needed to customize pressing if no user is selected --> values only stored temporary for the session
        CONFIG.PRESSING_INDEX_THRESHOLD = $('#pressingIndexThreshold').val();
        CONFIG.PRESSING_DURATION_THRESHOLD = $('#pressingDurationThreshold').val() * 1000;
        // Need to remove phases from ResultList and to clear drawingArea
        ResultList.removeResultsFromResultList(Timeline.getItemListLength());
        DrawingArea.clearAndResetDefault();
    };
    /**
     * Called if pressing values are set back to default in the customization modal
     */
    Analysis.setDefaultPressingValues = function () {
        $('#pressingIndexThreshold').val(2);
        $('#pressingDurationThreshold').val(2);
    };
    Analysis.calculateOffTransition = function () {
        if (FilterArea.getMatchFilters() == "" || FilterArea.getTeamFilters() == "") {
            $('#error-modal-text').text("You have to select a match and a team for the transition analysis.");
            $("#errorMPModal").modal();
            return;
        }
        else {
            // if phases from ResultList should be removed and to clear drawingArea
            ResultList.removeResultsFromResultList(Timeline.getItemListLength());
            DrawingArea.clearAndResetDefault();
            var user = document.getElementById('userMenu').textContent;
            DBConnection.analyzeOffTransition(user);
        }
    };
    Analysis.calculateDefTransition = function () {
        if (FilterArea.getMatchFilters() == "" || FilterArea.getTeamFilters() == "") {
            $('#error-modal-text').text("You have to select a match and a team for the transition analysis.");
            $("#errorMPModal").modal();
            return;
        }
        else {
            // if phases from ResultList should be removed and to clear drawingArea
            ResultList.removeResultsFromResultList(Timeline.getItemListLength());
            DrawingArea.clearAndResetDefault();
            var user = document.getElementById('userMenu').textContent;
            DBConnection.analyzeDefTransition(user);
        }
    };
    // needed for the visualization in the UI
    Analysis.parameterDict = {
        "gamesPlayed": "Games Played",
        "gamesWon": "Games Won",
        "gamesLost": "Games Lost",
        "gamesDrawn": "Games Drawn",
        "winPercentage": "Win Percentage [%]",
        "successfulPassEvent": "Successful Passes",
        "misplacedPassEvent": "Misplaced Passes",
        "passAccuracy": "Passing Accuracy [%]",
        "longPasses": "Long Passes",
        "shortPasses": "Short Passes",
        "avgPassLength": "Avg Pass Length [m]",
        "avgPassVelocity": "Avg Pass Velocity [km/h]",
        "avgPacking": "Avg Packing",
        "leftPasses": "Passes Left",
        "rightPasses": "Passes Right",
        "forwardPasses": "Passes Forward",
        "backwardPasses": "Passes Backward",
        "goalEvent": "Goals",
        "totalShots": "Total Shots",
        "shotOnTargetEvent": "Shots on Target",
        "shotOffTargetEvent": "Shots off Target",
        "avgShotLength": "Avg Shot Length [m]",
        "avgShotVelocity": "Avg Shot Velocity [km/h]",
        "DribblingStatistic": "Dribblings",
        "interceptionEvent": "Interceptions",
        "clearanceEvent": "Clearances",
        "totalUnderPressurePhases": "Under Pressing Phases",
        "avgUnderPressurePhasesPerGame": "Under Pressing Phases per Game",
        "avgUnderPressureIndex": "Average Pressing exposed [Pressing-Index]",
        "totalPressurePhases": "Pressing Phases",
        "avgPhasesPerGame": "Pressing Phases per Game",
        "avgPressureIndex": "Average Pressing exerted [Pressing-Index]",
        "timeSpeedZone1": "Spent time [in s] standing [< 1 km/h]",
        "timeSpeedZone2": "Spent time [in s] walking [1.1-11 km/h]",
        "timeSpeedZone3": "Spent time [in s] jogging [11.1-14 km/h]",
        "timeSpeedZone4": "Spent time [in s] running [14.1-17 km/h]",
        "timeSpeedZone5": "Spent time [in s] sprinting [17.1-24 km/h]",
        "timeSpeedZone6": "Spent time [in s] at maximum speed [> 24 km/h]",
        "totalTouches": "Touches",
        "cornerkickEvent": "Cornerkicks",
        "throwinEvent": "Throwins",
        "freekickEvent": "Freekicks",
        "playerFoulsEvent": "Fouls committed",
        "playerGetFouledEvent": "Fouls against",
        "teamFoulsEvent": "Fouls committed",
        "teamGetFouledEvent": "Fouls against",
        "transitionsOffensive": "Transitions DEF-OFF per Game",
        "transitionsDefensive": "Transitions OFF-DEF per Game",
        "successfulTakeOnEvent": "Successful Take Ons",
        "failedTakeOnEvent": "Failed Take Ons",
        "playerOn": "Substitutions (In)",
        "playerOff": "Substitutions (Out)",
        "subsPerGame": "Substitutions per Game",
        "dumpEvent": "Dumps",
        "entryEvent": "Entries",
        "shiftEvent": "Shifts",
        "faceOffEvent": "Face Offs",
        "shotAtGoalEvent": "Shots at Goal",
        "penaltyEvent": "Penalties",
        "stickhandlingEvent": "Stickhandlings"
    };
    Analysis.colors = [['#e5524a', '#ee8b86'], ['#187fce', '#74b2e2'], ['#008d68', '#66bba4'], ['#ffa800', '#ffcb66'], ['#7b457b', '#b08fb0'], ['#e5524a', '#ee8b86'], ['#187fce', '#74b2e2'], ['#008d68', '#66bba4'], ['#ffa800', '#ffcb66'], ['#7b457b', '#b08fb0'], ['#e5524a', '#ee8b86']];
    return Analysis;
}());
var Graph = /** @class */ (function () {
    function Graph(label, yAxisID) {
        this.label = label;
        this.yAxisID = yAxisID;
        this.data = [];
    }
    return Graph;
}());
