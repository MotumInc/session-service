export interface Coordinates {
    longitude: number;
    latitude: number;
}

export interface Location {
    id: number;
    name: string;
    coords: Coordinates;
}

export interface Region {
    id: number;
    name: string;
    polygon: Coordinates[];
}

export interface DiscoveredRegion extends Region {
    completion: number;
}

export interface UserState {
    id: number;
    steps: number;
    distance: number;
    points: number;
    locations: LocationSet;
    currentRegion?: DiscoveredRegion;
    regions: RegionSet;
}

export const initialUserState = (id: number): UserState => ({
    id, 
    distance: 0,
    locations: {},
    regions: {},
    points: 0,
    steps: 0
})

export type RegionSet = {
    [k : number]: DiscoveredRegion
}

export type LocationSet = {
    [k : number]: Location
}

export const metersPerPoint = 100;
export const stepsPerPoint = 150;
export const viewArea = 50;
export const stepsPerRegion = 3000;