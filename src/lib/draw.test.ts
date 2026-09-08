import { describe, expect, it } from "vitest";
import { drawQuest, eligibleQuests } from "./draw";
import { EMPTY_STATE, type Quest, type UserState } from "./types";

const q = (id: string, scale: "micro" | "big", extra: Partial<Quest> = {}): Quest => ({
  id: `${scale}-${id}`,
  title: "T",
  description: "D",
  scale,
  category: "nature",
  duration: "minutes",
  cost: "free",
  setting: "any",
  company: "any",
  ...extra,
});

const QUESTS = [q("a", "micro"), q("b", "micro"), q("c", "big"), q("d", "big", { retired: true })];
const TODAY = "2026-09-02";

describe("eligibleQuests", () => {
  it("excludes retired, done, saved and recently dismissed", () => {
    const state: UserState = {
      ...EMPTY_STATE,
      saved: ["micro-a"],
      done: [{ id: "micro-b", date: "2026-08-01" }],
      dismissed: [{ id: "big-c", date: "2026-09-01" }],
    };
    expect(eligibleQuests(QUESTS, state, "any", TODAY)).toEqual([]);
  });

  it("excludes quests in progress", () => {
    const state: UserState = { ...EMPTY_STATE, active: [{ id: "micro-a", date: TODAY }] };
    expect(eligibleQuests(QUESTS, state, "micro", TODAY).map((x) => x.id)).toEqual(["micro-b"]);
  });

  it("lets dismissals expire after the TTL", () => {
    const state: UserState = { ...EMPTY_STATE, dismissed: [{ id: "big-c", date: "2026-08-01" }] };
    expect(eligibleQuests(QUESTS, state, "big", TODAY).map((x) => x.id)).toEqual(["big-c"]);
  });

  it("filters by scale", () => {
    expect(eligibleQuests(QUESTS, EMPTY_STATE, "micro", TODAY).map((x) => x.id)).toEqual(["micro-a", "micro-b"]);
  });
});

describe("drawQuest", () => {
  it("flips a coin between scales that still have candidates", () => {
    // rng < 0.5 → micro, then index 0 within micro
    expect(drawQuest(QUESTS, EMPTY_STATE, "any", { today: TODAY, rng: () => 0.1 })?.id).toBe("micro-a");
    // rng ≥ 0.5 → big
    expect(drawQuest(QUESTS, EMPTY_STATE, "any", { today: TODAY, rng: () => 0.9 })?.id).toBe("big-c");
  });

  it("does not flip the coin when one scale is exhausted", () => {
    const state: UserState = { ...EMPTY_STATE, done: [{ id: "big-c", date: TODAY }] };
    expect(drawQuest(QUESTS, state, "any", { today: TODAY, rng: () => 0.9 })?.scale).toBe("micro");
  });

  it("falls back to dismissed quests before giving up", () => {
    const state: UserState = {
      ...EMPTY_STATE,
      done: [{ id: "micro-a", date: TODAY }, { id: "micro-b", date: TODAY }],
      dismissed: [{ id: "big-c", date: TODAY }],
    };
    expect(drawQuest(QUESTS, state, "any", { today: TODAY })?.id).toBe("big-c");
  });

  it("returns null when everything is done", () => {
    const state: UserState = {
      ...EMPTY_STATE,
      done: [{ id: "micro-a", date: TODAY }, { id: "micro-b", date: TODAY }, { id: "big-c", date: TODAY }],
    };
    expect(drawQuest(QUESTS, state, "any", { today: TODAY })).toBeNull();
  });

  it("never returns the excluded id", () => {
    const state: UserState = { ...EMPTY_STATE, done: [{ id: "micro-b", date: TODAY }] };
    for (let i = 0; i < 20; i++) {
      expect(drawQuest(QUESTS, state, "micro", { today: TODAY }, "micro-a")).toBeNull();
    }
  });
});
