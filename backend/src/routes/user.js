import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import prisma from '../services/prisma.js';
import { uploadAvatar, AVATARS_DIR } from '../middleware/upload.js';

const router = Router();

router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, username: true, email: true, avatarUrl: true, createdAt: true,
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
      select: { id: true, username: true, avatarUrl: true, createdAt: true, },
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
      select: { id: true, username: true, avatarUrl: true, createdAt: true,
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
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data, select: { id: true, username: true, email: true, avatarUrl: true, createdAt: true, },});

    res.json({ message: 'Profile updated', user });
  } 
  catch (error) 
  {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/me/avatar', (req, res) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 2 MB or smaller'
        : err.message;
      return res.status(400).json({ error: message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const userId = req.user.userId;
    const avatarUrl = `/api/uploads/avatars/${req.file.filename}`;

    try {
      const previous = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatarUrl: true },
      });

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: { id: true, username: true, email: true, avatarUrl: true, createdAt: true },
      });

      if (previous?.avatarUrl?.startsWith('/api/uploads/avatars/')) {
        const oldPath = path.join(AVATARS_DIR, path.basename(previous.avatarUrl));
        fs.promises.unlink(oldPath).catch(() => {});
      }

      res.json({ message: 'Avatar updated', user });
    } catch (error) {
      console.error('Error updating avatar:', error);
      fs.promises.unlink(req.file.path).catch(() => {});
      res.status(500).json({ error: 'Server error' });
    }
  });
});

export default router;
