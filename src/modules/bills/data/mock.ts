export type Renewal = { id: string; title: string; amount?: string; dayOffset: number; kind: "bill" | "renewal" | "warranty"; threadId?: string };

export const RENEWALS: Renewal[] = [
  { id: "r1", title: "Auto insurance renews", amount: "$612", dayOffset: 14, kind: "renewal", threadId: "t-car" },
  { id: "r2", title: "Card statement due", amount: "$1,284.50", dayOffset: 17, kind: "bill" },
  { id: "r3", title: "Streaming bundle renews", amount: "$22.99", dayOffset: 9, kind: "renewal" },
  { id: "r4", title: "Dishwasher warranty ends", dayOffset: 53, kind: "warranty", threadId: "t-house" },
];
