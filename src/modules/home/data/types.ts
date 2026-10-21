export type MaintenanceItem = {
  id: string;
  title: string;
  area: "Heating & air" | "Kitchen" | "Safety" | "Outside" | "Plumbing";
  everyDays: number;
  lastDoneOffset: number; // sample data: negative days ago, relative to the day it was seeded
  /** Set when you mark it done here with no linked task; wins over the sample offset. */
  lastDoneDate?: string; // YYYY-MM-DD
  how?: string;
  threadId?: string;
};

export type Coverage = {
  id: string;
  kind: "insurance" | "warranty";
  title: string;
  provider: string; // fictional
  endsOffset: number; // renewal or expiry, days from today
  amount?: string;
  note: string;
  threadId?: string;
};
