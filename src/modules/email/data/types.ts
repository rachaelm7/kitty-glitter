export type AccountId = "personal" | "hobby" | "work" | "home" | "legacy";

export type Account = {
  id: AccountId;
  name: string;
  address: string; // fictional, uses reserved example.* domains
  color: string;
  unread: number;
  connected: boolean;
};

export type Category = "bill" | "appointment" | "renewal" | "work" | "order" | "security" | "personal" | "newsletter" | "promo" | "receipt";

export type Message = {
  id: string;
  account: AccountId;
  from: string;
  fromAddress: string;
  subject: string;
  preview: string;
  receivedDayOffset: number; // 0 = today, -1 = yesterday …
  time: string;
  category: Category;
  needsAction: boolean;
  /** Short imperative used on Today, e.g. "Confirm Thursday's appointment". */
  actionTitle?: string;
  urgent: boolean;
  unread: boolean;
  /** Simulated AI output. In later phases this comes from a backend route. */
  summary: string;
  deadline?: { label: string; dayOffset?: number };
  suggestedReply?: string;
  threadId?: string;
};

export type PromoSender = {
  id: string;
  name: string;
  account: AccountId;
  count: number;
  lastOpenedDaysAgo: number | null;
};

/** Cleanup actions are only ever proposals until confirmed. */
export type CleanupChoice = "unsubscribe" | "spam" | "keep";
export type CleanupProposal = { senderId: string; choice: Exclude<CleanupChoice, "keep"> };
