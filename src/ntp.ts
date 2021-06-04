import { createSocket } from "dgram"
import { offset } from "./offset"

const host = "pool.ntp.org"
const port = 123
const timeout = 5000
const payload = new Uint8Array(48)
payload[0] = 0x1b

export function getTime(): Promise<number> {
    return new Promise((res, rej) => {
        const client = createSocket("udp4")
        
        const t = setTimeout(()=>{
            rej(new Error("Timeout"))
        },timeout)

        client.on("error", (error) => {
            rej(error)
        })

        client.on("message", (msg: Uint8Array) => {
            clearTimeout(t)
            client.close()
            res(offset(msg))
        })

        client.send(payload, 0, 48, port, host, (error) => {
            if (error){
                clearTimeout(t)
                client.close()
                rej(error)
            }
        });
    })
}