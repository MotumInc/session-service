require("dotenv-safe").config()
const WebSocket = require("ws")

// const ws = new WebSocket(`ws://localhost:${process.env.PORT}`, {
const ws = new WebSocket("ws://api.motumapp.me:5505", {
    headers: {
        "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidG9rZW5SZXZpc2lvbiI6MCwiaWF0IjoxNTg4MzY5MDkyLCJleHAiOjE1ODgzNjkzOTJ9.xBOqwNDbnH_Yh-Q29dhgohuHpljyublNRJxqg9e6Hmg"
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