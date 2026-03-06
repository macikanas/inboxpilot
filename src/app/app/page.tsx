"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/chat/Sidebar";

export default function AppPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-4xl">✉️</span>
          <p className="text-gray-400 mt-3">Loading InboxPilot...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen flex">
      <Sidebar
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        refreshTrigger={refreshTrigger}
      />
      <main className="flex-1 flex flex-col">
        <ChatInterface
          key={activeConversationId || "new"}
          conversationId={activeConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </main>
    </div>
  );
}
