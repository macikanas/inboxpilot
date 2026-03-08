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

  const cardStyle = {
    background: "var(--bg-surface)",
    border: "1px solid var(--bg-overlay-dark)",
  };

  const inputStyle = {
    background: "var(--bg-overlay-dark)",
    border: "1px solid var(--bg-overlay-light)",
    color: "var(--text-primary)",
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-overflow)" }}>
        <p style={{ color: "var(--text-subtle)" }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-overflow)" }}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{settings.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/app")}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ border: "1px solid var(--bg-overlay-light)", color: "var(--text-muted)" }}
            >
              {"\u2190"} Back to Chat
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ color: "var(--accent-red)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Email Accounts */}
        <div className="rounded-xl p-6 mb-6" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Email Accounts</h2>

          {settings.emailAccounts.length > 0 ? (
            <div className="space-y-3 mb-4">
              {settings.emailAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-lg p-3"
                  style={{ border: "1px solid var(--bg-overlay-dark)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{account.email}</p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
                      {account.provider.toUpperCase()} {"\u00B7"} {account.imapHost}
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ background: "rgba(20,184,166,0.15)", color: "var(--accent-teal)" }}
                  >
                    Connected
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm mb-4" style={{ color: "var(--text-subtle)" }}>No email accounts connected yet.</p>
          )}

          {showIMAPForm ? (
            <div className="rounded-lg p-4" style={{ border: "1px solid var(--bg-overlay-light)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>Connect IMAP Account</h3>
                <button
                  onClick={() => setShowIMAPForm(false)}
                  className="text-sm" style={{ color: "var(--text-subtle)" }}
                >
                  Cancel
                </button>
              </div>
              <IMAPForm onConnected={() => {
                setShowIMAPForm(false);
                fetch("/api/settings").then((r) => r.json()).then(setSettings);
              }} />
            </div>
          ) : (
            <button
              onClick={() => setShowIMAPForm(true)}
              className="px-4 py-2 text-sm text-white rounded-lg transition-colors"
              style={{ background: "var(--accent-purple)" }}
            >
              + Connect Email Account
            </button>
          )}
        </div>

        {/* AI Provider */}
        <div className="rounded-xl p-6 mb-6" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>AI Provider</h2>

          <div className="space-y-3 mb-4">
            {[
              { value: "claude", label: "Claude (Anthropic)", desc: "Best for nuanced email understanding" },
              { value: "openai", label: "GPT-4o (OpenAI)", desc: "Fast and capable" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors"
                style={{
                  border: `1px solid ${provider === opt.value ? "var(--accent-purple)" : "var(--bg-overlay-dark)"}`,
                  background: provider === opt.value ? "rgba(124,92,252,0.08)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="provider"
                  value={opt.value}
                  checked={provider === opt.value}
                  onChange={() => { setProvider(opt.value); setModel(""); }}
                  className="w-4 h-4 accent-purple-500"
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{opt.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Model (optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
              style={inputStyle}
              placeholder={provider === "claude" ? "claude-sonnet-4-20250514" : "gpt-4o"}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>Leave blank for default model</p>
          </div>

          <button
            onClick={saveAISettings}
            disabled={saving}
            className="px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-40"
            style={{ background: "var(--accent-purple)" }}
          >
            {saving ? "Saving..." : saved ? "\u2713 Saved" : "Save AI Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
