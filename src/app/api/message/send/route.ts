import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { Message, messageValidator } from "@/lib/validations/mesaages"
import { nanoid } from "nanoid"
import { getServerSession } from "next-auth"
import { z } from "zod"

export const POST = async (req: Request) => {
    try {
        const { text, chatId } = await req.json()
        const session = await getServerSession(authOptions)
        if (!session) return new Response('Unauthorized', {
            status: 401
        })

        const [userId1, userId2] = chatId.split('--')

        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', {
                status: 401
            })
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1

        const friendList = (await fetchRedis('smembers', `user:${session.user.id}:friends`)) as string[]

        const isFriend = friendList.includes(friendId)
        if (!isFriend) {

            return new Response('Unauthorized', {
                status: 401
            })
        }
        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
        const sender = JSON.parse(rawSender) as User

        const timestamp = Date.now()
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp

        }
        const message = messageValidator.parse(messageData)

        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
                ...message,
                senderImg: sender.image,
                senderName: sender.name
            }),
            pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message),
            db.zadd(`chat:${chatId}:messages`, {
                score: timestamp,
                member: JSON.stringify(message)
            })
        ])

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Type error', {
                status: 501
            })
        }
        return new Response('Internal server error', {
            status: 501
        })
    }
}