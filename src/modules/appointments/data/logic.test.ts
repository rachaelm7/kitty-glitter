import { describe, expect, it } from "vitest";
import { SEED_APPOINTMENTS } from "./mock";
import { countByStatus, needsAttention, nextActions, officeDraft } from "./logic";
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
