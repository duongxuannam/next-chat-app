import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { id: idDeny } = z
      .object({
        id: z.string(),
      })
      .parse(body);
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
    const isAlreadyFriend = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`, idDeny
    );
    if (isAlreadyFriend) {
      return new Response("Already friends", {
        status: 400,
      });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`, idDeny
    );
    if (!hasFriendRequest) {
      return new Response("No friend request", {
        status: 400,
      });
    }

    await Promise.all([
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idDeny),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        'new_friend',
        {
          idDeny,

        }
      ),
    ])


    return new Response('OK ')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', {
        status: 422
      })
    }
    return new Response('Invalid request', {
      status: 400
    })
  }
};
