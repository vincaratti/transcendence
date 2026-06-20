import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { leaveGame } from './services/game.js'

let io;

export function initSocket(server) {
	io = new Server(server, { path: '/ws/' });

	io.use((socket, next) => {
		const token = socket.handshake.auth?.token;
		if (!token) return next(new Error('Authentication required'));
		try {
			socket.user = jwt.verify(token, process.env.JWT_SECRET);
			next();
		} catch {
			next(new Error('Invalid token'));
		}
	});

	io.on('connection', (socket) => {
		socket.on('join-lobby', (gameCode) => {
			socket.data.gameCode = gameCode;
			socket.join(`lobby:${gameCode}`);
		});

		socket.on('leave-lobby', async (gameCode) => {
			try {
				await leaveGame(gameCode, socket.user.userId);
				socket.to(`lobby:${gameCode}`).emit('player-left', socket.user.userId);
			} catch (e) {
				console.error('leave-lobby error:', e);
			}
			socket.data.gameCode = null;
			socket.leave(`lobby:${gameCode}`);
		});

		socket.on('disconnect', async () => {
			const gameCode = socket.data.gameCode;
			if (!gameCode) return;
			try {
				await leaveGame(gameCode, socket.user.userId);
				socket.to(`lobby:${gameCode}`).emit('player-left', socket.user.userId);
			} catch (e) {
				console.error('disconnect leave error:', e);
			}
		});
	});

	return io;
}

export function getIO() {
	return io;
}
