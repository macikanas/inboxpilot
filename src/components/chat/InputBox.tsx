"use client";

import { useState, useRef, useEffect } from "react";

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function InputBox({ onSend, disabled }: InputBoxProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 py-3" style={{ background: "var(--bg-base)", borderTop: "1px solid var(--bg-overlay-dark)" }}>
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your emails..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
          style={{
            background: "var(--bg-overlay-dark)",
            border: "1px solid var(--bg-overlay-light)",
            color: "var(--text-primary)",
            focusRingColor: "var(--accent-purple)",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          className="px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "var(--accent-purple)" }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.disabled) e.currentTarget.style.background = "var(--accent-purple-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-purple)";
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
