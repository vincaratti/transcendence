import prisma from './prisma.js';

const FRIEND_USER_SELECT = { id: true, username: true };

export async function findRelationship(a, b) {
	return prisma.friendship.findFirst({
		where: {
			OR: [
				{ requesterId: a, addresseeId: b },
				{ requesterId: b, addresseeId: a },
			],
		},
	});
}

export async function listFriends(userId) {
	const rows = await prisma.friendship.findMany({
		where: {
			status: 'ACCEPTED',
			OR: [{ requesterId: userId }, { addresseeId: userId }],
		},
		include: {
			requester: { select: FRIEND_USER_SELECT },
			addressee: { select: FRIEND_USER_SELECT },
		},
		orderBy: { updatedAt: 'desc' },
	});
	return rows.map((r) => (r.requesterId === userId ? r.addressee : r.requester));
}

export async function listIncomingRequests(userId) {
	const rows = await prisma.friendship.findMany({
		where: { status: 'PENDING', addresseeId: userId },
		include: { requester: { select: FRIEND_USER_SELECT } },
		orderBy: { createdAt: 'desc' },
	});
	return rows.map((r) => ({ id: r.id, user: r.requester }));
}

export async function listOutgoingRequests(userId) {
	const rows = await prisma.friendship.findMany({
		where: { status: 'PENDING', requesterId: userId },
		include: { addressee: { select: FRIEND_USER_SELECT } },
		orderBy: { createdAt: 'desc' },
	});
	return rows.map((r) => ({ id: r.id, user: r.addressee }));
}

export class FriendError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

export async function sendRequest(requesterId, addresseeId) {
	if (requesterId === addresseeId) {
		throw new FriendError(400, 'You cannot add yourself');
	}

	const target = await prisma.user.findUnique({ where: { id: addresseeId } });
	if (!target) {
		throw new FriendError(404, 'User not found');
	}

	const existing = await findRelationship(requesterId, addresseeId);
	if (existing) {
		if (existing.status === 'ACCEPTED') {
			throw new FriendError(409, 'You are already friends');
		}
		if (existing.addresseeId === requesterId) {
			const accepted = await prisma.friendship.update({
				where: { id: existing.id },
				data: { status: 'ACCEPTED' },
			});
			return { friendship: accepted, accepted: true };
		}
		throw new FriendError(409, 'Friend request already sent');
	}

	const friendship = await prisma.friendship.create({
		data: { requesterId, addresseeId, status: 'PENDING' },
	});
	return { friendship, accepted: false };
}

export async function acceptRequest(id, userId) {
	const row = await prisma.friendship.findUnique({ where: { id } });
	if (!row || row.status !== 'PENDING' || row.addresseeId !== userId) {
		throw new FriendError(404, 'Request not found');
	}
	return prisma.friendship.update({ where: { id }, data: { status: 'ACCEPTED' } });
}

export async function declineRequest(id, userId) {
	const row = await prisma.friendship.findUnique({ where: { id } });
	if (!row || row.status !== 'PENDING' || row.addresseeId !== userId) {
		throw new FriendError(404, 'Request not found');
	}
	await prisma.friendship.delete({ where: { id } });
	return row;
}

export async function removeFriend(userId, otherId) {
	const row = await findRelationship(userId, otherId);
	if (!row || row.status !== 'ACCEPTED') {
		throw new FriendError(404, 'Friend not found');
	}
	await prisma.friendship.delete({ where: { id: row.id } });
	return row;
}
