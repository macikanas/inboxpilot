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

  if (hours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (hours < 168) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitialColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500",
    "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
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
        if (Array.isArray(data)) {
          setEmails(data);
        } else if (data.error) {
          setError(data.error);
        }
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
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <div className="text-4xl mb-3 opacity-40">ð­</div>
          <p className="text-sm text-gray-500 mb-4">Connect your email in Settings to see your inbox here</p>
          <a
            href="/settings"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Inbox</h2>
          {!loading && (
            <span className="text-xs text-gray-400 font-medium">
              {emails.filter((e) => !e.isRead).length} unread
            </span>
          )}
        </div>
        <button
          onClick={refreshInbox}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {loading && emails.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl mb-2 opacity-40">ð­</div>
            <p className="text-sm text-gray-400">No emails found</p>
          </div>
        ) : (
          emails.map((email) => (
            <button
              key={email.uid}
              onClick={() => setSelectedUid(selectedUid === email.uid ? null : email.uid)}
              className={`w-full text-left px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                selectedUid === email.uid ? "bg-blue-50" : ""
              } ${!email.isRead ? "" : "opacity-70"}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5 ${getInitialColor(
                    email.from
                  )}`}
                >
                  {getInitial(email.from)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate ${
                        !email.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-600"
                      }`}
                    >
                      {formatFrom(email.from)}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDate(email.date)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate mt-0.5 ${
                      !email.isRead ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {email.subject || "(no subject)"}
                  </p>
                </div>

                {/* Unread dot */}
                {!email.isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
