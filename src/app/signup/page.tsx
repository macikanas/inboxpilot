"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Signup failed");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/signin");
      } else {
        router.push("/app");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-overlay-dark)",
    border: "1px solid var(--bg-overlay-light)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-overflow)" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8" style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-overlay-dark)" }}>
          <div className="text-center mb-8">
            <span className="text-4xl">{"\u2709\uFE0F"}</span>
            <h1 className="text-2xl font-bold mt-3" style={{ color: "var(--text-primary)" }}>Create your account</h1>
            <p className="mt-1" style={{ color: "var(--text-muted)" }}>Get started with InboxPilot</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm px-4 py-3 rounded-lg" style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-red)" }}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>First name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Last name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={inputStyle}
                placeholder="Min 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
              style={{ background: "var(--accent-purple)" }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <a href="/signin" className="font-medium hover:underline" style={{ color: "var(--accent-purple)" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
