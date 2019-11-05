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

class MultiPathLineWithArrow extends MultiPathLine {

    private arrowhead: any;
    private startPoint: any;
    private endPoint: any;
    // this.line is stored in the class MultiPathLine

    private static paths: MultiPathLineWithArrow[] = [];

    constructor(points: any[], time: string, videotime: number, id: number, eventtype, period, matchId, playerId) {
        super(points, time, videotime, id, eventtype, period, matchId);

        // setting up the differences to the normal MultiPathLine objects
        let firstChar: string = playerId.charAt(0);
        if (playerId == "BALL") {
            this.color_standard = CONFIG.COLOR_BALL_STANDARD;
            this.color_highlighted = CONFIG.COLOR_BALL_HIGHLIGHTED;
            this.color_hover = CONFIG.COLOR_BALL_HOVER;
        } else if (firstChar == "A" || firstChar == "C") {
            this.color_standard = CONFIG.COLOR_TEAM_A_STANDARD;
            this.color_highlighted = CONFIG.COLOR_TEAM_A_HIGHLIGHTED;
            this.color_hover = CONFIG.COLOR_TEAM_A_HOVER;
        } else if (firstChar == "B" || firstChar == "D") {
            this.color_standard = CONFIG.COLOR_TEAM_B_STANDARD;
            this.color_highlighted = CONFIG.COLOR_TEAM_B_HIGHLIGHTED;
            this.color_hover = CONFIG.COLOR_TEAM_B_HOVER;
        }

        // update line color to newly set value
        this.changeColor(1);
    }

    protected build(points: any[]) {
        // build arrow head
        let length: number = points.length;
        if (length > 1) {
            let p1 = DrawingArea.dbToCanvasCoordinates(points[length-2][0], points[length-2][1]);
            let p2 = DrawingArea.dbToCanvasCoordinates(points[length-1][0], points[length-1][1]);
            let coords = [parseFloat(p1[0]), parseFloat(p1[1]), parseFloat(p2[0]), parseFloat(p2[1])];
            // in order to draw an arrow head we first have to find the angle to point the arrow head in the right direction
            let alpha_radians = Math.atan2(coords[3] - coords[1], coords[2] - coords[0]);        // atan2(p2.y - p1.y, p2.x - p1.x)
            let alpha_deg = alpha_radians * 180 / Math.PI;
            this.arrowhead = new fabric.Triangle({
                left: coords[2],            // triangle is positioned on last point
                top: coords[3],
                strokeWidth: 1,
                width: 8, height: 8,
                stroke: false,
                fill: this.color_standard,
                selectable: false,
                originX: 'center',
                originY: 'center',
                perPixelTargetFind: true
            });
            this.arrowhead.set('angle', alpha_deg + 90);          // +90 is needed, otherwise the arrow heads would be sideways
        }

        // build path
        let p1 = DrawingArea.dbToCanvasCoordinates(points[0][0], points[0][1]);
        let path: string = "M " + p1[0] + " " + p1[1];
        this.startPoint = p1;
        for (let i = 1; i < points.length; i++) {
            let p = DrawingArea.dbToCanvasCoordinates(points[i][0], points[i][1]);
            path = path + " L " + p[0] + " " + p[1];
            if (i == points.length - 1) {
                this.endPoint = p;
            }
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
            let mpl: MultiPathLineWithArrow = e.target.mpl;
            videoarea.setVideoTime(mpl.videotime, mpl.matchId);
            mpl.changeActiveLine();
        });
        this.line.on("mouseover", function (e) {
            let mpl: MultiPathLineWithArrow = e.target.mpl;
            if (mpl != MultiPathLineWithArrow.active_line) {
                mpl.changeColor(3);
            }
        });
        this.line.on("mouseout", function (e) {
            let mpl: MultiPathLineWithArrow = e.target.mpl;
            if (mpl != MultiPathLineWithArrow.active_line) {
                mpl.changeColor(1);
            }
        });
    }

    public register(): void {
        DrawingArea.field.add(this.line);
        DrawingArea.field.add(this.arrowhead);
        MultiPathLineWithArrow.paths.push(this);
    }

    public static clearLines(): void {
        MultiPathLineWithArrow.active_line = null;
        for (let path of MultiPathLineWithArrow.paths) {
            DrawingArea.field.remove(path.line);
            DrawingArea.field.remove(path.arrowhead);
        }
        MultiPathLineWithArrow.paths = [];
    }

    protected changeColor(highlight: number): void {
        if (highlight == 1) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_standard);
            this.arrowhead.set('fill', this.color_standard);
            //DrawingArea.field.bringToFront(this.line);
            //DrawingArea.field.sendBackwards(this.line);
            DrawingArea.field.renderAll();
        } else if (highlight == 2) {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_highlighted);
            this.arrowhead.set('fill', this.color_highlighted);
            //DrawingArea.field.bringToFront(this.line);
            DrawingArea.field.renderAll();
        } else {
            this.line.set('fill', CONFIG.COLOR_NONE);
            this.line.set('stroke', this.color_hover);
            this.arrowhead.set('fill', this.color_hover);
            DrawingArea.field.renderAll();
        }
    }

    public static getPathStartAndEndPoints(): any[] {
        let startPoints = [];
        let endPoints = [];

        for (let path of MultiPathLineWithArrow.paths) {
            startPoints.push(path.startPoint);
            endPoints.push(path.endPoint);
        }

        return [startPoints, endPoints];
    }
}
