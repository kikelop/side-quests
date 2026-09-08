import type { Category, Scale } from "./types";

export interface Tone {
  /** Background. */
  bg: string;
  /** Text on top of `bg`. */
  fg: string;
}

// The Today card is coloured by scale: amber for something you can do today,
// dark cocoa for the once-in-a-lifetime ones.
export const SCALE_THEME: Record<Scale, Tone> = {
  micro: { bg: "#ffb347", fg: "#3a2a1a" },
  big: { bg: "#3a2a1a", fg: "#fff3dc" },
};

// Category swatches (Explore rows, filter chips), tuned to the warm palette.
export const CATEGORY_THEME: Record<Category, Tone> = {
  nature:   { bg: "#4f6b3a", fg: "#f1f5e9" },
  travel:   { bg: "#2f5d6b", fg: "#e9f3f5" },
  food:     { bg: "#c2552d", fg: "#fdeee6" },
  creative: { bg: "#7b4b8a", fg: "#f6eef8" },
  social:   { bg: "#d98b1a", fg: "#2c1d08" },
  body:     { bg: "#a8323c", fg: "#fbebec" },
  mind:     { bg: "#3f6f68", fg: "#e9f3f1" },
  skills:   { bg: "#6b5a4a", fg: "#f3eee8" },
  home:     { bg: "#8a5a3c", fg: "#f8efe8" },
};
