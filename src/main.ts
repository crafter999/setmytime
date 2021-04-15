#!/usr/bin/env node

import { execute } from "./exec"
import { getTime } from "./ntp"

(async () => {
    try {
        let t = await getTime()
        t = Math.floor(t/1000)

        if (Number.isNaN(t)) {
            throw "Invalid number from ntp server"
        }
        await execute("/usr/bin/date +%s -s @" + t)
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
})()