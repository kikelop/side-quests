"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "./EmptyState";
import QuestCard from "./QuestCard";
import ScaleToggle from "./ScaleToggle";
import SwipeCard, { type SwipeDirection } from "./SwipeCard";
import { computeStreak, todayISO } from "@/lib/dates";
import { buzz, toast } from "@/lib/feedback";
import { QUEST_BY_ID } from "@/lib/quests";
import { useQuests } from "@/lib/QuestsProvider";
import type { TodayScale } from "@/lib/types";

const LABELS: Record<SwipeDirection, string> = { left: "Skip", right: "I'm in", up: "Someday" };

export default function TodayView() {
  const { state, hydrated, dispatch } = useQuests();
  const router = useRouter();
  const [flyOut, setFlyOut] = useState<SwipeDirection | null>(null);
  const today = todayISO();

  useEffect(() => {
    if (hydrated) dispatch({ type: "ensureToday", ctx: { today } });
  }, [hydrated, dispatch, today, state.today, state.prefs.todayScale]);

  const quest = state.today ? QUEST_BY_ID.get(state.today.id) : undefined;
  const streak = computeStreak(state.done, today);
  const inProgress = state.active.length;

  // Called once the card has flown off screen, both for gestures and buttons.
  const onSwipe = (dir: SwipeDirection) => {
    if (!quest) return;
    setFlyOut(null);
    if (dir === "left") {
      dispatch({ type: "skipToday", ctx: { today } });
    } else if (dir === "up") {
      buzz();
      toast("Added to Someday");
      dispatch({ type: "toggleSaved", id: quest.id, date: today });
    } else {
      buzz(16);
      dispatch({ type: "accept", id: quest.id, date: today });
      router.push(`/quest/${quest.id}`);
    }
  };

  const setScale = (scale: TodayScale) => dispatch({ type: "setTodayScale", scale, ctx: { today } });

  return (
    <main className="px-5 pt-6">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <p className="h-5 text-[13px] font-medium text-ink-2">
            {hydrated && new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display text-[24px] font-semibold leading-none">Today&apos;s quest</h1>
        </div>
        <div className="flex gap-1.5">
          {inProgress > 0 && (
            <span className="rounded-full bg-ink/8 px-3 py-1 text-[13px] font-semibold text-ink-2">{inProgress} next up</span>
          )}
          {streak >= 2 && (
            <span className="rounded-full bg-done/10 px-3 py-1 text-[13px] font-semibold text-done">{streak} day streak</span>
          )}
        </div>
      </header>

      <div className="mb-4">
        <ScaleToggle value={state.prefs.todayScale} onChange={setScale} />
      </div>

      {!hydrated ? (
        <div className="animate-pulse rounded-[var(--radius-card)] bg-ink/6" style={{ minHeight: "min(58dvh, 520px)" }} />
      ) : quest ? (
        <>
          <SwipeCard key={quest.id} labels={LABELS} onSwipe={onSwipe} flyOut={flyOut}>
            <QuestCard quest={quest} />
          </SwipeCard>
          <div className="mt-5 grid grid-cols-[auto_1fr_1fr] gap-2">
            <button
              onClick={() => setFlyOut("left")}
              className="rounded-full px-4 py-3.5 text-[15px] font-medium text-ink-2 transition-colors hover:bg-ink/5 active:scale-[0.98]"
            >
              Skip
            </button>
            <button
              onClick={() => setFlyOut("up")}
              className="rounded-full border border-ink/15 bg-surface py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5 active:scale-[0.98]"
            >
              Someday
            </button>
            <button
              onClick={() => setFlyOut("right")}
              className="rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white active:scale-[0.98]"
            >
              I&apos;m in
            </button>
          </div>
          <p className="mt-3 text-center text-[12px] text-ink-3">Swipe right if you&apos;re in · up for someday · left to skip</p>
        </>
      ) : (
        <EmptyState
          title="You have seen them all"
          body="Every quest here is done, queued, saved for someday or skipped recently. Bring the skipped ones back?"
          action={{ label: "Bring them back", onClick: () => dispatch({ type: "resetDismissed" }) }}
        />
      )}
    </main>
  );
}
