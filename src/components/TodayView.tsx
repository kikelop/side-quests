"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "./EmptyState";
import QuestCard from "./QuestCard";
import ScaleToggle from "./ScaleToggle";
import { computeStreak, todayISO } from "@/lib/dates";
import { buzz, toast } from "@/lib/feedback";
import { QUEST_BY_ID } from "@/lib/quests";
import { useQuests } from "@/lib/QuestsProvider";
import type { TodayScale } from "@/lib/types";

const LEAVE_MS = 220;

export default function TodayView() {
  const { state, hydrated, dispatch } = useQuests();
  const [leaving, setLeaving] = useState(false);
  const today = todayISO();

  // Make sure today's card exists once we know what the user already has.
  useEffect(() => {
    if (hydrated) dispatch({ type: "ensureToday", ctx: { today } });
  }, [hydrated, dispatch, today, state.today, state.prefs.todayScale]);

  const quest = state.today ? QUEST_BY_ID.get(state.today.id) : undefined;
  const streak = computeStreak(state.done, today);

  // Let the current card leave before the state changes and the next one enters.
  const transition = useCallback(
    (fn: () => void) => {
      setLeaving(true);
      window.setTimeout(() => {
        fn();
        setLeaving(false);
      }, LEAVE_MS);
    },
    [],
  );

  const skip = () => transition(() => dispatch({ type: "skipToday", ctx: { today } }));
  const save = () => {
    if (!quest) return;
    buzz();
    toast("Added to your list");
    transition(() => dispatch({ type: "toggleSaved", id: quest.id }));
  };
  const done = () => {
    if (!quest) return;
    buzz(16);
    toast("Done. Nice one.");
    transition(() => dispatch({ type: "markDone", id: quest.id, date: today }));
  };
  const setScale = (scale: TodayScale) => dispatch({ type: "setTodayScale", scale, ctx: { today } });

  return (
    <main className="px-5 pt-6">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-[13px] font-medium text-ink-2">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-[28px] font-semibold leading-none">Today&apos;s quest</h1>
        </div>
        {streak >= 2 && (
          <span className="rounded-full bg-done/10 px-3 py-1 text-[13px] font-semibold text-done">{streak} day streak</span>
        )}
      </header>

      <div className="mb-4">
        <ScaleToggle value={state.prefs.todayScale} onChange={setScale} />
      </div>

      {!hydrated ? (
        <div className="animate-pulse rounded-[var(--radius-card)] bg-ink/6" style={{ minHeight: "min(58dvh, 520px)" }} />
      ) : quest ? (
        <>
          <div key={quest.id} className={leaving ? "card-leave" : "card-enter"}>
            <QuestCard quest={quest} />
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr_1fr] gap-2">
            <button
              onClick={skip}
              className="rounded-full px-4 py-3.5 text-[15px] font-medium text-ink-2 transition-colors hover:bg-ink/5 active:scale-[0.98]"
            >
              Skip
            </button>
            <button
              onClick={save}
              className="rounded-full border border-ink/15 bg-surface py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5 active:scale-[0.98]"
            >
              Save for later
            </button>
            <button
              onClick={done}
              className="rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          title="You have seen them all"
          body="Every quest here is done, saved, or skipped recently. Bring the skipped ones back?"
          action={{ label: "Bring them back", onClick: () => dispatch({ type: "resetDismissed" }) }}
        />
      )}
    </main>
  );
}
