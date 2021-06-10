import { logger } from "./logger";
import { ntpServers } from "./servers";
import { getTime } from "./ntp";
import { IResult } from ".";

export async function fastestPools(): Promise<IResult[]> {
    const pools: Promise<IResult>[] = []
    let poolRequests: PromiseSettledResult<IResult>[] = [];

    for (let s of ntpServers) {
        pools.push(getTime(s,0))
    }

    poolRequests = await Promise.allSettled(pools)
    poolRequests = poolRequests.filter(e => e.status === "fulfilled")

    const sortedTimestamps = poolRequests.sort((a, b) => {
        // @ts-ignore TODO: fix?
        return a.value.ms - b.value.ms
    })

    if (poolRequests.length === 0) {
        throw new Error("All pools are down. Maybe network error")
    }

    return sortedTimestamps.map(e=>{
        // @ts-ignore TODO: fix?
        return e.value
    })
}