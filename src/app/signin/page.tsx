"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-overflow)" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8" style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-overlay-dark)" }}>
          <div className="text-center mb-8">
            <span className="text-4xl">{"\u2709\uFE0F"}</span>
            <h1 className="text-2xl font-bold mt-3" style={{ color: "var(--text-primary)" }}>Sign in to InboxPilot</h1>
            <p className="mt-1" style={{ color: "var(--text-muted)" }}>Your AI email assistant</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm px-4 py-3 rounded-lg" style={{ background: "rgba(239,68,68,0.15)", color: "var(--accent-red)" }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-overlay-dark)",
                  border: "1px solid var(--bg-overlay-light)",
                  color: "var(--text-primary)",
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-tertiary)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "var(--bg-overlay-dark)",
                  border: "1px solid var(--bg-overlay-light)",
                  color: "var(--text-primary)",
                }}
                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
              style={{ background: "var(--accent-purple)" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-medium hover:underline" style={{ color: "var(--accent-purple)" }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
