"use client";

import { useEffect } from "react";
import { COMPANY_LABEL, COST_LABEL, DURATION_LABEL, SETTING_LABEL } from "@/lib/quests";
import { COMPANIES, COSTS, DURATIONS, SETTINGS } from "@/lib/types";
import { DEFAULT_FILTERS, type Filters } from "@/lib/filters";

type ListKey = "durations" | "costs" | "settings" | "companies";

export default function FilterSheet({
  filters,
  onChange,
  onClose,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggle = <K extends ListKey>(key: K, value: Filters[K][number]) => {
    const list = filters[key] as string[];
    const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    onChange({ ...filters, [key]: next });
  };

  const clear = () =>
    onChange({ ...filters, scale: "any", durations: [], costs: [], settings: [], companies: [] });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal aria-label="Filters">
      <button aria-label="Close" onClick={onClose} className="fade-in absolute inset-0 bg-ink/35 backdrop-blur-[2px]" />
      <div
        className="sheet-in relative w-full max-w-[480px] rounded-t-[28px] bg-bg px-5 pt-3"
        style={{ paddingBottom: "max(var(--safe-b), 16px)" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold">Filters</h2>
          <button onClick={clear} className="text-[14px] font-medium text-ink-2 hover:text-ink">
            Clear
          </button>
        </div>

        <Group label="Scale">
          {(["any", "micro", "big"] as const).map((s) => (
            <Chip key={s} active={filters.scale === s} onClick={() => onChange({ ...filters, scale: s })}>
              {s === "any" ? "Any" : s === "micro" ? "Today" : "Once in a life"}
            </Chip>
          ))}
        </Group>
        <Group label="Time it takes">
          {DURATIONS.map((d) => (
            <Chip key={d} active={filters.durations.includes(d)} onClick={() => toggle("durations", d)}>
              {DURATION_LABEL[d]}
            </Chip>
          ))}
        </Group>
        <Group label="Cost">
          {COSTS.map((c) => (
            <Chip key={c} active={filters.costs.includes(c)} onClick={() => toggle("costs", c)}>
              {COST_LABEL[c]}
            </Chip>
          ))}
        </Group>
        <Group label="Where">
          {SETTINGS.map((s) => (
            <Chip key={s} active={filters.settings.includes(s)} onClick={() => toggle("settings", s)}>
              {SETTING_LABEL[s]}
            </Chip>
          ))}
        </Group>
        <Group label="Who with">
          {COMPANIES.map((c) => (
            <Chip key={c} active={filters.companies.includes(c)} onClick={() => toggle("companies", c)}>
              {COMPANY_LABEL[c]}
            </Chip>
          ))}
        </Group>

        <button onClick={onClose} className="mt-2 w-full rounded-full bg-ink py-3.5 text-[15px] font-semibold text-white active:scale-[0.99]">
          Show quests
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_FILTERS };

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${
        active ? "bg-ink text-white" : "bg-surface text-ink shadow-[0_1px_0_rgba(21,23,28,0.05)]"
      }`}
    >
      {children}
    </button>
  );
}
