// Data contract shared by the web app and the (future) SwiftUI port.
// Every enum is a lowercase string literal and every date is an ISO
// "YYYY-MM-DD" string so the same JSON decodes into `Codable` structs
// without any transformation.

export type Scale = "big" | "micro";

export type Category =
  | "nature"
  | "travel"
  | "food"
  | "creative"
  | "social"
  | "body"
  | "mind"
  | "skills"
  | "home";

export type Duration = "minutes" | "hours" | "day" | "multi-day";
export type Cost = "free" | "low" | "medium" | "high";
export type Setting = "indoor" | "outdoor" | "any";
export type Company = "solo" | "with-others" | "any";

export interface Quest {
  /** Stable slug, `${scale}-${kebab}`. Never renamed: user state references it. */
  id: string;
  /** Imperative, one line, no trailing period. */
  title: string;
  /** One or two sentences: the why, or a concrete how. */
  description: string;
  scale: Scale;
  category: Category;
  duration: Duration;
  cost: Cost;
  setting: Setting;
  company: Company;
  tags?: string[];
  /** Soft delete. Retired quests stay resolvable but never get drawn or listed. */
  retired?: boolean;
}

export interface DatedRef {
  id: string;
  /** ISO calendar date, YYYY-MM-DD, in the user's local time. */
  date: string;
}

export type TodayScale = Scale | "any";

export interface UserState {
  version: 1;
  /** Insertion order. */
  saved: string[];
  done: DatedRef[];
  /** Skipped quests. Entries expire after DISMISS_TTL_DAYS. */
  dismissed: DatedRef[];
  /** The quest pinned to today's card, so it survives reloads. */
  today: DatedRef | null;
  prefs: {
    todayScale: TodayScale;
  };
}

export const SCALES: Scale[] = ["micro", "big"];
export const CATEGORIES: Category[] = [
  "nature",
  "travel",
  "food",
  "creative",
  "social",
  "body",
  "mind",
  "skills",
  "home",
];
export const DURATIONS: Duration[] = ["minutes", "hours", "day", "multi-day"];
export const COSTS: Cost[] = ["free", "low", "medium", "high"];
export const SETTINGS: Setting[] = ["indoor", "outdoor", "any"];
export const COMPANIES: Company[] = ["solo", "with-others", "any"];

export const DISMISS_TTL_DAYS = 14;

export const EMPTY_STATE: UserState = {
  version: 1,
  saved: [],
  done: [],
  dismissed: [],
  today: null,
  prefs: { todayScale: "any" },
};
