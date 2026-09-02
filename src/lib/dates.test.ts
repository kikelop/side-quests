import { describe, expect, it } from "vitest";
import { addDays, computeStreak, daysBetween, isISODate, toISODate } from "./dates";

describe("dates", () => {
  it("formats local dates", () => {
    expect(toISODate(new Date(2026, 8, 2))).toBe("2026-09-02");
  });
  it("validates ISO dates", () => {
    expect(isISODate("2026-09-02")).toBe(true);
    expect(isISODate("2026-9-2")).toBe(false);
    expect(isISODate(123)).toBe(false);
  });
  it("counts days between", () => {
    expect(daysBetween("2026-09-01", "2026-09-15")).toBe(14);
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
  });
  it("computes streaks ending today or yesterday", () => {
    const done = [
      { id: "a", date: "2026-09-01" },
      { id: "b", date: "2026-09-02" },
      { id: "c", date: "2026-09-03" },
    ];
    expect(computeStreak(done, "2026-09-03")).toBe(3);
    expect(computeStreak(done, "2026-09-04")).toBe(3);
    expect(computeStreak(done, "2026-09-05")).toBe(0);
    expect(computeStreak([], "2026-09-05")).toBe(0);
  });
});
