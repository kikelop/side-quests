import { daysBetween } from "./dates";
import { DISMISS_TTL_DAYS, type Quest, type TodayScale, type UserState } from "./types";

export interface DrawContext {
  today: string;
  rng?: () => number;
}

/** Dismissals still in force on `today`. */
export function activeDismissals(state: UserState, today: string): Set<string> {
  const ids = new Set<string>();
  for (const d of state.dismissed) {
    if (daysBetween(d.date, today) < DISMISS_TTL_DAYS) ids.add(d.id);
  }
  return ids;
}

/**
 * Quests that may appear on the Today card: not retired, not done, not
 * already on the list, not skipped recently, and matching the scale filter.
 */
export function eligibleQuests(
  quests: Quest[],
  state: UserState,
  scale: TodayScale,
  today: string,
  { ignoreDismissed = false } = {},
): Quest[] {
  const done = new Set(state.done.map((d) => d.id));
  const saved = new Set(state.saved);
  const dismissed = ignoreDismissed ? new Set<string>() : activeDismissals(state, today);
  return quests.filter(
    (q) =>
      !q.retired &&
      (scale === "any" || q.scale === scale) &&
      !done.has(q.id) &&
      !saved.has(q.id) &&
      !dismissed.has(q.id),
  );
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Draw one quest. With scale "any" the coin is flipped between the scales
 * that still have candidates, then a candidate is picked uniformly — so a
 * long micro list never drowns out the big ones. Falls back to ignoring
 * dismissals before giving up.
 */
export function drawQuest(
  quests: Quest[],
  state: UserState,
  scale: TodayScale,
  { today, rng = Math.random }: DrawContext,
  exclude?: string,
): Quest | null {
  for (const ignoreDismissed of [false, true]) {
    let pool = eligibleQuests(quests, state, scale, today, { ignoreDismissed });
    if (exclude) pool = pool.filter((q) => q.id !== exclude);
    if (pool.length === 0) continue;
    if (scale !== "any") return pick(pool, rng);

    const micro = pool.filter((q) => q.scale === "micro");
    const big = pool.filter((q) => q.scale === "big");
    if (micro.length === 0) return pick(big, rng);
    if (big.length === 0) return pick(micro, rng);
    return pick(rng() < 0.5 ? micro : big, rng);
  }
  return null;
}
