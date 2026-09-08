"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type SwipeDirection = "left" | "right" | "up";

interface Props {
  /** Re-mount per quest so drag state never leaks between cards. */
  children: React.ReactNode;
  labels: Record<SwipeDirection, string>;
  onSwipe: (dir: SwipeDirection) => void;
  /** When set, the card flies out in that direction (used by the buttons). */
  flyOut: SwipeDirection | null;
}

const THRESHOLD = 90;
const FLY_MS = 280;

/**
 * Tinder-style drag. Left = skip, right = accept, up = save. The card follows
 * the finger with a slight rotation; past the threshold it flies off and
 * `onSwipe` fires once the animation is done.
 */
export default function SwipeCard({ children, labels, onSwipe, flyOut }: Props) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [leaving, setLeaving] = useState<SwipeDirection | null>(null);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const fired = useRef(false);

  const fly = (dir: SwipeDirection) => {
    if (fired.current) return;
    fired.current = true;
    setLeaving(dir);
    window.setTimeout(() => onSwipe(dir), FLY_MS);
  };

  useEffect(() => {
    if (flyOut) fly(flyOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyOut]);

  const onDown = (e: ReactPointerEvent) => {
    if (leaving) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0, dragging: true });
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!start.current || leaving) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    // Ignore downward pulls: that gesture belongs to the page.
    setDrag({ x, y: Math.min(y, 0) * 0.9, dragging: true });
  };
  const onUp = () => {
    if (!start.current || leaving) return;
    start.current = null;
    const { x, y } = drag;
    if (-y > THRESHOLD && -y > Math.abs(x)) return fly("up");
    if (x > THRESHOLD) return fly("right");
    if (x < -THRESHOLD) return fly("left");
    setDrag({ x: 0, y: 0, dragging: false });
  };

  const dir: SwipeDirection | null =
    leaving ?? (-drag.y > 40 && -drag.y > Math.abs(drag.x) ? "up" : drag.x > 40 ? "right" : drag.x < -40 ? "left" : null);
  const progress = leaving ? 1 : Math.min(1, Math.max(Math.abs(drag.x), -drag.y) / THRESHOLD);

  const transform = leaving
    ? leaving === "up"
      ? "translate(0, -140%) rotate(0deg)"
      : `translate(${leaving === "right" ? 130 : -130}%, ${drag.y}px) rotate(${leaving === "right" ? 18 : -18}deg)`
    : `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 18}deg)`;

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative select-none"
      style={{
        touchAction: "none",
        transform,
        transition: drag.dragging ? "none" : `transform ${leaving ? FLY_MS : 320}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        opacity: leaving ? 0 : 1,
        cursor: drag.dragging ? "grabbing" : "grab",
      }}
    >
      {children}
      {dir && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full bg-surface px-5 py-2.5 font-display text-[17px] font-semibold uppercase tracking-[0.08em] text-ink shadow-[0_6px_24px_rgba(58,42,26,0.25)]"
          style={{ opacity: progress, transform: `translate(-50%, -50%) rotate(${dir === "left" ? 8 : dir === "right" ? -8 : 0}deg) scale(${0.85 + progress * 0.15})` }}
        >
          {labels[dir]}
        </span>
      )}
    </div>
  );
}
