import { Router } from 'express';
import prisma from '../services/prisma.js';
import { getIO } from '../socket.js';
import {
	listFriends,
	listIncomingRequests,
	listOutgoingRequests,
	sendRequest,
	acceptRequest,
	declineRequest,
	removeFriend,
	FriendError,
} from '../services/friends.js';

const router = Router();

function emitToUser(userId, event, payload) {
	const io = getIO();
	if (io) io.to(`user:${userId}`).emit(event, payload);
}

function handleError(res, error, context) {
	if (error instanceof FriendError) {
		return res.status(error.status).json({ error: error.message });
	}
	console.error(`${context} error:`, error);
	return res.status(500).json({ error: 'Server error' });
}

router.get('/', async (req, res) => {
	try {
		res.json(await listFriends(req.user.userId));
	} catch (error) {
		handleError(res, error, 'list friends');
	}
});

router.get('/requests', async (req, res) => {
	try {
		const [incoming, outgoing] = await Promise.all([
			listIncomingRequests(req.user.userId),
			listOutgoingRequests(req.user.userId),
		]);
		res.json({ incoming, outgoing });
	} catch (error) {
		handleError(res, error, 'list requests');
	}
});

router.post('/requests', async (req, res) => {
	try {
		const { username } = req.body;
		if (!username) {
			return res.status(400).json({ error: 'Username is required' });
		}

		const target = await prisma.user.findUnique({
			where: { username },
			select: { id: true },
		});
		if (!target) {
			return res.status(404).json({ error: 'User not found' });
		}

		const { accepted } = await sendRequest(req.user.userId, target.id);

		if (accepted) {
			emitToUser(target.id, 'friend-request-accepted', { userId: req.user.userId });
		} else {
			emitToUser(target.id, 'friend-request-received', { userId: req.user.userId });
		}

		res.status(201).json({ accepted });
	} catch (error) {
		handleError(res, error, 'send request');
	}
});

router.post('/requests/:id/accept', async (req, res) => {
	try {
		const row = await acceptRequest(req.params.id, req.user.userId);
		emitToUser(row.requesterId, 'friend-request-accepted', { userId: req.user.userId });
		res.json({ ok: true });
	} catch (error) {
		handleError(res, error, 'accept request');
	}
});

router.post('/requests/:id/decline', async (req, res) => {
	try {
		const row = await declineRequest(req.params.id, req.user.userId);
		emitToUser(row.requesterId, 'friend-removed', { userId: req.user.userId });
		res.json({ ok: true });
	} catch (error) {
		handleError(res, error, 'decline request');
	}
});

router.delete('/:userId', async (req, res) => {
	try {
		await removeFriend(req.user.userId, req.params.userId);
		emitToUser(req.params.userId, 'friend-removed', { userId: req.user.userId });
		res.json({ ok: true });
	} catch (error) {
		handleError(res, error, 'remove friend');
	}
});

export default router;
