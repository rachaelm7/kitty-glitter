import type { Task } from "./types";

export const SEED_TASKS: Task[] = [
  { id: "k1", title: "Review Q4 coverage plan", done: false, fromEmail: { messageId: "m3", sender: "Dana Whitfield" }, createdAt: 5 },
  { id: "k2", title: "Pay the rest of the card statement", done: false, fromEmail: { messageId: "m4", sender: "Sapphire Card" }, dueDayOffset: 17, createdAt: 4 },
  { id: "k3", title: "Reply to Jamie about dinner", done: false, fromEmail: { messageId: "m5", sender: "Jamie Rivers" }, createdAt: 3 },
  { id: "k4", title: "Order a new furnace filter", done: false, threadId: "t-house", createdAt: 2 },
  { id: "k5", title: "Book a dental cleaning", done: true, createdAt: 1 },
];
