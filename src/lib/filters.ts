import type { Category, Company, Cost, Duration, Quest, Setting, TodayScale, UserState } from "./types";

export type Status = "all" | "todo" | "saved" | "done";

export interface Filters {
  scale: TodayScale;
  categories: Category[];
  status: Status;
  durations: Duration[];
  costs: Cost[];
  settings: Setting[];
  companies: Company[];
  query: string;
}

export const DEFAULT_FILTERS: Filters = {
  scale: "any",
  categories: [],
  status: "all",
  durations: [],
  costs: [],
  settings: [],
  companies: [],
  query: "",
};

export function countActiveFilters(f: Filters): number {
  return (
    (f.scale !== "any" ? 1 : 0) +
    f.categories.length +
    f.durations.length +
    f.costs.length +
    f.settings.length +
    f.companies.length
  );
}

function matches<T>(selected: T[], value: T): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function applyFilters(quests: Quest[], state: UserState, f: Filters): Quest[] {
  const done = new Map(state.done.map((d) => [d.id, d.date]));
  const saved = new Set(state.saved);
  const active = new Set(state.active.map((a) => a.id));
  const q = f.query.trim().toLowerCase();

  const out = quests.filter((quest) => {
    if (quest.retired) return false;
    if (f.scale !== "any" && quest.scale !== f.scale) return false;
    if (!matches(f.categories, quest.category)) return false;
    if (!matches(f.durations, quest.duration)) return false;
    if (!matches(f.costs, quest.cost)) return false;
    if (!matches(f.settings, quest.setting)) return false;
    if (!matches(f.companies, quest.company)) return false;

    const isDone = done.has(quest.id);
    const isSaved = saved.has(quest.id);
    if (f.status === "done" && !isDone) return false;
    if (f.status === "saved" && !isSaved) return false;
    if (f.status === "todo" && (isDone || isSaved || active.has(quest.id))) return false;

    if (q) {
      const hay = `${quest.title} ${quest.description} ${(quest.tags ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (f.status === "done") {
    return out.sort((a, b) => (done.get(b.id) ?? "").localeCompare(done.get(a.id) ?? ""));
  }
  // Untouched first, then in progress / saved, then done; alphabetical inside each group.
  const rank = (id: string) => (done.has(id) ? 2 : saved.has(id) || active.has(id) ? 1 : 0);
  return out.sort((a, b) => rank(a.id) - rank(b.id) || a.title.localeCompare(b.title));
}
