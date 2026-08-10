"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operate",
    items: [
      { href: "/", label: "Dashboard", icon: "▦" },
      { href: "/verticals", label: "Verticals", icon: "◎" },
      { href: "/intelligence", label: "Intelligence", icon: "✨" },
    ],
  },
  {
    label: "Work",
    items: [
      { href: "/leads", label: "Leads", icon: "☺" },
      { href: "/pipeline", label: "Pipeline", icon: "☷" },
      { href: "/knowledge", label: "Knowledge", icon: "\u{1F9E0}" },
      { href: "/escalations", label: "Escalations", icon: "🚩" },
    ],
  },
  {
    label: "Measure",
    items: [{ href: "/analytics", label: "Analytics", icon: "\u{1F4C8}" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-sidebar flex-col justify-between border-r border-border bg-neutral px-md py-lg">
      <div>
        <div className="mb-xl flex items-center gap-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-neutral">
            BSC
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-primary leading-none">
              Bharat Sales Copilot
            </div>
            <div className="font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
              B2B Sales OS
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-lg">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-xs font-label-caps text-label-caps tracking-label-caps uppercase text-secondary">
                {group.label}
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-sm rounded-md px-sm py-xs font-body-md text-body-md transition-colors ${
                        active
                          ? "border-l-4 border-primary bg-[#EFE8D8] font-semibold text-primary"
                          : "border-l-4 border-transparent text-primary/80 hover:bg-[#EFE8D8]/60"
                      }`}
                    >
                      <span aria-hidden>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-sm">
        <Link
          href="/verticals?new=1"
          className="rounded-full bg-primary px-md py-sm text-center font-label-caps text-label-caps uppercase text-neutral"
        >
          + Build a vertical
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-sm px-sm py-xs font-body-sm text-body-sm ${
            pathname === "/settings" ? "font-semibold text-primary" : "text-secondary"
          }`}
        >
          <span aria-hidden>{"⚙"}</span> Settings
        </Link>
      </div>
    </aside>
  );
}
