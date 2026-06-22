import express from 'express'
import { createServer } from 'http'
import { authenticate } from './middleware/auth.js'
import { initSocket } from './socket.js'
import gameRoutes from "./routes/game.js"
import userRoutes from "./routes/user.js"  

const app = express();
const server = createServer(app);

initSocket(server);

const PORT = process.env.BACKEND_PORT;

app.use(express.json());
app.use("/game", authenticate, gameRoutes)
app.use("/users", authenticate, userRoutes)

server.listen(PORT, '0.0.0.0', () => {
	console.log(`backend listening on port ${PORT}`)
});
