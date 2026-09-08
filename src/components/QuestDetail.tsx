"use client";

import { useRouter } from "next/navigation";
import QuestCard from "./QuestCard";
import { todayISO } from "@/lib/dates";
import { buzz, toast } from "@/lib/feedback";
import { QUEST_BY_ID } from "@/lib/quests";
import { useQuests } from "@/lib/QuestsProvider";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export default function QuestDetail({ id }: { id: string }) {
  const { state, hydrated, dispatch } = useQuests();
  const router = useRouter();
  const quest = QUEST_BY_ID.get(id);
  if (!quest) return null;

  const today = todayISO();
  const active = state.active.find((a) => a.id === id);
  const done = state.done.find((d) => d.id === id);
  const saved = state.saved.includes(id);

  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  return (
    <main className="px-5 pt-4">
      <button onClick={back} className="mb-4 flex h-10 items-center gap-1 rounded-full pr-3 text-[15px] font-medium text-ink-2 hover:text-ink">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Back
      </button>

      <QuestCard quest={quest} />

      {!hydrated ? null : done ? (
        <section className="mt-5">
          <p className="rounded-full bg-done/10 px-4 py-2 text-center text-[14px] font-semibold text-done">
            Done on {formatDate(done.date)}
          </p>
          <button
            onClick={() => dispatch({ type: "undoDone", id })}
            className="mt-3 w-full rounded-full py-3 text-[14px] font-medium text-ink-2 hover:bg-ink/5"
          >
            Undo
          </button>
        </section>
      ) : active ? (
        <section className="mt-5">
          <p className="text-center text-[13px] font-medium text-ink-2">In progress since {formatDate(active.date)}</p>
          <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
            <button
              onClick={() => {
                dispatch({ type: "unaccept", id });
                toast("Back in the pile");
                back();
              }}
              className="rounded-full px-4 py-3.5 text-[15px] font-medium text-ink-2 hover:bg-ink/5"
            >
              Drop it
            </button>
            <button
              onClick={() => {
                buzz(16);
                toast("Done. Nice one.");
                dispatch({ type: "markDone", id, date: today });
              }}
              className="rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white active:scale-[0.98]"
            >
              Mark as done
            </button>
          </div>
        </section>
      ) : (
        <section className="mt-5 grid grid-cols-[1fr_1fr] gap-2">
          <button
            onClick={() => {
              toast(saved ? "Removed from your list" : "Saved for later");
              dispatch({ type: "toggleSaved", id, date: today });
            }}
            className="rounded-full border border-ink/15 bg-surface py-3.5 text-[15px] font-medium text-ink hover:bg-ink/5"
          >
            {saved ? "Unsave" : "Save for later"}
          </button>
          <button
            onClick={() => {
              buzz(16);
              toast("Quest accepted");
              dispatch({ type: "accept", id, date: today });
            }}
            className="rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white active:scale-[0.98]"
          >
            I&apos;m in
          </button>
        </section>
      )}
    </main>
  );
}
