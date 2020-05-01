import { LocationSet, Region, Coordinates, Location } from "./model"
import { TypeOf, Type } from "../util/inShapeOf";

export interface AccumulateEvent {
    type: "accumulate"
    steps: number;
    distance: number;
}

export interface PointsAcuumulationEvent {
    type: "accumulate-points";
    points: number;
}

export interface POIEvent {
    type: "poi-update";
    locations: LocationSet;
}

export interface RegionEvent {
    type: "region";
    region?: Region
}

export type StateEvents = AccumulateEvent | PointsAcuumulationEvent | POIEvent | RegionEvent

export interface ClientPointEvent {
    type: "points";
    points: number;
}

export interface ClientPOIEvent {
    type: "poi";
    add: Location[];
    remove: number[];
}

export interface ClientRegionEvent {
    type: "region";
    region?: Region;
}

export interface ClientErrorEvent {
    type: "error";
    message: string;
}

export type ClientEvents = ClientPointEvent | ClientPOIEvent | ClientRegionEvent | ClientErrorEvent

export const IncomingLocationEventSchema = {
    type: "location" as const,
    longitude: Number,
    latitude: Number,
    steps: Number,
    distance: Number
}

export type IncomingLocationEvent = TypeOf<typeof IncomingLocationEventSchema>

export interface IncomingStartEvent {
    type: "start"
}

export interface IncomingEndEvent {
    type: "end"
}

export type IncomingEvents = IncomingLocationEvent | IncomingStartEvent | IncomingEndEvent