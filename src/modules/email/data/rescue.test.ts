import { describe, expect, it } from "vitest";
import { ACCOUNTS } from "./mock";
import { PILES, defaultPlan, generateRescueInbox, protectReason, splitInbox, summarizePlan } from "./rescue";

const inbox = generateRescueInbox();

describe("rescue inbox generator", () => {
  it("is deterministic and matches the account unread counts", () => {
    expect(generateRescueInbox()).toEqual(inbox);
    expect(inbox.length).toBe(ACCOUNTS.reduce((n, a) => n + a.unread, 0));
  });
  it("includes every kind the brief asks for", () => {
    const kinds = new Set(inbox.map((m) => m.kind));
    for (const k of ["newsletter", "receipt", "personal", "bill", "appointment", "promo"]) expect(kinds.has(k as never)).toBe(true);
  });
});

describe("important-email protection", () => {
  const { protectedMsgs, piles } = splitInbox(inbox);
  const inPiles = PILES.flatMap((p) => piles[p.id]);

  it("never puts protected mail in a bulk pile", () => {
    expect(inPiles.some((m) => protectReason(m))).toBe(false);
    const ids = new Set(inPiles.map((m) => m.id));
    expect(protectedMsgs.some((m) => ids.has(m.id))).toBe(false);
  });

  it("protects bills, appointments, people, security and deadlines", () => {
    for (const m of inbox) {
      if (["bill", "appointment", "personal", "security"].includes(m.kind) || m.deadline || m.knownContact) {
        expect(protectReason(m)).not.toBeNull();
      }
    }
  });

  it("plan totals add up and protected mail stays unread and untouched", () => {
    const s = summarizePlan(inbox, defaultPlan());
    expect(s.markRead + s.archive + s.leave + s.protectedCount).toBe(s.total);
    expect(s.unreadAfter).toBe(s.protectedCount + s.leave);
  });
});
