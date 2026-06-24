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


router.put('/me', async (req, res) => {
  const { username, email, password } = req.body;
  const userId = req.user.userId;

  try {
    if (username) {
      const existing = await prisma.user.findFirst({ where: { username, id: { not: userId },},});
      if (existing) {
        return res.status(400).json({ error: 'Username already exist' });
      }
    }

    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, id: { not: userId }, }, });
      if (existing) {
        return res.status(400).json({ error: 'Email already exist' });
      }
    }

    const data = {};
    if (username) data.username = username;
    if (email) data.email = email;
    if (password) {
      const bcrypt = await import('bcrypt');
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data, select: { id: true, username: true, email: true, createdAt: true, },});

    res.json({ message: 'Profile updated', user });
  } 
  catch (error) 
  {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;