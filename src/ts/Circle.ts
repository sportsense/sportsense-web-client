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

class Circle extends DrawingObject{
    public circle: any;
    private object_num: number;

    /**
     * the constructor creates a new fabric.js object and adds it to the rink
     * @param pointer
     * @param x
     * @param y
     */
    constructor(pointer, x, y, num){
        super("circle");
        this.object_num = num;
        this.circle = new fabric.Circle({
            left:x,
            top:y,
            radius: this.calculateHypotenuse((pointer.x-x),(pointer.y-y)),
            angle: 0,
            fill: CONFIG.COLOR_NONE,
            stroke: CONFIG.COLOR_SELECTION,
            strokeWidth: CONFIG.SELECTION_STROKE_WIDTH,
            hasRotatingPoint: false,
            hasBorders: true,
            hasControls: false,
            object_ref: this
        });
        DrawingArea.field.add(this.circle);
    }

    /**
     * disables the selection of this object
     */
    public disableSelection(): void{
        this.circle.selectable = false;
    }

    /**
     * enables the selection of this object
     */
    public enableSelection(): void{
        this.circle.selectable = true;
    }

    /**
     * This function is used by an fabric.js event listener.
     * If DrawingArea is in "drawing mode" this function is called after every mouse:move event.
     * The active_object will scale with the mouse position.
     * @param pointer
     * @param origX
     * @param origY
     */
    public resize(pointer,origX,origY): void{
        var radius = this.calculateHypotenuse(origX-pointer.x,origY-pointer.y);
        this.circle.set("left", origX-radius);
        this.circle.set("top", origY-radius);
        this.circle.set("radius", radius);
        this.circle.setCoords(); // important step: this method updates the selection box to the new size of the drawn object
        DrawingArea.field.renderAll();
    }

    /**
     * This function returns the length of the hypothenuse of the circle.
     * @param a
     * @param b
     * @returns {number}
     */
    private calculateHypotenuse(a, b): number{
        return Math.sqrt(Math.pow(a,2)+Math.pow(b,2));
    }

    /**
     * This function returns the type of DrawingObject, the middle coordinate and the radius length of the circle for the query.
     * @returns {[string,any,any,any]}
     */
    public getSelection(): any[]{
        return [this.type, this.circle.left+this.circle.radius, this.circle.top+this.circle.radius, this.circle.left]; // left is returned to recalculate the radius after converting to db coordinates
    }

    /**
     * This function returns true, if a coordinate lies within the circle.
     */
    public contained(x: number, y: number): boolean{
        var midx = this.circle.left+this.circle.radius;
        var midy = this.circle.top+this.circle.radius;
        var res = Math.sqrt(Math.pow(Math.abs(x - midx),2)+Math.pow(Math.abs(y - midy),2));
        if(res <= this.circle.radius){
            return true;
        }else{
            return false;
        }
    }

    /**
     * This function removes the circle.
     */
    public remove(): void{
        this.circle.remove();
    }

    /**
     * This function changes the value of object_num
     * (if a object on the DrawingArea has been removed the object_num needs to be updated).
     */
    public setObjectNum(x): void{
        this.object_num = x;
    }
}
