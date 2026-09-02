"use client";

import type { TodayScale } from "@/lib/types";

const OPTIONS: { value: TodayScale; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "micro", label: "Today" },
  { value: "big", label: "Once in a life" },
];

export default function ScaleToggle({ value, onChange }: { value: TodayScale; onChange: (v: TodayScale) => void }) {
  return (
    <div role="radiogroup" aria-label="Quest scale" className="inline-flex rounded-full bg-ink/6 p-1">
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              active ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
