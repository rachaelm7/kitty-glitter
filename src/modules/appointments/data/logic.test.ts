import { describe, expect, it } from "vitest";
import { SEED_APPOINTMENTS } from "./mock";
import { countByStatus, needsAttention, nextActions, officeDraft, validateAppointment } from "./logic";
import { STATUSES } from "./types";

const byId = (id: string) => SEED_APPOINTMENTS.find((a) => a.id === id)!;

describe("appointment next actions", () => {
  it("flags a referral that has waited too long to schedule", () => {
    expect(needsAttention(byId("ap1"))).toBe(true);
    expect(nextActions(byId("ap1"))[0].text).toMatch(/Call Brightwater Dermatology/);
  });
  it("has no actions once completed", () => {
    expect(nextActions(byId("ap6"))).toEqual([]);
  });
  it("covers all six statuses in the sample data", () => {
    const counts = countByStatus(SEED_APPOINTMENTS);
    expect(STATUSES.every((s) => counts[s] >= 1)).toBe(true);
  });
  it("never gives clinical advice", () => {
    const clinical = /\b(diagnos|symptom|dose|dosage|medicat|treat|prescri|normal range|abnormal|you (have|might have)|take \d)/i;
    for (const a of SEED_APPOINTMENTS) {
      for (const s of STATUSES) {
        const variant = { ...a, status: s };
        for (const n of nextActions(variant)) expect(n.text).not.toMatch(clinical);
        expect(officeDraft(variant)).not.toMatch(clinical);
      }
    }
  });
  it("uses only fictional 555-01xx numbers", () => {
    for (const a of SEED_APPOINTMENTS) expect(a.contact).toMatch(/^555-01\d\d$/);
  });
});

describe("appointment form rules", () => {
  const base = { title: "Eye exam", provider: "Clearview Optometry", status: "needs-scheduling" as const, date: "", time: "" };
  it("needs a name and an office", () => {
    expect(validateAppointment({ ...base, title: " ", provider: "" })).toEqual({ title: expect.any(String), provider: expect.any(String) });
  });
  it("needs a date only once it is scheduled", () => {
    expect(validateAppointment(base)).toEqual({});
    expect(validateAppointment({ ...base, status: "scheduled" }).date).toMatch(/need a date/);
    expect(validateAppointment({ ...base, status: "scheduled", date: "2026-11-02" })).toEqual({});
  });
  it("words new items naturally, without a phone number or a zero-day wait", () => {
    const fresh = { ...byId("ap1"), contact: "", statusSince: 0 };
    expect(nextActions(fresh)[0].text).toBe("Call Brightwater Dermatology to book. The referral was sent today.");
  });
});
