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
    <div className="w-72 bg-gray-50 border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✉️</span>
          <h1 className="text-lg font-bold text-gray-800">InboxPilot</h1>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Chat
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-gray-400">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm text-gray-400">No conversations yet</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-100 transition-colors ${
                activeId === conv.id ? "bg-blue-50 border-l-2 border-l-blue-600" : ""
              }`}
            >
              <p className="text-sm font-medium text-gray-800 truncate">
                {conv.title || "New conversation"}
              </p>
              {conv.messages[0] && (
                <p className="text-xs text-gray-400 truncate mt-1">
                  {conv.messages[0].content.substring(0, 60)}
                </p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t">
        <a
          href="/settings"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>⚙️</span>
          Settings
        </a>
      </div>
    </div>
  );
}
