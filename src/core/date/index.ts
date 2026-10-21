"use client";

import { useSyncExternalStore } from "react";

/**
 * Sample data stores dates as day offsets from "today" so the demo always
 * looks current. The server renders against a fixed demo date; the client
 * switches to the real date right after hydration.
 */
export const DEMO_TODAY = "2026-10-20T08:00:00";

const noop = () => () => {};
let clientNow: Date | null = null;
function getClientNow() {
  if (!clientNow) clientNow = new Date();
  return clientNow;
}
const serverNow = new Date(DEMO_TODAY);

export function useNow(): Date {
  return useSyncExternalStore(noop, getClientNow, () => serverNow);
}

export function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function addDays(d: Date, days: number) {
  const c = startOfDay(d);
  c.setDate(c.getDate() + days);
  return c;
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLongDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function weekday(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

/** "today", "tomorrow", "in 5 days", "3 days ago", or a date for far ones. */
export function relativeDay(offset: number, now: Date) {
  if (offset === 0) return "today";
  if (offset === 1) return "tomorrow";
  if (offset === -1) return "yesterday";
  if (offset > 1 && offset < 7) return weekday(addDays(now, offset));
  if (offset < 0 && offset > -7) return `${-offset} days ago`;
  return formatDay(addDays(now, offset));
}

export function greeting(now: Date) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Countdown wording: "today", "tomorrow", "in 9 days", "2 days ago". */
export function untilLabel(offset: number) {
  if (offset === 0) return "today";
  if (offset === 1) return "tomorrow";
  if (offset > 1) return `in ${offset} days`;
  return offset === -1 ? "yesterday" : `${-offset} days ago`;
}
