import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✉️</span>
          <span className="text-xl font-bold text-gray-900">InboxPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="text-sm text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center pt-24 pb-16 px-8">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Manage your email
          <br />
          <span className="text-blue-600">through conversation</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Connect your email account and let AI help you search, read, summarize,
          and respond to emails — all through natural chat.
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3.5 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Start Free →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-8 py-16">
        <div className="text-center">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Search</h3>
          <p className="text-gray-500 text-sm">
            Ask in plain language — &quot;find emails from my supplier about pricing last month&quot;
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">🌍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Multi-Language</h3>
          <p className="text-gray-500 text-sm">
            Read and respond in any language. AI detects and matches the conversation language automatically.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose Your AI</h3>
          <p className="text-gray-500 text-sm">
            Works with both Claude (Anthropic) and GPT-4o (OpenAI). Switch anytime in settings.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">📧</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Any Email Provider</h3>
          <p className="text-gray-500 text-sm">
            Connect via IMAP — works with any email provider, corporate servers, or custom domains.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure by Design</h3>
          <p className="text-gray-500 text-sm">
            Credentials encrypted with AES-256. AI always shows drafts before sending — you stay in control.
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-Time Streaming</h3>
          <p className="text-gray-500 text-sm">
            Responses stream in real-time. See AI thinking and acting on your emails as it works.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to pilot your inbox?</h2>
        <p className="text-gray-500 mb-8">Free to start. Connect your email in 30 seconds.</p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        <p>InboxPilot — Built with Next.js, Claude &amp; GPT-4o</p>
      </footer>
    </div>
  );
}
