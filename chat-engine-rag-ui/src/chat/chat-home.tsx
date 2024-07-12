import React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import Typography from "../components/ui/typography";
import { cn } from "../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Button } from "../components/ui/button";
import { Plus, Send } from "lucide-react";
import { useState } from "react";

import { Input } from "../components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "../types/types";


function ChatHome() {

      const [conversations, setConversations] = useState<Conversation[]>([
        { id: uuidv4(), title: "Welcome to the chat!", messages: [] },
      ]);

      const [input, setInput] = useState("");
      const inputLength = input.trim().length;
      const [currentConversationId, setCurrentConversationId] = useState<
        string | null
      >(conversations[0]?.id || null);

      const messages =
        conversations.find(
          (conversation) => conversation.id === currentConversationId
        )?.messages || [];

      function newConversation(): void {
        const conversationId = uuidv4();
        setCurrentConversationId(conversationId);
        setConversations([
          { id: conversationId, title: "", messages: [] },
          ...conversations,
        ]);
      }

      async function sendMessage(message: string): Promise<void> {
        const currConversation = conversations.find(
          (conversation) => conversation.id === currentConversationId
        );
        if (currConversation) {
          if (!currConversation.title) currConversation.title = message;
          try {
            const response = await fetch("http://localhost:8080/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message,
                conversationId: currentConversationId,
              }),
            });

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const responseData = await response.text();
            console.log(responseData); // Placeholder for handling response
            const updatedConversations = conversations.map((conversation) => {
              if (conversation.id === currentConversationId) {
                // Found the current conversation, now create a new object with updated messages
                return {
                  ...conversation,
                  messages: [
                    ...(conversation.messages || []),
                    { role: "user", content: message },
                    { role: "agent", content: responseData },
                  ],
                };
              }
              return conversation; // Return unmodified for all other conversations
            });
            setConversations(updatedConversations);
            console.log(conversations);
          } catch (error) {
            console.error("Failed to send message:", error);
          }
        }
      }


  return (
    <div className="grid grid-cols-10 h-full m-2">
      <div className="col-span-2 m-2">
        <Card
          style={{
            width: "100%",
            height: "90%",
            minHeight: "750px",
          }}
          className="m-2"
        >
          <CardHeader className="flex flex-row items-center">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-lg font-bold leading-none">Conversations</p>
              </div>
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="ml-auto rounded-full"
                    onClick={() => newConversation()}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">New message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={10}>New message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="grid gap-4">
            {conversations.map((conversation, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  "bg-muted"
                )}
                onClick={() => setCurrentConversationId(conversation.id)}
              >
                {conversation.title}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-8 m-2">
        <Card
          style={{
            height: "90%",
            minHeight: "750px",
            width: "98%",
          }}
          className="m-2"
        >
          <CardContent className="grid gap-4">
            <Typography element="h3" as="h3">
              Messages
            </Typography>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted",
                  "w-full"
                )}
              >
                {message.content}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (inputLength === 0) return;
                sendMessage(input);
                setInput("");
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                id="message"
                placeholder="Type your message..."
                className="flex-1"
                autoComplete="off"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <Button type="submit" size="icon" disabled={inputLength === 0}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ChatHome
