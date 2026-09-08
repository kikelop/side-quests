import QuestMeta from "./QuestMeta";
import { CATEGORY_LABEL, SCALE_LABEL } from "@/lib/quests";
import { SCALE_THEME } from "@/lib/theme";
import type { Quest } from "@/lib/types";

/** The big card on the Today tab. Full-bleed in the category color. */
export default function QuestCard({ quest, className = "" }: { quest: Quest; className?: string }) {
  const t = SCALE_THEME[quest.scale];
  return (
    <article
      className={`flex flex-col justify-between rounded-[var(--radius-card)] p-6 sm:p-7 ${className}`}
      style={{ background: t.bg, color: t.fg, minHeight: "min(58dvh, 520px)" }}
    >
      <header className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.12em] opacity-80">
        <span>{CATEGORY_LABEL[quest.category]}</span>
        <span>{SCALE_LABEL[quest.scale]}</span>
      </header>
      <div className="my-8">
        <h2 className="font-display text-[clamp(24px,6.8vw,30px)] font-semibold leading-[1.08]">{quest.title}</h2>
        <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.5] opacity-90">{quest.description}</p>
      </div>
      <QuestMeta quest={quest} onColor />
    </article>
  );
}
