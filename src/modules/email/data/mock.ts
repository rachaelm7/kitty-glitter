import type { Account, Message, PromoSender } from "./types";
import type { EmailProvider } from "./provider";

// Everything below is fictional. The demo persona is "Juniper Ellis"; every
// address uses the reserved example.com domain. No real people or companies.

export const ACCOUNTS: Account[] = [
  { id: "personal", name: "Personal", address: "juniper.personal@example.com", color: "#9A515D", unread: 142, connected: true },
  { id: "hobby", name: "Makes & hobbies", address: "juniper.makes@example.com", color: "#6F5FA0", unread: 38, connected: false },
  { id: "work", name: "Work", address: "juniper.work@example.com", color: "#9A7A3F", unread: 12, connected: false },
  { id: "home", name: "Home & bills", address: "household.juniper@example.com", color: "#4E7F8C", unread: 7, connected: false },
  { id: "legacy", name: "Old inbox", address: "juniper1999@example.com", color: "#8A7A80", unread: 311, connected: false },
];

const msg = (m: Omit<Message, "unread"> & { unread?: boolean }): Message => ({ unread: true, ...m });

export const MESSAGES: Message[] = [
  msg({
    id: "m2", account: "personal", from: "Harbor Smiles Dental", fromAddress: "reminders.harborsmiles@example.com",
    subject: "Please confirm your cleaning on Thursday", preview: "Reply C to confirm your 3:30 PM visit, or call us to reschedule…",
    receivedDayOffset: 0, time: "7:40 AM", category: "appointment", needsAction: true, urgent: true,
    actionTitle: "Confirm your dental appointment",
    briefLine: "your dental appointment needs confirmation",
    summary: "Your dental cleaning is booked for Thursday at 3:30 PM. The office asks you to confirm today by replying C.",
    why: "Mentions a booked visit and asks you to confirm",
    deadline: { label: "Confirm today", dayOffset: 0 },
    suggestedReply: "C. I'll be there Thursday at 3:30 PM. Thank you!",
    threadId: "t-dental",
  }),
  msg({
    id: "m1", account: "home", from: "Harborline Auto Insurance", fromAddress: "policy.harborline@example.com",
    subject: "Your policy renews in two weeks", preview: "Your premium for the next term is $612. Review before renewal…",
    receivedDayOffset: 0, time: "8:12 AM", category: "renewal", needsAction: true, urgent: true,
    actionTitle: "Review the insurance renewal",
    briefLine: "a sample insurance renewal is approaching",
    summary: "Your sample auto policy renews in 14 days at $612 for six months, up $38 from last term. Autopay will charge the card on file unless you change it.",
    why: "Mentions a renewal date and a price change",
    deadline: { label: "Renews in 14 days", dayOffset: 14 },
    suggestedReply: "Hi, I'd like to review my renewal before it processes. Could you send a quote for a higher deductible and any available discounts? Thank you.",
    threadId: "t-car",
  }),
  msg({
    id: "m3", account: "personal", from: "Jamie Rivers", fromAddress: "jamie.rivers@example.com",
    subject: "Dinner Saturday?", preview: "We found a new place downtown. Are you free around 7?…",
    receivedDayOffset: -1, time: "6:18 PM", category: "personal", needsAction: true, urgent: true,
    actionTitle: "Reply to Jamie about Saturday",
    briefLine: "a friend is waiting for your response about Saturday",
    summary: "Jamie is asking whether you're free Saturday around 7 PM for dinner downtown and is waiting on your answer.",
    why: "A friend asked you a question",
    suggestedReply: "Yes, Saturday at 7 works! Send me the address and I'll meet you there.",
  }),
  msg({
    id: "m7", account: "personal", from: "Maple Grove Family Clinic", fromAddress: "referrals.maplegrove@example.com",
    subject: "Your referral to Brightwater Dermatology", preview: "We've sent your referral. Please call them to schedule…",
    receivedDayOffset: -6, time: "10:05 AM", category: "appointment", needsAction: true, urgent: false,
    actionTitle: "Schedule the dermatology visit",
    summary: "The clinic sent a referral to Brightwater Dermatology and asks you to call them to book a skin check.",
    why: "A referral that needs you to book",
    threadId: "t-derm",
  }),
  msg({
    id: "m8", account: "home", from: "Pipewise Plumbing", fromAddress: "office.pipewise@example.com",
    subject: "Estimate for your kitchen faucet", preview: "Replacing the cartridge and supply lines: $185, parts ordered on approval…",
    receivedDayOffset: -2, time: "2:44 PM", category: "service", needsAction: true, urgent: false,
    actionTitle: "Approve the faucet repair estimate",
    summary: "Pipewise quoted $185 to replace the faucet cartridge and supply lines. They'll order parts once you approve.",
    why: "An estimate waiting for your approval",
    suggestedReply: "Thanks for the estimate. Please go ahead and order the parts, and let me know which days you have for the repair.",
    threadId: "t-house",
  }),
  msg({
    id: "m4", account: "work", from: "Dana Whitfield", fromAddress: "dana.whitfield@example.com",
    subject: "Q4 coverage plan: can you review by Friday?", preview: "Attached is the draft. I mainly need your eyes on staffing…",
    receivedDayOffset: -1, time: "4:55 PM", category: "work", needsAction: true, urgent: false,
    actionTitle: "Review the Q4 coverage plan",
    summary: "Dana needs your review of the Q4 coverage plan by Friday, mostly the staffing section on page 3.",
    why: "A colleague asked for a review with a deadline",
    deadline: { label: "By Friday" },
    suggestedReply: "Thanks, Dana. I'll review the staffing section and send comments by Thursday afternoon.",
  }),
  msg({
    id: "m5", account: "home", from: "Sapphire Card", fromAddress: "statements.sapphire@example.com",
    subject: "Your statement is ready", preview: "Statement balance $1,284.50. Payment due in 17 days…",
    receivedDayOffset: -1, time: "9:02 AM", category: "bill", needsAction: true, urgent: false,
    actionTitle: "Pay the card statement",
    summary: "Statement balance is $1,284.50, due in 17 days. Autopay covers only the minimum, so pay the rest to avoid interest.",
    why: "A balance with a due date",
    deadline: { label: "Due in 17 days", dayOffset: 17 },
  }),
  msg({
    id: "m9", account: "personal", from: "Lumen & Loom", fromAddress: "orders.lumenloom@example.com",
    subject: "Your return label for order LL-2048", preview: "Drop off the lamp at any parcel point. Refund in 5–7 days after it arrives…",
    receivedDayOffset: -3, time: "11:30 AM", category: "receipt", needsAction: true, urgent: false,
    actionTitle: "Drop off the lamp return",
    summary: "Your return for the table lamp is approved. Drop it off with the attached label; the refund arrives 5–7 days after they receive it.",
    why: "A return label for something you bought",
    threadId: "t-return",
  }),
  msg({
    id: "m13", account: "personal", from: "Priya Nolan", fromAddress: "priya.nolan@example.com",
    subject: "Birthday picnic!", preview: "Thinking the park on the 8th. Can you bring a dessert? Still deciding on the spot…",
    receivedDayOffset: -2, time: "8:20 PM", category: "personal", needsAction: true, urgent: false,
    actionTitle: "Pick a dessert for Priya's picnic",
    summary: "Priya is planning a birthday picnic on the 8th and asked if you can bring a dessert. She'll confirm the location.",
    why: "A friend invited you and asked for help",
    suggestedReply: "I'd love to! I'll bring a lemon tart. Let me know where we're meeting.",
    threadId: "t-party",
  }),
  msg({
    id: "m14", account: "personal", from: "Account Security", fromAddress: "security.alerts@example.com",
    subject: "New sign-in on an iPhone", preview: "If this was you, you don't need to do anything…",
    receivedDayOffset: -2, time: "11:40 AM", category: "security", needsAction: false, urgent: false, unread: false,
    summary: "A new sign-in was detected on an iPhone. If it was you, no action is needed.",
    why: "A security notice from your email provider",
  }),
  msg({
    id: "m10", account: "home", from: "Cedar Coast Airlines", fromAddress: "trips.cedarcoast@example.com",
    subject: "Your trip to Lisbon is booked", preview: "Confirmation KG7Q2X. Seat 14A. Check-in opens 24 hours before…",
    receivedDayOffset: -9, time: "2:30 PM", category: "receipt", needsAction: false, urgent: false, unread: false,
    summary: "Flight confirmation for the Lisbon trip, seat 14A. Check-in opens 24 hours before departure.",
    why: "A booking confirmation",
    threadId: "t-lisbon",
  }),
  msg({
    id: "m11", account: "home", from: "Casa Azulejo Guesthouse", fromAddress: "stay.casaazulejo@example.com",
    subject: "Booking confirmed: 5 nights", preview: "We look forward to welcoming you. Check-in from 3 PM…",
    receivedDayOffset: -8, time: "9:15 AM", category: "receipt", needsAction: false, urgent: false, unread: false,
    summary: "Five nights confirmed with breakfast included. Check-in from 3 PM.",
    why: "A booking confirmation",
    threadId: "t-lisbon",
  }),
  msg({
    id: "m12", account: "hobby", from: "Whisker & Co.", fromAddress: "hello.whiskerco@example.com",
    subject: "Your cat food is on its way", preview: "Salmon recipe, 2 bags. Arriving Thursday…",
    receivedDayOffset: -1, time: "7:05 AM", category: "receipt", needsAction: false, urgent: false,
    summary: "Two bags of salmon-recipe cat food shipped and arrive Thursday. No action needed.",
    why: "An order shipping update",
  }),
  msg({
    id: "m6", account: "home", from: "Riverbend Power & Light", fromAddress: "billing.riverbend@example.com",
    subject: "Your October bill: $86.40", preview: "Autopay will pay this on the 28th…",
    receivedDayOffset: -4, time: "6:30 AM", category: "bill", needsAction: false, urgent: false, unread: false,
    summary: "Electric bill of $86.40. Autopay will cover it in full, so nothing to do.",
    why: "A bill with autopay already set",
  }),
  msg({
    id: "m22", account: "personal", from: "Meadow Grocery", fromAddress: "receipts.meadow@example.com",
    subject: "Your receipt: $42.18", preview: "Thanks for shopping with us. Oat milk, apples, sourdough…",
    receivedDayOffset: -3, time: "5:52 PM", category: "receipt", needsAction: false, urgent: false, unread: false,
    summary: "A grocery receipt for $42.18. No action needed.",
    why: "A purchase receipt",
  }),
  msg({
    id: "m15", account: "hobby", from: "Fiber Arts Weekly", fromAddress: "news.fiberarts@example.com",
    subject: "This week: 12 cozy patterns", preview: "Plus a free cable-knit hat guide…",
    receivedDayOffset: -1, time: "6:00 AM", category: "newsletter", needsAction: false, urgent: false,
    summary: "Weekly knitting newsletter. No action needed.", why: "A newsletter you subscribed to",
  }),
  msg({
    id: "m16", account: "personal", from: "The Morning Digest", fromAddress: "digest.morning@example.com",
    subject: "Five things to know today", preview: "Weather, a recipe and a good long read…",
    receivedDayOffset: 0, time: "5:30 AM", category: "newsletter", needsAction: false, urgent: false,
    summary: "Daily news digest. No action needed.", why: "A newsletter you subscribed to",
  }),
  msg({
    id: "m17", account: "legacy", from: "Garden Notes", fromAddress: "notes.garden@example.com",
    subject: "Planting bulbs before the frost", preview: "Tulips, daffodils and a little patience…",
    receivedDayOffset: -2, time: "8:00 AM", category: "newsletter", needsAction: false, urgent: false,
    summary: "Seasonal gardening newsletter. No action needed.", why: "A newsletter you subscribed to",
  }),
  msg({
    id: "m18", account: "personal", from: "Trendline Outlet", fromAddress: "deals.trendline@example.com",
    subject: "Up to 40% off ends tonight", preview: "Last chance for fall favorites…",
    receivedDayOffset: 0, time: "9:00 AM", category: "promo", needsAction: false, urgent: false,
    summary: "A sale email. No action needed.", why: "A promotional offer",
  }),
  msg({
    id: "m19", account: "personal", from: "Glow Beauty Club", fromAddress: "club.glowbeauty@example.com",
    subject: "A little something for you", preview: "Free sample with any order this week…",
    receivedDayOffset: -1, time: "1:15 PM", category: "promo", needsAction: false, urgent: false,
    summary: "A promotional offer. No action needed.", why: "A promotional offer",
  }),
  msg({
    id: "m20", account: "legacy", from: "SeatSwap Tickets", fromAddress: "offers.seatswap@example.com",
    subject: "Concerts near you this weekend", preview: "Grab seats before they're gone…",
    receivedDayOffset: -2, time: "4:00 PM", category: "promo", needsAction: false, urgent: false,
    summary: "Ticket promotions. No action needed.", why: "A promotional offer",
  }),
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
