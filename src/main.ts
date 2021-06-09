#!/usr/bin/env node

import { IResult } from "."
import { setDate } from "../node-gyp"
import { logger } from "./logger"
import { getTime } from "./ntp"
import { fastestPool } from "./pools"

(async () => {
    const args = process.argv.slice(2)
    let t: IResult | undefined
    if (typeof args[0] !== "undefined" && typeof args[1] !== "undefined") {
        // manual
        if (args[0] === "-s") {
            t = await getTime(args[1],4)
        }
    } else {
        // auto
        let fastest = await fastestPool()
        t = await getTime(fastest.host,4)
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