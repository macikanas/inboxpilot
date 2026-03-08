"use client";

import { useState, useEffect } from "react";

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
  messages: { content: string; role: string }[];
}

interface SidebarProps {
  activeId?: string | null;
  onSelect: (id: string | null) => void;
  refreshTrigger?: number;
}

export default function Sidebar({ activeId, onSelect, refreshTrigger }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <div
      className="w-72 flex flex-col h-full border-r"
      style={{ background: "var(--bg-base)", borderColor: "var(--bg-overlay-dark)" }}
    >
      {/* Header */}
      <div className="p-4" style={{ borderBottom: "1px solid var(--bg-overlay-dark)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{"\u2709\uFE0F"}</span>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>InboxPilot</h1>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="w-full px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors"
          style={{ background: "var(--accent-purple)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-purple-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-purple)")}
        >
          + New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm" style={{ color: "var(--text-subtle)" }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm" style={{ color: "var(--text-subtle)" }}>No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className="w-full text-left px-4 py-3 transition-colors"
              style={{
                background: activeId === conv.id ? "var(--bg-surface)" : "transparent",
                borderLeft: activeId === conv.id ? "2px solid var(--accent-purple)" : "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (activeId !== conv.id) e.currentTarget.style.background = "var(--bg-surface)";
              }}
              onMouseLeave={(e) => {
                if (activeId !== conv.id) e.currentTarget.style.background = "transparent";
              }}
            >
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {conv.title || "New conversation"}
              </p>
              {conv.messages[0] && (
                <p className="text-xs truncate mt-1" style={{ color: "var(--text-muted)" }}>
                  {conv.messages[0].content.substring(0, 60)}
                </p>
              )}
              <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: "1px solid var(--bg-overlay-dark)" }}>
        <a
          href="/settings"
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>{"\u2699\uFE0F"}</span>
          Settings
        </a>
      </div>
    </div>
  );
}
