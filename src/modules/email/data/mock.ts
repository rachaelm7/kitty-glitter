import type { Account, Message, PromoSender } from "./types";
import type { EmailProvider } from "./provider";

// All people, companies and addresses below are fictional.
// Addresses use the reserved example.com / example.org / example.net domains.

export const ACCOUNTS: Account[] = [
  { id: "personal", name: "Personal", address: "me@example.com", color: "#2B7A74", unread: 142, connected: true },
  { id: "hobby", name: "Hobby", address: "craft.corner@example.net", color: "#7A6CC8", unread: 38, connected: false },
  { id: "work", name: "Work", address: "r.demo@northwind.example", color: "#C98A1E", unread: 12, connected: false },
  { id: "home", name: "Home & bills", address: "household@example.org", color: "#3E8FD1", unread: 7, connected: false },
  { id: "legacy", name: "Old inbox", address: "oldbox1999@example.net", color: "#A0728A", unread: 311, connected: false },
];

export const MESSAGES: Message[] = [
  {
    id: "m1", account: "home", from: "Harborline Auto Insurance", fromAddress: "policy@harborline.example",
    subject: "Your policy renews soon", preview: "Your premium for the next term is $612. Review before renewal…",
    receivedDayOffset: 0, time: "8:12 AM", category: "renewal", needsAction: true, actionTitle: "Review the auto insurance renewal", urgent: true, unread: true,
    summary: "Your auto policy renews in 14 days at $612 for six months, up $38 from last term. Autopay will charge the card on file unless you change it.",
    deadline: { label: "Renews in 14 days", dayOffset: 14 },
    suggestedReply: "Hi, I'd like to review my renewal before it processes. Could you send a quote for a higher deductible and any available discounts? Thank you.",
    threadId: "t-car",
  },
  {
    id: "m2", account: "personal", from: "Maple Grove Family Clinic", fromAddress: "reminders@maplegrove.example",
    subject: "Appointment reminder: Thursday, 3:30 PM", preview: "Please reply C to confirm or call to reschedule…",
    receivedDayOffset: 0, time: "7:40 AM", category: "appointment", needsAction: true, actionTitle: "Confirm Thursday's appointment", urgent: true, unread: true,
    summary: "A check-up is booked for Thursday at 3:30 PM. The office asks you to confirm by replying today.",
    deadline: { label: "Confirm today", dayOffset: 0 },
    suggestedReply: "C. I'll be there Thursday at 3:30 PM. Thank you!",
    threadId: "t-health",
  },
  {
    id: "m3", account: "work", from: "Dana Whitfield", fromAddress: "dana@northwind.example",
    subject: "Q4 coverage plan: can you review by Friday?", preview: "Attached is the draft. I mainly need your eyes on staffing…",
    receivedDayOffset: -1, time: "4:55 PM", category: "work", needsAction: true, actionTitle: "Review the Q4 coverage plan", urgent: true, unread: true,
    summary: "Dana needs your review of the Q4 coverage plan by Friday, mostly the staffing section on page 3.",
    deadline: { label: "By Friday" },
    suggestedReply: "Thanks, Dana. I'll review the staffing section and send comments by Thursday afternoon.",
  },
  {
    id: "m4", account: "home", from: "Sapphire Card", fromAddress: "statements@sapphirecard.example",
    subject: "Your statement is ready", preview: "Statement balance $1,284.50. Payment due in 17 days…",
    receivedDayOffset: -1, time: "9:02 AM", category: "bill", needsAction: true, urgent: false, unread: true,
    summary: "Statement balance is $1,284.50, due in 17 days. Autopay covers the minimum only, so pay the rest manually to avoid interest.",
    deadline: { label: "Due in 17 days", dayOffset: 17 },
  },
  {
    id: "m5", account: "personal", from: "Jamie Rivers", fromAddress: "jamie.rivers@example.com",
    subject: "Dinner Saturday?", preview: "We found a new place downtown. Are you free around 7?…",
    receivedDayOffset: -2, time: "6:18 PM", category: "personal", needsAction: true, urgent: false, unread: false,
    summary: "Jamie is asking whether you're free Saturday around 7 PM for dinner downtown.",
    suggestedReply: "Yes, Saturday at 7 works! Send me the address and I'll meet you there.",
  },
  {
    id: "m6", account: "personal", from: "Account Security", fromAddress: "no-reply@mailhost.example",
    subject: "New sign-in on iPhone", preview: "If this was you, you don't need to do anything…",
    receivedDayOffset: -2, time: "11:40 AM", category: "security", needsAction: true, urgent: false, unread: false,
    summary: "A new sign-in was detected on an iPhone. If it was you, no action is needed. If not, secure the account.",
  },
  {
    id: "m7", account: "hobby", from: "Parcel Updates", fromAddress: "track@parcels.example",
    subject: "Your package arrives tomorrow", preview: "Out for delivery. Track your package…",
    receivedDayOffset: -2, time: "8:00 AM", category: "order", needsAction: false, urgent: false, unread: true,
    summary: "Your yarn order arrives tomorrow by 8 PM. No action needed.",
  },
  {
    id: "m8", account: "legacy", from: "Riverside Library", fromAddress: "notices@riversidelib.example",
    subject: "Your hold is ready for pickup", preview: "Your hold will be kept for 7 days…",
    receivedDayOffset: -3, time: "10:15 AM", category: "order", needsAction: false, urgent: false, unread: true,
    summary: "Your library hold is ready and will be kept for 7 more days.",
    deadline: { label: "Pick up within 7 days", dayOffset: 4 },
  },
  {
    id: "m9", account: "home", from: "Cedar Coast Airlines", fromAddress: "trips@cedarcoast.example",
    subject: "Your trip to Lisbon is booked", preview: "Confirmation KG7Q2X. Seat 14A…",
    receivedDayOffset: -3, time: "2:30 PM", category: "receipt", needsAction: false, urgent: false, unread: false,
    summary: "Flight confirmation for the Lisbon trip. Check-in opens 24 hours before departure.",
    threadId: "t-lisbon",
  },
  {
    id: "m10", account: "hobby", from: "Fiber Arts Weekly", fromAddress: "hello@fiberarts.example",
    subject: "This week: 12 cozy patterns", preview: "Plus a free cable-knit hat guide…",
    receivedDayOffset: -1, time: "6:00 AM", category: "newsletter", needsAction: false, urgent: false, unread: true,
    summary: "Weekly newsletter with knitting patterns. No action needed.",
  },
];

export const PROMO_SENDERS: PromoSender[] = [
  { id: "s1", name: "Trendline Outlet", account: "personal", count: 14, lastOpenedDaysAgo: null },
  { id: "s2", name: "SeatSwap Tickets", account: "personal", count: 11, lastOpenedDaysAgo: 210 },
  { id: "s3", name: "Lounge & Co.", account: "legacy", count: 9, lastOpenedDaysAgo: null },
  { id: "s4", name: "Rack Room Deals", account: "legacy", count: 8, lastOpenedDaysAgo: 400 },
  { id: "s5", name: "Glow Beauty Club", account: "personal", count: 6, lastOpenedDaysAgo: 90 },
  { id: "s6", name: "BulkBarn Warehouse", account: "home", count: 5, lastOpenedDaysAgo: 30 },
  { id: "s7", name: "The Daily Giggle", account: "hobby", count: 4, lastOpenedDaysAgo: null },
  { id: "s8", name: "Handmade Market", account: "hobby", count: 3, lastOpenedDaysAgo: 12 },
];

export const mockEmailProvider: EmailProvider = {
  listAccounts: () => ACCOUNTS,
  listMessages: () => MESSAGES,
  listPromoSenders: () => PROMO_SENDERS,
  previewCleanup(proposals) {
    const ids = new Set(proposals.map((p) => p.senderId));
    const emails = PROMO_SENDERS.filter((s) => ids.has(s.id)).reduce((n, s) => n + s.count, 0);
    return { senders: ids.size, emails };
  },
};
