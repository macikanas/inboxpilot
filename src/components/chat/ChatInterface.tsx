"use client";

import { useState, useCallback } from "react";
import MessageList from "./MessageList";
import InputBox from "./InputBox";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  conversationId?: string | null;
  initialMessages?: Message[];
  onConversationCreated?: (id: string) => void;
}

export default function ChatInterface({
  conversationId: initialConversationId,
  initialMessages = [],
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: Message = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, conversationId }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Chat request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                assistantContent += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }

              if (data.done && data.conversationId) {
                if (!conversationId) {
                  setConversationId(data.conversationId);
                  onConversationCreated?.(data.conversationId);
                }
              }

              if (data.error) {
                assistantContent += `\nError: ${data.error}`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip malformed SSE data
            }
          }
        }
      } catch (err: any) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Sorry, something went wrong: ${err.message}`,
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, onConversationCreated]
  );

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} isStreaming={isStreaming && !messages[messages.length - 1]?.content} />
      <InputBox onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
