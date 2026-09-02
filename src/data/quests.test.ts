import { describe, expect, it } from "vitest";
import { QUESTS } from "@/lib/quests";
import { CATEGORIES, SCALES, type Category, type Scale } from "@/lib/types";
import { validateQuest } from "@/lib/validate";

const live = QUESTS.filter((q) => !q.retired);

describe("quest catalogue", () => {
  it("every quest passes validation", () => {
    const problems = QUESTS.flatMap((q) => validateQuest(q).map((e) => `${q.id}: ${e}`));
    expect(problems).toEqual([]);
  });

  it("ids are unique", () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has at least three live quests per category and scale", () => {
    const count = (s: Scale, c: Category) => live.filter((q) => q.scale === s && q.category === c).length;
    const thin = SCALES.flatMap((s) => CATEGORIES.filter((c) => count(s, c) < 3).map((c) => `${s}/${c}: ${count(s, c)}`));
    expect(thin).toEqual([]);
  });

  it("micro quests are mostly free, big quests are not mostly expensive", () => {
    const micro = live.filter((q) => q.scale === "micro");
    const big = live.filter((q) => q.scale === "big");
    expect(micro.filter((q) => q.cost === "free").length / micro.length).toBeGreaterThanOrEqual(0.7);
    expect(big.filter((q) => q.cost === "high").length / big.length).toBeLessThanOrEqual(0.3);
  });

  it("micro quests are doable in a day", () => {
    const long = live.filter((q) => q.scale === "micro" && q.duration === "multi-day").map((q) => q.id);
    expect(long).toEqual([]);
  });
});
