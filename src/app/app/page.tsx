"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ChatInterface from "@/components/chat/ChatInterface";
import Sidebar from "@/components/chat/Sidebar";
import EmailPanel from "@/components/chat/EmailPanel";

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400 mt-3 text-sm">Loading InboxPilot...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen flex bg-white">
      {/* Left: Sidebar + Chat */}
      <div className="w-[440px] min-w-[380px] flex flex-col border-r border-gray-200">
        <Sidebar
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          refreshTrigger={refreshTrigger}
        />
        <div className="flex-1 flex flex-col min-h-0">
          <ChatInterface
            key={activeConversationId || "new"}
            conversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>

      {/* Right: Email Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <EmailPanel />
      </div>
    </div>
  );
}
