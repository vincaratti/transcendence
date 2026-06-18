import express from 'express'
import { createServer } from 'http'

const app = express()
const server = createServer(app)

const PORT = process.env.BACKEND_PORT;

app.use(express.json())

app.get('/test', (req, res) => {
	res.json({ status: 'ok' })
})

server.listen(PORT, '0.0.0.0', () => {
	console.log(`backend listening on port ${PORT}`)
})
