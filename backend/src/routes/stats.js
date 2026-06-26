import { Router } from 'express';
import prisma from '../services/prisma.js';


const router = Router();

//[STATS]

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

//[MATCHES]

router.get('/me/matches', async (req, res) => {
  try
  {
    const matches = await getUserMatches(req.user.userId, req.query);
    res.json(matches);
  }
  catch (error)
  {
    console.error('Error fetching match history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

//[LEADERBOARD]

router.get('/leaderboard', async (req, res) => {
  try
  {
    const { limit = 10, cursor } = req.query;
    const leaderboard = await getLeaderboard(parseInt(limit), cursor);
    res.json(leaderboard);
  }
  catch (error)
  {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/leaderboard/me', async (req, res) => {
  try
  {
    const rank = await getMyRank(req.user.userId);
    res.json(rank);
  }
  catch (error)
  {
    console.error('Error fetching my rank:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId/matches', async (req, res) => {
  try
  {
    const matches = await getUserMatches(req.params.userId, req.query);
    res.json(matches);
  }
  catch (error)
  {
    console.error('Error fetching match history:', error);
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

//[STATS]

async function getUserStats(userId) {
  const players = await prisma.player.findMany({
    where: { userId, game: { status: 'FINISHED'} },
    include: { game: true },
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

//[MATCHES]

async function getUserMatches(userId, query) {
  const { limit = 10, cursor, result } = query;

  const where = { userId, game: { status: 'FINISHED' } };

  if (result) {
    const allPlayers = await prisma.player.findMany(
        {
            where: { userId, game: { status: 'FINISHED' } },
            include: { game: true },
        });

    const gameIds = allPlayers
      .filter((p) => { const game = p.game; 
        const isWin =
          (game.winner === 'RED' && p.team === 'RED') ||
          (game.winner === 'BLUE' && p.team === 'BLUE');
        return result === 'win' ? isWin : !isWin;
      })
      .map((p) => p.gameId);

      if (gameIds.length > 0) 
            where.gameId = { in: gameIds };
        else
            return { matches: [], hasMore: false, nextCursor: null };
  }

  if (cursor) 
    where.id = { lt: cursor };

  const players = await prisma.player.findMany({
    where,
    include: {
      game: {
        include: {
          players: { include: { user: { select: { username: true } } } },
        },
      },
    },
    orderBy: { game: { createdAt: 'desc' } },
    take: parseInt(limit) + 1,
  });

  let hasMore = false;
  let nextCursor = null;
  if (players.length > parseInt(limit)) 
    {
    hasMore = true;
    players.pop();
    nextCursor = players[players.length - 1]?.id || null;
  }

  const matches = players.map((player) => {
    const game = player.game;
    const isWin =
      (game.winner === 'RED' && player.team === 'RED') ||
      (game.winner === 'BLUE' && player.team === 'BLUE');

    const teammates = game.players
      .filter((p) => p.team === player.team && p.userId !== userId)
      .map((p) => ({ username: p.user.username }));
    const opponents = game.players
      .filter((p) => p.team !== player.team)
      .map((p) => ({ username: p.user.username }));

    return {
      id: game.id,
      code: game.code,
      team: player.team,
      role: player.role,
      result: isWin ? 'win' : 'loss',
      winner: game.winner,
      createdAt: game.createdAt,
      teammates,
      opponents,
    };
  });

  return {
    matches,
    hasMore,
    nextCursor,
  };
}

//[LEADERBOARD]

async function getLeaderboard(limit = 10, cursor) {

  const users = await prisma.user.findMany({
    include: 
    { 
        players: { where: { game: { status: 'FINISHED' } },
        include: { game: true } } 
    }});

  const leaderboard = users.map((user) => {
    let wins = 0;
    let total = 0;

    for (const player of user.players) 
    {
      const game = player.game;
      total++;
      if ((game.winner === 'RED' && player.team === 'RED') ||
        (game.winner === 'BLUE' && player.team === 'BLUE')) 
        wins++;
    }

    return {
      userId: user.id,
      username: user.username,
      wins,
      totalGames: total,
      winRate: total > 0 ? (wins / total * 100).toFixed(1) : 0,
    };
  });

  leaderboard.sort((a, b) => b.wins - a.wins);

  let startIndex = 0;
  if (cursor) 
    {
        const found = leaderboard.findIndex((u) => u.userId === cursor);
        if (found !== -1) startIndex = found + 1;
    }

  const paginated = leaderboard.slice(startIndex, startIndex + limit);

  return {
    leaderboard: paginated,
    hasMore: startIndex + limit < leaderboard.length,
    nextCursor: paginated.length > 0 ? paginated[paginated.length - 1].userId : null,
  };
}

async function getMyRank(userId) {
  const stats = await getUserStats(userId);

  const users = await prisma.user.findMany({
    include: { players: { where: { game: { status: 'FINISHED' } },
        include: { game: true } } } 
    });

  const leaderboard = users.map((user) => {
    let wins = 0;
    let total = 0;

    for (const player of user.players) {
      const game = player.game;
      total++;
      if ((game.winner === 'RED' && player.team === 'RED') ||
        (game.winner === 'BLUE' && player.team === 'BLUE'))
        wins++;
    }

    return {
      userId: user.id,
      username: user.username,
      wins,
      totalGames: total,
      winRate: total > 0 ? (wins / total * 100).toFixed(1) : 0,
    };
  });

  leaderboard.sort((a, b) => b.wins - a.wins);

  const rank = leaderboard.findIndex((u) => u.userId === userId) + 1;

  return {
    rank: rank > 0 ? rank : null,
    ...stats,
  };
}

export default router;