import { COMPANY_LABEL, COST_LABEL, DURATION_LABEL, SETTING_LABEL } from "@/lib/quests";
import type { Quest } from "@/lib/types";

/** Compact facts about a quest: how long, how much, where, with whom. */
export default function QuestMeta({ quest, onColor = false }: { quest: Quest; onColor?: boolean }) {
  const items = [DURATION_LABEL[quest.duration], COST_LABEL[quest.cost]];
  if (quest.setting !== "any") items.push(SETTING_LABEL[quest.setting]);
  if (quest.company !== "any") items.push(COMPANY_LABEL[quest.company]);

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((label) => (
        <li
          key={label}
          className={`rounded-full px-2.5 py-1 text-[12px] font-medium leading-none ${
            onColor ? "text-current [background:color-mix(in_srgb,currentColor_16%,transparent)]" : "bg-ink/6 text-ink-2"
          }`}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
