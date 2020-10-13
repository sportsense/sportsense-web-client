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

// this part just waits 200 ms in order to load the correct window size
/*
setTimeout(() =>
    {
        this.router.navigate(['/']);
    },
    200);*/

// this class initiates all static classes

let drawingarea = new DrawingArea();
let offballactivities = new OffBallActivities();
let filters = new FilterArea();
let drawingbtns = new DrawingButtons();
let resultlist = new ResultList();
let videoarea = new VideoArea();
let timeline = new Timeline();
let graph2d = new Graph2d();
let network = new Network();

$(function() {
    window.dispatchEvent(new Event('resize'));
});
