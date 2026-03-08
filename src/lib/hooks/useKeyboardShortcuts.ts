"use client";

import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      // Build key string
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push("mod");
      if (e.shiftKey) parts.push("shift");
      parts.push(e.key.toLowerCase());
      const combo = parts.join("+");

      // Also try just the key
      const simpleKey = e.key.toLowerCase();

      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      } else if (!e.metaKey && !e.ctrlKey && !e.shiftKey && shortcuts[simpleKey]) {
        e.preventDefault();
        shortcuts[simpleKey]();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
