import { describe, expect, it } from "vitest";
import { completeInList } from "@/modules/tasks/data/recur";
import { SEED_TASKS } from "@/modules/tasks/data/mock";
import { SEED_COVERAGE, SEED_MAINTENANCE } from "./mock";
import { coverageState, lastDoneOffset, nextDue, sortMaintenance } from "./logic";

const now = new Date("2026-10-20T09:00:00");
const furnace = SEED_MAINTENANCE[0];

describe("home maintenance", () => {
  it("computes next due from the last time it was done", () => {
    expect(nextDue(furnace, now)).toEqual({ offset: -14, state: "overdue" });
    expect(nextDue(SEED_MAINTENANCE[1], now)).toEqual({ offset: 4, state: "soon" });
    expect(nextDue(SEED_MAINTENANCE[4], now).state).toBe("ok");
  });
  it("lists the most pressing first", () => {
    expect(sortMaintenance(SEED_MAINTENANCE, now)[0].id).toBe("h1");
  });
  it("flags coverage ending within 30 days", () => {
    expect(coverageState(SEED_COVERAGE[0])).toBe("soon");
    expect(coverageState(SEED_COVERAGE[1])).toBe("ok");
  });
});

describe("upkeep shares state with linked tasks", () => {
  it("a date set by Mark done beats the seeded sample", () => {
    expect(lastDoneOffset({ ...furnace, lastDoneDate: "2026-10-18" }, now)).toBe(-2);
    expect(nextDue({ ...furnace, lastDoneDate: "2026-10-18" }, now)).toEqual({ offset: 88, state: "ok" });
  });
  it("finishing the linked task brings the upkeep item up to date", () => {
    const done = completeInList(SEED_TASKS, "k12", now, "next1");
    expect(nextDue(furnace, now, done)).toEqual({ offset: 90, state: "ok" });
    // and the next occurrence is waiting on the list, due 90 days out
    const next = done.find((t) => t.id === "next1")!;
    expect(next).toMatchObject({ status: "open", dueDate: "2027-01-18", linkedTo: { kind: "maintenance", id: "h1" } });
  });
  it("undoing the task reverts the upkeep item (nothing is stored twice)", () => {
    const done = completeInList(SEED_TASKS, "k12", now, "next1");
    const reopened = done.filter((t) => t.id !== "next1").map((t) => (t.id === "k12" ? { ...t, status: "open" as const, completedAt: undefined } : t));
    expect(nextDue(furnace, now, reopened)).toEqual({ offset: -14, state: "overdue" });
  });
  it("ignores placeholder timestamps on seeded done tasks", () => {
    const seededDone = [{ ...SEED_TASKS[0], status: "done" as const, completedAt: 0, linkedTo: { kind: "maintenance" as const, id: "h1" } }];
    expect(lastDoneOffset(furnace, now, seededDone)).toBe(-104);
  });
});
