"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

/**
 * Groups consecutive tool call lines into a compact summary.
 * "[Calling unsubscribe...]" x5 becomes one collapsed block instead of five.
 */
function parseContent(content: string) {
  const lines = content.split("\n");
  const segments: Array<
    | { type: "text"; value: string }
    | { type: "tools"; calls: { name: string; count: number }[] }
  > = [];

  let i = 0;
  while (i < lines.length) {
    const match = lines[i].match(/^\[Calling (.+)\.\.\.\]$/);
    if (match) {
      // Collect consecutive tool calls
      const calls: Record<string, number> = {};
      while (i < lines.length) {
        const m = lines[i].match(/^\[Calling (.+)\.\.\.\]$/);
        if (m) {
          calls[m[1]] = (calls[m[1]] || 0) + 1;
          i++;
        } else if (lines[i].trim() === "") {
          // skip blank lines between tool calls
          i++;
        } else {
          break;
        }
      }
      segments.push({
        type: "tools",
        calls: Object.entries(calls).map(([name, count]) => ({ name, count })),
      });
    } else {
      // Collect consecutive text lines
      const textLines: string[] = [];
      while (i < lines.length && !lines[i].match(/^\[Calling .+\.\.\.\]$/)) {
        textLines.push(lines[i]);
        i++;
      }
      const text = textLines.join("\n").trim();
      if (text) {
        segments.push({ type: "text", value: text });
      }
    }
  }

  return segments;
}

/** Friendly display name for tool functions */
function toolLabel(name: string): string {
  const labels: Record<string, string> = {
    search_emails: "Searching emails",
    read_email: "Reading email",
    send_email: "Sending email",
    mark_email: "Updating email",
    list_folders: "Listing folders",
    delete_email: "Deleting emails",
    move_email: "Moving emails",
    forward_email: "Forwarding email",
    unsubscribe: "Unsubscribing",
  };
  return labels[name] || name.replace(/_/g, " ");
}

/** Icon per tool category */
function toolIcon(name: string): string {
  const icons: Record<string, string> = {
    search_emails: "🔍",
    read_email: "📖",
    send_email: "📤",
    mark_email: "✓",
    list_folders: "📂",
    delete_email: "🗑",
    move_email: "📁",
    forward_email: "↗",
    unsubscribe: "🚫",
  };
  return icons[name] || "⚙";
}
export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const segments = parseContent(content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-gray-50 text-gray-800 rounded-bl-md"
        }`}
      >
        {segments.map((seg, idx) => {
          if (seg.type === "text") {
            return (
              <span key={idx}>
                {seg.value.split("\n").map((line, li) => (
                  <span key={li}>
                    {line}
                    {li < seg.value.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </span>
            );
          }

          // Compact tool calls block
          return (
            <div
              key={idx}
              className={`my-2 rounded-lg overflow-hidden ${
                isUser ? "bg-blue-700/30" : "bg-gray-100"
              }`}
            >
              {seg.calls.map((call, ci) => (
                <div
                  key={ci}
                  className={`flex items-center gap-2 px-2.5 py-1.5 text-xs ${
                    ci > 0
                      ? isUser
                        ? "border-t border-blue-600/20"
                        : "border-t border-gray-200/80"
                      : ""
                  } ${isUser ? "text-blue-100" : "text-gray-500"}`}
                >
                  <span className="text-xs opacity-70">{toolIcon(call.name)}</span>
                  <span className="font-medium">{toolLabel(call.name)}</span>
                  {call.count > 1 && (
                    <span
                      className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                        isUser
                          ? "bg-blue-500/40 text-blue-100"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      ×{call.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

