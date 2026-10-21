import { describe, expect, it } from "vitest";
import { SEED_APPOINTMENTS } from "@/modules/appointments/data/mock";
import { MESSAGES } from "@/modules/email/data/mock";
import { SEED_TASKS } from "@/modules/tasks/data/mock";
import { completeInList } from "@/modules/tasks/data/recur";
import { SEED_THREADS } from "@/modules/threads/data/mock";
import { buildChanges, summarizeChanges, type ChangeSources } from "./changes";
import { deriveThreadState } from "./threadState";

const now = new Date("2026-10-20T09:00:00");
const inbox = { read: {}, archived: {} };
const src = (over: Partial<ChangeSources> = {}): ChangeSources => ({ messages: MESSAGES, inbox, tasks: SEED_TASKS, appointments: SEED_APPOINTMENTS, threads: SEED_THREADS, now, ...over });
const thread = (id: string) => SEED_THREADS.find((t) => t.id === id)!;

describe("what changed since yesterday", () => {
  it("lists new mail that needs you, newest and most urgent first", () => {
    const emails = buildChanges(src()).filter((c) => c.kind === "email");
    expect(emails.length).toBeGreaterThan(0);
    expect(emails.every((c) => c.dayOffset >= -1)).toBe(true);
    expect(emails[0].dayOffset).toBe(0);
    expect(emails[0].urgent).toBe(true);
  });
  it("leaves out mail you've read or archived, and mail older than yesterday", () => {
    const base = buildChanges(src()).filter((c) => c.kind === "email").map((c) => c.emailId);
    expect(base).not.toContain("m7"); // 6 days old
    const quiet = buildChanges(src({ inbox: { read: { m2: true }, archived: { m1: true } } })).filter((c) => c.kind === "email").map((c) => c.emailId);
    expect(quiet).not.toContain("m2");
    expect(quiet).not.toContain("m1");
  });
  it("includes thread updates without repeating an email from the same thread and day", () => {
    const changes = buildChanges(src());
    expect(changes.some((c) => c.kind === "update" && c.threadId === "t-car")).toBe(true);
    // t-dental has a new email today and a reminder event the same day: only the email shows.
    expect(changes.filter((c) => c.threadId === "t-dental" && c.dayOffset === 0)).toHaveLength(1);
  });
  it("reports tasks you finished since yesterday and what you're still waiting on", () => {
    const done = completeInList(SEED_TASKS, "k1", now, "x");
    const changes = buildChanges(src({ tasks: done }));
    expect(changes.find((c) => c.kind === "finished")).toMatchObject({ text: "You finished: Confirm your dental appointment", dayOffset: 0, threadId: "t-dental" });
    expect(changes.find((c) => c.kind === "waiting")?.text).toBe("Still waiting on 2 things");
  });
  it("summarizes in one calm sentence", () => {
    expect(summarizeChanges(buildChanges(src()))).toMatch(/new emails? need(s)? you/);
    expect(summarizeChanges([])).toBe("Nothing new since yesterday.");
  });
});

describe("thread next step follows its tasks", () => {
  it("keeps the written next step while it's still open", () => {
    const s = deriveThreadState(thread("t-derm"), SEED_TASKS, now);
    expect(s.next).toMatchObject({ taskId: "k4" });
    expect(s.advanced).toBe(false);
  });
  it("advances to the next open task when the written one is finished", () => {
    const tasks = [...SEED_TASKS, { id: "n1", title: "Bring the referral letter", status: "open" as const, category: "Health" as const, threadId: "t-derm", createdAt: 99 }];
    const done = completeInList(tasks, "k4", now, "z");
    const s = deriveThreadState(thread("t-derm"), done, now);
    expect(s.next).toMatchObject({ label: "Bring the referral letter", taskId: "n1" });
    expect(s.advanced).toBe(true);
    expect(s.allDone).toBe(false);
  });
  it("says everything's done when no tasks are left, and never invents a step", () => {
    const done = completeInList(SEED_TASKS, "k4", now, "z");
    const s = deriveThreadState(thread("t-derm"), done, now);
    expect(s.next).toBeNull();
    expect(s.allDone).toBe(true);
    expect(s.status).toBe("Everything's done");
  });
  it("an email-based step is met when the task made from it is done", () => {
    const done = completeInList(SEED_TASKS, "k1", now, "z"); // "Confirm your dental appointment" (from email m2)
    const s = deriveThreadState(thread("t-dental"), done, now);
    expect(s.next).toBeNull();
    expect(s.allDone).toBe(true);
  });
  it("waiting follows waiting tasks and turns into a check-back step", () => {
    const s = deriveThreadState(thread("t-return"), SEED_TASKS.map((t) => (t.id === "k6" ? { ...t, status: "done" as const } : t)), now);
    expect(s.waitingOn).toContain("Lumen & Loom");
    expect(s.next).toMatchObject({ waiting: true, taskId: "k7" });
  });
  it("threads without tasks keep their written step", () => {
    const s = deriveThreadState(thread("t-party"), SEED_TASKS.filter((t) => t.threadId !== "t-party"), now);
    expect(s.next?.emailId).toBe("m13");
    expect(s.allDone).toBe(false);
    expect(s.waitingOn).toBe("Priya to confirm the park");
  });
});
