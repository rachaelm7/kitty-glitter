import type { Task } from "./types";

// Fictional tasks. Several link to sample emails and Life Threads.
export const SEED_TASKS: Task[] = [
  { id: "k1", title: "Confirm your dental appointment", status: "open", category: "Health", dueDayOffset: 0, emailId: "m2", emailFrom: "Harbor Smiles Dental", threadId: "t-dental", createdAt: 10 },
  { id: "k2", title: "Reply to Jamie about Saturday", status: "open", category: "Social", dueDayOffset: 0, emailId: "m3", emailFrom: "Jamie Rivers", createdAt: 9 },
  { id: "k3", title: "Compare the insurance renewal quote", status: "waiting", waitingOn: "Harborline to send a higher-deductible quote", category: "Money", dueDayOffset: 10, emailId: "m1", emailFrom: "Harborline Auto Insurance", threadId: "t-car", createdAt: 8 },
  { id: "k4", title: "Call Brightwater Dermatology to book", status: "open", category: "Health", emailId: "m7", emailFrom: "Maple Grove Family Clinic", threadId: "t-derm", createdAt: 7, notes: "Referral was sent 6 days ago. Number is on the referral email (fictional)." },
  { id: "k5", title: "Approve the faucet repair estimate", status: "open", category: "Home", dueDayOffset: 2, emailId: "m8", emailFrom: "Pipewise Plumbing", threadId: "t-house", createdAt: 6 },
  { id: "k6", title: "Drop off the lamp return", status: "open", category: "Errands", dueDayOffset: 3, emailId: "m9", emailFrom: "Lumen & Loom", threadId: "t-return", createdAt: 5 },
  { id: "k7", title: "Refund for the lamp", status: "waiting", waitingOn: "Lumen & Loom to process the refund", category: "Money", threadId: "t-return", createdAt: 4 },
  { id: "k8", title: "Find your passport for Lisbon", status: "open", category: "Travel", kind: "reminder", threadId: "t-lisbon", createdAt: 3 },
  { id: "k9", title: "Pay the rest of the card statement", status: "open", category: "Money", dueDayOffset: 17, emailId: "m5", emailFrom: "Sapphire Card", createdAt: 2 },
  { id: "k10", title: "Buy lemons and butter for Priya's tart", status: "open", category: "Social", threadId: "t-party", createdAt: 1 },
  { id: "k11", title: "Order a new furnace filter", status: "done", category: "Home", threadId: "t-house", createdAt: 0, completedAt: 0 },
];
