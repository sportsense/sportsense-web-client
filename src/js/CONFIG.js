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
var CONFIG = /** @class */ (function () {
    function CONFIG() {
    }
    /*
        This class contains all changeable configuration variables that are used by the other classes.
    */
    // Server settings
    CONFIG.PROXY_ADDRESS = "http://localhost:2222";
    CONFIG.METHOD = "GET";
    // Fabric.js drawing colors
    CONFIG.COLOR_STANDARD = "rgba(32,91,175,1)";
    CONFIG.COLOR_HIGHLIGHTED = "rgba(255,112,166,1)";
    CONFIG.COLOR_HOVER = "rgba(114,161,229,1)";
    CONFIG.COLOR_NONE = "rgba(0,0,0,0)";
    CONFIG.COLOR_SELECTION = "rgba(255,200,0,1)";
    CONFIG.COLOR_DEACTIVATED = "rgba(149, 165, 166, 1)";
    CONFIG.COLOR_INVISIBLE = "rgba(0,0,0,0)";
    // Fabric.js drawing colors for off-ball activities
    CONFIG.COLOR_BALL_STANDARD = "rgba(50,50,50,1)";
    CONFIG.COLOR_BALL_HIGHLIGHTED = "rgba(80,80,80,1)";
    CONFIG.COLOR_BALL_HOVER = "rgba(120,120,120,1)";
    CONFIG.COLOR_TEAM_A_STANDARD = "rgba(220,0,0,1)";
    CONFIG.COLOR_TEAM_A_HIGHLIGHTED = "rgba(255,112,166,1)";
    CONFIG.COLOR_TEAM_A_HOVER = "rgba(255,50,50,1)";
    CONFIG.COLOR_TEAM_B_STANDARD = "rgba(0,0,220,1)";
    CONFIG.COLOR_TEAM_B_HIGHLIGHTED = "rgba(255,112,166,1)";
    CONFIG.COLOR_TEAM_B_HOVER = "rgba(50,50,255,1)";
    CONFIG.COLOR_POLYGON_START = "rgba(60,180,255,0.8)";
    CONFIG.COLOR_POLYGON_END = "rgba(120,255,255,0.8)";
    // Fabric.js sizes
    CONFIG.MARKER_SIZE = 3;
    CONFIG.EC_STROKE_WIDTH = 2;
    CONFIG.SELECTION_STROKE_WIDTH = 3;
    // Database sizes for soccer
    CONFIG.DB_X_MAX_soccer = 54.0;
    CONFIG.DB_X_MIN_soccer = -54.0;
    CONFIG.DB_Y_MAX_soccer = 36.0;
    CONFIG.DB_Y_MIN_soccer = -36.0;
    // Database sizes for ice hockey
    CONFIG.DB_X_MAX_icehockey = 30.5;
    CONFIG.DB_X_MIN_icehockey = -30.5;
    CONFIG.DB_Y_MAX_icehockey = 15.0;
    CONFIG.DB_Y_MIN_icehockey = -15.0;
    // Straight motion path
    CONFIG.POINTS_PER_HALF_CIRCLE = 10;
    // Video
    CONFIG.ADDITIONAL_VIDEO_OFFSET = -4;
    // Drawing Buttons
    CONFIG.EVENT_QUERY = 1;
    CONFIG.FORWARD_EVENT_CASCADE = 2;
    CONFIG.REVERSE_EVENT_CASCADE = 3;
    CONFIG.STRAIGHT_MOTION_PATH = 4;
    CONFIG.FREEHAND_MOTION_PATH = 5;
    // Off ball constants
    CONFIG.COMPLEX_SLIDER_MARGIN = 1500; // left and right margin of complex slider to min and max values
    CONFIG.INITIAL_SLIDER1_POSITION = -500; // initial position of slider1 in milliseconds
    CONFIG.INITIAL_SLIDER2_POSITION = 3000; // initial position of slider2 in milliseconds
    CONFIG.COMPLEX_SLIDER_MIN = -10000; // minimum value of complex slider
    CONFIG.COMPLEX_SLIDER_MAX = 10000; // maximum value of complex slider
    // Highlight events
    CONFIG.HIGHLIGHT_EVENTS = [
        "cornerkickEvent",
        "freekickEvent",
        "goalEvent"
    ];
    // Zooming filter levels
    CONFIG.ZOOMINGFILTER_LEVEL_1 = {
        max_view: 100,
        min_view: 75,
        events: [
            "cornerkickEvent",
            "freekickEvent",
            "goalEvent"
        ]
    };
    CONFIG.ZOOMINGFILTER_LEVEL_2 = {
        max_view: 75,
        min_view: 40,
        events: [
            "clearanceEvent",
            "goalkickEvent",
            "interceptionEvent",
            "kickoffEvent",
            "shotOffTargetEvent",
            "shotOnTargetEvent",
            "throwinEvent"
        ]
    };
    CONFIG.ZOOMINGFILTER_LEVEL_3 = {
        max_view: 40,
        min_view: 0,
        events: [
            "successfulPassEvent",
            "passSequenceEvent",
            "passEvent",
            "misplacedPassEvent",
            "doublePassEvent"
        ]
    };
    return CONFIG;
}());
