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
var DrawingArea = /** @class */ (function () {
    /**
     *  The constructor initializes the static vars and sets some default values in the fabric.js
     */
    function DrawingArea() {
        // initialization of the static vars
        DrawingArea.field = new fabric.Canvas('field');
        DrawingArea.field.hoverCursor = 'default';
        DrawingArea.field.preserveObjectStacking = true;
        DrawingArea.active_objects = [];
        DrawingArea.active_marker = null;
        DrawingArea.drawing = false;
        DrawingArea.hover = false;
        DrawingArea.mouse_down = false;
        DrawingArea.active_object = null;
        DrawingArea.origX = 0;
        DrawingArea.origY = 0;
        DrawingArea.border = 0; // drawingObjects will use this size to check if they are within the canvas borders
        DrawingArea.polygon_drawing = false;
        if (window.location.search.substr(1).split('=')[1] === "football") {
            DrawingArea.field_src = './imgs/soccer.jpg';
            DrawingArea.db_X_max = CONFIG.DB_X_MAX_soccer;
            DrawingArea.db_X_min = CONFIG.DB_X_MIN_soccer;
            DrawingArea.db_Y_max = CONFIG.DB_Y_MAX_soccer;
            DrawingArea.db_Y_min = CONFIG.DB_Y_MIN_soccer;
        }
        else if (window.location.search.substr(1).split('=')[1] === "icehockey") {
            DrawingArea.field_src = './imgs/rink.gif';
            DrawingArea.db_X_max = CONFIG.DB_X_MAX_icehockey;
            DrawingArea.db_X_min = CONFIG.DB_X_MIN_icehockey;
            DrawingArea.db_Y_max = CONFIG.DB_Y_MAX_icehockey;
            DrawingArea.db_Y_min = CONFIG.DB_Y_MIN_icehockey;
        }
        // setting default values of the fabric.js canvas
        fabric.Object.prototype.transparentCorners = false;
        // adding event listeners for the automatic resizing of the canvas
        window.addEventListener('resize', DrawingArea.resizeCanvas);
        window.addEventListener('DOMContentLoaded', DrawingArea.resizeCanvas);
        window.addEventListener('load', DrawingArea.resizeCanvas);
        // canvas event listeners
        DrawingArea.field.on('mouse:down', function (o) {
            DrawingArea.mouseDown(o);
        });
        DrawingArea.field.on('mouse:up', function () {
            DrawingArea.mouseUp();
        });
        DrawingArea.field.on('mouse:move', function (o) {
            DrawingArea.mouseMove(o);
        });
        DrawingArea.field.on('object:selected', function (o) {
            DrawingArea.objectSelected(o);
        });
        DrawingArea.field.on('selection:cleared', function () {
            DrawingArea.selectionCleared();
        });
        DrawingArea.field.on('selection:created', function (o) {
            DrawingArea.selectionCreated(o);
        });
        DrawingArea.field.on('object:modified', function () {
            DBConnection.nextQuery();
        });
        DrawingArea.field.on('object:moving', function (o) {
            DrawingArea.objectMoving(o);
        });
        // context menu (right click menu)
        // this menu object defines the whole context menu
        var menu = [{
                name: 'Delete',
                title: 'delete button',
                disable: false,
                fun: function () {
                    DrawingArea.deleteActiveObject(DrawingArea.ctxTarget.get('object_ref').object_num);
                }
            }];
        // this replaces the defined menu with the standard context menu on the rink object
        $('.upper-canvas').contextMenu(menu, {
            triggerOn: 'contextmenu',
            closeOnClick: true,
            winEventClose: true
        });
        // this part is needed to enable/disable the delete function (only enabled if mouse is over an user-drawn object)
        DrawingArea.ctxTarget = null;
        $('.upper-canvas').on('contextmenu', function (e) {
            if (DrawingArea.active_object == null) {
                DrawingArea.ctxTarget = DrawingArea.field.findTarget(e.originalEvent);
                var delete_disable = true;
                if (DrawingArea.ctxTarget != null) {
                    delete_disable = false;
                }
                var updateObj = [{
                        name: 'Delete',
                        disable: delete_disable
                    }];
                $('.upper-canvas').contextMenu('update', updateObj);
            }
        });
        var entry = document.getElementById("entryEventsBtn");
        var shift = document.getElementById("shiftEventsBtn");
        var pressing2d = document.getElementById("pressingAnalysis2dBtn");
        var pressing = document.getElementById("pressingAnalysisBtn");
        var offTrans = document.getElementById("offTransBtn");
        var defTrans = document.getElementById("defTransBtn");
        var sport = window.location.search.substr(1).split('=')[1];
        if (sport != 'icehockey') {
            entry.style.display = "none";
            shift.style.display = "none";
        }
        if (sport == 'icehockey') {
            pressing2d.style.display = "none";
            pressing.style.display = "none";
            offTrans.style.display = "none";
            defTrans.style.display = "none";
        }
    }
    /**
     * This function removes every drawn object on the canvas.
     */
    DrawingArea.clearCanvas = function (filters) {
        DBConnection.resetEventCascadeQueryArray();
        ResultList.clearResultList();
        MultiPathLine.deleteAllLines();
        Arrow.deleteAllArrows();
        if (filters) {
            // skip the filter reset
        }
        else {
            FilterArea.resetFilters();
        }
        DrawingArea.active_objects = [];
        EventChain.clearChains();
        DrawingArea.field.clear();
        DBConnection.cascadeDepth = 0;
        DBConnection.resetExpandFilterList();
        $("#zooming_filter_switch").prop('checked', false);
        Timeline.zoomingfilterActive = false;
        if (Timeline.getFilterActive() == true) {
            $("#timeline_filter_switch").prop('checked', false);
            Timeline.triggerTimeFilter();
        }
        else {
            $("#timeline_filter_switch").prop('checked', false);
        }
        if (OffBallActivities.isActive == true) {
            OffBallActivities.triggerOffBallActivities();
            $("#offball_activate").prop('checked', false);
            OffBallActivities.clear();
        }
        var pressBtnContent = document.getElementById("pressingAnalysis2dBtn").innerHTML;
        if (pressBtnContent == "Deactivate Pressing Index") {
            Analysis.reset2dToDefault();
        }
        var pressPhasesBtnContent = document.getElementById("pressingAnalysisBtn").innerHTML;
        if (pressPhasesBtnContent == "Deactivate Pressing Phases") {
            document.getElementById("pressingAnalysisBtn").innerHTML = 'Pressing Phases';
            Timeline.resizeTimeline();
        }
        var netBtnContent = document.getElementById("passNetworkBtn").innerHTML;
        if (netBtnContent == "Deactivate Pass Network") {
            Network.clearNodesAndEdges();
            document.getElementById("passNetworkBtn").innerHTML = 'Pass Network';
        }
    };
    /**
     * This function calls clearCanvas() and resets the drawing mode to default
     */
    DrawingArea.clearAndReset = function () {
        this.clearCanvas();
        DrawingButtons.standardDrawingMode();
        Analysis.clearHeatmap();
    };
    /**
     * This function checks the Drawing Mode and calls clearCanvas(). This is needed to delete Highlights and
     * to prevent saving them with the event query results!
     * Attention: multiple event queries are no longer supported!
     */
    DrawingArea.clearAndResetDefault = function () {
        // if EVENT QUERY is selected
        if (DrawingButtons.getDrawingDropdownValue() == 1) {
            DrawingArea.clearCanvas(true);
        }
        else {
            return;
        }
        Analysis.clearHeatmap();
    };
    /**
     * This function will be executed after the user selects a single object, or multiple objects.
     * For single objects: It triggers a refresh of the filter area.
     * For multiple objects: nothing so far.
     */
    DrawingArea.objectSelected = function (o) {
        if (o.target.type != 'group') {
            DrawingArea.selected_object = o.target.get('object_ref');
            FilterArea.setObjectFilters(DrawingArea.selected_object);
        }
        else {
            // here could be actions taken for multiple object selection
        }
    };
    /**
     * This function is called when a selection has been made and prevents that group selections have resizing/rotating tools.
     * If the selected object is not a group it will trigger the delete button activation.
     */
    DrawingArea.selectionCreated = function (o) {
        if (o.target.type === 'group') {
            o.target.hasControls = false;
        }
    };
    /**
     * This function resets the selected_object variable and triggers the filter reset
     */
    DrawingArea.selectionCleared = function () {
        DrawingArea.selected_object = null;
        // DO NOT resetFilters here, this leads to ugly bugs
        //FilterArea.resetFilters();
    };
    /**
     * This function resets the solutions, removes delete button and
     * controls the object moving, it should prevent objects being moved out of the rink area.
     */
    DrawingArea.objectMoving = function (o) {
        DrawingArea.clearSolutions();
        var obj = o.target;
        if (obj.getHeight() > obj.canvas.height || obj.getWidth() > obj.canvas.width) {
            obj.setScaleY(obj.originalState.scaleY);
            obj.setScaleX(obj.originalState.scaleX);
        }
        obj.setCoords();
        if (obj.getBoundingRect().top - (obj.cornerSize / 2) < 0 ||
            obj.getBoundingRect().left - (obj.cornerSize / 2) < 0) {
            obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top + (obj.cornerSize / 2));
            obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left + (obj.cornerSize / 2));
        }
        if (obj.getBoundingRect().top + obj.getBoundingRect().height + obj.cornerSize > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width + obj.cornerSize > obj.canvas.width) {
            obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top - obj.cornerSize / 2);
            obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left - obj.cornerSize / 2);
        }
    };
    /**
     * This functions removes all solutions (EventChains, EventMarkers and Connectors) from the canvas.
     * It also removes the results from the ResultList.
     * User-drawn objects remain on the field.
     */
    DrawingArea.clearSolutions = function () {
        ResultList.clearResultList();
        EventChain.clearChains();
        MultiPathLine.deleteAllLines();
        Arrow.deleteAllArrows();
        DBConnection.cascadeDepth = 0;
    };
    /**
     * This function changes the width and height of the canvas.
     * The canvas itself is placed always in the exact center of
     * the container div so it aligns with the background image.
     * @param width
     * @param height
     */
    DrawingArea.setDimensions = function (width, height) {
        DrawingArea.field.setDimensions({
            width: width,
            height: height
        });
    };
    /**
     * This function is called when the user triggers a click event on the canvas.
     * First it checks the button state of the DrawingButtons class and then decides what object has to be created.
     */
    DrawingArea.mouseDown = function (o) {
        $('.upper-canvas').contextMenu('close'); // this is needed to close the context menu with a click on the drawing area
        if (DrawingButtons.isDrawingActive() > 0) {
            if (DrawingArea.active_objects.length > 0 && (DrawingArea.active_objects[0].type == "straight_motion_path" || DrawingArea.active_objects[0].type == "freehand_motion_path")) {
                DrawingArea.clearCanvas();
            }
            var state = DrawingButtons.getButtonState();
            if (state[0] != "") {
                var pointer = DrawingArea.field.getPointer(o.e);
                DrawingArea.origX = pointer.x;
                DrawingArea.origY = pointer.y;
                if (state[0] == "rectangle_btn") {
                    DrawingArea.drawing = true;
                    DrawingArea.drawRectangle(pointer, DrawingArea.origX, DrawingArea.origY);
                    DrawingArea.mouse_down = true;
                }
                else if (state[0] == "circle_btn") {
                    DrawingArea.drawing = true;
                    DrawingArea.drawCircle(pointer, DrawingArea.origX, DrawingArea.origY);
                    DrawingArea.mouse_down = true;
                }
                else if (state[0] == "freedraw_btn") {
                    DrawingArea.polygon_drawing = true;
                    DrawingArea.drawPolygon(DrawingArea.origX, DrawingArea.origY);
                }
                else if (state[0] == "mp_btn") {
                    if (DrawingButtons.playerMPActive()) {
                        if (FilterArea.playerfilterSelectionDone() == false) {
                            $('#error-modal-text').text("You have to select a player filter for the player motion path.");
                            $("#errorMPModal").modal();
                            return;
                        }
                        else if (FilterArea.playerfilterMultiSelect() == true) {
                            $('#error-modal-text').text("You can only select one player for the player motion path.");
                            $("#errorMPModal").modal();
                            return;
                        }
                    }
                    if (state[2] == 4) {
                        DrawingArea.drawStraightMotionPath(DrawingArea.origX, DrawingArea.origY);
                        DrawingArea.mouse_down = true;
                    }
                    else if (state[2] == 5) {
                        DrawingArea.drawFreehandMotionPath(DrawingArea.origX, DrawingArea.origY);
                        DrawingArea.mouse_down = true;
                    }
                }
            }
        }
    };
    /**
     * this function is called by the mouse listener for the "mouseUp" event.
     * DrawingArea.mouse_down is not used by the polygon drawing method and triggers the second if of the function.
     * (polygon is while drawing just a collection of lines, after releasing the mouse button the polygon will be generated)
     * filterName input is optional, it only gets called with this string when a user is saving a filter
     */
    DrawingArea.mouseUp = function (filterName) {
        if (filterName) {
            DBConnection.nextQuery(filterName);
        }
        if (DrawingArea.mouse_down) {
            DrawingArea.active_object.setFiltersRaw(FilterArea.getFiltersRaw());
            DrawingArea.active_object = null;
            DrawingArea.origX = 0;
            DrawingArea.origY = 0;
            DrawingArea.mouse_down = false;
            if (!(DrawingButtons.getButtonState()[1] == 2 && DrawingArea.active_objects.length != 1)) {
                DBConnection.nextQuery();
            }
            DrawingArea.drawing = false;
        }
        if (DrawingArea.polygon_drawing) {
            DrawingArea.active_object.setFiltersRaw(FilterArea.getFiltersRaw());
            DrawingArea.active_object.resize(null, null, null); // this function triggers the end of the drawing
            DrawingArea.field.remove(DrawingArea.polygon_line_active);
            DrawingArea.polygon_line_active = null;
            DrawingArea.polygon_drawing = false;
            if (!(DrawingButtons.getButtonState()[1] == 2 && DrawingArea.active_objects.length != 1)) {
                DBConnection.nextQuery();
            }
        }
    };
    /**
     * this function is called by the mouse:move event
     * if drawing is in active mode (mouse_down = true)
     * it will call the resize function of the active_object
     * with the actual mouse position, except for the polygon object.
     * @param o
     */
    DrawingArea.mouseMove = function (o) {
        var pointer = DrawingArea.field.getPointer(o.e);
        if (DrawingButtons.isDrawingActive() > 0) {
            DrawingArea.disableSelection();
        }
        else {
            DrawingArea.enableSelection();
        }
        if (DrawingArea.polygon_drawing) {
            var points2 = [pointer.x, pointer.y];
            DrawingArea.polygon_line_active.set({ x2: pointer.x, y2: pointer.y });
            DrawingArea.field.renderAll();
            var points1 = [DrawingArea.polygon_line_active.getCoords()[0].x, DrawingArea.polygon_line_active.getCoords()[0].y];
            if (DrawingObject.didMouseMoveEnough(points1, points2)) {
                var newpoints = [points2[0], points2[1], points2[0], points2[1]];
                DrawingArea.drawActiveLine(newpoints);
            }
            DrawingArea.field.renderAll();
        }
        else if (DrawingArea.mouse_down) {
            DrawingArea.active_object.resize(pointer, DrawingArea.origX, DrawingArea.origY);
        }
    };
    /**
     * this function creates a new rectangle object and updates the active object list
     */
    DrawingArea.drawRectangle = function (pointer, x, y) {
        DrawingArea.active_object = new Rectangle(pointer, x, y, DrawingArea.active_objects.length);
        DrawingArea.active_objects.push(DrawingArea.active_object);
    };
    /**
     * this function creates a new circle object and updates the active object list
     */
    DrawingArea.drawCircle = function (pointer, x, y) {
        DrawingArea.active_object = new Circle(pointer, x, y, DrawingArea.active_objects.length);
        DrawingArea.active_objects.push(DrawingArea.active_object);
    };
    /**
     * this function creates a new polygon object and updates the active object list
     * It creates the first active line object, so the user can see what he is drawing.
     */
    DrawingArea.drawPolygon = function (x, y) {
        DrawingArea.active_object = new Polygon(DrawingArea.active_objects.length);
        DrawingArea.active_objects.push(DrawingArea.active_object);
        DrawingArea.polygon_lines = [];
        var points = [x, y, x, y];
        DrawingArea.drawActiveLine(points);
    };
    DrawingArea.drawFreehandMotionPath = function (x, y) {
        DrawingArea.motion_path_width = parseInt(document.getElementById("motionpath_size").value);
        DrawingArea.active_object = new FreehandMotionPath(x, y, DrawingArea.motion_path_width, DrawingArea.active_objects.length);
        DrawingArea.active_objects.push(DrawingArea.active_object);
    };
    DrawingArea.drawActiveLine = function (points) {
        DrawingArea.polygon_line_active = new fabric.Line(points, {
            strokeWidth: 3,
            fill: '#ffc800',
            stroke: '#ffc800',
            class: 'line',
            originX: 'center',
            originY: 'center',
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false
        });
        DrawingArea.polygon_lines.push(DrawingArea.polygon_line_active);
        DrawingArea.field.add(DrawingArea.polygon_line_active);
    };
    DrawingArea.drawStraightMotionPath = function (x, y) {
        DrawingArea.motion_path_width = parseInt(document.getElementById("motionpath_size").value);
        DrawingArea.active_object = new StraightMotionPath(x, y, DrawingArea.motion_path_width, DrawingArea.active_objects.length);
        DrawingArea.active_objects.push(DrawingArea.active_object);
    };
    /**
     * This function disables the selection of every object
     */
    DrawingArea.disableSelection = function () {
        DrawingArea.field.selection = false;
        for (var _i = 0, _a = DrawingArea.active_objects; _i < _a.length; _i++) {
            var object = _a[_i];
            object.disableSelection();
        }
    };
    /**
     * This function enables the selection of every object
     */
    DrawingArea.enableSelection = function () {
        DrawingArea.field.selection = true;
        for (var _i = 0, _a = DrawingArea.active_objects; _i < _a.length; _i++) {
            var object = _a[_i];
            object.enableSelection();
        }
    };
    /**
     * This function is used by the event listeners for loading and resizing the window
     * it sets the canvas to the same size of the background image of the container
     */
    DrawingArea.resizeCanvas = function () {
        // clearing drawn objects on canvas
        DrawingArea.clearCanvas();
        // first get width, height and aspect ratio of background img
        var img = new Image();
        document.getElementById("field-container").style.backgroundImage = "url('" + DrawingArea.field_src + "')";
        img.src = DrawingArea.field_src;
        var imgW = img.width;
        var imgH = img.height;
        var aspectRatio = imgW / imgH;
        // get width, height and aspect ratio of container
        var newW, newH;
        newW = document.getElementById("field-container").offsetWidth;
        newH = document.getElementById("field-container").offsetHeight;
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
        // set correct dimensions of canvas
        DrawingArea.setDimensions(newW, newH);
        // at the end also trigger the resizing of the timeline
        Timeline.resizeTimeline();
    };
    /**
     * this function returns the actual size of the canvas
     * (the query generator has to recalculate the coordinates)
     */
    DrawingArea.getCanvasSize = function () {
        return [DrawingArea.field.width, DrawingArea.field.height];
    };
    /**
     * This function converts the canvas coordinates to DB coordinates by transforming the ranges.
     */
    DrawingArea.canvasToDBCoordinates = function (x, y) {
        var ranges = DrawingArea.getRanges();
        x = ((((x - DrawingArea.border) * ranges[2]) / ranges[0]) + DrawingArea.db_X_min).toFixed(2);
        y = ((((y - DrawingArea.border) * ranges[3]) / ranges[1]) + DrawingArea.db_Y_min).toFixed(2);
        return [x, y];
    };
    /**
     * This function converts the DB coordinates to canvas coordinates by transforming the ranges.
     */
    DrawingArea.dbToCanvasCoordinates = function (x, y) {
        var ranges = DrawingArea.getRanges();
        x = (((x - DrawingArea.db_X_min) * ranges[0]) / ranges[2]).toFixed(2);
        y = (((y - DrawingArea.db_Y_min) * ranges[1]) / ranges[3]).toFixed(2);
        return [x, y];
    };
    /**
     * This function converts returns the radius length of the DB coordinate system.
     */
    DrawingArea.canvasRadiusToDBRadius = function (x, y, p1) {
        var p2 = DrawingArea.canvasToDBCoordinates(x, y);
        return p1[0] - p2[0];
    };
    /**
     * This function sets the ranges to calculate with, is calculated before converting coordinates,
     * for example if the window size changed.
     */
    DrawingArea.getRanges = function () {
        var canvas_size = DrawingArea.getCanvasSize();
        var canvasRangeX = canvas_size[0];
        var canvasRangeY = canvas_size[1];
        var DBRangeX = (DrawingArea.db_X_max - DrawingArea.db_X_min);
        var DBRangeY = (DrawingArea.db_Y_max - DrawingArea.db_Y_min);
        return [canvasRangeX, canvasRangeY, DBRangeX, DBRangeY];
    };
    DrawingArea.getFullAreaSelection = function () {
        /*let bottomLeft = DrawingArea.dbToCanvasCoordinates(DrawingArea.db_X_min, DrawingArea.db_Y_max);
        let topRight = DrawingArea.dbToCanvasCoordinates(DrawingArea.db_X_max, DrawingArea.db_Y_min);
        return ['rectangle', bottomLeft[0], topRight[0], bottomLeft[1], topRight[1]];*/
        var size = DrawingArea.getCanvasSize();
        return ['rectangle', 0, size[0] * 3, size[1] * 3, 0];
        //return ['rectangle', DrawingArea.db_X_min, DrawingArea.db_Y_max, DrawingArea.db_X_max, DrawingArea.db_Y_min];
    };
    /**
     * This function deletes the last user drawn input and reexecutes the query.
     */
    DrawingArea.undo = function () {
        if (DrawingButtons.getButtonState()[1] == 2) { // if reverse event cascade query is active it is not possible to just delete the last user drawn object.
            DBConnection.removeLastExpandFilter();
        }
        else { // else the last duser drawn area will be removed.
            DrawingArea.active_objects[DrawingArea.active_objects.length - 1].remove();
            DrawingArea.active_objects.splice(-1, 1);
        }
        DrawingArea.clearSolutions();
        DBConnection.nextQuery();
    };
    /**
     * This function deletes a specific user drawn object and updates the object_nums of all the remaining objects.
     */
    DrawingArea.deleteActiveObject = function (x) {
        DrawingArea.active_objects[x].remove();
        DrawingArea.active_objects.splice(x, 1);
        for (var i in DrawingArea.active_objects) {
            this.active_objects[i].setObjectNum(i);
        }
        DrawingArea.clearSolutions();
        DBConnection.nextQuery();
    };
    DrawingArea.changeSport = function (sport) {
        if (sport == 1) {
            this.field_src = './imgs/rink.gif';
        }
        else {
            this.field_src = './imgs/soccer.jpg';
        }
        this.resizeCanvas();
    };
    DrawingArea.polygon_last_vertex = null;
    DrawingArea.motion_path_width = 200.0;
    DrawingArea.freehand_mp_drawing = false;
    return DrawingArea;
}());
