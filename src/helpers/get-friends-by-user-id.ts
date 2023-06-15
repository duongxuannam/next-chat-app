import { fetchRedis } from "./redis"

export const getFriendsByUserId = async (userId: string) => {
    const friendIs = await fetchRedis('smembers',
        `user:${userId}:friends`) as string[]
    const friends = await Promise.all(
        friendIs.map(async (friendId) => {
            const friend = await fetchRedis('get', `user:${friendId}`) as string
            const parsedFriends = JSON.parse(friend) as User
            return parsedFriends
        })
    )

    return friends
}