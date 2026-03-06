"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export default function MessageList({ messages, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome to InboxPilot
          </h2>
          <p className="text-gray-500 mb-6">
            Your AI email assistant. Ask me to search, read, or manage your emails.
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <p>Try: &quot;Show my unread emails&quot;</p>
            <p>Try: &quot;Search for emails from Amazon&quot;</p>
            <p>Try: &quot;Summarize my recent emails about the project&quot;</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.map((msg, i) => (
        <MessageBubble key={msg.id || i} role={msg.role} content={msg.content} />
      ))}
      {isStreaming && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
