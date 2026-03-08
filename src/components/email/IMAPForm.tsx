"use client";

import { useState } from "react";

interface IMAPFormProps {
  onConnected: () => void;
}

export default function IMAPForm({ onConnected }: IMAPFormProps) {
  const [form, setForm] = useState({
    email: "",
    imapHost: "",
    imapPort: "993",
    smtpHost: "",
    smtpPort: "465",
    username: "",
    password: "",
    displayName: "",
    sentFolderName: "Sent Messages",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/email/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imapPort: parseInt(form.imapPort),
          smtpPort: parseInt(form.smtpPort),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Connection failed");
      }

      setSuccess(true);
      setTimeout(() => onConnected(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImapHostChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      imapHost: value,
      smtpHost: prev.smtpHost || value,
    }));
  };

  const inputStyle = {
    background: "var(--bg-overlay-dark)",
    border: "1px solid var(--bg-overlay-light)",
    color: "var(--text-primary)",
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">{"\u2705"}</div>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Connected!</h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Your email account is ready to use.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm px-4 py-3 rounded-lg" style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-red)" }}>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Email Address</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={inputStyle}
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Display Name (optional)</label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={inputStyle}
          placeholder="John Doe"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>IMAP Host</label>
          <input
            type="text"
            value={form.imapHost}
            onChange={(e) => handleImapHostChange(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
            placeholder="mail.company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Port</label>
          <input
            type="number"
            value={form.imapPort}
            onChange={(e) => setForm({ ...form, imapPort: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>SMTP Host</label>
          <input
            type="text"
            value={form.smtpHost}
            onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
            placeholder="mail.company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Port</label>
          <input
            type="number"
            value={form.smtpPort}
            onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Username</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={inputStyle}
          placeholder="you@company.com or username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Sent Folder Name</label>
        <input
          type="text"
          value={form.sentFolderName}
          onChange={(e) => setForm({ ...form, sentFolderName: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
          style={inputStyle}
          placeholder="Sent Messages, Sent, INBOX.Sent"
        />
        <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
          Varies by mail server: &quot;Sent Messages&quot;, &quot;Sent&quot;, &quot;INBOX.Sent&quot;
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
        style={{ background: "var(--accent-purple)" }}
      >
        {loading ? "Testing connection..." : "Connect Email Account"}
      </button>
    </form>
  );
}
