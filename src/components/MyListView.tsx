"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EmptyState from "./EmptyState";
import QuestRow from "./QuestRow";
import { todayISO } from "@/lib/dates";
import { buzz, toast } from "@/lib/feedback";
import { QUEST_BY_ID } from "@/lib/quests";
import { useQuests } from "@/lib/QuestsProvider";

type Tab = "saved" | "done";

export default function MyListView() {
  const { state, hydrated, dispatch } = useQuests();
  const [tab, setTab] = useState<Tab>("saved");

  const saved = useMemo(
    () => state.saved.map((id) => QUEST_BY_ID.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q)),
    [state.saved],
  );
  const done = useMemo(
    () =>
      [...state.done]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((d) => ({ quest: QUEST_BY_ID.get(d.id), date: d.date }))
        .filter((x): x is { quest: NonNullable<typeof x.quest>; date: string } => Boolean(x.quest)),
    [state.done],
  );

  return (
    <main className="px-5 pt-6">
      <header className="mb-4">
        <h1 className="font-display text-[28px] font-semibold leading-none">My list</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-2">
          {state.saved.length} saved · {state.done.length} done
        </p>
      </header>

      <div role="tablist" className="inline-flex rounded-full bg-ink/6 p-1">
        {(["saved", "done"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              tab === t ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {!hydrated ? null : tab === "saved" ? (
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
                onDone={() => {
                  buzz(16);
                  toast("Done. Nice one.");
                  dispatch({ type: "markDone", id: q.id, date: todayISO() });
                }}
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
