"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuests } from "@/lib/QuestsProvider";

const TABS = [
  { href: "/", label: "Today", icon: DiceIcon },
  { href: "/explore", label: "Explore", icon: GridIcon },
  { href: "/list", label: "My quests", icon: BookmarkIcon },
] as const;

export default function TabBar() {
  const pathname = usePathname();
  const { state, hydrated } = useQuests();
  const savedCount = hydrated ? state.saved.length : 0;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4"
      style={{ paddingBottom: "max(var(--safe-b), 12px)" }}
    >
      <div
        className="flex w-full max-w-[420px] items-stretch rounded-full border border-line bg-surface/90 p-1.5 shadow-[0_8px_30px_rgba(21,23,28,0.10)] backdrop-blur-xl"
        style={{ height: "var(--tabbar-h)" }}
      >
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium transition-colors ${
                active ? "bg-ink text-white" : "text-ink-2 hover:text-ink"
              }`}
            >
              <Icon />
              <span>{label}</span>
              {href === "/list" && savedCount > 0 && !active && (
                <span className="absolute right-[22%] top-2 min-w-4 rounded-full bg-ink px-1 text-center text-[10px] font-semibold leading-4 text-white">
                  {savedCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DiceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-4.1-6.5 4.1V5.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
