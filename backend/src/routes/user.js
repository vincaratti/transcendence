import { Router } from 'express';
import prisma from '../services/prisma.js';

const router = Router();

router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, username: true, email: true, createdAt: true,
        players: { include: { game: { select: { id: true, code: true, status: true, } } } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } 
  catch (error) 
  {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, createdAt: true, },
      orderBy: { username: 'asc', }, });
    res.json(users);
  } 
  catch (error) 
  {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, username: true, createdAt: true,
        players: { include: { game: { select: {id: true, code: true, status: true, } } } } } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } 
  catch (error) 
  {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;