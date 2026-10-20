import { describe, expect, it } from "vitest";
import { SEED_APPOINTMENTS } from "@/modules/appointments/data/mock";
import { RENEWALS } from "@/modules/bills/data/mock";
import { MESSAGES } from "@/modules/email/data/mock";
import { SEED_TASKS } from "@/modules/tasks/data/mock";
import { SEED_THREADS } from "@/modules/threads/data/mock";
import { SEED_TRIPS } from "@/modules/travel/data/mock";
import { buildThreadView } from "./threadView";

const now = new Date("2026-10-20T09:00:00");
const src = { messages: MESSAGES, tasks: SEED_TASKS, appointments: SEED_APPOINTMENTS, trips: SEED_TRIPS, renewals: RENEWALS, notes: [], now };
const view = (id: string) => buildThreadView(SEED_THREADS.find((t) => t.id === id)!, src);

describe("Life Thread views", () => {
  it("medical follow-up gathers the referral email, appointment and task", () => {
    const v = view("t-derm");
    expect(v.emails.map((m) => m.id)).toEqual(["m7"]);
    expect(v.appointments.map((a) => a.id)).toEqual(["ap1"]);
    expect(v.tasks.map((t) => t.id)).toEqual(["k4"]);
    expect(v.past.map((i) => i.dayOffset)).toEqual([...v.past.map((i) => i.dayOffset)].sort((a, b) => a - b));
  });
  it("trip thread puts bookings in the future", () => {
    const v = view("t-lisbon");
    expect(v.upcoming.length).toBeGreaterThan(3);
    expect(v.upcoming.every((i) => i.dayOffset > 0)).toBe(true);
  });
  it("every seed thread's next step points at a real email or task", () => {
    for (const t of SEED_THREADS) {
      if (t.next?.emailId) expect(MESSAGES.some((m) => m.id === t.next!.emailId)).toBe(true);
      if (t.next?.taskId) expect(SEED_TASKS.some((k) => k.id === t.next!.taskId)).toBe(true);
    }
  });
  it("every thread id used by fixtures exists", () => {
    const ids = new Set(SEED_THREADS.map((t) => t.id));
    const used = [...MESSAGES, ...SEED_TASKS, ...SEED_APPOINTMENTS, ...SEED_TRIPS, ...RENEWALS].map((x) => x.threadId).filter(Boolean);
    for (const id of used) expect(ids.has(id!)).toBe(true);
  });
});
