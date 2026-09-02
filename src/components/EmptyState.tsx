export default function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="fade-in flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-ink/15 px-8 py-16 text-center">
      <h3 className="font-display text-[22px] font-semibold">{title}</h3>
      <p className="mt-2 max-w-[30ch] text-[15px] leading-snug text-ink-2">{body}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
