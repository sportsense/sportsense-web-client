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

class MultiPathLine {

    protected line: any;
    public time: string;
    public video_time: number;
    public matchId: string;
    protected id: number;
    protected elem_id: string;
    protected eventtype: any;
    protected eventmarker: EventMarker = null;

    protected color_standard: string = CONFIG.COLOR_STANDARD;
    protected color_highlighted: string = CONFIG.COLOR_HIGHLIGHTED;
    protected color_hover: string = CONFIG.COLOR_HOVER;

    protected static lines: any[] = [];
    public static active_line: MultiPathLine = null;

    constructor(points: any[], time: string, videotime: number, id: number, eventtype, period, matchId) {
        this.time = time;
        this.video_time = videotime;
        this.id = id;
        this.elem_id = "";
        this.matchId = matchId;
        this.eventtype = eventtype;

        this.build(points);
    }

    protected build(points: any[]): void {
        let p1 = DrawingArea.dbToCanvasCoordinates(points[0][0], points[0][1]);
        let path: string = "M " + p1[0] + " " + p1[1];
        for (let i = 1; i < points.length; i++) {
            let p = DrawingArea.dbToCanvasCoordinates(points[i][0], points[i][1]);
            path = path + " L " + p[0] + " " + p[1];
        }

        this.line = new fabric.Path(path, {
            stroke: this.color_standard,
            strokeWidth: CONFIG.EC_STROKE_WIDTH,
            fill: false,
            selectable: false,
            perPixelTargetFind: true
        });
        this.line.set("mpl", this);

        this.line.on('mousedown', function (e) {
            let mpl: MultiPathLine = e.target.mpl;
            videoarea.setVideoTime(mpl.video_time, mpl.matchId);
            mpl.changeActiveLine();
            //ResultList.set_active(mpl.elem_id);
        });

        this.line.on("mouseover", function (e) {
            let mpl: MultiPathLine = e.target.mpl;
            if (mpl != MultiPathLine.active_line) {
                mpl.changeColor(3);
                //var $list = $("#" + mpl.elem_id);
                //$list.trigger('hover');
            }
            //ResultList.hover(mpl.elem_id);
        });
        this.line.on("mouseout", function (e) {
            let mpl: MultiPathLine = e.target.mpl;
            if (mpl != MultiPathLine.active_line) {
                mpl.changeColor(1);
                //var $list = $("#" + mpl.elem_id);
                //$list.mouseout();
            }
            //ResultList.deactivate_hover(mpl.elem_id);
        });
    }

    public register(): void {
        DrawingArea.field.add(this.line);
        ResultList.addResult(new Result(this.id.toString(), this.time, this.video_time,location[0],location[1],this.eventtype,[],this));
        MultiPathLine.addLine(this);
    }

    public static addLine(line: MultiPathLine): void {
        MultiPathLine.lines.push(line);
    }

    public static clearLines(): void {
        MultiPathLine.active_line = null;
        for (let line of MultiPathLine.lines) {
            line.deleteLine();
        }
    }

    public deleteLine(): void {
        DrawingArea.field.remove(this.line);
    }

    public unhighlight(): void {
        this.line
    }

    public changeActiveLine(): void {
        if (MultiPathLine.active_line == null) {
            MultiPathLine.active_line = this;
        } else {
            MultiPathLine.active_line.deactivateActive();
            MultiPathLine.active_line = this;
        }
        this.changeColor(2);
    }

    protected changeColor(highlight: number): void {
        if (highlight == 1) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_standard);
            DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.sendBackwards(this.line);
            DrawingArea.field.renderAll();
            Timeline.stopHover(this.elem_id.split("_")[1]);
        } else if (highlight == 2) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_highlighted);
            DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.renderAll();
            Timeline.stopHover(this.elem_id.split("_")[1]);
            Timeline.setActive(this.elem_id.split("_")[1]);
        } else {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_hover);
            DrawingArea.field.renderAll();
            Timeline.hover(this.elem_id.split("_")[1]);
        }
    }

    public deactivateActive(): void {
        this.changeColor(1);
    }

    public setElemID(elem_id) {
        this.elem_id = elem_id;
    }

    public static deleteAllLines(): void {
        MultiPathLine.active_line = null;
        if (MultiPathLine.lines.length > 0) {
            for (let line of MultiPathLine.lines) {
                line.deleteLine();
            }
        }
    }
}
