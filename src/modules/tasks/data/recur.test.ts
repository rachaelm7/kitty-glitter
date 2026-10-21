import { describe, expect, it } from "vitest";
import { SEED_TASKS } from "./mock";
import { addDaysISO, completeInList, nextOccurrence, openLinked, reopenInList, repeatLabel } from "./recur";
import type { Task } from "./types";

const now = new Date("2026-10-20T09:00:00");
const filter: Task = { id: "r1", title: "Replace the furnace filter", status: "open", category: "Home", repeatEveryDays: 90, linkedTo: { kind: "maintenance", id: "h1" }, dueDate: "2026-10-01", emailId: "m1", createdAt: 1 };

describe("recurring tasks", () => {
  it("dates the next occurrence from the day it was completed, not from the old due date", () => {
    expect(addDaysISO(now, 90)).toBe("2027-01-18");
    const next = nextOccurrence(filter, now)!;
    expect(next).toMatchObject({ title: filter.title, status: "open", dueDate: "2027-01-18", spawnedFrom: "r1", repeatEveryDays: 90 });
    expect(next.emailId).toBeUndefined(); // an old email link doesn't carry over
  });
  it("only repeating tasks spawn", () => {
    expect(nextOccurrence({ ...filter, repeatEveryDays: undefined }, now)).toBeNull();
  });
  it("completing creates exactly one next occurrence, even after an undo", () => {
    const once = completeInList([filter], "r1", now, "n1");
    expect(once.map((t) => [t.id, t.status])).toEqual([["n1", "open"], ["r1", "done"]]);
    const reopened = reopenInList(once, "r1");
    expect(reopened.map((t) => [t.id, t.status])).toEqual([["r1", "open"]]); // the spawned one is taken back
    const again = completeInList(reopened, "r1", now, "n2");
    expect(again.filter((t) => t.status === "open")).toHaveLength(1);
  });
  it("keeps a spawned occurrence you've already finished", () => {
    const once = completeInList([filter], "r1", now, "n1");
    const finished = completeInList(once, "n1", now, "n2");
    const reopened = reopenInList(finished, "r1");
    expect(reopened.find((t) => t.id === "n1")?.status).toBe("done");
  });
  it("non-repeating tasks just complete", () => {
    const list = completeInList([{ ...filter, repeatEveryDays: undefined }], "r1", now, "n1");
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe("done");
  });
  it("finds the open task linked to an upkeep item and labels repeats", () => {
    expect(openLinked([filter], "maintenance", "h1")).toHaveLength(1);
    expect(openLinked(completeInList([filter], "r1", now, "n1"), "maintenance", "h1").map((t) => t.id)).toEqual(["n1"]);
    expect(repeatLabel(90)).toBe("Every 3 months");
    expect(repeatLabel(45)).toBe("Every 45 days");
  });
  it("seed data links furnace, smoke detector and gutter tasks to Home upkeep", () => {
    const linked = SEED_TASKS.filter((t) => t.linkedTo);
    expect(linked.map((t) => t.linkedTo!.id).sort()).toEqual(["h1", "h2", "h4"]);
    expect(linked.every((t) => t.repeatEveryDays)).toBe(true);
  });
});
