import type { Task } from "@/modules/tasks";
import type { Coverage, MaintenanceItem } from "./types";

export type DueState = "overdue" | "soon" | "ok";

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const REAL_TIME = 1e12; // seed tasks use tiny placeholder timestamps

/**
 * Days since (negative) the item was last done. It uses the most recent of:
 * the seeded sample value, a date set by "Mark done" here, and any linked
 * task you've completed. Reopening a task therefore reverts it automatically.
 */
export function lastDoneOffset(m: MaintenanceItem, now: Date, tasks: Task[] = []): number {
  const today = startOfDay(now);
  const offsets = [m.lastDoneOffset];
  if (m.lastDoneDate) offsets.push(Math.round((new Date(m.lastDoneDate + "T00:00:00").getTime() - today) / DAY));
  for (const t of tasks) {
    if (t.status === "done" && t.linkedTo?.kind === "maintenance" && t.linkedTo.id === m.id && t.completedAt && t.completedAt > REAL_TIME) {
      offsets.push(Math.round((startOfDay(new Date(t.completedAt)) - today) / DAY));
    }
  }
  return Math.max(...offsets);
}

/** Next due date is computed from the last time it was done; nothing is guessed. */
export function nextDue(m: MaintenanceItem, now: Date, tasks: Task[] = []) {
  const offset = lastDoneOffset(m, now, tasks) + m.everyDays;
  const state: DueState = offset < 0 ? "overdue" : offset <= 14 ? "soon" : "ok";
  return { offset, state };
}

export function sortMaintenance(items: MaintenanceItem[], now: Date, tasks: Task[] = []) {
  return [...items].sort((a, b) => nextDue(a, now, tasks).offset - nextDue(b, now, tasks).offset);
}

export function coverageState(c: Coverage): DueState {
  return c.endsOffset < 0 ? "overdue" : c.endsOffset <= 30 ? "soon" : "ok";
}
