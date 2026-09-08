"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EmptyState from "./EmptyState";
import FilterBar from "./FilterBar";
import FilterSheet from "./FilterSheet";
import QuestRow from "./QuestRow";
import { todayISO } from "@/lib/dates";
import { buzz, toast } from "@/lib/feedback";
import { applyFilters, DEFAULT_FILTERS, type Filters, type Status } from "@/lib/filters";
import { QUESTS } from "@/lib/quests";
import { useQuests } from "@/lib/QuestsProvider";

const STATUS_TABS: { value: Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "done", label: "Done" },
];

export default function ExploreView() {
  const params = useSearchParams();
  const { state, hydrated, dispatch } = useQuests();
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    status: (params.get("status") as Status | null) ?? "all",
  }));
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(() => applyFilters(QUESTS, state, filters), [state, filters]);
  const doneDates = useMemo(() => new Map(state.done.map((d) => [d.id, d.date])), [state.done]);

  return (
    <main className="px-5 pt-6">
      <header className="mb-4">
        <h1 className="font-display text-[24px] font-semibold leading-none">Explore</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          {results.length} of {QUESTS.length} quests
        </p>
      </header>

      <FilterBar filters={filters} onChange={setFilters} onOpenMore={() => setSheetOpen(true)} />

      <div role="tablist" className="mt-3 flex gap-1 border-b border-line">
        {STATUS_TABS.map((t) => {
          const active = filters.status === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() => setFilters({ ...filters, status: t.value })}
              className={`-mb-px border-b-2 px-3 py-2.5 text-[14px] font-medium transition-colors ${
                active ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {!hydrated ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-[20px] bg-ink/6" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nothing matches"
            body="Try fewer filters, or a different word."
            action={{ label: "Clear filters", onClick: () => setFilters({ ...DEFAULT_FILTERS, status: filters.status }) }}
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {results.map((q) => (
            <QuestRow
              key={q.id}
              quest={q}
              saved={state.saved.includes(q.id)}
              active={state.active.some((a) => a.id === q.id)}
              doneDate={doneDates.get(q.id)}
              onToggleSaved={() => {
                buzz();
                toast(state.saved.includes(q.id) ? "Removed from your list" : "Added to your list");
                dispatch({ type: "toggleSaved", id: q.id, date: todayISO() });
              }}
              onDone={() => {
                buzz(16);
                toast("Done. Nice one.");
                dispatch({ type: "markDone", id: q.id, date: todayISO() });
              }}
              onUndo={() => dispatch({ type: "undoDone", id: q.id })}
            />
          ))}
        </ul>
      )}

      {sheetOpen && <FilterSheet filters={filters} onChange={setFilters} onClose={() => setSheetOpen(false)} />}
    </main>
  );
}
