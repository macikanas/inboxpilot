"use client";

import { useState, useEffect, useRef } from "react";

interface Action {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
}

export default function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      style={{ background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-overlay-dark)", border: "1px solid var(--bg-overlay-light)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ borderBottom: "1px solid var(--bg-overlay-light)" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={{ background: "transparent", color: "var(--text-primary)" }}
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
              No commands found
            </div>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
                style={{
                  background: i === selectedIndex ? "var(--bg-overlay-light)" : "transparent",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--text-muted)" }}>{action.icon}</span>
                  <span>{action.label}</span>
                </div>
                {action.shortcut && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "var(--bg-base)", color: "var(--text-subtle)" }}
                  >
                    {action.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
