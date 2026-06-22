import { Router } from 'express';
import { createGame, getGame, joinGame, startGame, switchRole, GAME_STATUS } from '../services/game.js';
import { getIO } from '../socket.js';

const router = Router();

router.post('/create', async (req, res) => {
	const game = await createGame(req.user.userId);
	res.json({ code: game.code });
});

router.post('/:code/join', async (req, res) => {
	const { team, role } = req.body;
	if (!team || !role) return res.status(400).json({ error: 'team and role are required' });

	const game = await getGame(req.params.code);
	if (!game || game.status !== GAME_STATUS.WAITING) return res.status(404).json({ error: 'Game not found' });

	const existing = game.players.find(p => p.userId === req.user.userId);
	if (existing) return res.status(400).json({ error: 'Already in this game' });

	if (game.players.length >= 4) return res.status(400).json({ error: 'Game is full' });

	const teamPlayers = game.players.filter(p => p.team === team);
	if (teamPlayers.length >= 2) return res.status(400).json({ error: 'Team is full' });
	if (teamPlayers.some(p => p.role === role)) return res.status(400).json({ error: 'Role already taken' });

	const player = await joinGame(req.params.code, req.user.userId, team, role);
	getIO().to(`lobby:${req.params.code}`).emit('player-joined', player);
	res.json(player);
});

router.post('/:code/switch', async (req, res) => {
	const { team, role } = req.body;
	if (!team || !role) return res.status(400).json({ error: 'team and role are required' });

	const game = await getGame(req.params.code);
	if (!game || game.status !== GAME_STATUS.WAITING) return res.status(404).json({ error: 'Game not found' });

	const existing = game.players.find(p => p.userId === req.user.userId);
	if (!existing) return res.status(400).json({ error: 'Not in this game' });

	const taken = game.players.find(p => p.team === team && p.role === role);
	if (taken) return res.status(400).json({ error: 'Spot already taken' });

	const player = await switchRole(req.params.code, req.user.userId, team, role);
	getIO().to(`lobby:${req.params.code}`).emit('player-switched', player);
	res.json(player);
});

router.get('/:code', async (req, res) => {
	const game = await getGame(req.params.code);
	if (!game) return res.status(404).json({ error: 'Game not found' });
	res.json(game);
});

router.post('/:code/start', async (req, res) => {
	const game = await getGame(req.params.code);
	if (!game) return res.status(404).json({ error: 'Game not found' });
	if (game.status !== GAME_STATUS.WAITING) return res.status(400).json({ error: 'Game already started' });
	if (game.players.length < 4) return res.status(400).json({ error: 'Not enough players' });
	const updated = await startGame(game);
	getIO().to(`lobby:${req.params.code}`).emit('game-started', updated);
	res.json(updated);
});

export default router;
