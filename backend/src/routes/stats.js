import { Router } from 'express';
import prisma from '../services/prisma.js';

const router = Router();

router.get('/me', async (req, res) => {
  try 
  {
    const stats = await getUserStats(req.user.userId);
    res.json(stats);
  } 
  catch (error) 
  {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/:userId', async (req, res) => {
  try 
  {
    const stats = await getUserStats(req.params.userId);
    res.json(stats);
  } 
  catch (error) 
  {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


async function getUserStats(userId) {
  const players = await prisma.player.findMany({
    where: { userId, game: { status: 'FINISHED',},},
    include: { game: true, },
  });

  const totalGames = players.length;

  let wins = 0;
  let losses = 0;
  let redWins = 0;
  let blueWins = 0;

  for (const player of players) {
    const game = player.game;
    if ((game.winner === 'RED' && player.team === 'RED') ||
      (game.winner === 'BLUE' && player.team === 'BLUE'))
    {
      wins++;
      if (player.team === 'RED')
        redWins++;
      else 
        blueWins++;
    } 
    else
      losses++;
  }

  return {
    userId,
    totalGames,
    wins,
    losses,
    winRate: totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : 0,
    redWins,
    blueWins,
  };
}

export default router;