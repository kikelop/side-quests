import type { Category } from "./types";

export interface CategoryTheme {
  /** Card background. */
  bg: string;
  /** Text on top of `bg`. */
  fg: string;
  /** Translucent tint for chips and rows on the light UI. */
  tint: string;
}

// One confident color per category. Cards are full-bleed in this color,
// rows in Explore use the tint as a leading swatch.
export const CATEGORY_THEME: Record<Category, CategoryTheme> = {
  nature:   { bg: "#2F6B4F", fg: "#F2F7F3", tint: "rgba(47,107,79,0.14)" },
  travel:   { bg: "#1F4E8C", fg: "#EEF3FA", tint: "rgba(31,78,140,0.14)" },
  food:     { bg: "#C4552B", fg: "#FFF3EC", tint: "rgba(196,85,43,0.16)" },
  creative: { bg: "#6E3AA1", fg: "#F5EEFB", tint: "rgba(110,58,161,0.14)" },
  social:   { bg: "#E0A626", fg: "#231A05", tint: "rgba(224,166,38,0.22)" },
  body:     { bg: "#B8233B", fg: "#FDEEF0", tint: "rgba(184,35,59,0.14)" },
  mind:     { bg: "#23707B", fg: "#EAF6F7", tint: "rgba(35,112,123,0.14)" },
  skills:   { bg: "#3F4460", fg: "#EEEFF5", tint: "rgba(63,68,96,0.14)" },
  home:     { bg: "#8A5A3C", fg: "#FAF1EA", tint: "rgba(138,90,60,0.16)" },
};
