require("dotenv-safe").config()
const WebSocket = require("ws")

const ws = new WebSocket(`ws://localhost:${process.env.PORT}`, {
    headers: {
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidG9rZW5SZXZpc2lvbiI6MCwiaWF0IjoxNTg4MzUwNDg5LCJleHAiOjE1ODgzNTA3ODl9.09G-nnB0yim2MuZsgqBz4yoMB8925vJ3BS6ISU2qtZM"
    }
})

ws.on("open", () => {
    ws.addListener("message", console.log)
    ws.send(JSON.stringify({
        type: "location",
        latitude: 50.46193310891305, 
        longitude: 30.349437929821825,
        steps: 10,
        distance: 15
    }))
})
ws.on("error", (err) => {
    console.error(err)
})
ws.on("close", (code, reason) => {
    console.log("Connection closed", code, reason)
})