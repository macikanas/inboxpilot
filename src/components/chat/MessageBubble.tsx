"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        {/* Render tool calls with special styling */}
        {content.split("\n").map((line, i) => {
          if (line.match(/^\[Calling .+\.\.\.\]$/)) {
            return (
              <div
                key={i}
                className={`text-xs my-1 px-2 py-1 rounded font-mono ${
                  isUser ? "bg-blue-700/50" : "bg-gray-200 text-gray-500"
                }`}
              >
                {line}
              </div>
            );
          }
          return (
            <span key={i}>
              {line}
              {i < content.split("\n").length - 1 && <br />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
