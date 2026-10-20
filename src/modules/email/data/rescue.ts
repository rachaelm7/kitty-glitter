import { ACCOUNTS } from "./mock";
import type { AccountId } from "./types";

/**
 * Email Rescue Mode: a large, generated, fictional unread pile, grouped into
 * calm "piles" with safe default actions. Important mail is protected and is
 * never part of any bulk action.
 */

export type RescueKind = "newsletter" | "promo" | "receipt" | "notification" | "social" | "personal" | "bill" | "appointment" | "security";

export type RescueMessage = {
  id: string;
  account: AccountId;
  from: string;
  subject: string;
  kind: RescueKind;
  dayOffset: number; // negative: days ago
  /** Signals used by protection rules. */
  knownContact?: boolean;
  deadline?: string;
};

export type ProtectReason = "From someone you know" | "Bill or payment" | "Appointment" | "Security alert" | "Has a deadline";

export function protectReason(m: RescueMessage): ProtectReason | null {
  if (m.kind === "security") return "Security alert";
  if (m.kind === "bill") return "Bill or payment";
  if (m.kind === "appointment") return "Appointment";
  if (m.kind === "personal" || m.knownContact) return "From someone you know";
  if (m.deadline) return "Has a deadline";
  return null;
}

export type PileId = "newsletters" | "promotions" | "receipts" | "notifications" | "social";
export type PileAction = "mark-read" | "archive" | "leave";

export const PILES: { id: PileId; name: string; kinds: RescueKind[]; defaultAction: PileAction; blurb: string }[] = [
  { id: "promotions", name: "Promotions", kinds: ["promo"], defaultAction: "archive", blurb: "Sales and offers" },
  { id: "newsletters", name: "Newsletters", kinds: ["newsletter"], defaultAction: "mark-read", blurb: "Digests you subscribed to" },
  { id: "notifications", name: "Notifications", kinds: ["notification"], defaultAction: "mark-read", blurb: "Automatic updates from apps and sites" },
  { id: "social", name: "Social", kinds: ["social"], defaultAction: "mark-read", blurb: "Likes, follows and group digests" },
  { id: "receipts", name: "Receipts", kinds: ["receipt"], defaultAction: "mark-read", blurb: "Order confirmations without a return deadline" },
];

export const ACTION_LABEL: Record<PileAction, string> = { "mark-read": "Mark as read", archive: "Archive", leave: "Leave as is" };

// ---- Fictional generator -------------------------------------------------

const SENDERS: Record<Exclude<RescueKind, "personal">, string[]> = {
  newsletter: ["Fiber Arts Weekly", "The Morning Digest", "Garden Notes", "Local Library News", "Recipe Roundup", "Budget Bites"],
  promo: ["Trendline Outlet", "SeatSwap Tickets", "Lounge & Co.", "Rack Room Deals", "Glow Beauty Club", "BulkBarn Warehouse", "Handmade Market"],
  receipt: ["Parcel Pantry", "Cornerstone Books", "QuickRide", "Pixel Plus Store", "Meadow Grocery"],
  notification: ["CloudBox Storage", "FitTrack App", "Calendar Assistant", "Photo Prints", "Neighborly App"],
  social: ["Circle Social", "Pinwheel Boards", "Book Club Group", "Alumni Network"],
  bill: ["Riverbend Power & Light", "Clearwave Internet", "Sapphire Card"],
  appointment: ["Maple Grove Family Clinic", "Harbor Smiles Dental", "Clearview Optometry"],
  security: ["Account Security"],
};
const PEOPLE = ["Jamie Rivers", "Priya Nolan", "Sam Okafor", "Aunt Lou", "Dana Whitfield", "Marco Bell"];
const SUBJECTS: Record<RescueKind, string[]> = {
  newsletter: ["This week's picks", "Your weekly digest", "Fresh ideas for the weekend", "Issue #{n}"],
  promo: ["Up to 40% off ends tonight", "A little something for you", "New arrivals just dropped", "Last chance: free shipping"],
  receipt: ["Your order has shipped", "Receipt for order #{n}", "Thanks for your purchase", "Your trip receipt"],
  notification: ["Your storage is almost full", "Weekly activity summary", "New sign-in to your account settings page", "Your photos are ready"],
  social: ["3 people liked your post", "New posts in Book Club Group", "You have new followers", "Weekly highlights"],
  personal: ["Quick question", "Photos from Saturday", "Catching up", "Re: weekend plans"],
  bill: ["Your bill is ready", "Payment reminder", "Statement available"],
  appointment: ["Appointment reminder", "Please confirm your visit", "Time to book your next visit"],
  security: ["New sign-in on a device", "Password changed"],
};

// Kind weights per account (sum need not be 1).
const MIX: Record<AccountId, Partial<Record<RescueKind, number>>> = {
  personal: { promo: 40, newsletter: 22, notification: 14, social: 12, receipt: 6, personal: 3, bill: 1, appointment: 1, security: 1 },
  hobby: { newsletter: 45, promo: 25, social: 20, receipt: 8, personal: 2 },
  work: { notification: 50, newsletter: 30, personal: 20 },
  home: { bill: 40, receipt: 30, appointment: 15, notification: 15 },
  legacy: { promo: 55, newsletter: 25, social: 12, notification: 6, receipt: 2 },
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T extends string>(r: () => number, weights: Partial<Record<T, number>>): T {
  const entries = Object.entries(weights) as [T, number][];
  let x = r() * entries.reduce((n, [, w]) => n + w, 0);
  for (const [k, w] of entries) {
    x -= w;
    if (x <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

export function generateRescueInbox(seed = 42): RescueMessage[] {
  const r = rng(seed);
  const out: RescueMessage[] = [];
  for (const acct of ACCOUNTS) {
    for (let i = 0; i < acct.unread; i++) {
      const kind = pickWeighted<RescueKind>(r, MIX[acct.id]);
      const from = kind === "personal" ? PEOPLE[Math.floor(r() * PEOPLE.length)] : SENDERS[kind][Math.floor(r() * SENDERS[kind].length)];
      const subject = SUBJECTS[kind][Math.floor(r() * SUBJECTS[kind].length)].replace("{n}", String(100 + Math.floor(r() * 900)));
      const maxAge = acct.id === "legacy" ? 900 : 120;
      const m: RescueMessage = { id: `${acct.id}-${i}`, account: acct.id, from, subject, kind, dayOffset: -Math.floor(r() * maxAge) };
      if (kind === "receipt" && r() < 0.15) m.deadline = "Return window closes soon";
      if ((kind === "newsletter" || kind === "notification") && r() < 0.04) m.knownContact = true;
      out.push(m);
    }
  }
  return out.sort((a, b) => b.dayOffset - a.dayOffset);
}

// ---- Planning ------------------------------------------------------------

export type Plan = Record<PileId, PileAction>;

export function defaultPlan(): Plan {
  return Object.fromEntries(PILES.map((p) => [p.id, p.defaultAction])) as Plan;
}

export function splitInbox(all: RescueMessage[]) {
  const protectedMsgs = all.filter((m) => protectReason(m));
  const rest = all.filter((m) => !protectReason(m));
  const piles = Object.fromEntries(PILES.map((p) => [p.id, rest.filter((m) => p.kinds.includes(m.kind))])) as Record<PileId, RescueMessage[]>;
  return { protectedMsgs, piles };
}

export function summarizePlan(all: RescueMessage[], plan: Plan) {
  const { protectedMsgs, piles } = splitInbox(all);
  let markRead = 0;
  let archive = 0;
  let leave = 0;
  for (const p of PILES) {
    const n = piles[p.id].length;
    if (plan[p.id] === "mark-read") markRead += n;
    else if (plan[p.id] === "archive") archive += n;
    else leave += n;
  }
  return { total: all.length, protectedCount: protectedMsgs.length, markRead, archive, leave, unreadAfter: all.length - markRead - archive };
}

export function senderCounts(msgs: RescueMessage[]) {
  const map = new Map<string, number>();
  for (const m of msgs) map.set(m.from, (map.get(m.from) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}
