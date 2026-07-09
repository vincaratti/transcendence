import { Router } from 'express';
import prisma from '../services/prisma.js';

const router = Router();

import { isBlocked, blockUser, unblockUser, getAllBlockedUsers } from '../services/blocks.js';


router.get('/', async (req, res) => {
    try {
        const blockedUsers = await getAllBlockedUsers(req.user.userId);
        res.json(blockedUsers.map(b => b.blockedId));
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

    router.post('/:blockedId', async (req, res) => {
        const { blockedId } = req.params;
        try {
            const target = await prisma.user.findFirst({
                where: {
                    OR: [
                        { id: blockedId },
                        { username: blockedId }
                    ]
                }
            });
            
            if (!target) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (req.user.userId === target.id) {
                return res.status(400).json({ error: 'You cannot block yourself' });
            }
            
            await blockUser(req.user.userId, target.id);
            res.status(201).json({ message: 'User blocked successfully' });
        } catch (error) {
            console.error('Error blocking user:', error);
            res.status(400).json({ error: error.message });
        }
    });

router.delete('/:blockedId', async (req, res) => {
    const { blockedId } = req.params;
    try {
        const target = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: blockedId },
                    { username: blockedId }
                ]
            }
        });
        
        if (!target) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await unblockUser(req.user.userId, target.id);
        res.json({ message: 'User unblocked successfully' });
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;