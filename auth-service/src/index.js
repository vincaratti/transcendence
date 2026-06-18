import express from 'express'

const PORT = process.env.AUTH_PORT

const app = express()
app.use(express.json())

app.post('/register', (req, res) => {
	res.sendStatus(501)
})

app.post('/login', (req, res) => {
	res.sendStatus(501)
})

app.listen(PORT, '0.0.0.0', () => {
	console.log(`auth-service listening on port ${PORT}`)
})
