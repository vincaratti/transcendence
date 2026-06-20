import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from './services/prisma.js'

const PORT = process.env.AUTH_PORT

const app = express()
app.use(express.json())

app.post('/register', async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.status(400).json({ error: { message: 'All fields are required' } });
	}

	try {
		const existingUsername = await prisma.user.findUnique({ where: { username } })
		if (existingUsername) {
			return res.status(400).json({ error: { message: 'Username already exist' } });
		}

		const existingEmail = await prisma.user.findUnique({ where: { email } })
		if (existingEmail) {
			return res.status(400).json({ error: { message: 'Email already exist' } });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
			},
			select: { id: true, username: true },
		});

		const accessToken = jwt.sign(
			{ userId: user.id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		);

		res.status(201).json({ message: 'User Created', user, accessToken });
	} catch (error) {
		console.error('Register error:', error);
		res.status(500).json({ error: { message: 'Server error' } });
	}
})

app.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: { message: 'Email and password required' } });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, username: true, password: true },
		});

		if (!user) {
			return res.status(401).json({ error: { message: 'Invalid credentials' } });
		}

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return res.status(401).json({ error: { message: 'Invalid credentials' } })
		}

		const accessToken = jwt.sign(
			{ userId: user.id, username: user.username },
			process.env.JWT_SECRET,
			{ expiresIn: '24h' }
		);

		res.json({ message: 'Login successful', user: { id: user.id, username: user.username }, accessToken });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ error: { message: 'Server error' } })
	}
})

app.listen(PORT, '0.0.0.0', () => {
	console.log(`auth-service listening on port ${PORT}`)
})
