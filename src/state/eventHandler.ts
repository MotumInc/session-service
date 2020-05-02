import { PrismaClient } from "@prisma/client"
import { StateStore } from "./state";
import { ClientEmitter } from "./clientEventer";
import { IncomingLocationEvent, IncomingEvents } from "./event";

export type EventHandler<Event extends IncomingEvents> =
    (event: Omit<Event, "type">, store: StateStore, emitter: ClientEmitter, prisma: PrismaClient) => Promise<void>

export default <Event extends IncomingEvents>(handler: EventHandler<Event>) =>
    (prisma: PrismaClient) =>
        (event: Omit<Event, "type">, store: StateStore, emitter: ClientEmitter) =>
            handler(event, store, emitter, prisma)
