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
        <div className="text-center px-6">
          <p className="text-lg font-medium text-gray-800 mb-1">How can I help you today?</p>
          <p className="text-sm text-gray-400 mb-6">
            Search, read, organize, and manage your emails
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full">Organize my inbox</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full">Find urgent emails</span>
            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full">Plan my day</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map((msg, i) => (
        <MessageBubble key={msg.id || i} role={msg.role} content={msg.content} />
      ))}
      {isStreaming && (
        <div className="flex justify-start mb-3">
          <div className="bg-gray-50 rounded-xl px-3 py-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
