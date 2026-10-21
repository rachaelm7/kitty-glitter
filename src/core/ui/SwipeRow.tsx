"use client";

import { useRef, useState, type ReactNode } from "react";
import { SWIPE_THRESHOLD, clampDrag, decideSwipe, isHorizontalIntent } from "./swipe";
import { cx } from "./primitives";

/**
 * Touch swipe actions for a list row: swipe right for the "start" action,
 * left for the "end" action. Touch and pen only, so mouse users keep normal
 * text selection; the row's regular buttons remain the accessible route to
 * the same actions. Vertical scrolling is untouched (touch-action: pan-y).
 */
export function SwipeRow({
  children,
  onSwipeStart,
  onSwipeEnd,
  startLabel,
  endLabel,
  startIcon,
  endIcon,
}: {
  children: ReactNode;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  startLabel: string;
  endLabel: string;
  startIcon: ReactNode;
  endIcon: ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const origin = useRef<{ x: number; y: number; t: number; id: number } | null>(null);
  const horizontal = useRef(false);
  const moved = useRef(false);

  const armed = Math.abs(dx) >= SWIPE_THRESHOLD;

  function reset() {
    origin.current = null;
    horizontal.current = false;
    setDragging(false);
    setDx(0);
  }

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className={cx("absolute inset-0 flex items-center justify-start bg-lavender-soft pl-5 text-lavender", dx > 0 ? "visible" : "invisible")}>
        <span className={cx("flex items-center gap-2 text-sm font-semibold transition-transform", dx >= SWIPE_THRESHOLD && "scale-110")}>
          {startIcon} {startLabel}
        </span>
      </div>
      <div aria-hidden className={cx("absolute inset-0 flex items-center justify-end bg-accent-soft pr-5 text-accent", dx < 0 ? "visible" : "invisible")}>
        <span className={cx("flex items-center gap-2 text-sm font-semibold transition-transform", dx <= -SWIPE_THRESHOLD && "scale-110")}>
          {endLabel} {endIcon}
        </span>
      </div>
      <div
        data-swipe-row
        data-armed={armed || undefined}
        className={cx("relative bg-surface [touch-action:pan-y]", !dragging && "transition-transform duration-200")}
        style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          origin.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, id: e.pointerId };
          horizontal.current = false;
          moved.current = false;
        }}
        onPointerMove={(e) => {
          const o = origin.current;
          if (!o || o.id !== e.pointerId) return;
          const ddx = e.clientX - o.x;
          const ddy = e.clientY - o.y;
          if (!horizontal.current) {
            if (!isHorizontalIntent(ddx, ddy)) return;
            horizontal.current = true;
            moved.current = true;
            setDragging(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          setDx(clampDrag(ddx));
        }}
        onPointerUp={(e) => {
          const o = origin.current;
          if (!o || o.id !== e.pointerId) return;
          if (horizontal.current) {
            const decided = decideSwipe(e.clientX - o.x, e.timeStamp - o.t);
            if (decided) navigator.vibrate?.(8);
            if (decided === "right") onSwipeStart?.();
            if (decided === "left") onSwipeEnd?.();
          }
          reset();
        }}
        onPointerCancel={reset}
        onClickCapture={(e) => {
          // A swipe must not also count as a tap on the row.
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
