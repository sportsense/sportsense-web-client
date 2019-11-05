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

declare var videojs:any;

class VideoArea{

    public static videoplayer: any;
    // SUI-CRO matchID as default matchid
    private static matchid: string = "Match ID: 742569";

    /**
     * starting videojs to initialize the video player
     */
    constructor(){
        videojs("video").ready(function(){
            VideoArea.videoplayer = this;
            if(window.location.search.substr(1).split('=')[1] === "football") {
                VideoArea.videoplayer.src({ type: "video/mp4", src: "./videos/SUI-CRO.mp4" });
            }else if(window.location.search.substr(1).split('=')[1] === "icehockey"){
                VideoArea.videoplayer.src("./videos/usa_swe.mp4");
            }
        });
    }

    /**
     * sets the video player to the input time and starts the video
     * @param e
     */
    public setVideoTime(time:number, key: string): void{
        this.changeVideo("Match ID: " + key);

        // needed if no matchfilter is selected -> elements of different matches with corresponding video scene
        VideoArea.videoplayer.on('loadedmetadata', function() {
            VideoArea.videoplayer.currentTime(time+CONFIG.ADDITIONAL_VIDEO_OFFSET);
        });

        VideoArea.videoplayer.currentTime(time+CONFIG.ADDITIONAL_VIDEO_OFFSET);
        VideoArea.videoplayer.play();
    }

    /**
     * adjusts the video source each time the match Filter is changed
     */
    public changeVideo(key: string): void{
        //console.log(key,VideoArea.matchid);
        if(key === VideoArea.matchid){
            return;
        }else{
            let video_name: string = FilterArea.getVideoPath(key);
            //console.log("[VideoArea] changed to " + video_name);
            VideoArea.videoplayer.src("./videos/" + video_name);
            VideoArea.matchid = key;
        }
    }
}
