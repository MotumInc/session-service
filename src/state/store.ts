import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter"

export type Dispatcher<Event, State> = (event: Event, state: State) => State

interface Messages<Event, State> {
    event: (event: Event) => void;
    state: (state: State, oldState: State) => void;
}

export class Store<Event, State> {
    public state: State
    public emitter = new EventEmitter() as TypedEmitter<Messages<Event, State>>
    private dispatcher: Dispatcher<Event, State>

    public constructor(initialState: State, dispatcher: Dispatcher<Event, State>) {
        this.state = initialState
        this.dispatcher = dispatcher

        this.emitter.on("event", event => {
            this.emitter.emit("state", this.dispatcher(event, this.state), this.state)
        })

        this.emitter.on("state", state => {
            this.state = state
        })
    }

    public dispatch(event: Event) {
        this.emitter.emit("event", event)
        return this.state
    }

}
