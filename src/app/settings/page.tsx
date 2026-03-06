"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import IMAPForm from "@/components/email/IMAPForm";

interface UserSettings {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  preferredAIProvider: string;
  preferredAIModel: string | null;
  emailAccounts: {
    id: string;
    email: string;
    provider: string;
    displayName: string | null;
    imapHost: string | null;
    isActive: boolean;
  }[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [provider, setProvider] = useState("claude");
  const [model, setModel] = useState("");
  const [showIMAPForm, setShowIMAPForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then((data) => {
        setSettings(data);
        setProvider(data.preferredAIProvider);
        setModel(data.preferredAIModel || "");
      })
      .catch(() => router.push("/signin"));
  }, [router]);

  const saveAISettings = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredAIProvider: provider, preferredAIModel: model || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm mt-1">{settings.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/app")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Chat
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Email Accounts */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Accounts</h2>

          {settings.emailAccounts.length > 0 ? (
            <div className="space-y-3 mb-4">
              {settings.emailAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{account.email}</p>
                    <p className="text-xs text-gray-400">
                      {account.provider.toUpperCase()} · {account.imapHost}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">
                    Connected
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No email accounts connected yet.</p>
          )}

          {showIMAPForm ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Connect IMAP Account</h3>
                <button
                  onClick={() => setShowIMAPForm(false)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
              <IMAPForm onConnected={() => {
                setShowIMAPForm(false);
                // Refresh settings
                fetch("/api/settings").then((r) => r.json()).then(setSettings);
              }} />
            </div>
          ) : (
            <button
              onClick={() => setShowIMAPForm(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Connect Email Account
            </button>
          )}
        </div>

        {/* AI Provider */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Provider</h2>

          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="provider"
                value="claude"
                checked={provider === "claude"}
                onChange={() => { setProvider("claude"); setModel(""); }}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Claude (Anthropic)</p>
                <p className="text-xs text-gray-400">Best for nuanced email understanding</p>
              </div>
            </label>
            <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="provider"
                value="openai"
                checked={provider === "openai"}
                onChange={() => { setProvider("openai"); setModel(""); }}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">GPT-4o (OpenAI)</p>
                <p className="text-xs text-gray-400">Fast and capable</p>
              </div>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Model (optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={provider === "claude" ? "claude-sonnet-4-20250514" : "gpt-4o"}
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank for default model</p>
          </div>

          <button
            onClick={saveAISettings}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save AI Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
