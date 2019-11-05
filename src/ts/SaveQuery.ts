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

class SaveQuery {

    public static deleteQuery(queryID: string): void{
        //Send method "deleteQuery with the query ID to the DB, then send back to remove the list element with that ID
        console.log("Delete this " + queryID);
        DBConnection.editSavedQueries("delQuery", queryID);

        let element = document.getElementById(queryID); //To remove the deleted Query from the list
        element.parentNode.removeChild(element);
    }

    public static rerunQuery(queryID: string): void{
        //Send to DB the ID of the saved Query, then use the shapeQuery method in the Server and send back the events, also set the Filters to the state.
        console.log("Rerun this " + queryID);
        DBConnection.editSavedQueries("rerunQuery", queryID);
    }

    /**
     * Shows the just saved query in the list by creating a new "li" Html Element.
     * Every "li" element has the id of the saved query document as a parameter for the delete and rerun functions.
     * @param name of the saved query
     * @param json with the ID from the MongoDB
     */
    public static addSavedQuery(name: string, json):void{
        let id: string = json.id.toString();
        let li = document.createElement("li");
        li.className = "li-query";
        li.id = id;
        let buttonHTMLString = "<button class=\"btn-sm btn-danger btn-space\"style=\"float: right;\" onclick=\"SaveQuery.deleteQuery(document.getElementById(" + "'" + id + "'" + ").id)\" ><i class=\"fa fa-trash\"></i></button> <input type=\"button\" onclick=\"SaveQuery.rerunQuery(document.getElementById(" + "'" + id + "'" + ").id)\" value=\"Show\" style=\"float: right;\">";
        li.innerHTML = name + buttonHTMLString;
        $('#savedQueries').prepend(li);
    }

    /**
     * Gets the name from the saved form field and reruns the shapequery but only to save the specified attributes.
     */
    public static saveQuery():void{
        let obj = (<HTMLInputElement>document.getElementById("filter-name")); //Name of the Saved query
        if (DBConnection.eventIDs.length == 0){
            DrawingArea.mouseUp(obj.value); //Old version, when the query parameters where saved and not only the eventIDs
        } else if (DBConnection.active_eventmarkers.length != 0){
            DBConnection.saveEcQuery(obj.value);
            console.log(DBConnection.active_eventmarkers);
        } else {
            DBConnection.saveNormalQuery(obj.value);
        }
        obj.value = "";
    }

    /**
     * To fill in the saved queries list
     * It creates an HTML list where each Query is a "li" element with 2 buttons, "show" query and delete
     * @param json: the response from the server with the queryNames and IDs.
     */
    public static fillQueries(json): void{
        for (let i in json.result) {
            let queryName: string = json.result[i].name;
            let query_ID: string = json.result[i].qid;

            let li = document.createElement("li");
            li.className = "li-query";
            li.id = query_ID;
            let buttonHTMLString = "<button class=\"btn-sm btn-danger btn-space\"style=\"float: right;\" onclick=\"SaveQuery.deleteQuery(document.getElementById("+ "'" + query_ID + "'" + ").id)\" ><i class=\"fa fa-trash\"></i></button> <input type=\"button\" onclick=\"SaveQuery.rerunQuery(document.getElementById("+"'" + query_ID + "'"+").id)\" value=\"Show\" style=\"float: right;\">";
            li.innerHTML = queryName + buttonHTMLString;

            //Adds the player options to the selection as well as the player ID as the value. "<option value= " + playerID + ">" + playerName + "</option>"
            $('#savedQueries').append(li);
        }
    }
}

function getQueryList() {
    // 1. Call DB get JSON document with all the saved Filters, Need to check SportFilter = Football
    // --> Sort them based on their creationDate. db.getCollection('savedFilters').find({}).sort({_id:-1}) this will sort the collection in descending order based on date of insertion
    // 3. Loop through them and create List item of every single one, displaying Name, storing the other Query Information in an Array
    // 4. Make them clickable --> Clear drawing area --> Fill in Filteroptions --> Send Query with the rectangle parameters
    // 5. add a trashcan to delete the saved query.
}
