import type { Task } from "./types";

export type TaskView = "today" | "upcoming" | "waiting" | "done";

const DAY = 86_400_000;

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Days from today to the task's due date, or undefined when it has none. */
export function dueOffset(t: Pick<Task, "dueDayOffset" | "dueDate">, now: Date): number | undefined {
  if (t.dueDate) return Math.round((new Date(t.dueDate + "T00:00:00").getTime() - startOfDay(now).getTime()) / DAY);
  return t.dueDayOffset;
}

export function inView(t: Task, view: TaskView, now: Date) {
  const off = dueOffset(t, now);
  switch (view) {
    case "today":
      return t.status === "open" && off !== undefined && off <= 0;
    case "upcoming":
      return t.status === "open" && (off === undefined || off > 0);
    case "waiting":
      return t.status === "waiting";
    case "done":
      return t.status === "done";
  }
}

export function viewTasks(tasks: Task[], view: TaskView, now: Date) {
  const list = tasks.filter((t) => inView(t, view, now));
  if (view === "done") return list.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  return list.sort((a, b) => {
    const da = dueOffset(a, now) ?? Infinity;
    const db = dueOffset(b, now) ?? Infinity;
    return da - db || b.createdAt - a.createdAt;
  });
}

export function viewCounts(tasks: Task[], now: Date) {
  return {
    today: tasks.filter((t) => inView(t, "today", now)).length,
    upcoming: tasks.filter((t) => inView(t, "upcoming", now)).length,
    waiting: tasks.filter((t) => inView(t, "waiting", now)).length,
    done: tasks.filter((t) => inView(t, "done", now)).length,
  };
}

/** Open tasks first (by due date), then done ones. */
export function sortTasks(ts: Task[]) {
  return [...ts].sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || b.createdAt - a.createdAt);
}

export { toISODate } from "./recur";
