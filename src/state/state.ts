import { Store } from "./store";
import { StateEvents } from "./event";
import { UserState, initialUserState, stepsPerRegion } from "./model";

export type StateStore = Store<StateEvents, UserState>

export default (userid: number): StateStore =>
    new Store<StateEvents, UserState>(
        initialUserState(userid),
        (event, state) => {
            switch (event.type) {
                case "accumulate":
                    if (state.currentRegion) {
                        state.currentRegion.completion = 
                            Math.min(1.0, state.currentRegion.completion + event.steps / stepsPerRegion)
                    }
                    return {
                        ...state,
                        distance: state.distance + event.distance,
                        steps: state.steps + event.steps
                    }
                case "accumulate-points":
                    return { ...state, points: state.points + event.points }
                case "poi-update":
                    return { ...state, locations: event.locations }
                case "region":
                    if (state.currentRegion) {
                        const savedRegion = state.regions[state.currentRegion.id]
                        if (savedRegion) {
                            savedRegion.completion = Math.min(1.0, savedRegion.completion + state.currentRegion.completion)
                        } else {
                            state.regions[state.currentRegion.id] = state.currentRegion
                        }
                    }
                    return { ...state, currentRegion: event.region }
                case "region-fetch":
                    return { ...state, regions: event.regions }
                case "reset": 
                    return initialUserState(userid)
            }
        })