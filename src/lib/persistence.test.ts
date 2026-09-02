import { describe, expect, it } from "vitest";
import { loadState, sanitize, saveState, STORAGE_KEY } from "./persistence";
import { EMPTY_STATE, type UserState } from "./types";

const KNOWN = new Set(["micro-a", "big-b"]);
const TODAY = "2026-09-02";

describe("sanitize", () => {
  it("returns the empty state for garbage", () => {
    expect(sanitize(null, KNOWN, TODAY)).toEqual(EMPTY_STATE);
    expect(sanitize("nope", KNOWN, TODAY)).toEqual(EMPTY_STATE);
    expect(sanitize({ saved: "x", done: 3 }, KNOWN, TODAY)).toEqual(EMPTY_STATE);
  });

  it("drops unknown ids, duplicates, bad dates and expired dismissals", () => {
    const out = sanitize(
      {
        saved: ["micro-a", "micro-a", "gone"],
        done: [{ id: "big-b", date: "2026-08-01" }, { id: "big-b", date: "2026-08-02" }, { id: "micro-a", date: "yesterday" }],
        dismissed: [{ id: "micro-a", date: "2026-08-01" }, { id: "big-b", date: "2026-09-01" }],
        today: { id: "gone", date: TODAY },
        prefs: { todayScale: "huge" },
      },
      KNOWN,
      TODAY,
    );
    expect(out).toEqual({
      version: 1,
      saved: ["micro-a"],
      done: [{ id: "big-b", date: "2026-08-01" }],
      dismissed: [{ id: "big-b", date: "2026-09-01" }],
      today: null,
      prefs: { todayScale: "any" },
    });
  });
});

describe("load/save", () => {
  it("round-trips through localStorage", () => {
    const state: UserState = { ...EMPTY_STATE, saved: ["micro-a"], today: { id: "big-b", date: TODAY } };
    saveState(state);
    expect(loadState(KNOWN, TODAY)).toEqual(state);
  });

  it("survives corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState(KNOWN, TODAY)).toEqual(EMPTY_STATE);
  });
});
