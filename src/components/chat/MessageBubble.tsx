"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

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
      const calls: Record<string, number> = {};
      while (i < lines.length) {
        const m = lines[i].match(/^\[Calling (.+)\.\.\.\]$/);
        if (m) { calls[m[1]] = (calls[m[1]] || 0) + 1; i++; }
        else if (lines[i].trim() === "") { i++; }
        else { break; }
      }
      segments.push({
        type: "tools",
        calls: Object.entries(calls).map(([name, count]) => ({ name, count })),
      });
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !lines[i].match(/^\[Calling .+\.\.\.\]$/)) {
        textLines.push(lines[i]);
        i++;
      }
      const text = textLines.join("\n").trim();
      if (text) segments.push({ type: "text", value: text });
    }
  }
  return segments;
}

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

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const segments = parseContent(content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? "rounded-br-md" : "rounded-bl-md"
        }`}
        style={{
          background: isUser ? "var(--accent-purple)" : "var(--bg-surface)",
          color: isUser ? "#ffffff" : "var(--text-primary)",
        }}
      >
        {segments.map((seg, idx) => {
          if (seg.type === "tools") {
            return (
              <div key={idx} className="flex flex-wrap gap-1.5 my-2">
                {seg.calls.map((call, j) => (
                  <span
                    key={j}
                    className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg font-mono"
                    style={{
                      background: isUser
                        ? "rgba(255,255,255,0.15)"
                        : "var(--bg-overlay-dark)",
                      color: isUser
                        ? "rgba(255,255,255,0.8)"
                        : "var(--text-muted)",
                    }}
                  >
                    <Spinner />
                    <span>{toolLabel(call.name)}</span>
                    {call.count > 1 && (
                      <span
                        className="ml-0.5 px-1 rounded text-xs font-semibold"
                        style={{
                          background: isUser
                            ? "rgba(255,255,255,0.2)"
                            : "var(--bg-overlay-light)",
                          color: isUser ? "#fff" : "var(--text-tertiary)",
                        }}
                      >
                        {"\u00D7"}{call.count}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            );
          }
          return (
            <span key={idx}>
              {seg.value.split("\n").map((line, li, arr) => (
                <span key={li}>
                  {line}
                  {li < arr.length - 1 && <br />}
                </span>
              ))}
            </span>
          );
        })}
      </div>
    </div>
  );
}
