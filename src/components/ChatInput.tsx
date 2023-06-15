"use client";

import React, { useRef, useState } from "react";
import TextAreaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

type Props = {
  chatPartner: User;
  chatId: string;
};

const ChatInput = ({ chatPartner, chatId }: Props) => {
  const textareaAutosizeRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!input) return;
    try {
      setIsLoading(true);
      await axios.post("/api/message/send", {
        text: input,
        chatId,
      });
      setInput("");
      textareaAutosizeRef.current?.focus();
    } catch (error) {
      // if (error instanceof AxiosError) {
      // }
      toast.error("Something wrong please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm right-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextAreaAutosize
          ref={textareaAutosizeRef}
          onKeyDown={(e) => {
            if (e.key === "enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />
        <div
          onClick={() => textareaAutosizeRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="px-px">
            <div className="h-9"></div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button isLoading={isLoading} onClick={sendMessage} type="submit">
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
