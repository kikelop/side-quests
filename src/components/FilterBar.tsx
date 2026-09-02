"use client";

import { CATEGORY_LABEL } from "@/lib/quests";
import { CATEGORY_THEME } from "@/lib/theme";
import { CATEGORIES, type Category } from "@/lib/types";
import { countActiveFilters, type Filters } from "@/lib/filters";

export default function FilterBar({
  filters,
  onChange,
  onOpenMore,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onOpenMore: () => void;
}) {
  const toggleCategory = (c: Category) => {
    const categories = filters.categories.includes(c)
      ? filters.categories.filter((x) => x !== c)
      : [...filters.categories, c];
    onChange({ ...filters, categories });
  };
  const more = countActiveFilters(filters) - (filters.scale !== "any" ? 1 : 0) - filters.categories.length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-full bg-surface px-4 shadow-[0_1px_0_rgba(21,23,28,0.05)]">
          <SearchIcon />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder="Search quests"
            className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-3"
          />
        </label>
        <button
          onClick={onOpenMore}
          className={`flex h-11 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-colors ${
            more > 0 ? "bg-ink text-white" : "bg-surface text-ink shadow-[0_1px_0_rgba(21,23,28,0.05)]"
          }`}
        >
          <SlidersIcon />
          {more > 0 ? more : "Filters"}
        </button>
      </div>

      <div className="rail -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((c) => {
          const active = filters.categories.includes(c);
          const t = CATEGORY_THEME[c];
          return (
            <button
              key={c}
              onClick={() => toggleCategory(c)}
              aria-pressed={active}
              className="flex shrink-0 items-center gap-2 rounded-full py-2 pl-2.5 pr-3.5 text-[13px] font-medium transition-colors"
              style={
                active
                  ? { background: t.bg, color: t.fg }
                  : { background: "var(--surface)", color: "var(--ink)", boxShadow: "0 1px 0 rgba(21,23,28,0.05)" }
              }
            >
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: active ? t.fg : t.bg }} />
              {CATEGORY_LABEL[c]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-ink-3" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}
