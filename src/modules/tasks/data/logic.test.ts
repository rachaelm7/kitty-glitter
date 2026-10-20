import { describe, expect, it } from "vitest";
import { SEED_TASKS } from "./mock";
import { dueOffset, viewCounts, viewTasks } from "./logic";

const now = new Date("2026-10-20T09:00:00");

describe("task views", () => {
  it("splits tasks into Today, Upcoming, Waiting On and Completed", () => {
    const c = viewCounts(SEED_TASKS, now);
    expect(c.today + c.upcoming + c.waiting + c.done).toBe(SEED_TASKS.length);
    expect(viewTasks(SEED_TASKS, "today", now).map((t) => t.id).sort()).toEqual(["k1", "k2"]);
    expect(viewTasks(SEED_TASKS, "waiting", now).every((t) => t.status === "waiting" && t.waitingOn)).toBe(true);
  });
  it("puts undated tasks in Upcoming after dated ones and never invents a date", () => {
    const up = viewTasks(SEED_TASKS, "upcoming", now);
    const lastDated = up.map((t) => dueOffset(t, now)).lastIndexOf(up.map((t) => dueOffset(t, now)).filter((x) => x !== undefined).pop());
    expect(up.slice(lastDated + 1).every((t) => dueOffset(t, now) === undefined)).toBe(true);
    expect(dueOffset(SEED_TASKS.find((t) => t.id === "k4")!, now)).toBeUndefined();
  });
  it("reads user-set ISO dates", () => {
    expect(dueOffset({ dueDate: "2026-10-23" }, now)).toBe(3);
  });
});
