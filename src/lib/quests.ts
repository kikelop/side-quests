import micro from "@/data/quests.micro.json";
import big from "@/data/quests.big.json";
import type { Category, Company, Cost, Duration, Quest, Scale, Setting } from "./types";

export const QUESTS: Quest[] = [...(micro as Quest[]), ...(big as Quest[])];
export const QUEST_BY_ID: Map<string, Quest> = new Map(QUESTS.map((q) => [q.id, q]));
export const QUEST_IDS: Set<string> = new Set(QUEST_BY_ID.keys());

export const SCALE_LABEL: Record<Scale, string> = {
  micro: "Today",
  big: "Once in a lifetime",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  nature: "Nature",
  travel: "Travel",
  food: "Food",
  creative: "Creative",
  social: "People",
  body: "Body",
  mind: "Mind",
  skills: "Skills",
  home: "Home",
};

export const DURATION_LABEL: Record<Duration, string> = {
  minutes: "Minutes",
  hours: "A few hours",
  day: "A day",
  "multi-day": "Days or more",
};

export const COST_LABEL: Record<Cost, string> = {
  free: "Free",
  low: "Cheap",
  medium: "Some money",
  high: "Big spend",
};

export const SETTING_LABEL: Record<Setting, string> = {
  indoor: "Indoors",
  outdoor: "Outdoors",
  any: "Anywhere",
};

export const COMPANY_LABEL: Record<Company, string> = {
  solo: "Solo",
  "with-others": "With others",
  any: "Solo or together",
};
