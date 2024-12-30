"use client";

import { Message } from "@/app/product/Chat/Message";
import { MessageList } from "@/app/product/Chat/MessageList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../../../convex/_generated/api";

export function Chat({ viewer }: { viewer: string }) {
  const [newMessageText, setNewMessageText] = useState("");
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewMessageText("");
    sendMessage({ body: newMessageText, author: viewer }).catch((error) => {
      console.error("Failed to send message:", error);
    });
  };

  return (
    <>
      <MessageList messages={messages}>
        {messages?.map((message) => (
          <Message key={message._id} author={message.author} viewer={viewer}>
            {message.body}
          </Message>
        ))}
      </MessageList>
      <div className="border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 p-4">
          <Input
            value={newMessageText}
            onChange={(event) => setNewMessageText(event.target.value)}
            placeholder="Write a message…"
          />
          <Button type="submit" disabled={newMessageText === ""}>
            Send
          </Button>
        </form>
      </div>
    </>
  );
}
