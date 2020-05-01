import { Store } from "./store";
import { StateEvents } from "./event";
import { UserState, initialUserState } from "./model";

export type StateStore = Store<StateEvents, UserState>

export default (userid: number): StateStore =>
    new Store<StateEvents, UserState>(
        initialUserState(userid),
        (event, state) => {
            switch (event.type) {
                case "accumulate":
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
                    return { ...state, currentRegion: event.region }
                case "region-fetch":
                    return { ...state, regions: event.regions }
            }
        })