import express from 'express'
import { createServer } from 'http'
import { authenticate } from './middleware/auth.js'
import gameRoutes from "./routes/game.js"

const app = express();
const server = createServer(app);

const PORT = process.env.BACKEND_PORT;

app.use(express.json());
app.use("/game", authenticate, gameRoutes)

server.listen(PORT, '0.0.0.0', () => {
	console.log(`backend listening on port ${PORT}`)
});
