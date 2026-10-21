import type { AccountId, CleanupChoice, CleanupProposal, Message, PromoSender } from "./types";

export type InboxTab = "all" | "action" | "personal" | "appointments" | "bills" | "receipts" | "promotions";

export const TABS: { id: InboxTab; label: string }[] = [
  { id: "all", label: "All inboxes" },
  { id: "action", label: "Needs action" },
  { id: "personal", label: "Personal" },
  { id: "appointments", label: "Appointments" },
  { id: "bills", label: "Bills" },
  { id: "receipts", label: "Receipts" },
  { id: "promotions", label: "Promotions" },
];

/** Read/unread and simulated archive state, layered over the fixtures. */
export type InboxState = { read: Record<string, boolean>; archived: Record<string, boolean> };

export function isUnread(m: Message, s: InboxState) {
  return s.read[m.id] === undefined ? m.unread : !s.read[m.id];
}

export function inTab(m: Message, tab: InboxTab) {
  switch (tab) {
    case "all":
      return true;
    case "action":
      return m.needsAction;
    case "personal":
      return m.category === "personal" || m.category === "work";
    case "appointments":
      return m.category === "appointment";
    case "bills":
      return m.category === "bill" || m.category === "renewal";
    case "receipts":
      return m.category === "receipt";
    case "promotions":
      return m.category === "promo" || m.category === "newsletter";
  }
}

export function filterMessages(
  messages: Message[],
  opts: { account: AccountId | "all"; tab: InboxTab; query: string; state?: InboxState; showArchived?: boolean },
): Message[] {
  const state = opts.state ?? { read: {}, archived: {} };
  const q = opts.query.trim().toLowerCase();
  return messages
    .filter((m) => (opts.showArchived ? !!state.archived[m.id] : !state.archived[m.id]))
    .filter((m) => opts.account === "all" || m.account === opts.account)
    .filter((m) => inTab(m, opts.tab))
    .filter((m) => !q || `${m.from} ${m.fromAddress} ${m.subject} ${m.preview}`.toLowerCase().includes(q))
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || Number(b.needsAction) - Number(a.needsAction) || b.receivedDayOffset - a.receivedDayOffset);
}

export type InboxRow = { kind: "message"; message: Message } | { kind: "newsletters"; messages: Message[] };

/** Collapses newsletters into one row so they don't crowd out real mail. */
export function groupNewsletters(list: Message[]): InboxRow[] {
  const news = list.filter((m) => m.category === "newsletter");
  const rows: InboxRow[] = list.filter((m) => m.category !== "newsletter").map((message) => ({ kind: "message", message }));
  if (news.length) {
    const firstPromoIdx = rows.findIndex((r) => r.kind === "message" && !r.message.needsAction);
    rows.splice(firstPromoIdx < 0 ? rows.length : firstPromoIdx, 0, { kind: "newsletters", messages: news });
  }
  return rows;
}

export function tabCounts(messages: Message[], state: InboxState, account: AccountId | "all") {
  return Object.fromEntries(
    TABS.map((t) => [t.id, filterMessages(messages, { account, tab: t.id, query: "", state }).filter((m) => isUnread(m, state)).length]),
  ) as Record<InboxTab, number>;
}

export function toProposals(choices: Record<string, CleanupChoice | undefined>): CleanupProposal[] {
  return Object.entries(choices).flatMap(([senderId, choice]) =>
    choice && choice !== "keep" ? [{ senderId, choice }] : [],
  );
}

export function promoTotal(senders: PromoSender[]) {
  return senders.reduce((n, s) => n + s.count, 0);
}
