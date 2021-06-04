#!/usr/bin/env node

import { getTime } from "./ntp"
import { setDate } from "../node-gyp"

(async () => {
    let t = await getTime()
    t = Math.floor(t / 1000)

    if (Number.isNaN(t)) {
        throw "Invalid number from ntp server"
    }
    const result = setDate(t)
    if (result == 0){
        console.log("OK");
    } else {
        console.error("ERROR");
    }
})().catch(e => {
    console.error(e);
    process.exit(1)
})