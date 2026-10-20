import type { AccountId, CleanupChoice, CleanupProposal, Message, PromoSender } from "./types";

export type InboxView = "priority" | "everything" | "cleanup";

export function filterMessages(
  messages: Message[],
  opts: { account: AccountId | "all"; view: InboxView; query: string },
): Message[] {
  const q = opts.query.trim().toLowerCase();
  return messages
    .filter((m) => opts.account === "all" || m.account === opts.account)
    .filter((m) => (opts.view === "priority" ? m.needsAction : true))
    .filter((m) => !q || `${m.from} ${m.subject} ${m.preview}`.toLowerCase().includes(q))
    .sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.receivedDayOffset - a.receivedDayOffset);
}

export function toProposals(choices: Record<string, CleanupChoice | undefined>): CleanupProposal[] {
  return Object.entries(choices).flatMap(([senderId, choice]) =>
    choice && choice !== "keep" ? [{ senderId, choice }] : [],
  );
}

export function promoTotal(senders: PromoSender[]) {
  return senders.reduce((n, s) => n + s.count, 0);
}
