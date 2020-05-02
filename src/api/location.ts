import { isPointInPolygon, getDistance } from "geolib";
import { Location, Region, Coordinates, LocationSet, metersPerPoint, stepsPerPoint, viewArea } from "../state/model";
import eventHandler from "../state/eventHandler";
import { IncomingLocationEvent } from "../state/event";
import { PrismaClient } from "@prisma/client";

export interface LocationResponse {
    points: number;
    add: Location[];
    remove: number[];
}


const coinsForActivity = (distance: number, steps: number) =>
    Math.floor(Math.floor(distance) / metersPerPoint + steps / stepsPerPoint)

const intersection = (o1: object, o2: object) =>
    [
        Object.keys(o1).filter(key => !{}.hasOwnProperty.call(o2, key)),
        Object.keys(o2).filter(key => !{}.hasOwnProperty.call(o1, key)),
    ]

let regions: Region[] | undefined = undefined

const calculateRegions = async (position: Coordinates, prisma: PrismaClient): Promise<Region | undefined> => {
    if (!regions) {
        const r = await prisma.region.findMany({
            include: {
                Polygon: {
                    orderBy: {
                        id: "desc"
                    },
                    select: {
                        latitude: true,
                        longitude: true,
                    }
                }
            }
        })
        regions = r.map(region => ({
            id: region.id,
            name: region.name,
            polygon: region.Polygon,
        }))
    }

    const region = regions.find(({ polygon }) => isPointInPolygon(position, polygon))
    return region
}

const getDiscoveryInfo = async (region: Region, userID: number, prisma: PrismaClient) => {
    const discovered = await prisma.userRegion.findOne({
        where: {
            userid: userID
        },
        select: {
            completion: true
        }
    }) || await prisma.userRegion.create({
        data: {
            userid: userID,
            completion: 0,
            Region: {
                connect: {
                    id: region.id
                }
            }
        }, select: {
            completion: true
        }
    })

    return { ...region, ...discovered }
}

export default eventHandler<IncomingLocationEvent>(async (event, store, emitter, prisma) => {
    let state = store.dispatch({
        type: "accumulate",
        distance: event.distance,
        steps: event.steps
    })

    // const diff = coinsForActivity(state.distance, state.steps) - state.points
    const diff = Math.random() < 0.3 ? 1 : 0
    if (diff || state.currentRegion?.completion)
        emitter.emit("point", { points: state.points, completion: state.currentRegion?.completion })

    const userPosition = { longitude: event.longitude, latitude: event.latitude }

    if (!state.currentRegion) {
        const region = await calculateRegions(userPosition, prisma)
        if (region) {
            const discoveredRegion = await getDiscoveryInfo(region, state.id, prisma)
            state = store.dispatch({ type: "region", region: discoveredRegion })
            emitter.emit("region", { region: discoveredRegion })
        } else {
            state = store.dispatch({ type: "region" })
            emitter.emit("region", {})
        }
    } else {
        if (!isPointInPolygon(userPosition, state.currentRegion.polygon)) {
            const region = await calculateRegions(userPosition, prisma)
            if (region) {
                const discoveredRegion = await getDiscoveryInfo(region, state.id, prisma)
                state = store.dispatch({ type: "region", region: discoveredRegion })
                emitter.emit("region", { region: discoveredRegion })
            } else {
                state = store.dispatch({ type: "region" })
                emitter.emit("region", {})
            }
        }
    }

    if (state.currentRegion) {
        const locations = await prisma.location.findMany({
            where: {
                region: state.currentRegion!.id
            }
        })

        const nearLocations = locations.filter(({ longitude, latitude }) => getDistance(userPosition, { longitude, latitude }) < viewArea)

        const nearLocationObjects: LocationSet = nearLocations.reduce((acc, location) => ({ ...acc, [location.id]: location }), {})

        const [newLocations, removedLocations] = intersection(nearLocationObjects, state.locations)

        if (newLocations.length !== 0 || removedLocations.length !== 0) {
            emitter.emit("poi", {
                add: newLocations.map(key => nearLocationObjects[parseInt(key)]),
                remove: removedLocations.map(parseInt)
            })
            state = store.dispatch({
                type: "poi-update",
                locations: nearLocationObjects
            })
        }
    }
})