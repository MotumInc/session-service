import { PrismaClient } from "@prisma/client";
import eventHandler from "../state/eventHandler"
import { IncomingEndEvent } from "../state/event"
import { pushActivity } from "../util/user-registry"
import { DiscoveredRegion } from "../state/model";

const pushLocalActivity = (userid: number, regions: DiscoveredRegion[], prisma: PrismaClient) =>
    Promise.all(regions.map(({ completion, id }) =>
        prisma.userRegion.upsert({
            create: {
                userid,
                completion,
                Region: {
                    connect: {
                        id
                    }
                }
            },
            where: {
                region: id
            },
            update: {
                completion
            }
        })
    ))

export default eventHandler<IncomingEndEvent>(async (event, store, emitter, prisma) => {
    let state = store.state
    const regions = Object.values(state.regions)
    const [activity] = await Promise.all([
        pushActivity(state.id, state.steps, state.distance, state.points, regions),
        pushLocalActivity(state.id, regions, prisma)
    ])

    emitter.emit("end", activity.toObject())
})