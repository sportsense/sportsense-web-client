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
        "totalTouches" : "Touches",
        "cornerkickEvent" : "Cornerkicks",
        "throwinEvent" : "Throwins"
    };

    public static openNewTab(analysis: string) {
        let link = window.location.href;
        link = link.substr(0, link.lastIndexOf("/"));

        switch (analysis) {
            case "playerAnalysis": {
                link = link + "/playerAnalysis.html";
                break;
            }
            case "queryAnalysis":{
                link = link + "/queryAnalysis.html";
                break
            }
            default:{
                console.log("invalid choice " + analysis);
                break;
            }
        }
        window.open(link);
    }

    //creates the player name cards on the top from the cards array
    public static setCards(cards){
        $('.players-g').html('');
        for (let i = 0; i < Object.keys(cards).length; i++){
            $('.players-g').append('<div class="card-g" data-name="'+Object.keys(cards)[i]+'"><div class="name-g">'+Object.keys(cards)[i]+'</div></div>');
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
                $(this).find('.fill-g').css('height', height + '%');
            })
        })
    }

    public static updateGraph(cards, param){
        this.setCards(cards);
        this.setRows(param);
        this.setBars(cards,param, Analysis.colors);
    }

    public static cards2 = {
        "Robert":[0, 45, 12, 8, 3],
        "Tim":[1, 57, 5, 3, 0]
    };

    public static param2 = ["Goals", "Successful Passes", "Misplaced Passes", "Interceptions", "Tackles"];

    public static colors = [['#e5524a','#ee8b86'],['#187fce','#74b2e2'],['#008d68','#66bba4'],['#ffa800','#ffcb66'],['#7b457b','#b08fb0'], ['#e5524a','#ee8b86'],['#187fce','#74b2e2'],['#008d68','#66bba4'],['#ffa800','#ffcb66'],['#7b457b','#b08fb0'],['#e5524a','#ee8b86']];

    /**
     * Calls the method that create the graphs
     * @param json
     */
    public static analyzePlayers(json){
        let parameterArray = $('select#param_select').val();

        for (let id in json){
            //console.log(id);
            let name = $("#player_select option:selected[value = "+id+"]").text();
            //console.log(name);
        }

        let playersAndStats = "";

        let b = 0;
        for( let i in json){ //Loops through the players stats

            let stats = json[i];
            let pName = $("#player_select option:selected[value = "+i+"]").text();  //Selects the player with the ID as value.

            let combined = "";
            //So we don't have the comma after the last element
            if (b === ( $("#player_select option:selected").length -1)){
                combined = '"' + pName + '":['+stats+']';
            } else {
                combined = '"' + pName + '":['+stats+'],';
            }

            //console.log(combined);
            playersAndStats += combined;
            b++
        }

        let jsonCards = "{"+playersAndStats+"}";
        let cards = JSON.parse(jsonCards);
        this.updateGraph(cards,parameterArray);
    }

    //Analyzes the players
    public static analyze(){
        let playerIdArray = $('select#player_select').val();
        let parameterArray = $('select#param_select').val();

        //For some names in the Selection, there were duplicates, this removes them.
        let playerIdArrayWithoutDuplicates = playerIdArray.filter(function (item, pos) {
            return playerIdArray.indexOf(item) == pos;
        });

        //console.log(parameterArray);
        //console.log(playerIdArrayWithoutDuplicates);
        DBConnection.analyzePlayers(playerIdArrayWithoutDuplicates, parameterArray);
    }

    public static getParameterNames(key): string {
        return this.parameterDict[key];
    }

    public static showQueryGraphs(json){
        let queryLabels = [];
        let chartType;
        if ($('#chartToggler').is(":checked")){
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

        let forwardPassData = new Graph('Forward',qty);
        let backwardPassData = new Graph('Backward',qty);
        let leftPassData = new Graph('Left',qty);
        let rightPassData = new Graph('Right',qty);

        let misplacedAvgPassLengthData = new Graph(avgLength, "length");
        let avgMisplacedPassVelocityData = new Graph(avgVelocity, "velocity");
        let misplacedPassBackwardData = new Graph("Backward", qty);
        let misplacedPassForwardData = new Graph("Forward", qty);
        let misplacedPassLeftData = new Graph("Left", qty);
        let misplacedPassRightData = new Graph("Right", qty);
        let misplacedPassEventsData = new Graph("Misplaced Passes", qty);
        let maxMisplacedLengthData = new Graph(maxLength, "length");
        let maxMisplacedVelocityData = new Graph(maxVelocity, "velocity");

        let overThirtyPassesData = new Graph("Over 30 m","length");
        let underSevenPassesData = new Graph("Under 7 m", "length");
        let sevenToFifteenPassesData = new Graph("7 - 15 m","length");
        let fifteenToThirtyPassesData = new Graph("15 - 30 m","length");
        let MPoverThirtyPassesData = new Graph("Over 30 m","length");
        let MPunderSevenPassesData = new Graph("Under 7 m","length");
        let MPsevenToFifteenPassesData = new Graph("7 - 15 m","length");
        let MPfifteenToThirtyPassesData = new Graph("15 - 30 m","length");

        let totalShotsData = new Graph("Total Shots", qty);
        let shotsOnTargetData = new Graph("Shots on Target", qty);
        let goalsData = new Graph("Goals", qty);

        let avgShotLenData = new Graph(avgLength,"length");
        let avgShotVelData = new Graph(avgVelocity,"velocity");
        let maxShotLenData = new Graph(maxLength,"length");
        let maxShotVelData = new Graph(maxVelocity,"velocity");

        //Interceptions
        let interceptionsData = new Graph("Interceptions",qty);

        //Clearance
        let avgClearanceLengthData = new Graph(avgLength,"length");
        let clearanceEventsData = new Graph("Clearances",qty);

        //corners
        let cornerkickEventsData = new Graph("Cornerkicks",qty);

        //freekicks
        let freekicksData = new Graph("Freekicks",qty);

        //throw-ins
        let throwinsData = new Graph("Throw-ins",qty);

        let setPiecesData = new Graph("Set Pieces", qty);

        for (let i in json){
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
            if (successfulPassEvents != 0){
                passPercentage = Math.floor((successfulPassEvents/(successfulPassEvents+misplacedPassEvents))*1000)/10;
                passPercentageData.data.push(passPercentage);
            }

            let maxPassLength: number  = json[i].maxPassLength;
            maxPassLengthData.data.push(maxPassLength);
            let maxPassVelocity: number = json[i].maxPassVelocity;
            maxPassVelocityData.data.push(maxPassVelocity);

            //Shooting
            let avgShotLength: number = json[i].avgShotLength;
            let avgShotVelocity: number = json[i].avgShotVelocity;
            let maxShotLength: number  = json[i].maxShotLength;
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

            let setPieces = throwins+freekicks+cornerkickEvent;
            setPiecesData.data.push(setPieces);
        }
        $('#allCharts').html(''); //To destroy previous charts

        let queryParamArray = $('select#query_param_select').val();
        let data;
        let yAxes = [];
        let title;
        let scheme = 'brewer.Spectral10';
        let graphID;
        for (let i = 0; i < queryParamArray.length; i++){
            graphID = queryParamArray[i];
            switch (queryParamArray[i]) {
                case "misplaced/Successful":
                    data = { //This needs to be done this way, if we push only the data.datasets we get an error, see: https://github.com/chartjs/Chart.js/issues/6207
                        labels: queryLabels,
                        datasets: [successfulPassData, misplacedPassEventsData]
                    };
                    yAxes = [{id:"quantity", ticks:{beginAtZero:true}}];
                    title = "Successful & Misplaced Passes";
                    break;
                case "passAccuracy": //, passPercentageData
                    data = {
                        labels: queryLabels,
                        datasets: [passPercentageData]
                    };
                    yAxes = [{id:"percentage", ticks:{beginAtZero:true}}];
                    title = "Pass Accuracy";
                    break;
                case "avgMaxSuccPassLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPassLengthData, maxPassLengthData]
                    };
                    yAxes = [{id:"length", ticks:{beginAtZero:true}}];
                    title = "Avg & Max Length - Successful Passes";
                    break;
                case "SuccessfulPassesVelocity":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPassVelocityData, maxPassVelocityData]
                    };
                    yAxes = [{id:"velocity", ticks:{beginAtZero:true}}];
                    title = "Avg & Max Velocity - Successful Passes";
                    break;
                case "packing":
                    data = {
                        labels: queryLabels,
                        datasets: [avgPackingData]
                    };
                    yAxes = [{id:"packing", ticks:{beginAtZero:true}}];
                    title = "Avg Packing - Successful Passes";
                    break;
                case "PassDirectionsSuccessfulPasses":
                    data = {
                        labels: queryLabels,
                        datasets:[leftPassData,forwardPassData,backwardPassData,rightPassData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Pass Directions - Successful Passes";
                    break;
                case "MisplacedPassesLength":
                    data = {
                        labels: queryLabels,
                        datasets: [misplacedAvgPassLengthData,maxMisplacedLengthData]
                    };
                    yAxes = [{id:"length", ticks:{beginAtZero:true}}];
                    title = "Avg & Max Length - Misplaced Passes";
                    break;
                case "MisplacedPassesVelocity":
                    data = {
                        labels: queryLabels,
                        datasets: [avgMisplacedPassVelocityData, maxMisplacedVelocityData]
                    };
                    yAxes = [{id:"velocity", ticks:{beginAtZero:true}}];
                    title = "Avg & Max Velocity - Misplaced Passes";
                    break;
                case "PassDirectionsMisplacedPasses":
                    data = {
                        labels: queryLabels,
                        datasets: [misplacedPassLeftData,misplacedPassForwardData,misplacedPassBackwardData, misplacedPassRightData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Pass Directions - Misplaced Passes";
                    break;
                case "passLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [underSevenPassesData,sevenToFifteenPassesData,fifteenToThirtyPassesData,overThirtyPassesData]
                    };
                    yAxes = [{id:"length", ticks:{beginAtZero:true}}];
                    title = "Pass Lengths - Successful Passes";
                    break;
                case "MPpassLengths":
                    data = {
                        labels: queryLabels,
                        datasets: [MPunderSevenPassesData,MPsevenToFifteenPassesData,MPfifteenToThirtyPassesData,MPoverThirtyPassesData]
                    };
                    yAxes = [{id:"length", ticks:{beginAtZero:true}}];
                    title = "Pass Lengths - Unsuccessful Passes";
                    break;
                case "Shots - General":
                    data = {
                        labels: queryLabels,
                        datasets: [goalsData,shotsOnTargetData,totalShotsData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Shots - General";
                    graphID = "GeneralShots";
                    break;
                case "Shot Attributes":
                    data = {
                        labels: queryLabels,
                        datasets: [avgShotLenData, avgShotVelData, maxShotLenData, maxShotVelData]
                    };
                    yAxes = [{id:"velocity", ticks:{beginAtZero:true}},{id:"length", ticks:{beginAtZero:true}}];
                    title = "Shots - Attributes";
                    graphID = "AttributesShots";
                    break;
                case "Interceptions":
                    data = {
                        labels: queryLabels,
                        datasets: [interceptionsData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Interceptions";
                    graphID = "interceptions";
                    break;
                case "Clearances":
                    data = {
                        labels: queryLabels,
                        datasets: [clearanceEventsData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Clearances";
                    break;
                case "avgClearanceLength":
                    data = {
                        labels: queryLabels,
                        datasets: [avgClearanceLengthData]
                    };
                    yAxes = [{id:"length", ticks:{beginAtZero:true}}];
                    title = "Avg Clearance Length";
                    break;
                case "Set Pieces":
                    data = {
                        labels: queryLabels,
                        datasets: [freekicksData,cornerkickEventsData,throwinsData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Set Pieces";
                    graphID = "setPieces";
                    break;
                case "Query Overview":
                    data = {
                        labels: queryLabels,
                        datasets: [successfulPassData,misplacedPassEventsData,totalShotsData,interceptionsData,clearanceEventsData, setPiecesData]
                    };
                    yAxes = [{id:qty, ticks:{beginAtZero:true}}];
                    title = "Query Overview";
                    graphID = "qOverview";
                    break;
            }
            this.createGraph(data,title,chartType,graphID,yAxes, scheme);
        }

        console.log(json);

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
        let slider = document.getElementById("slider") as noUiSlider.Instance;
        let queryIdArray = $('select#query_select').val();
        let timeFilter = slider.noUiSlider.get().toString(); //Get the timeFilter
        DBConnection.analyzeQueries(queryIdArray, timeFilter);
    }

    //to init the player and parameter selection
    public static loadSelection(){

        DBConnection.analysisOn = true; //To send the results to the fillSelection function
        DBConnection.getFilter("/getPlayers");

        $('#param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });
    }

    public static fillSelection(json){

        for (let i in json.result) {
            let playerName: string = json.result[i].name;
            let playerID: string = json.result[i].pid;
            let o = new Option(playerName, playerID);

            //Adds the player options to the selection as well as the player ID as the value. "<option value= " + playerID + ">" + playerName + "</option>"
            $('#player_select').append(o);
        }

        $('#player_select').multiSelect({
            selectionHeader:"<div class='custom-header'>Selected Players</div>",
            selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='All players'>",
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

    public static loadQuerySelection(){
        let sliderDiv = document.getElementById("sliderDiv");
        sliderDiv.style.display = "none";

        DBConnection.analysisOn = true;
        DBConnection.getFilter("/getQueries");

        $('#query_param_select').multiSelect({
            selectableHeader: "<div class='custom-header'>All Parameters</div>",
            selectionHeader: "<div class='custom-header'>Selected Parameters</div>"
        });

        //TODO: Load the timeline to filter here.
        let slider = document.getElementById('slider') as noUiSlider.Instance;


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
    }

    public static setFirstHalf(){
        let slider = document.getElementById('slider') as noUiSlider.Instance;
        slider.noUiSlider.set([0,45]);
    }

    public static setSecondHalf(){
        let slider = document.getElementById('slider') as noUiSlider.Instance;
        slider.noUiSlider.set([45,90]);
    }

    public static fillQuerySelection(json){

        //create options for all the queries with the QueryID as value and QueryName as text
        for (let i in json.result){
            let queryName: string = json.result[i].name;
            let query_ID: string = json.result[i].qid;
            let o = new Option(queryName, query_ID);
            $('#query_select').append(o);
        }

        $('#query_select').multiSelect({
            selectionHeader:"<div class='custom-header'>Selected Queries(Max 5)</div>",
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
