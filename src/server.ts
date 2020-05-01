import ws, { createWebSocketStream } from "ws";
import http from "http"
import { Socket } from "net";
import { PrismaClient } from "@prisma/client";
import authorize from "./util/auth";
import inShapeOf from "./util/inShapeOf";
import createStore from "./state/state";
import createEventer from "./state/clientEventer";
import locationHandler from "./api/location";
import { IncomingEvents, IncomingLocationEventSchema } from "./state/event";

const server = http.createServer()
const wss = new ws.Server({ noServer: true })
const prisma = new PrismaClient({
    log: [
        {
            level: "info",
            emit: "stdout"
        },
        {
            level: "query",
            emit: "stdout"
        },
        {
            level: "warn",
            emit: "stdout"
        }
    ]
})

const { BIND_ADDRESS, PORT } = process.env

wss.on('connection', (ws: ws, req: http.IncomingMessage, clientID: number) => {
    const store = createStore(clientID, ws)
    const eventer = createEventer(ws)

    const handlers = {
        location: locationHandler(prisma)
    }
    ws.on('message', (data) => {
        try {
            const obj = JSON.parse(data.toString()) as IncomingEvents
            switch (obj.type) {
                case "location": {
                    const { type, ...event } = obj
                    if (!inShapeOf(obj, IncomingLocationEventSchema)) throw new Error("Invalid event shape")
                    handlers.location(event, store, eventer)
                } break;
            }
        } catch (e) {
            eventer.emit("error", { message: e.message || JSON.stringify(e) })
        }
    })
})

server.on('upgrade', (request: http.IncomingMessage, socket: Socket, head: Buffer) => {
    authorize(request).then(id => {
        if (id !== undefined) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit("connection", ws, request, id)
            })
        } else {
            socket.write("HTTP/1.1 401 Unauthorized \n\r\n\r")
            socket.destroy()
        }
    })
})

prisma.connect().then(() => {
    const port = parseInt(PORT!)
    if (isNaN(port)) throw new Error("PORT expected to be an integer")
    server.listen(port, BIND_ADDRESS!, 10000, () => {
        console.log(`Starting server on ${BIND_ADDRESS}:${port}`)
    })
}).finally(() => [
    prisma.disconnect()
])