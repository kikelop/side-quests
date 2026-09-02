import { describe, expect, it } from "vitest";
import { createReducer } from "./reducer";
import { EMPTY_STATE, type Quest, type UserState } from "./types";

const q = (id: string, scale: "micro" | "big"): Quest => ({
  id: `${scale}-${id}`,
  title: "T",
  description: "D",
  scale,
  category: "nature",
  duration: "minutes",
  cost: "free",
  setting: "any",
  company: "any",
});

const QUESTS = [q("a", "micro"), q("b", "micro"), q("c", "big")];
const reduce = createReducer(QUESTS);
const TODAY = "2026-09-02";
const ctx = { today: TODAY, rng: () => 0 };

describe("reducer", () => {
  it("pins a quest for today and keeps it across calls", () => {
    const s1 = reduce(EMPTY_STATE, { type: "ensureToday", ctx });
    expect(s1.today).toEqual({ id: "micro-a", date: TODAY });
    const s2 = reduce(s1, { type: "ensureToday", ctx: { ...ctx, rng: () => 0.99 } });
    expect(s2).toBe(s1);
  });

  it("redraws when the date changes", () => {
    const s1 = reduce(EMPTY_STATE, { type: "ensureToday", ctx });
    const s2 = reduce(s1, { type: "ensureToday", ctx: { ...ctx, today: "2026-09-03" } });
    expect(s2.today?.date).toBe("2026-09-03");
  });

  it("skip dismisses the current quest and draws a different one", () => {
    const s1 = reduce(EMPTY_STATE, { type: "ensureToday", ctx });
    const s2 = reduce(s1, { type: "skipToday", ctx });
    expect(s2.dismissed).toEqual([{ id: "micro-a", date: TODAY }]);
    expect(s2.today?.id).not.toBe("micro-a");
  });

  it("marking done clears saved and dismissed for that id, and redraws today", () => {
    let s: UserState = { ...EMPTY_STATE, saved: ["micro-a"], dismissed: [{ id: "micro-a", date: TODAY }] };
    s = reduce(s, { type: "markDone", id: "micro-a", date: TODAY });
    expect(s.saved).toEqual([]);
    expect(s.dismissed).toEqual([]);
    expect(s.done).toEqual([{ id: "micro-a", date: TODAY }]);
    s = reduce(s, { type: "markDone", id: "micro-a", date: TODAY });
    expect(s.done).toHaveLength(1);
    s = reduce(s, { type: "ensureToday", ctx });
    expect(s.today?.id).not.toBe("micro-a");
  });

  it("finishing the pinned quest redraws the card immediately", () => {
    let s = reduce(EMPTY_STATE, { type: "ensureToday", ctx });
    expect(s.today?.id).toBe("micro-a");
    s = reduce(s, { type: "markDone", id: "micro-a", date: TODAY });
    expect(s.today?.id).toBe("micro-b");
    // Finishing a quest that is not on the card leaves the card alone.
    s = reduce(s, { type: "markDone", id: "big-c", date: TODAY });
    expect(s.today?.id).toBe("micro-b");
  });

  it("saving the pinned quest moves the card on", () => {
    let s = reduce(EMPTY_STATE, { type: "ensureToday", ctx });
    s = reduce(s, { type: "toggleSaved", id: "micro-a", date: TODAY });
    expect(s.saved).toEqual(["micro-a"]);
    expect(s.today?.id).toBe("micro-b");
  });

  it("changing scale redraws only if the pinned quest no longer fits", () => {
    const s1 = reduce(EMPTY_STATE, { type: "ensureToday", ctx });
    const s2 = reduce(s1, { type: "setTodayScale", scale: "micro", ctx });
    expect(s2.today?.id).toBe("micro-a");
    const s3 = reduce(s2, { type: "setTodayScale", scale: "big", ctx });
    expect(s3.today?.id).toBe("big-c");
  });

  it("resetAll returns to the empty state", () => {
    const s = reduce({ ...EMPTY_STATE, saved: ["micro-a"] }, { type: "resetAll" });
    expect(s).toEqual(EMPTY_STATE);
  });
});
