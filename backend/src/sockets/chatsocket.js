import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../services/prisma.js';

export function registerChat(io) {
  const chatNamespace = io.of('/ws/chat')

  chatNamespace.on('connection', (socket) => {
    // track auth state with 3-second timeout
    socket.data.authenticated = false
    socket.data.userId = null

    const authTimeout = setTimeout(() => {
      if (!socket.data.authenticated) {
        socket.emit('message', {
          type: 'auth:error',
          payload: {}
        })
        socket.disconnect(true)
      }
    }, 3000)

    socket.on('message', async (frame) => {
      // Handle auth frame
      if (frame.type === 'auth') {
        try {
          const decoded = jwt.verify(frame.payload.token, process.env.JWT_SECRET)
          socket.data.userId = decoded.userId
          socket.data.username = decoded.username
          socket.data.authenticated = true
          clearTimeout(authTimeout)

          socket.join(`user:${decoded.userId}`)
          socket.join('lobby')

          socket.emit('message', {
            type: 'auth:ok',
            payload: {}
          })

          chatNamespace.emit('message', {
            type: 'presence:update',
            payload: {
              userId: decoded.userId,
              online: true
            }
          })

          console.log(`User authenticated: ${decoded.username} (${decoded.userId})`)

          const persistentMessages = await prisma.message.findMany({
            where: {
              OR: [
                { recipientId: decoded.userId },
                { senderId: decoded.userId },
                { recipientId: null }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              sender: { select: { id: true, username: true } },
              receiver: { select: { username: true } }
            }
          })

          for (const msg of persistentMessages.reverse()) {
            socket.emit('message', {
              type: 'message:new',
              payload: {
                id: msg.id,
                from: msg.senderId,
                fromUsername: msg.sender.username,
                to: msg.receiver?.username ?? null,
                content: msg.content,
                ts: msg.createdAt?.toISOString?.() ?? new Date().toISOString()
              }
            })
          }
        } catch (err) {
          console.error('Auth/connect error:', err)
          socket.emit('message', {
            type: 'auth:error',
            payload: {}
          })
          socket.disconnect(true)
        }

        return
      }

      if (!socket.data.authenticated) {
        console.warn('Unauthenticated message attempt:', frame.type)
        return
      }

      if (frame.type === 'message:send') {
        const { to, content } = frame.payload

        // idk if empty content could cause issue maybe we want to refuse 
        // huge message too in case we get a troll evaluator who tries to crash 
        // ou struff
        if (!content || content.trim().length === 0 || content.length > 2000) {
          return
        }

        const messageId = uuidv4()
        const now = new Date().toISOString()
        const messageNewFrame = {
          type: 'message:new',
          payload: {
            id: messageId,
            from: socket.data.userId, // for dms
            fromUsername: socket.data.username, // for display
            to: to || null,
            content: content.trim(),
            ts: now
          }
        }

        if (to) {
          const recipient = await prisma.user.findUnique({
            where: { username: to },
            select: { id: true }
          })

          if (!recipient) { // No need to send to 
            chatNamespace.to(`user:${socket.data.userId}`).emit('message', {
              type: 'msgToSelf', // identifies it in the frontend
              payload: {
                content: `User "${to}" not found.`,
                type: 'msgToSelf',
                from: socket.data.userId, // for dms
                fromUsername: 'WARNING' // for display
              }
            })
            return
          }
          else if (recipient.id === socket.data.userId) {
            chatNamespace.to(`user:${socket.data.userId}`).emit('message', {
              type: 'msgToSelf',
              payload: {
                content: `you cannot send messages to yourself.`,
                type: 'msgToSelf',
                from: socket.data.userId,
                fromUsername: 'WARNING'
              }
            })
            return
          }
          else {
            const isBlocked = await prisma.block.findUnique({
              where: {
                blockerId_blockedId: {
                  blockerId: recipient.id,
                  blockedId: socket.data.userId
                }
              }
            })

            if (isBlocked) {
              chatNamespace.to(`user:${socket.data.userId}`).emit('message', {
                type: 'msgToSelf',
                payload: {
                  content: `User "${to}" has blocked you and wont receive your messages !`,
                  type: 'msgToSelf',
                  from: socket.data.userId,
                  fromUsername: 'WARNING'
                }
              })
              return
            }

            console.log('saving message with senderId:', socket.data.userId)
            await prisma.message.create({
              data: {
                senderId: socket.data.userId,
                recipientId: recipient.id,
                content: content.trim(),
              }
            })

            chatNamespace.to(`user:${socket.data.userId}`).emit('message', messageNewFrame)
            chatNamespace.to(`user:${recipient.id}`).emit('message', messageNewFrame)
            return
          }
        }

        try {
          await prisma.message.create({
            data: {
              senderId: socket.data.userId,
              recipientId: null,
              content: content.trim(),
            }
          })
        } catch (e) {
          console.error('CREATE FAILED with senderId:', socket.data.userId, e.message)
        }

        chatNamespace.emit('message', messageNewFrame)
      }

      // === typing ===
      // Expected: { "type": "typing", "payload": { "to": null|userId } }
      if (frame.type === 'typing') {
        const typingFrame = {
          type: 'typing',
          payload: {
            fromUsername: socket.data.username
          }
        }
        chatNamespace.emit('message', typingFrame)
      }

      if (frame.type === 'read') {
        const { messageId } = frame.payload
        // Update message read status may be useful later
        //  if we want to receive dms from other users while disconnected
        await prisma.message.update({
          where: { id: messageId },
          data: { readAt: new Date() }
        })
      }
    })

    socket.on('disconnect', () => {
      if (socket.data.authenticated) {
        chatNamespace.emit('message', {
          type: 'presence:update',
          payload: {
            userId: socket.data.userId,
            online: false
          }
        })
        console.log(`User disconnected: ${socket.data.username}`)
      }
    })
  })
}