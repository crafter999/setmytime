import { createSocket } from "dgram"
import { logger } from "./logger"
import { offset } from "./offset"
import { performance } from "perf_hooks"
import { IResult } from "."
import EventEmitter from "events"

const port = 123
const timeout = 10000
const payload = new Uint8Array(48)
payload[0] = 0x1b

export function getTime(host: string, retries: number): Promise<IResult> {
    const bounce = new EventEmitter()
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
            if (timestamp <= 0){
                return
            }
            diff = timestamp - diff
            perf = performance.now() - perf
            logger(host, `${timestamp.toFixed(4).toString()} ${perf.toFixed(4)} ${diff}`)
            
            if (sync >= retries && sync >= 2) {
                clearTimeout(t)
                client.close()
                res({
                    host: host,
                    ms: perf,
                    diff: diff,
                    timestamp: timestamp
                })
                return
            }

            diff = timestamp
            sync++
            bounce.emit("finished")
        })

        bounce.on("finished", () => {
            perf = performance.now()
            client.send(payload, 0, 48, port, host, (error) => {
                if (error) {
                    clearTimeout(t)
                    client.close()
                    rej(error)
                }
            })
        })

        bounce.emit("finished")
    })
}
