import { createSocket } from "dgram"
import { logger } from "./logger"
import { offset } from "./offset"
import { performance } from "perf_hooks"
import { IResult } from "."
import { delay } from "./utils"

const port = 123
const timeout = 10000
const payload = new Uint8Array(48)
payload[0] = 0x1b

export function getTime(host: string,retries:number): Promise<IResult> {
    let diff = 0
    let sync = 0
    let perf = 0
    return new Promise(async (res, rej) => {
        const client = createSocket("udp4")

        const t = setTimeout(() => {
            client.close()
            rej(new Error("Timeout"))
        }, timeout)

        client.on("error", (error) => {
            clearTimeout(t)
            client.close()
            rej(error)
        })

        client.on("message", (msg: Uint8Array) => {
            const timestamp = offset(msg)
            diff = timestamp - diff
            perf = performance.now() - perf
            if (diff >= 1000){
                diff = 1000 // safe trap
            }

            if (sync >= retries) {
                clearTimeout(t)
                client.close()
                res({
                    host: host,
                    ms: perf,
                    diff: diff,
                    timestamp: timestamp
                })
            }
            logger(host, `${timestamp.toFixed(4).toString()} ${perf.toFixed(4)} ${diff}`)
            
            diff = timestamp
        })

        while (sync <= retries) {
            client.send(payload, 0, 48, port, host, (error) => {
                if (error) {
                    clearTimeout(t)
                    client.close()
                    rej(error)
                }
            })
            perf = performance.now()
            await delay(500)
            sync++
        }
    })
}