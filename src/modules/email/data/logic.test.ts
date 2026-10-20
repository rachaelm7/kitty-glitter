import { describe, expect, it } from "vitest";
import { MESSAGES, PROMO_SENDERS, mockEmailProvider } from "./mock";
import { filterMessages, promoTotal, toProposals } from "./logic";

describe("filterMessages", () => {
  it("priority view shows only messages that need action, urgent first", () => {
    const list = filterMessages(MESSAGES, { account: "all", view: "priority", query: "" });
    expect(list.every((m) => m.needsAction)).toBe(true);
    expect(list[0].urgent).toBe(true);
  });

  it("filters by account and search text", () => {
    const work = filterMessages(MESSAGES, { account: "work", view: "everything", query: "" });
    expect(work.every((m) => m.account === "work")).toBe(true);
    const q = filterMessages(MESSAGES, { account: "all", view: "everything", query: "DINNER" });
    expect(q.map((m) => m.id)).toEqual(["m5"]);
  });
});

describe("cleanup proposals", () => {
  it("drops Keep and unset choices", () => {
    expect(toProposals({ s1: "unsubscribe", s2: "keep", s3: undefined, s4: "spam" })).toEqual([
      { senderId: "s1", choice: "unsubscribe" },
      { senderId: "s4", choice: "spam" },
    ]);
  });

  it("preview counts emails without changing data", () => {
    const before = JSON.stringify(PROMO_SENDERS);
    expect(mockEmailProvider.previewCleanup([{ senderId: "s1", choice: "unsubscribe" }])).toEqual({ senders: 1, emails: 14 });
    expect(JSON.stringify(PROMO_SENDERS)).toBe(before);
    expect(promoTotal(PROMO_SENDERS)).toBe(60);
  });
});

describe("fictional data", () => {
  it("uses only reserved example domains for addresses", () => {
    const addresses = [...MESSAGES.map((m) => m.fromAddress), ...mockEmailProvider.listAccounts().map((a) => a.address)];
    for (const a of addresses) expect(a).toMatch(/@([a-z0-9-]+\.)*example(\.(com|org|net))?$/);
  });
});
