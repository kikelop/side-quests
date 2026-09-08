"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "./EmptyState";
import QuestRow from "./QuestRow";
import { todayISO } from "@/lib/dates";
import { buzz, toast } from "@/lib/feedback";
import { QUEST_BY_ID } from "@/lib/quests";
import { useQuests } from "@/lib/QuestsProvider";
import type { Quest } from "@/lib/types";

type Tab = "active" | "saved" | "done";
const TABS: { value: Tab; label: string }[] = [
  { value: "active", label: "In progress" },
  { value: "saved", label: "Saved" },
  { value: "done", label: "Done" },
];

const resolve = (ids: string[]) => ids.map((id) => QUEST_BY_ID.get(id)).filter((q): q is Quest => Boolean(q));

export default function MyListView() {
  const { state, hydrated, dispatch } = useQuests();
  const [tab, setTab] = useState<Tab>(() => "active");

  const active = useMemo(() => resolve(state.active.map((a) => a.id)), [state.active]);
  const saved = useMemo(() => resolve(state.saved), [state.saved]);
  const done = useMemo(
    () =>
      [...state.done]
        .sort((a, b) => b.date.localeCompare(a.date))
        .flatMap((d) => (QUEST_BY_ID.has(d.id) ? [{ quest: QUEST_BY_ID.get(d.id)!, date: d.date }] : [])),
    [state.done],
  );

  const markDone = (id: string) => {
    buzz(16);
    toast("Done. Nice one.");
    dispatch({ type: "markDone", id, date: todayISO() });
  };

  return (
    <main className="px-5 pt-6">
      <header className="mb-4">
        <h1 className="font-display text-[24px] font-semibold leading-none">My list</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          {state.active.length} in progress · {state.saved.length} saved · {state.done.length} done
        </p>
      </header>

      <div role="tablist" className="inline-flex rounded-full bg-ink/6 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              tab === t.value ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hydrated ? null : tab === "active" ? (
        active.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nothing in progress" body="Swipe right on a quest, or tap I'm in, and it lands here until you finish it." />
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {active.map((q) => (
              <QuestRow
                key={q.id}
                quest={q}
                saved={false}
                active
                onToggleSaved={() => {
                  toast("Back in the pile");
                  dispatch({ type: "unaccept", id: q.id });
                }}
                onDone={() => markDone(q.id)}
                onUndo={() => {}}
              />
            ))}
          </ul>
        )
      ) : tab === "saved" ? (
        saved.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Nothing saved yet" body="Save a quest from Today or Explore and it will wait for you here." />
            <p className="mt-4 text-center text-[14px]">
              <Link href="/explore" className="font-medium text-ink underline underline-offset-4">
                Browse all quests
              </Link>
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {saved.map((q) => (
              <QuestRow
                key={q.id}
                quest={q}
                saved
                onToggleSaved={() => {
                  toast("Removed from your list");
                  dispatch({ type: "removeSaved", id: q.id });
                }}
                onDone={() => markDone(q.id)}
                onUndo={() => {}}
              />
            ))}
          </ul>
        )
      ) : done.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Nothing done yet" body="The first one is the hardest. Pick something small from Today." />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {done.map(({ quest, date }) => (
            <QuestRow
              key={quest.id}
              quest={quest}
              saved={false}
              doneDate={date}
              onToggleSaved={() => {}}
              onDone={() => {}}
              onUndo={() => dispatch({ type: "undoDone", id: quest.id })}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
