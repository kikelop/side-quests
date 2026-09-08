"use client";

import QuestMeta from "./QuestMeta";
import { CATEGORY_LABEL, SCALE_LABEL } from "@/lib/quests";
import { CATEGORY_THEME } from "@/lib/theme";
import type { Quest } from "@/lib/types";

export interface QuestRowProps {
  quest: Quest;
  saved: boolean;
  doneDate?: string;
  onToggleSaved: () => void;
  onDone: () => void;
  onUndo: () => void;
}

/** Compact row for lists. Category swatch on the left, actions on the right. */
export default function QuestRow({ quest, saved, doneDate, onToggleSaved, onDone, onUndo }: QuestRowProps) {
  const t = CATEGORY_THEME[quest.category];
  const isDone = Boolean(doneDate);

  return (
    <li className="flex gap-3 rounded-[20px] bg-surface p-4 shadow-[0_1px_0_rgba(21,23,28,0.05)]">
      <span
        aria-hidden
        className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
        style={{ background: isDone ? "var(--done)" : t.bg }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
          {CATEGORY_LABEL[quest.category]}
          {quest.scale === "big" && ` · ${SCALE_LABEL.big}`}
          {isDone && ` · Done ${formatDate(doneDate!)}`}
        </p>
        <h3 className={`font-display mt-0.5 text-[15px] font-semibold leading-snug ${isDone ? "text-ink-2 line-through decoration-ink/30" : ""}`}>
          {quest.title}
        </h3>
        <p className="mt-1 text-[14px] leading-snug text-ink-2">{quest.description}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <QuestMeta quest={quest} />
          <div className="flex shrink-0 gap-1">
            {isDone ? (
              <IconButton label="Undo done" onClick={onUndo}>
                <UndoIcon />
              </IconButton>
            ) : (
              <>
                <IconButton label={saved ? "Remove from list" : "Save to list"} onClick={onToggleSaved} active={saved}>
                  <BookmarkIcon filled={saved} />
                </IconButton>
                <IconButton label="Mark done" onClick={onDone}>
                  <CheckIcon />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function IconButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors active:scale-95 ${
        active ? "bg-ink text-white" : "bg-ink/6 text-ink hover:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-4.1-6.5 4.1V5.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h9.5a6.5 6.5 0 0 1 0 13H10" />
    </svg>
  );
}
