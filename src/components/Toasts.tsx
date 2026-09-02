"use client";

import { useEffect, useState } from "react";
import { onToast } from "@/lib/feedback";

export default function Toasts() {
  const [msg, setMsg] = useState<string | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let hide: ReturnType<typeof setTimeout> | undefined;
    let clear: ReturnType<typeof setTimeout> | undefined;
    return onToast((m) => {
      clearTimeout(hide);
      clearTimeout(clear);
      setMsg(m);
      setShown(true);
      hide = setTimeout(() => setShown(false), 1800);
      clear = setTimeout(() => setMsg(null), 2100);
    });
  }, []);

  if (!msg) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
      style={{
        bottom: "calc(var(--tabbar-h) + max(var(--safe-b), 12px) + 14px)",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.24s ease, transform 0.24s ease",
      }}
    >
      <div className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{msg}</div>
    </div>
  );
}
