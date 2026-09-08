import { daysBetween, isISODate } from "./dates";
import { DISMISS_TTL_DAYS, EMPTY_STATE, type DatedRef, type UserState } from "./types";

export const STORAGE_KEY = "side-quests:v1";

function cleanRefs(raw: unknown, knownIds: Set<string>): DatedRef[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: DatedRef[] = [];
  for (const r of raw) {
    if (!r || typeof r.id !== "string" || !isISODate(r.date)) continue;
    if (!knownIds.has(r.id) || seen.has(r.id)) continue;
    seen.add(r.id);
    out.push({ id: r.id, date: r.date });
  }
  return out;
}

/**
 * Turn whatever is in storage into a valid state: tolerate corrupt JSON,
 * drop references to quests that no longer exist, dedupe, and expire old
 * dismissals. `migrate` is where future schema versions get upgraded.
 */
export function sanitize(raw: unknown, knownIds: Set<string>, today: string): UserState {
  if (!raw || typeof raw !== "object") return EMPTY_STATE;
  const r = raw as Record<string, unknown>;
  const prefs = (r.prefs ?? {}) as Record<string, unknown>;
  const todayScale = prefs.todayScale;

  const saved = Array.isArray(r.saved)
    ? Array.from(new Set(r.saved.filter((id): id is string => typeof id === "string" && knownIds.has(id))))
    : [];
  const done = cleanRefs(r.done, knownIds);
  const active = cleanRefs(r.active, knownIds).filter((a) => !done.some((d) => d.id === a.id));
  const dismissed = cleanRefs(r.dismissed, knownIds).filter(
    (d) => daysBetween(d.date, today) < DISMISS_TTL_DAYS,
  );
  const t = r.today as Partial<DatedRef> | null | undefined;
  const today_ =
    t && typeof t.id === "string" && isISODate(t.date) && knownIds.has(t.id) ? { id: t.id, date: t.date } : null;

  return {
    version: 1,
    saved,
    active,
    done,
    dismissed,
    today: today_,
    prefs: {
      todayScale: todayScale === "big" || todayScale === "micro" ? todayScale : "any",
    },
  };
}

export function loadState(knownIds: Set<string>, today: string): UserState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return sanitize(JSON.parse(raw), knownIds, today);
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state: UserState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota: the session still works, it just won't persist.
  }
}
