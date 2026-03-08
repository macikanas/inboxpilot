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
      <div className="flex-1 flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{"\u2709\uFE0F"}</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome to InboxPilot
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Your AI email assistant. Ask me to search, read, or manage your emails.
          </p>
          <div className="flex flex-col gap-2 text-sm">
            {["Show my unread emails", "Search for emails from Amazon", "Summarize my recent emails about the project"].map((hint, i) => (
              <p
                key={i}
                className="px-3 py-2 rounded-lg"
                style={{ background: "var(--bg-overlay-dark)", color: "var(--text-muted)" }}
              >
                Try: &quot;{hint}&quot;
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6" style={{ background: "var(--bg-base)" }}>
      {messages.map((msg, i) => (
        <MessageBubble key={msg.id || i} role={msg.role} content={msg.content} />
      ))}
      {isStreaming && (
        <div className="flex justify-start mb-4">
          <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "var(--bg-surface)" }}>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-purple)", animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-purple)", animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-purple)", animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
