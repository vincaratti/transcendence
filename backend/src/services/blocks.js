import prisma from './prisma.js';
export async function isBlocked(blockerId, blockedId) {
    const block = await prisma.block.findFirst({
        where: {
        blockerId,
        blockedId,
        },
    });
    return !!block;
}
export async function blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
        throw new Error("You cannot block yourself");
    }
    const existingBlock = await prisma.block.findFirst({
        where: {
            blockerId,
            blockedId,
        },
    });
    if (existingBlock) {
        throw new Error("User is already blocked");
    }
    return prisma.block.create({
        data: {
            blockerId,
            blockedId,
        },
    });
}

export async function unblockUser(blockerId, blockedId) {
    return prisma.block.deleteMany({
        where: {
            blockerId,
            blockedId,
        },
    });
}

export async function getAllBlockedUsers(blockerId) {
    return prisma.block.findMany({
        where: {
            blockerId,
        },
        select: {
            blockedId: true,
        },
    });
}