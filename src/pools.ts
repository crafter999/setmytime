import { logger } from "./logger";
import { ntpServers } from "./servers";
import { getTime } from "./ntp";
import { IResult } from ".";

export async function fastestPool(): Promise<IResult> {
    const pools: Promise<IResult>[] = []
    let poolRequests: PromiseSettledResult<IResult>[] = [];

    for (let s of ntpServers) {
        pools.push(getTime(s,0))
    }

    poolRequests = await Promise.allSettled(pools)
    poolRequests = poolRequests.filter(e => e.status === "fulfilled")

    const sortedTimestamps = poolRequests.sort((a, b) => {
        // @ts-ignore
        return a.value.ms - b.value.ms
    })

    if (poolRequests.length === 0) {
        throw new Error("All pools are down. Maybe network error")
    }

    // @ts-ignore
    const fastestPool = sortedTimestamps[0].value as IResult

    logger("Found fastest pool server",
        `${fastestPool.host} ${fastestPool.ms.toFixed(4)}`)

    return fastestPool
}