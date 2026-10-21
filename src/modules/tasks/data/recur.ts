import { toISODate } from "@/core/date";
import type { Task } from "./types";

/** Repeat choices offered in the editor. A task may also carry a custom number of days. */
export const REPEAT_OPTIONS: { days: number; label: string }[] = [
  { days: 7, label: "Every week" },
  { days: 14, label: "Every 2 weeks" },
  { days: 30, label: "Every month" },
  { days: 90, label: "Every 3 months" },
  { days: 180, label: "Every 6 months" },
  { days: 365, label: "Every year" },
];

export function repeatLabel(days: number) {
  return REPEAT_OPTIONS.find((o) => o.days === days)?.label ?? `Every ${days} days`;
}

export { toISODate };

/** The ISO date `days` after `from`, in local time. */
export function addDaysISO(from: Date, days: number) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** The next occurrence of a repeating task, due `repeatEveryDays` after `now`. Null when it doesn't repeat. */
export function nextOccurrence(t: Task, now: Date): Omit<Task, "id" | "createdAt"> | null {
  if (!t.repeatEveryDays || t.repeatEveryDays < 1) return null;
  return {
    title: t.title,
    notes: t.notes,
    category: t.category,
    kind: t.kind,
    status: "open",
    repeatEveryDays: t.repeatEveryDays,
    linkedTo: t.linkedTo,
    threadId: t.threadId,
    dueDate: addDaysISO(now, t.repeatEveryDays),
    spawnedFrom: t.id,
  };
}

/**
 * Mark a task done. A repeating task also gets its next occurrence, once:
 * completing it again after an undo never creates a duplicate.
 */
export function completeInList(tasks: Task[], id: string, now: Date, newId: string): Task[] {
  const t = tasks.find((x) => x.id === id);
  if (!t || t.status === "done") return tasks;
  const done = tasks.map((x) => (x.id === id ? { ...x, status: "done" as const, completedAt: now.getTime(), waitingOn: undefined } : x));
  const next = nextOccurrence(t, now);
  if (!next || tasks.some((x) => x.spawnedFrom === id)) return done;
  return [{ ...next, id: newId, createdAt: now.getTime() }, ...done];
}

/** Reopen a done task and take back the occurrence that completing it created (if still untouched). */
export function reopenInList(tasks: Task[], id: string, status: "open" | "waiting" = "open"): Task[] {
  return tasks
    .filter((x) => !(x.spawnedFrom === id && x.status === "open"))
    .map((x) => (x.id === id ? { ...x, status, completedAt: undefined } : x));
}

/** Open (not done) tasks tied to a given upkeep item. */
export function openLinked(tasks: Task[], kind: "maintenance", id: string) {
  return tasks.filter((t) => t.status !== "done" && t.linkedTo?.kind === kind && t.linkedTo.id === id);
}
