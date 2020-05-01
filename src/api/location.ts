import { isPointInPolygon, getDistance } from "geolib";
import { Location, Region, Coordinates, LocationSet } from "../state/model";
import eventHandler from "../state/eventHandler";
import { IncomingLocationEvent } from "../state/event";
import { PrismaClient } from "@prisma/client";

export interface LocationResponse {
    points: number;
    add: Location[];
    remove: number[];
}

const metersPerPoint = 100;
const stepsPerPoint = 150;
const viewArea = 50;

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
            polygon: region.Polygon
        }))
    }

    const region = regions.find(({ polygon }) => isPointInPolygon(position, polygon))
    return region
}

export default eventHandler<IncomingLocationEvent>(async (event, store, emitter, prisma) => {
    let state = store.dispatch({
        type: "accumulate",
        distance: event.distance,
        steps: event.steps
    })

    const diff = coinsForActivity(state.distance, state.steps) - state.points
    if (diff !== 0) emitter.emit("point", { points: state.points })

    const userPosition = { longitude: event.longitude, latitude: event.latitude }

    if (!state.region) {
        const region = await calculateRegions(userPosition, prisma)
        state = store.dispatch({ type: "region", region })
        emitter.emit("region", { region })
    } else {
        if (!isPointInPolygon(userPosition, state.region.polygon)) {
            const region = await calculateRegions(userPosition, prisma)
            state = store.dispatch({ type: "region", region })
            emitter.emit("region", { region })
        }
    }

    const locations = await prisma.location.findMany({
        where: {
            region: state.region!.id
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
})