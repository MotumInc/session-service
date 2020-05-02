require("dotenv").config()
const WebSocket = require("ws")

const ws = new WebSocket(`ws://localhost:${process.env.PORT}`, {
    // const ws = new WebSocket("ws://api.motumapp.me:5505", {
    headers: {
        "authorization": `Bearer ${process.env.ACCESS_TOKEN}`
    }
})

const message = JSON.stringify({
    type: "location",
    latitude: 50.46193310891305,
    longitude: 30.349437929821825,
    steps: 10,
    distance: 15
})

ws.on("open", () => {
    ws.addListener("message", console.log)
    const send = () => {
        ws.send(message)
        setTimeout(send, 500)
    }
    setTimeout(() => ws.send(message), 1000)
    setTimeout(() => ws.send(message), 2000)
    setTimeout(() => ws.send(message), 3000)
    setTimeout(() => ws.send(message), 4000)
    setTimeout(() => ws.send(JSON.stringify({ type: "end" })))
    // send()
})

ws.on("error", (err) => {
    console.error(err)
})

ws.on("close", (code, reason) => {
    console.log("Connection closed", code, reason)
})