import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { getGame, leaveGame, revealCard, saveGameState, setClue, switchTurn, GAME_STATUS } from './services/game.js'
import { listFriends } from './services/friends.js'
import { checkAndUnlockAchievements } from './routes/stats.js'

let io;
const onlineUsers = new Map();

export function isOnline(userId) {
	const sockets = onlineUsers.get(userId);
	return sockets ? sockets.size > 0 : false;
}

async function broadcastOnlineStatus(socket, userId) {
	try {
		const friends = await listFriends(userId);
		const onlineFriendIds = friends.filter((f) => isOnline(f.id)).map((f) => f.id);
		socket.emit('friends-online-status', onlineFriendIds);
		friends.forEach((f) => io.to(`user:${f.id}`).emit('friend-online', { userId }));
	} catch (e) {
		console.error('broadcastOnlineStatus error:', e);
	}
}

async function notifyFriendsOffline(userId) {
	try {
		const friends = await listFriends(userId);
		friends.forEach((f) => io.to(`user:${f.id}`).emit('friend-offline', { userId }));
	} catch (e) {
		console.error('notifyFriendsOffline error:', e);
	}
}

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
		const userId = socket.user.userId;
		socket.join(`user:${userId}`);

		if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
		const userSockets = onlineUsers.get(userId);
		userSockets.add(socket.id);
		if (userSockets.size === 1) broadcastOnlineStatus(socket, userId);

		socket.on('join-lobby', (gameCode) => {
			socket.data.gameCode = gameCode;
			socket.join(`lobby:${gameCode}`);
		});

		socket.on('leave-lobby', async (gameCode) => {
			try {
				const game = await getGame(gameCode);
				if (game && game.status === GAME_STATUS.WAITING) {
					await leaveGame(gameCode, socket.user.userId);
					socket.to(`lobby:${gameCode}`).emit('player-left', socket.user.userId);
				}
			} catch (e) {
				console.error('leave-lobby error:', e);
			}
			socket.data.gameCode = null;
			socket.leave(`lobby:${gameCode}`);
		});

		socket.on('submit-clue', async ({ gameCode, clue, number }) => {
			try {
				const game = await getGame(gameCode);
				if (!game) return;
				const player = game.players.find(p => p.userId === socket.user.userId);
				if (!player || player.role !== 'SPYMASTER' || player.team !== game.currentTeam) return;
				const updated = setClue(game, clue, number);
				if (!updated) return;
				const saved = await saveGameState(updated);
				io.to(`lobby:${gameCode}`).emit('game-updated', saved);
			} catch (e) {
				console.error('submit-clue error:', e);
			}
		});

		socket.on('guess', async ({ gameCode, index }) => {
			try {
				const game = await getGame(gameCode);
				if (!game) return;
				const player = game.players.find(p => p.userId === socket.user.userId);
				if (!player || player.role !== 'OPERATIVE' || player.team !== game.currentTeam) return;
				const updated = revealCard(game, index);
				if (!updated) return;
				const saved = await saveGameState(updated);
				io.to(`lobby:${gameCode}`).emit('game-updated', saved);
				if (saved.status === GAME_STATUS.FINISHED) {
					for (const p of saved.players)
						await checkAndUnlockAchievements(p.userId);
				}
			} catch (e) {
				console.error('guess error:', e);
			}
		});

		socket.on('end-turn', async ({ gameCode }) => {
			try {
				const game = await getGame(gameCode);
				if (!game || game.status !== GAME_STATUS.IN_PROGRESS || game.phase !== 'GUESS') return;
				const player = game.players.find(p => p.userId === socket.user.userId);
				if (!player || player.role !== 'OPERATIVE' || player.team !== game.currentTeam) return;
				const updated = switchTurn(game);
				const saved = await saveGameState(updated);
				io.to(`lobby:${gameCode}`).emit('game-updated', saved);
			} catch (e) {
				console.error('end-turn error:', e);
			}
		});

		socket.on('disconnect', async () => {
			const userSockets = onlineUsers.get(userId);
			if (userSockets) {
				userSockets.delete(socket.id);
				if (userSockets.size === 0) {
					onlineUsers.delete(userId);
					notifyFriendsOffline(userId);
				}
			}

			const gameCode = socket.data.gameCode;
			if (!gameCode) return;
			try {
				const game = await getGame(gameCode);
				if (game && game.status === GAME_STATUS.WAITING) {
					await leaveGame(gameCode, userId);
					socket.to(`lobby:${gameCode}`).emit('player-left', userId);
				}
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
