#!/usr/bin/env node

import { IResult } from "."
import { setDate } from "../node-gyp"
import { logger } from "./logger"
import { getTime } from "./ntp"
import { fastestPools } from "./fastestPool"
import { progressiveSync } from "./progressiveSync"

(async () => {
    const args = process.argv.slice(2)
    let t: IResult | undefined
    let fastestSorted = await fastestPools()
    if (typeof args[0] !== "undefined" && typeof args[1] !== "undefined") {
        // manual
        if (args[0] === "-s") {
            t = await getTime(args[1],4)
        }
    } else {
        // auto
        for (let s of fastestSorted){
            try {
                t = await getTime(s.host,4)
                break
            } catch (error) {
                continue
            }
        }
    }

    // fail-safe (type too)
    if (!t) {
        return
    }
    if (Number.isNaN(t.timestamp)) {
        throw "Invalid number from ntp server"
    }

    const timestamp = (t.timestamp + t.diff + t.ms)
    logger("set date",timestamp.toString())
    const result = setDate(timestamp/1000, t.timestamp % 1000 * 1000)
    
    let maxSyncTries = 0
    let firstFastest = fastestSorted.map(e=>e.host)
    while (await progressiveSync(firstFastest) === false){
        if (maxSyncTries >= 5){
            console.warn("Could not sync with accuracy less than 0.01 sec")
            break
        }
        maxSyncTries++
    }

    if (result == 0) {
        console.log("OK");
        process.exit(0)
    } else {
        console.error("ERROR");
        process.exit(result)
    }

})().catch(e => {
    console.error(e);
    process.exit(1)
})