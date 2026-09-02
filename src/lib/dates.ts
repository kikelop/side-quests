import type { DatedRef } from "./types";

/** Local calendar date as YYYY-MM-DD. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function isISODate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

/** Whole days from `a` to `b` (b - a). Both YYYY-MM-DD, compared at UTC midnight. */
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86_400_000);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Consecutive days with at least one completed quest, counting back from
 * today (or from yesterday, so an unfinished day doesn't break the streak).
 */
export function computeStreak(done: DatedRef[], today: string): number {
  const days = new Set(done.map((d) => d.date));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
