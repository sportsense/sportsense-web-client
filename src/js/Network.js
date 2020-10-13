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
var Network = /** @class */ (function () {
    function Network() {
        Network.container = document.getElementById("field-container");
        Network.colorHome = CONFIG.COLOR_TEAM_A_STANDARD;
        Network.colorAway = CONFIG.COLOR_TEAM_B_STANDARD;
        Network.options = {
            physics: false,
            nodes: {
                shape: 'dot',
                scaling: {
                    label: {
                        enabled: true
                    },
                    customScalingFunction: function (min, max, total, value) {
                        return value / total;
                    },
                    min: 1,
                    max: 250
                }
            },
            edges: {
                arrows: {
                    // To make the endpoints smaller or larger
                    to: {
                        scaleFactor: 1
                    }
                },
                smooth: {
                    type: 'continuous',
                    roundness: 0.5
                },
                scaling: {
                    customScalingFunction: function (min, max, total, value) {
                        return value / total;
                    },
                    min: 1,
                    max: 50
                }
            },
            interaction: {
                hover: true,
                hideEdgesOnDrag: true,
                tooltipDelay: 200
            },
            configure: {
                enabled: true,
                showButton: true
            }
        };
    }
    /**
     * This function creates and visualizes the network
     */
    Network.visualizeNetwork = function () {
        // create the network
        Network.data = {
            nodes: Network.nodes,
            edges: Network.edges
        };
        //visualize the network
        Network.network = new vis.Network(Network.container, Network.data, Network.options);
    };
    /**
    * This function creates the nodes and edges out from the results of the Server
    */
    Network.createNodesAndEdges = function (json) {
        Network.nodes = [];
        Network.edges = [];
        //Hard-coded values for a 4-4-2 Formation visualization (football) of the nodes
        //Hard-coded values for distributed visualization (icehockey) of the nodes
        //TODO: Use avg player position or player role definitions for node positioning!
        var sport = window.location.search.substr(1).split('=')[1];
        var xCoords = [];
        var yCoords = [];
        if (sport != 'icehockey') {
            xCoords = [0, 100, 100, 100, 100, 200, 200, 300, 300, 400, 400];
            yCoords = [200, 0, 150, 250, 400, 150, 250, 0, 400, 150, 250];
        }
        if (sport == 'icehockey') {
            xCoords = [0, 50, 50, 50, 50, 100, 100, 100, 100, 200, 200, 200, 200, 300, 300, 300, 300, 400, 400, 400];
            yCoords = [200, 0, 150, 250, 400, 0, 150, 250, 400, 0, 150, 250, 400, 0, 150, 250, 400, 100, 200, 300];
        }
        //Loops through the edges results
        for (var i in json["Edges"]) {
            var content = json["Edges"][i];
            for (var j in content) {
                var results = content[j];
                for (var k in results) {
                    var from = results[k]["from"];
                    var to = results[k]["to"];
                    var value = results[k]["value"];
                    var venue = results[k]["venue"];
                    var color = void 0;
                    if (venue == "home") {
                        color = Network.colorHome;
                    }
                    else {
                        color = Network.colorAway;
                    }
                    // for a better visibility on the white rink
                    if (color == "white" && sport == 'icehockey') {
                        color = 'grey';
                    }
                    var newEdge = {
                        from: from,
                        to: to,
                        value: value,
                        title: 'from: ' + from + ' to: ' + to + "<br>" + "#passes: " + value,
                        arrows: {
                            to: {
                                enabled: true,
                                type: 'arrow'
                            }
                        },
                        color: {
                            color: color,
                            highlight: '#007bff',
                            opacity: 0.8
                        }
                    };
                    Network.edges.push(newEdge);
                }
            }
        }
        //Loops through the players results
        for (var i in json["Players"]) {
            var content = json["Players"][i];
            var name_1 = content["name"];
            var id = content["pid"];
            var passes = content["totalpasses"];
            var passesReceived = content["totalpassesreceived"];
            var venue = content["venue"];
            var color = void 0;
            var fontColor = 'black';
            var borderColor = 'black';
            if (venue == "home") {
                color = Network.colorHome;
            }
            else {
                color = Network.colorAway;
            }
            if (color == "black") {
                //fontColor only important if shape=circle
                //fontColor='white';
                borderColor = 'white';
            }
            // for a better visibility on the white rink
            if (color == "white" && sport == 'icehockey') {
                color = 'grey';
                borderColor = 'black';
            }
            var newNode = {
                id: id,
                label: name_1 + ' [' + id + ']',
                value: passes,
                title: 'Successful Passes: ' + passes + "<br>" + 'Received Passes: ' + passesReceived,
                color: {
                    background: color,
                    border: borderColor,
                    highlight: {
                        background: color,
                        border: '#007bff',
                        opacity: 0.3
                    }
                },
                font: { color: fontColor },
                x: xCoords[i],
                y: yCoords[i]
            }; //, hover:{background:'white',border:'black'}}};
            Network.nodes.push(newNode);
        }
    };
    /**
     * This function is called to update the colors for the network corresponding to the team colors of the selected match
     */
    Network.updateColors = function () {
        Network.colorHome = CONFIG.COLOR_TEAM_A_STANDARD;
        Network.colorAway = CONFIG.COLOR_TEAM_B_STANDARD;
    };
    /**
     * This function is called after the matchFilter changed and deletes the nodes and edges lists and the drawn network.
     * After that the Canvas is added and the drawing functionality is reactivated.
     */
    Network.clearNodesAndEdges = function () {
        Network.edges = [];
        Network.nodes = [];
        // remove old content in network visualization
        var div = document.getElementById('field-container');
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        // now we have to bring back the canvas to main.div and to restart the drawing functionality
        document.getElementById('field-container').innerHTML = '<canvas id="field"></canvas>';
        // adapted from DrawingArea.resizeCanvas() method
        var drawingArea = new DrawingArea();
        var img = new Image();
        img.src = DrawingArea.field_src;
        var imgW = img.width;
        var imgH = img.height;
        var aspectRatio = imgW / imgH;
        var newW = document.getElementById("field-container").offsetWidth;
        var newH = document.getElementById("field-container").offsetHeight;
        var newAspectRatio = newW / newH;
        var factor = 0;
        // case 1: if aspect ratio is less or equal to the new aspect ratio, then newW has to be calculated by the factor of resize
        // case 2: if aspect ratio is bigger than the new aspect ratio, then newH has to be calculated by the factor of resize
        if (aspectRatio <= newAspectRatio) {
            factor = newH / imgH;
            newW = imgW * factor;
        }
        else {
            factor = newW / imgW;
            newH = imgH * factor;
        }
        DrawingArea.setDimensions(newW, newH);
    };
    return Network;
}());
