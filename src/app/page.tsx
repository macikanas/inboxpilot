import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-overflow)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{"\u2709\uFE0F"}</span>
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>InboxPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="text-sm" style={{ color: "var(--text-muted)" }}>
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm text-white rounded-lg transition-colors"
            style={{ background: "var(--accent-purple)" }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-24 pb-16 px-8">
        <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: "var(--text-primary)" }}>
          Manage your email
          <br />
          <span style={{ color: "var(--accent-purple)" }}>through conversation</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--text-muted)" }}>
          Connect your email account and let AI help you search, read, summarize,
          and respond to emails &mdash; all through natural chat.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3.5 text-lg text-white rounded-xl transition-colors font-medium"
          style={{ background: "var(--accent-purple)" }}
        >
          Start Free {"\u2192"}
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-8 py-16">
        {[
          { icon: "\uD83D\uDD0D", title: "Smart Search", desc: "Ask in plain language \u2014 \"find emails from my supplier about pricing last month\"" },
          { icon: "\uD83C\uDF0D", title: "Multi-Language", desc: "Read and respond in any language. AI detects and matches the conversation language automatically." },
          { icon: "\uD83E\uDD16", title: "Choose Your AI", desc: "Works with both Claude (Anthropic) and GPT-4o (OpenAI). Switch anytime in settings." },
          { icon: "\uD83D\uDCE7", title: "Any Email Provider", desc: "Connect via IMAP \u2014 works with any email provider, corporate servers, or custom domains." },
          { icon: "\uD83D\uDD12", title: "Secure by Design", desc: "Credentials encrypted with AES-256. AI always shows drafts before sending \u2014 you stay in control." },
          { icon: "\u26A1", title: "Real-Time Streaming", desc: "Responses stream in real-time. See AI thinking and acting on your emails as it works." },
        ].map((feat, i) => (
          <div
            key={i}
            className="text-center p-6 rounded-xl"
            style={{ background: "var(--bg-surface)" }}
          >
            <div className="text-3xl mb-3">{feat.icon}</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{feat.title}</h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center py-16" style={{ background: "var(--bg-base)" }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>Ready to pilot your inbox?</h2>
        <p className="mb-8" style={{ color: "var(--text-muted)" }}>Free to start. Connect your email in 30 seconds.</p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 text-white rounded-xl transition-colors font-medium"
          style={{ background: "var(--accent-purple)" }}
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm" style={{ color: "var(--text-subtle)" }}>
        <p>InboxPilot &mdash; Built with Next.js, Claude &amp; GPT-4o</p>
      </footer>
    </div>
  );
}
