"use client";

import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import UnseenChatToast from "./UnseenChatToast";
import { toast } from "react-hot-toast";
import { pusherClient } from "@/lib/pusher";

type Props = {
  friends: User[];
  sessionId: string;
};

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

interface NewFriendIncoming extends User {
  idDeny: boolean;
}

const SidebarChatList = ({ friends, sessionId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = (newFriend: NewFriendIncoming) => {
      if (newFriend.idDeny) return;
      setActiveChats((prev) => [...prev, newFriend]);
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      // should be notified
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderMessage={message.text}
          senderName={message.senderName}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <>
      <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
        {activeChats.sort().map((friend) => {
          const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
            return unseenMessage.senderId === friend.id;
          }).length;
          return (
            <li key={friend.id}>
              <Link
                href={`/dashboard/chat/${chatHrefConstructor(
                  sessionId,
                  friend.id
                )}`}
              >
                <div className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
                  {friend.name}
                  {unseenMessagesCount > 0 ? (
                    <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                      {unseenMessagesCount}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default SidebarChatList;
