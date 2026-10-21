/** Pure swipe rules, kept separate from the component so they can be tested. */
export const SWIPE_THRESHOLD = 72; // px of drag that commits an action
export const FLICK_DISTANCE = 40; // a quick flick commits after this much…
export const FLICK_SPEED = 0.5; // …at this speed (px per ms)
export const MAX_DRAG = 132;
export const INTENT_SLOP = 10; // px before we decide the gesture is horizontal

export type SwipeDirection = "left" | "right";

/** Horizontal wins only when it clearly dominates, so vertical scrolling is never hijacked. */
export function isHorizontalIntent(dx: number, dy: number) {
  return Math.abs(dx) > INTENT_SLOP && Math.abs(dx) > Math.abs(dy) * 1.5;
}

export function clampDrag(dx: number) {
  return Math.max(-MAX_DRAG, Math.min(MAX_DRAG, dx));
}

/** Which action (if any) a finished swipe commits. */
export function decideSwipe(dx: number, ms: number): SwipeDirection | null {
  const distance = Math.abs(dx);
  const speed = ms > 0 ? distance / ms : 0;
  if (distance >= SWIPE_THRESHOLD || (distance >= FLICK_DISTANCE && speed >= FLICK_SPEED)) {
    return dx < 0 ? "left" : "right";
  }
  return null;
}
