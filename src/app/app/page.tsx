"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/chat/Sidebar";
import EmailPanel from "@/components/chat/EmailPanel";
import CommandPalette from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";

export default function AppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleConversationCreated = useCallback((id: string) => {
    setActiveConversationId(id);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleSelectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  const commandActions = useMemo(() => [
    {
      id: "new-chat",
      label: "New Chat",
      shortcut: "C",
      icon: "\u270F\uFE0F",
      action: () => setActiveConversationId(null),
    },
    {
      id: "settings",
      label: "Settings",
      shortcut: "",
      icon: "\u2699\uFE0F",
      action: () => router.push("/settings"),
    },
    {
      id: "search",
      label: "Search emails",
      shortcut: "/",
      icon: "\uD83D\uDD0D",
      action: () => setActiveConversationId(null),
    },
  ], [router]);

  const shortcuts = useMemo(() => ({
    "mod+k": () => setCommandPaletteOpen(true),
    "c": () => setActiveConversationId(null),
  }), []);

  useKeyboardShortcuts(shortcuts);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="text-center">
          <span className="text-4xl">{"\u2709\uFE0F"}</span>
          <p className="mt-3" style={{ color: "var(--text-subtle)" }}>Loading InboxPilot...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen flex" style={{ background: "var(--bg-overflow)" }}>
      <Sidebar
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        refreshTrigger={refreshTrigger}
      />
      <main className="flex-1 flex flex-col" style={{ background: "var(--bg-base)" }}>
        <ChatInterface
          key={activeConversationId || "new"}
          conversationId={activeConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </main>

      {/* Email Inbox Panel */}
      <div
        className="w-[480px] shrink-0 flex flex-col"
        style={{ borderLeft: "1px solid var(--bg-overlay-dark)" }}
      >
        <EmailPanel />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        actions={commandActions}
      />
    </div>
  );
}
