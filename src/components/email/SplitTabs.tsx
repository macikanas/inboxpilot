"use client";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface SplitTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function SplitTabs({ tabs, activeTab, onTabChange }: SplitTabsProps) {
  return (
    <div
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto"
      style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--bg-overlay-dark)" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-md"
            style={{
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              background: isActive ? "var(--bg-surface)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = "var(--bg-surface)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = "transparent";
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-medium"
                style={{
                  background: isActive ? "var(--accent-purple)" : "var(--bg-overlay-light)",
                  color: isActive ? "#fff" : "var(--text-muted)",
                }}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <div
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: "var(--accent-purple)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
