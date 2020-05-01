import ws from "ws";
import { Store } from "./store";
import { StateEvents } from "./event";
import { UserState, initialUserState } from "./model";

export type StateStore = Store<StateEvents, UserState>

export default (userid: number, ws: ws): StateStore =>
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
                    const points = state.points + event.points
                    ws.send(JSON.stringify({ type: "points", points }))
                    return { ...state, points }
                case "poi-update":
                    return { ...state, locations: event.locations }
                case "region":
                    return { ...state, region: event.region }
            }
        })