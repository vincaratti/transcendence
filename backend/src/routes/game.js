import { Router } from 'express';
import { createGame, getGame, startGame, GAME_STATUS } from '../services/game.js';

const router = Router();

router.post('/create', async (req, res) => {
	const game = await createGame();
	res.json({ code: game.code });
});

router.get('/:code/join', async (req, res) => {
	const game = await getGame(req.params.code);
	if (!game || game.status != GAME_STATUS.WAITING) return res.status(404).json({ error: 'Game not found' });
});

router.get('/:code', async (req, res) => {
	const game = await getGame(req.params.code);
	if (!game) return res.status(404).json({ error: 'Game not found' });
	res.json(game);
});

router.post('/:code/start', async (req, res) => {
	const game = await getGame(req.params.code);
	if (!game) return res.status(404).json({ error: 'Game not found' });
	//TODO: Check number of players
	await startGame(game);
	res.json(game);
});

export default router;
