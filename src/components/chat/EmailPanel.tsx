"use client";

import { useState, useEffect } from "react";

interface Email {
  uid: number;
  subject: string;
  from: string;
  to: string;
  date: string;
  flags: string[];
  isRead: boolean;
}

interface EmailPanelProps {
  onEmailAction?: (action: string) => void;
}

function formatFrom(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim().replace(/^"|"$/g, "") : from.split("@")[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 24) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (hours < 168) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitialColor(name: string): string {
  const colors = [
    "#3B82F6", "#10B981", "#7C5CFC", "#F59E0B",
    "#EC4899", "#06B6D4", "#6366F1", "#14B8A6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitial(from: string): string {
  const name = formatFrom(from);
  return name.charAt(0).toUpperCase();
}

export default function EmailPanel({ onEmailAction }: EmailPanelProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUid, setSelectedUid] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/email/inbox?limit=30")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmails(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshInbox = () => {
    setLoading(true);
    fetch("/api/email/inbox?limit=30")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmails(data);
      })
      .finally(() => setLoading(false));
  };

  if (error) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-3 opacity-40">{"\uD83D\uDCE7"}</div>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Connect your email in Settings to see your inbox here
          </p>
          <a
            href="/settings"
            className="text-sm font-medium"
            style={{ color: "var(--accent-purple)" }}
          >
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--bg-overlay-dark)" }}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Inbox
          </h2>
          {emails.filter((e) => !e.isRead).length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-overlay-dark)",
              }}
            >
              {emails.filter((e) => !e.isRead).length} unread
            </span>
          )}
        </div>
        <button
          onClick={refreshInbox}
          disabled={loading}
          className="p-1.5 rounded-md transition-colors disabled:opacity-40"
          style={{ color: "var(--text-muted)" }}
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {loading && emails.length === 0 ? (
          <div className="p-8 text-center">
            <div
              className="inline-block w-5 h-5 border-2 rounded-full animate-spin mb-3"
              style={{ borderColor: "var(--bg-overlay-light)", borderTopColor: "var(--accent-purple)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading emails...
            </p>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2 opacity-40">{"\uD83D\uDCE7"}</div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No emails found
            </p>
          </div>
        ) : (
          emails.map((email) => (
            <button
              key={email.uid}
              onClick={() => setSelectedUid(selectedUid === email.uid ? null : email.uid)}
              className="w-full text-left px-5 py-3 transition-colors"
              style={{
                borderBottom: "1px solid var(--bg-overlay-dark)",
                background:
                  selectedUid === email.uid
                    ? "var(--bg-surface)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (selectedUid !== email.uid)
                  e.currentTarget.style.background = "var(--bg-overlay-dark)";
              }}
              onMouseLeave={(e) => {
                if (selectedUid !== email.uid)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                  style={{ background: getInitialColor(formatFrom(email.from)) }}
                >
                  {getInitial(email.from)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate ${
                        !email.isRead ? "font-semibold" : "font-medium"
                      }`}
                      style={{
                        color: !email.isRead
                          ? "var(--text-primary)"
                          : "var(--text-tertiary)",
                      }}
                    >
                      {formatFrom(email.from)}
                    </span>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatDate(email.date)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate mt-0.5`}
                    style={{
                      color: !email.isRead
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {email.subject || "(no subject)"}
                  </p>
                </div>

                {/* Unread dot */}
                {!email.isRead && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-2"
                    style={{ background: "var(--accent-blue)" }}
                  />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
