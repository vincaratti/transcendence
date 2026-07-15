import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from './services/prisma.js'
import { rateLimit } from './middleware/rateLimit.js'
import { validateLogin, validateRegistration } from './validation.js'

const PORT = process.env.AUTH_PORT

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '10kb' }))

const loginLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 30,
	message: 'Too many login attempts. Please try again in a few minutes.',
})

const registerLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 20,
	message: 'Too many accounts created from this address. Please try again later.',
})

app.post('/register', registerLimiter, async (req, res) => {
	const { data, error } = validateRegistration(req.body);

	if (error) {
		return res.status(400).json({ error: { message: error } });
	}

	const { username, email, password } = data;

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

app.post('/login', loginLimiter, async (req, res) => {
	const { data, error } = validateLogin(req.body);

	if (error) {
		return res.status(400).json({ error: { message: error } });
	}

	const { email, password } = data;

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
