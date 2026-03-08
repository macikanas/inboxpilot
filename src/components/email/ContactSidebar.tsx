"use client";

interface ContactSidebarProps {
  email?: string;
  name?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ["#7C5CFC", "#3B82F6", "#14B8A6", "#EC4899", "#F59E0B", "#EF4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ContactSidebar({ email, name }: ContactSidebarProps) {
  if (!email) {
    return (
      <div
        className="w-[280px] flex flex-col items-center justify-center border-l"
        style={{ background: "var(--bg-base)", borderColor: "var(--bg-overlay-dark)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-subtle)" }}>
          Select an email to see contact info
        </p>
      </div>
    );
  }

  const displayName = name || email.split("@")[0];
  const domain = email.split("@")[1];

  return (
    <div
      className="w-[280px] flex flex-col border-l overflow-y-auto"
      style={{ background: "var(--bg-base)", borderColor: "var(--bg-overlay-dark)" }}
    >
      <div className="p-6 flex flex-col items-center">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3"
          style={{ background: getAvatarColor(displayName) }}
        >
          {getInitials(displayName)}
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          {displayName}
        </h3>

        {/* Email */}
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          {email}
        </p>

        {/* Domain */}
        {domain && (
          <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
            {domain}
          </p>
        )}
      </div>

      {/* Links section */}
      <div className="px-4 pb-4">
        <div className="space-y-1">
          {[
            { icon: "\u2709", label: "Mail", href: `mailto:${email}` },
            { icon: "\uD83C\uDF10", label: domain, href: `https://${domain}` },
          ].map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
