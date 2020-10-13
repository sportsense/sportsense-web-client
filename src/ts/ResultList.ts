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

class ResultList {

    private static resultList: Result[] = [];

    public static addResult(result: Result){
        ResultList.resultList.push(result);
    }

    public static getResult(num: number): Result{
        if(num < ResultList.resultList.length){
            return ResultList.resultList[num];
        }else{
            console.error("ERROR: THIS RESULT DOES NOT EXIST!");
            return null;
        }
    }

    public static clearResultList(): void{
        ResultList.resultList = [];
        Timeline.resetTimeline();
    }

    public static removeResultsFromResultList(start:number): void{
        ResultList.resultList.slice(start);
        Timeline.resetTimeline();
    }

    public static countElements(): number{
        return ResultList.resultList.length;
    }

    public static fillTimeline(highlightList: boolean): void{
        Timeline.resetTimeline();
        for(let res of ResultList.resultList){
            Timeline.addItem(res, highlightList);
        }
        Timeline.addItemListToTimeline();
    }

    public static deactivateResultList(): void{
        if(EventChain.active_chain != null){
            EventChain.active_chain.deactivateActive();
            EventChain.active_chain = null;
        }
        for(let res of ResultList.resultList){
            if(Timeline.zoomingLevel > CONFIG.ZOOMINGFILTER_LEVEL_1.min_view){
                if(!(CONFIG.ZOOMINGFILTER_LEVEL_1.events.indexOf(res.getEventType())> -1)){
                    res.deactivateResult();
                }else{
                    res.activateResult()
                }
            }else if(Timeline.zoomingLevel < CONFIG.ZOOMINGFILTER_LEVEL_2.max_view && Timeline.zoomingLevel > CONFIG.ZOOMINGFILTER_LEVEL_2.min_view){
                if(!(CONFIG.ZOOMINGFILTER_LEVEL_2.events.indexOf(res.getEventType())> -1)){
                    res.deactivateResult();
                }else{
                    res.activateResult()
                }
            }else if(Timeline.zoomingLevel < CONFIG.ZOOMINGFILTER_LEVEL_3.max_view){
                if(!(CONFIG.ZOOMINGFILTER_LEVEL_3.events.indexOf(res.getEventType())> -1)){
                    res.deactivateResult();
                }else{
                    res.activateResult()
                }
            }
        }
    }
}
