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
var UserSettings = /** @class */ (function () {
    function UserSettings(role, name, press_Index, press_Duration) {
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
    UserSettings.getUsers = function () {
        DBConnection.getUsers("/getUsers");
    };
    /**
     * Fills the userList with the results from the DB
     * @param json
     */
    UserSettings.fillUsers = function (json) {
        // Clear list, all users have value 3 for making refresh easier
        $("#user_dropdown [value='3']").remove();
        this.userList = [];
        var user;
        var role;
        var userName;
        var press_Index;
        var press_Duration;
        for (var i in json) {
            var stats = json[i];
            role = stats[0]["userRole"];
            userName = stats[0]["userName"];
            press_Index = stats[0]["pressingIndexThreshold"];
            press_Duration = stats[0]["pressingDurationThreshold"];
            user = new UserSettings(role, userName, press_Index, press_Duration);
            this.fillItemList(userName);
        }
    };
    /**
     * Adds a button Element for the user to the Html-Dropdown
     * and sets the onclick-Attribute.
     * @param user
     */
    UserSettings.fillItemList = function (user) {
        var name = user;
        var list = document.getElementById('user_dropdown');
        var entry = document.createElement('button');
        entry.appendChild(document.createTextNode(name));
        entry.setAttribute("value", "3");
        entry.setAttribute("class", "dropdown-item");
        entry.setAttribute("type", "button");
        entry.setAttribute("href", "#");
        entry.setAttribute("id", name);
        list.appendChild(entry);
        var fun = "UserSettings.updateLabelAndParameter('" + name + "')";
        document.getElementById(name).setAttribute('onclick', fun);
    };
    /**
     * Updates the label of the Html-Dropdown with the username.
     * @param name
     */
    UserSettings.updateLabelAndParameter = function (name) {
        var username = name;
        document.getElementById('userMenu').innerHTML = username;
        // load parameters (pressing z.B.)
        DBConnection.getUserParam(username);
        //clear canvas if user is changed etc.
        ResultList.removeResultsFromResultList(Timeline.getItemListLength());
        DrawingArea.clearAndResetDefault();
    };
    /**
     * Updates the values in the pressingCustomization Modal for the current user.
     * @param json
     */
    UserSettings.updateModalValues = function (json) {
        var index;
        var duration;
        for (var i in json) {
            var stats = json[i];
            index = stats[0]["pressingIndexThreshold"];
            duration = stats[0]["pressingDurationThreshold"] / 1000;
        }
        $('#pressingIndexThreshold').val(index);
        $('#pressingDurationThreshold').val(duration);
    };
    /**
     * Calls the server to save the user with input variables from
     * the user creation modal.
     */
    UserSettings.saveUser = function () {
        var userRole = $('#role_filter').val();
        var userName = $('#username').val();
        for (var i in this.userList) {
            if (userName == this.userList[i].userName) {
                $('#error-modal-text').text("This username already exists. Please try another one.");
                $("#errorMPModal").modal();
                return;
            }
        }
        DBConnection.saveUser(userRole, userName);
        this.updateLabelAndParameter(userName);
    };
    UserSettings.userList = [];
    return UserSettings;
}());
