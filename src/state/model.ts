export interface Coordinates {
    longitude: number;
    latitude: number;
}

export interface Location {
    id: number;
    name: string;
    coords: Coordinates
}

export interface Region {
    id: number;
    name: string;
    polygon: Coordinates[];
}

export interface UserState {
    id: number;
    steps: number;
    distance: number;
    points: number;
    locations: LocationSet
    region?: Region;
}

export const initialUserState = (id: number): UserState => ({
    id, 
    distance: 0,
    locations: {},
    points: 0,
    steps: 0
})

export type LocationSet = {
    [k : number]: Location
}