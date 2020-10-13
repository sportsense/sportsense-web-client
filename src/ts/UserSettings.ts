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

class UserSettings {

    private userRole: string;
    private userName: string;
    private pressingIndexThreshold:number;
    private pressingDurationThreshold:number;

    public static userList: UserSettings[] = [];

    constructor(role:string,name:string,press_Index:number,press_Duration:number) {
        // initializing all values
        this.userRole = role;
        this.userName = name;
        this.pressingIndexThreshold = press_Index;
        this.pressingDurationThreshold = press_Duration;

        UserSettings.userList.push(this);
    }

    /**
     * Calls the method that gets the users from the DB
     */
    public static getUsers(): void{
        DBConnection.getUsers("/getUsers");
    }

    /**
     * Fills the userList with the results from the DB
     * @param json
     */
    public static fillUsers(json): void {
        // Clear list, all users have value 3 for making refresh easier
        $("#user_dropdown [value='3']").remove();
        this.userList=[];
        let user;
        let role:string;
        let userName:string;
        let press_Index: number;
        let press_Duration: number;

        for (let i in json) {
            let stats = json[i];
            role = stats[0]["userRole"];
            userName = stats[0]["userName"];
            press_Index = stats[0]["pressingIndexThreshold"];
            press_Duration = stats[0]["pressingDurationThreshold"];
            user = new UserSettings(role, userName, press_Index, press_Duration);
            this.fillItemList(userName);
        }
    }

    /**
     * Adds a button Element for the user to the Html-Dropdown
     * and sets the onclick-Attribute.
     * @param user
     */
    public static fillItemList(user:string): void {
        let name:string = user;

        let list = document.getElementById('user_dropdown');
        let entry = document.createElement('button');
        entry.appendChild(document.createTextNode(name));
        entry.setAttribute("value", "3");
        entry.setAttribute("class", "dropdown-item");
        entry.setAttribute("type", "button")
        entry.setAttribute("href", "#");
        entry.setAttribute("id", name);
        list.appendChild(entry);

        let fun = "UserSettings.updateLabelAndParameter('" +  name +"')";
        document.getElementById(name).setAttribute('onclick', fun);
    }

    /**
     * Updates the label of the Html-Dropdown with the username.
     * @param name
     */
    public static updateLabelAndParameter(name:string){
        let username:string = name;
        document.getElementById('userMenu').innerHTML = username;

        // load parameters (pressing z.B.)
        DBConnection.getUserParam(username);

        //clear canvas if user is changed etc.
        ResultList.removeResultsFromResultList(Timeline.getItemListLength());
        DrawingArea.clearAndResetDefault();
    }

    /**
     * Updates the values in the pressingCustomization Modal for the current user.
     * @param json
     */
    public static updateModalValues(json){
        let index;
        let duration;
        for (let i in json) {
            let stats = json[i];
            index = stats[0]["pressingIndexThreshold"];
            duration = stats[0]["pressingDurationThreshold"]/1000;
        }

        $('#pressingIndexThreshold').val(index);
        $('#pressingDurationThreshold').val(duration);
    }

    /**
     * Calls the server to save the user with input variables from
     * the user creation modal.
     */
    public static saveUser(): void{
        let userRole:string = $('#role_filter').val();
        let userName:string = $('#username').val();
        for(let i in this.userList) {
            if(userName == this.userList[i].userName){
                $('#error-modal-text').text("This username already exists. Please try another one.");
                $("#errorMPModal").modal();
                return;
            }
        }
        DBConnection.saveUser(userRole, userName);
        this.updateLabelAndParameter(userName);
    }
}

