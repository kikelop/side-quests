import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS } from "./filters";
import { EMPTY_STATE, type Quest, type UserState } from "./types";

const q = (id: string, extra: Partial<Quest> = {}): Quest => ({
  id,
  title: id,
  description: "D",
  scale: "micro",
  category: "nature",
  duration: "minutes",
  cost: "free",
  setting: "any",
  company: "any",
  ...extra,
});

const QUESTS = [
  q("micro-b", { category: "food", cost: "low" }),
  q("micro-a"),
  q("big-c", { scale: "big", tags: ["night"] }),
  q("micro-r", { retired: true }),
];

describe("applyFilters", () => {
  it("hides retired quests and sorts alphabetically by default", () => {
    expect(applyFilters(QUESTS, EMPTY_STATE, DEFAULT_FILTERS).map((x) => x.id)).toEqual(["big-c", "micro-a", "micro-b"]);
  });

  it("filters by enum fields", () => {
    expect(applyFilters(QUESTS, EMPTY_STATE, { ...DEFAULT_FILTERS, categories: ["food"] }).map((x) => x.id)).toEqual(["micro-b"]);
    expect(applyFilters(QUESTS, EMPTY_STATE, { ...DEFAULT_FILTERS, scale: "big" }).map((x) => x.id)).toEqual(["big-c"]);
    expect(applyFilters(QUESTS, EMPTY_STATE, { ...DEFAULT_FILTERS, costs: ["low"] }).map((x) => x.id)).toEqual(["micro-b"]);
  });

  it("searches title, description and tags", () => {
    expect(applyFilters(QUESTS, EMPTY_STATE, { ...DEFAULT_FILTERS, query: "NIGHT" }).map((x) => x.id)).toEqual(["big-c"]);
  });

  it("filters by status and puts untouched quests first", () => {
    const state: UserState = { ...EMPTY_STATE, saved: ["micro-a"], done: [{ id: "big-c", date: "2026-09-01" }] };
    expect(applyFilters(QUESTS, state, DEFAULT_FILTERS).map((x) => x.id)).toEqual(["micro-b", "micro-a", "big-c"]);
    expect(applyFilters(QUESTS, state, { ...DEFAULT_FILTERS, status: "todo" }).map((x) => x.id)).toEqual(["micro-b"]);
    expect(applyFilters(QUESTS, state, { ...DEFAULT_FILTERS, status: "saved" }).map((x) => x.id)).toEqual(["micro-a"]);
    expect(applyFilters(QUESTS, state, { ...DEFAULT_FILTERS, status: "done" }).map((x) => x.id)).toEqual(["big-c"]);
  });

  it("orders done by most recent first", () => {
    const state: UserState = {
      ...EMPTY_STATE,
      done: [{ id: "micro-a", date: "2026-09-01" }, { id: "micro-b", date: "2026-09-02" }],
    };
    expect(applyFilters(QUESTS, state, { ...DEFAULT_FILTERS, status: "done" }).map((x) => x.id)).toEqual(["micro-b", "micro-a"]);
  });
});
