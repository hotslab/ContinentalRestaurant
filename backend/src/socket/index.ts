import "dotenv/config"
import "../utils/timezone"
import { createServer } from "http"
import { Server } from "socket.io"
import redis from "../utils/redis"

const httpSocketServer = createServer()
const io = new Server(httpSocketServer, { cors: { origin: "*" } })

io.on("connection", async socket => {
  console.log("Socket initialiased")
  await redis.subscribe('notification', (message) => {
    console.log('SUBSCRIBE', JSON.parse(message))
    socket.emit('channel:notification', JSON.parse(message))
  })
  socket.on("notification", (data) => console.log("news data", data))
})

export default httpSocketServer
