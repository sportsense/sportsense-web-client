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

declare var $: any;

class DrawingButtons {

    private static drawing_dropdown: any;
    private static active_drawing_mode: number;
    private static active_drawing_button: string = "";

    // Event Query Buttons
    private static rectangle_button: any;
    private static circle_button: any;
    private static freehand_button: any;

    // Event Cascade Buttons
    private static expand_button: any;
    private static expand_filter: any;

    // Motion Path Buttons
    private static motionpath_filter_group: any;
    private static motionpath_filter: any;
    private static motionpath_size: any;

    /**
     * initializes all static vars and default values
     */
    constructor() {
        // adding buttons to their vars
        DrawingButtons.drawing_dropdown = $("#drawing_mode");

        DrawingButtons.rectangle_button = $("#rectangle_btn");
        DrawingButtons.circle_button = $("#circle_btn");
        DrawingButtons.freehand_button = $("#freedraw_btn");
        DrawingButtons.expand_button = $("#expand_btn");
        DrawingButtons.expand_filter = $("#expand_filter");

        DrawingButtons.motionpath_filter_group = $("#motionpath_filter_group");
        DrawingButtons.motionpath_filter = $("#motionpath_filter");
        DrawingButtons.motionpath_size = $("#motionpath_size_group");

        DrawingButtons.standardDrawingMode();
    }

    /**
     * This method changes the drawing mode to "Event Query".
     */
    public static standardDrawingMode(): void {
        let val = CONFIG.EVENT_QUERY;
        DrawingButtons.drawing_dropdown.val(val);
        DrawingButtons.active_drawing_mode = CONFIG.EVENT_QUERY;
        DrawingButtons.deactivateActiveButton();
        DrawingButtons.changeDrawingMode();
    }

    /**
     * When the drawing_dropdown changes this function is called it resets the pitch and activates/deactivates the initial button settings.
     */
    public static changeDrawingMode(): void {
        let val: number = DrawingButtons.drawing_dropdown.val();

        // This is needed to clear the drawing area from the highlights
        if (val != DrawingButtons.active_drawing_mode)
            DrawingArea.clearCanvas(true);

        if (val != DrawingButtons.active_drawing_mode && DrawingArea.active_objects.length > 0) {
            DrawingArea.clearCanvas();
        }
        if(val != CONFIG.EVENT_QUERY){
            $("#zooming_filter_switch").attr('disabled', true);
        }
        if (val == CONFIG.EVENT_QUERY || val == CONFIG.FORWARD_EVENT_CASCADE || val == CONFIG.REVERSE_EVENT_CASCADE) {
            if(val == CONFIG.EVENT_QUERY){
                $("#zooming_filter_switch").attr('disabled', false);
            }
            DrawingButtons.rectangle_button.prop("disabled", false);
            DrawingButtons.circle_button.prop("disabled", false);
            DrawingButtons.freehand_button.prop("disabled", false);
            DrawingButtons.motionpath_filter_group.addClass("invisible");
            DrawingButtons.motionpath_size.addClass("invisible");
            FilterArea.activateFilterArea();
        } else if (val == CONFIG.STRAIGHT_MOTION_PATH || val == CONFIG.FREEHAND_MOTION_PATH) {
            DrawingButtons.rectangle_button.prop("disabled", true);
            DrawingButtons.circle_button.prop("disabled", true);
            DrawingButtons.freehand_button.prop("disabled", true);
            DrawingButtons.motionpath_filter_group.removeClass("invisible");
            DrawingButtons.motionpath_size.removeClass("invisible");
            FilterArea.deactivateFilterArea();
        }
        DrawingButtons.expand_filter.selectpicker('deselectAll');
        DrawingButtons.expand_button.prop("disabled", true);
        DrawingButtons.expand_filter.prop("disabled", true);
        DrawingButtons.expand_filter.selectpicker('refresh');
        DrawingButtons.active_drawing_mode = val;
    }

    /**
     * This method deactivates all other drawing buttons and activates the expand button.
     */
    public static activateExpandButton(): void {
        DrawingButtons.expand_button.prop("disabled", false);
        DrawingButtons.expand_filter.prop("disabled", false);
        DrawingButtons.expand_filter.selectpicker('refresh');
    }

    /**
     * this function returns a boolean if drawing is active
     */
    public static isDrawingActive(): number {
        if (DrawingButtons.active_drawing_button != "" && DrawingButtons.active_drawing_mode <= 3) {
            return 1;
        } else if (DrawingButtons.active_drawing_mode >= 4) {
            return 2;
        } else {
            return 0;
        }
    }

    /**
     * This method switches the active class on the drawing buttons.
     * It also keeps track on which button is at the moment active.
     */
    public static activateButton(id: string): void {
        $("#" + id).addClass("active");
        DrawingButtons.deactivateActiveButton();
        DrawingButtons.active_drawing_button = id;
        DrawingButtons.active_drawing_mode = DrawingButtons.drawing_dropdown.val();
    }

    /**
     * This method deactivates the active drawing button.
     */
    public static deactivateActiveButton(): void {
        if (DrawingButtons.active_drawing_button != "") {
            $("#" + DrawingButtons.active_drawing_button).removeClass("active");
        }
        DrawingButtons.active_drawing_button = "";
    }

    /**
         * This function checks which buttons are set to active,
         * maybe several buttons at once.
         * @returns {[string,boolean,number]}
         */
    public static getButtonState(): any[] {
        let active_btn: string = DrawingButtons.active_drawing_button;
        let ec_result: number = 0;
        if (DrawingButtons.active_drawing_mode == 2) {
            ec_result = 1;
        } else if (DrawingButtons.active_drawing_mode == 3) {
            ec_result = 2;
        }
        if (DrawingButtons.active_drawing_mode > 3) {
            active_btn = "mp_btn";
        }
        return [active_btn, ec_result, DrawingButtons.active_drawing_mode];
    }

    public static getDrawingDropdownValue(): number {
        return this.drawing_dropdown.val();
    }


    /**
     * This method is used for deactivating drawing, when the motion path query has been used.
     * The user needs to change the drawing mode, or clear the canvas in order to be again able to draw.
     */
    public static deactivateDrawing(): void {
        DrawingButtons.active_drawing_mode = 0;
    }

    /**
     * This function checks if the accept button in the expand modal is disabled or not (if all needed information for a reverse cascade is given)
     */
    public static expandBtn(): void{
        DBConnection.nextQuery();
    }

    public static mpFilterChanged(): void {
        if(DrawingButtons.motionpath_filter.val() == "PLAYER"){
            FilterArea.activatePlayerFilter();
        }else{
            FilterArea.deactivatePlayerFilter();
        }
    }

    public static playerMPActive(): boolean {
        if ($('#motionpath_filter').val() === "PLAYER") {
            return true;
        } else {
            return false;
        }
    }
}