import { describe, expect, it } from "vitest";
import { ACCOUNTS, MESSAGES, PROMO_SENDERS, mockEmailProvider } from "./mock";
import { filterMessages, groupNewsletters, isUnread, moveFocus, promoTotal, tabCounts, toProposals } from "./logic";

const empty = { read: {}, archived: {} };

describe("inbox filtering", () => {
  it("Needs action shows only actionable mail, urgent first", () => {
    const list = filterMessages(MESSAGES, { account: "all", tab: "action", query: "" });
    expect(list.every((m) => m.needsAction)).toBe(true);
    expect(list[0].urgent).toBe(true);
  });
  it("each category tab only contains its kinds", () => {
    expect(filterMessages(MESSAGES, { account: "all", tab: "bills", query: "" }).every((m) => ["bill", "renewal"].includes(m.category))).toBe(true);
    expect(filterMessages(MESSAGES, { account: "all", tab: "receipts", query: "" }).every((m) => m.category === "receipt")).toBe(true);
    expect(filterMessages(MESSAGES, { account: "all", tab: "appointments", query: "" }).map((m) => m.id)).toEqual(["m2", "m7"]);
  });
  it("filters by account and searches sender, address and subject", () => {
    expect(filterMessages(MESSAGES, { account: "work", tab: "all", query: "" }).every((m) => m.account === "work")).toBe(true);
    expect(filterMessages(MESSAGES, { account: "all", tab: "all", query: "DINNER" }).map((m) => m.id)).toEqual(["m3"]);
    expect(filterMessages(MESSAGES, { account: "all", tab: "all", query: "pipewise" }).map((m) => m.id)).toEqual(["m8"]);
  });
  it("hides archived mail and can show only archived", () => {
    const state = { read: {}, archived: { m18: true } };
    expect(filterMessages(MESSAGES, { account: "all", tab: "all", query: "", state }).some((m) => m.id === "m18")).toBe(false);
    expect(filterMessages(MESSAGES, { account: "all", tab: "all", query: "", state, showArchived: true }).map((m) => m.id)).toEqual(["m18"]);
  });
  it("tracks read state over the fixture default", () => {
    const m = MESSAGES.find((x) => x.id === "m2")!;
    expect(isUnread(m, empty)).toBe(true);
    expect(isUnread(m, { read: { m2: true }, archived: {} })).toBe(false);
    expect(tabCounts(MESSAGES, { read: { m2: true }, archived: {} }, "all").appointments).toBe(1);
  });
  it("groups newsletters into one row", () => {
    const rows = groupNewsletters(filterMessages(MESSAGES, { account: "all", tab: "all", query: "" }));
    const groups = rows.filter((r) => r.kind === "newsletters");
    expect(groups).toHaveLength(1);
    expect(groups[0].kind === "newsletters" && groups[0].messages.length).toBe(3);
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

describe("privacy", () => {
  it("uses only @example.com addresses", () => {
    const addresses = [...MESSAGES.map((m) => m.fromAddress), ...ACCOUNTS.map((a) => a.address)];
    for (const a of addresses) expect(a).toMatch(/^[a-z0-9._-]+@example\.com$/);
  });
  it("every message explains its categorization", () => {
    for (const m of MESSAGES) expect(m.why.length).toBeGreaterThan(5);
  });
});

describe("keyboard focus", () => {
  const ids = ["a", "b", "c"];
  it("starts at the top going down and the bottom going up", () => {
    expect(moveFocus(ids, null, 1)).toBe("a");
    expect(moveFocus(ids, null, -1)).toBe("c");
  });
  it("moves and clamps at the ends", () => {
    expect(moveFocus(ids, "a", 1)).toBe("b");
    expect(moveFocus(ids, "c", 1)).toBe("c");
    expect(moveFocus(ids, "a", -1)).toBe("a");
  });
  it("recovers when the focused message disappeared (archived)", () => {
    expect(moveFocus(ids, "gone", 1)).toBe("a");
    expect(moveFocus([], "a", 1)).toBeNull();
  });
});
