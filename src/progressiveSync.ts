import { IResult } from ".";
import { setDate } from "../node-gyp";
import { logger } from "./logger";
import { getTime } from "./ntp";
import { ntpServers } from "./servers";

export async function progressiveSync():Promise<boolean>{
    for (let s of ntpServers){
        let t!:IResult
        try {
            t = await getTime(s,4)
        } catch (error) {
            logger("progressive sync",`${error}\nSkipping ${s}`);
            continue
        }
        let diff = Date.now() 
        let timestamp = (t.timestamp + t.diff + t.ms)
        diff = timestamp - diff

        logger("diff",`${diff}`)
        if (diff <= 100 && diff >= -100){
            return true            
        }

        if (diff<= 0){
            timestamp = timestamp - diff
        } else if (diff>= 0){
            timestamp = timestamp + diff
        }
        setDate(timestamp/1000, timestamp % 1000 * 1000)

        diff = timestamp
    }
    return false
}