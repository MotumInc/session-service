import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import ws from "ws"
import { ClientPOIEvent, ClientPointEvent, ClientRegionEvent, ClientErrorEvent } from "./event";

type Messages = {
    poi:    (event: Omit<ClientPOIEvent,    "type">) => void;
    point:  (event: Omit<ClientPointEvent,  "type">) => void;
    region: (event: Omit<ClientRegionEvent, "type">) => void;
    error:  (event: Omit<ClientErrorEvent,  "type">) => void;
}

type AllMessages = Messages & { event: (...args: any[]) => void }

class Emitter extends EventEmitter {
    ws: ws

    constructor(ws: ws) {
        super()
        this.ws = ws
    }

    emit(type: string, event: any) {
        this.ws.send(JSON.stringify({ type, event }))
        return super.emit(type, event)
    }
}

export type ClientEmitter = TypedEmitter<AllMessages>

export default (ws: ws): ClientEmitter => (new Emitter(ws) as any)
