"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-50 text-gray-800 rounded-bl-md"
        }`}
      >
        {content.split("\n").map((line, i) => {
          if (line.match(/^\[Calling .+\.\.\.\]$/)) {
            return (
              <div
                key={i}
                className={`text-xs my-1 px-2 py-0.5 rounded font-mono ${
                  isUser ? "bg-blue-700/40 text-blue-100" : "bg-gray-200/80 text-gray-400"
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
