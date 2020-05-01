import { PrismaClient } from "@prisma/client"
import { StateStore } from "./state";
import { ClientEmitter } from "./clientEventer";
import { IncomingLocationEvent } from "./event";

export type EventHandler<Event extends IncomingLocationEvent> =
    (event: Omit<Event, "type">, store: StateStore, emitter: ClientEmitter, prisma: PrismaClient) => Promise<void>

export default <Event extends IncomingLocationEvent>(handler: EventHandler<Event>) =>
    (prisma: PrismaClient) =>
        (event: Omit<Event, "type">, store: StateStore, emitter: ClientEmitter) =>
            handler(event, store, emitter, prisma)
