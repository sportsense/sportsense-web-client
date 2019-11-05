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
    Analysis.openNewTab = function (analysis) {
        var link = window.location.href;
        link = link.substr(0, link.lastIndexOf("/"));
        switch (analysis) {
            case "playerAnalysis": {
                link = link + "/playerAnalysis.html";
                break;
            }
            case "queryAnalysis": {
                link = link + "/queryAnalysis.html";
                break;
            }
            default: {
                console.log("invalid choice " + analysis);
                break;
            }
        }
        window.open(link);
    };
    //creates the player name cards on the top from the cards array
    Analysis.setCards = function (cards) {
        $('.players-g').html('');
        for (var i = 0; i < Object.keys(cards).length; i++) {
            $('.players-g').append('<div class="card-g" data-name="' + Object.keys(cards)[i] + '"><div class="name-g">' + Object.keys(cards)[i] + '</div></div>');
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
     * Calls the method that create the graphs
     * @param json
     */
    Analysis.analyzePlayers = function (json) {
        var parameterArray = $('select#param_select').val();
        for (var id in json) {
            //console.log(id);
            var name_1 = $("#player_select option:selected[value = " + id + "]").text();
            //console.log(name);
        }
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
            //console.log(combined);
            playersAndStats += combined;
            b++;
        }
        var jsonCards = "{" + playersAndStats + "}";
        var cards = JSON.parse(jsonCards);
        this.updateGraph(cards, parameterArray);
    };
    //Analyzes the players
    Analysis.analyze = function () {
        var playerIdArray = $('select#player_select').val();
        var parameterArray = $('select#param_select').val();
        //For some names in the Selection, there were duplicates, this removes them.
        var playerIdArrayWithoutDuplicates = playerIdArray.filter(function (item, pos) {
            return playerIdArray.indexOf(item) == pos;
        });
        //console.log(parameterArray);
        //console.log(playerIdArrayWithoutDuplicates);
        DBConnection.analyzePlayers(playerIdArrayWithoutDuplicates, parameterArray);
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
            }
            this.createGraph(data, title, chartType, graphID, yAxes, scheme);
        }
        console.log(json);
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
        var slider = document.getElementById("slider");
        var queryIdArray = $('select#query_select').val();
        var timeFilter = slider.noUiSlider.get().toString(); //Get the timeFilter
        DBConnection.analyzeQueries(queryIdArray, timeFilter);
    };
    //to init the player and parameter selection
    Analysis.loadSelection = function () {
        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        DBConnection.getFilter("/getPlayers");
        $('#param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
    };
    Analysis.fillSelection = function (json) {
        for (var i in json.result) {
            var playerName = json.result[i].name;
            var playerID = json.result[i].pid;
            var o = new Option(playerName, playerID);
            //Adds the player options to the selection as well as the player ID as the value. "<option value= " + playerID + ">" + playerName + "</option>"
            $('#player_select').append(o);
        }
        $('#player_select').multiSelect({
            selectionHeader: "<div class='custom-header'>Selected Players</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All players'>",
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
    Analysis.loadQuerySelection = function () {
        var sliderDiv = document.getElementById("sliderDiv");
        sliderDiv.style.display = "none";
        DBConnection.analysisOn = true;
        DBConnection.getFilter("/getQueries");
        $('#query_param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
        //TODO: Load the timeline to filter here.
        var slider = document.getElementById('slider');
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
        slider.noUiSlider.on('set', function () {
            Analysis.analyzeQueries();
        });
    };
    Analysis.setFirstHalf = function () {
        var slider = document.getElementById('slider');
        slider.noUiSlider.set([0, 45]);
    };
    Analysis.setSecondHalf = function () {
        var slider = document.getElementById('slider');
        slider.noUiSlider.set([45, 90]);
    };
    Analysis.fillQuerySelection = function (json) {
        //create options for all the queries with the QueryID as value and QueryName as text
        for (var i in json.result) {
            var queryName = json.result[i].name;
            var query_ID = json.result[i].qid;
            var o = new Option(queryName, query_ID);
            $('#query_select').append(o);
        }
        $('#query_select').multiSelect({
            selectionHeader: "<div class='custom-header'>Selected Queries(Max 5)</div>",
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
        "totalTouches": "Touches",
        "cornerkickEvent": "Cornerkicks",
        "throwinEvent": "Throwins"
    };
    Analysis.cards2 = {
        "Robert": [0, 45, 12, 8, 3],
        "Tim": [1, 57, 5, 3, 0]
    };
    Analysis.param2 = ["Goals", "Successful Passes", "Misplaced Passes", "Interceptions", "Tackles"];
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
