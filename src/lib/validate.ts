import {
  CATEGORIES,
  COMPANIES,
  COSTS,
  DURATIONS,
  SCALES,
  SETTINGS,
  type Quest,
} from "./types";

export const ID_PATTERN = /^(big|micro)-[a-z0-9]+(-[a-z0-9]+)*$/;
const TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const TITLE_MAX = 48;
export const DESCRIPTION_MIN = 40;
export const DESCRIPTION_MAX = 180;

/** Words that make a quest read like a wellness ad. Kept out on purpose. */
export const BANNED_WORDS = [
  "journey",
  "manifest",
  "unleash",
  "vibes",
  "self-care",
  "unlock your",
  "level up",
  "game-changer",
];

/** Returns a list of human-readable problems. Empty means valid. */
export function validateQuest(q: Quest): string[] {
  const errors: string[] = [];
  const oneOf = <T extends string>(field: string, value: T, list: readonly T[]) => {
    if (!list.includes(value)) errors.push(`${field}: "${value}" not in [${list.join(", ")}]`);
  };

  if (!ID_PATTERN.test(q.id)) errors.push(`id: "${q.id}" must match ${ID_PATTERN}`);
  if (!q.id.startsWith(`${q.scale}-`)) errors.push(`id: prefix must match scale "${q.scale}"`);

  oneOf("scale", q.scale, SCALES);
  oneOf("category", q.category, CATEGORIES);
  oneOf("duration", q.duration, DURATIONS);
  oneOf("cost", q.cost, COSTS);
  oneOf("setting", q.setting, SETTINGS);
  oneOf("company", q.company, COMPANIES);

  const title = q.title ?? "";
  if (!title.trim()) errors.push("title: empty");
  if (title.length > TITLE_MAX) errors.push(`title: ${title.length} chars > ${TITLE_MAX}`);
  if (/[.!?]$/.test(title)) errors.push("title: no trailing punctuation");
  if (title[0] !== title[0]?.toUpperCase()) errors.push("title: must start uppercase");
  if (/\p{Extended_Pictographic}/u.test(title)) errors.push("title: no emoji");

  const desc = q.description ?? "";
  if (desc.length < DESCRIPTION_MIN) errors.push(`description: ${desc.length} chars < ${DESCRIPTION_MIN}`);
  if (desc.length > DESCRIPTION_MAX) errors.push(`description: ${desc.length} chars > ${DESCRIPTION_MAX}`);
  if (/\p{Extended_Pictographic}/u.test(desc)) errors.push("description: no emoji");

  const text = `${title} ${desc}`.toLowerCase();
  for (const w of BANNED_WORDS) {
    if (text.includes(w)) errors.push(`banned word: "${w}"`);
  }

  for (const t of q.tags ?? []) {
    if (!TAG_PATTERN.test(t)) errors.push(`tag: "${t}" must be kebab-case`);
  }

  return errors;
}
